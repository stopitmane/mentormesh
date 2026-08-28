import { runQuery } from "./neo4j";

/**
 * All Cypher lives here, in one place, so it's easy to audit and explain.
 * Every query is parameterised — no string concatenation.
 */

// Simple list + search, used by the directory page.
export async function listPeople(search = "") {
  return runQuery(
    `MATCH (p:Person)
     WHERE $search = "" OR toLower(p.name) CONTAINS toLower($search)
     OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
     RETURN p.name AS name, p.title AS title, p.openToMentor AS openToMentor,
            collect(DISTINCT s.name)[0..4] AS topSkills
     ORDER BY p.name`,
    { search }
  );
}

export async function getPerson(name) {
  const records = await runQuery(
    `MATCH (p:Person {name: $name})
     OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(skill:Skill)
     OPTIONAL MATCH (p)-[wl:WANTS_TO_LEARN]->(wantSkill:Skill)
     OPTIONAL MATCH (p)-[wo:WORKED_ON]->(proj:Project)
     RETURN p.name AS name, p.title AS title, p.bio AS bio, p.openToMentor AS openToMentor,
            collect(DISTINCT {skill: skill.name, level: hs.level, years: hs.years}) AS skills,
            collect(DISTINCT {skill: wantSkill.name, priority: wl.priority}) AS wantsToLearn,
            collect(DISTINCT {project: proj.name, role: wo.role}) AS projects`,
    { name }
  );
  return records[0] || null;
}

/**
 * THE key multi-hop query.
 *
 * Finds potential mentors for `personName`:
 *   - shares a project with them (1 hop out, 1 hop back = 2 hops)
 *   - has expert-level skill in something the person WANTS_TO_LEARN
 *   - is open to mentoring
 *   - is NOT already a direct connection (KNOWS)
 *
 * This is the query a relational schema would find genuinely awkward:
 * it needs a self-join through a bridge table (project membership),
 * another join to a skill table, an anti-join against an existing
 * "connections" table, and a NOT EXISTS to prevent recommending
 * people who are already connected — all while keeping it readable.
 * In Cypher it's one readable pattern match.
 */
export async function findMentors(personName) {
  return runQuery(
    `MATCH (me:Person {name: $personName})-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(candidate:Person)
     WHERE candidate <> me
       AND candidate.openToMentor = true
       AND NOT (me)-[:KNOWS]->(candidate)
     MATCH (me)-[:WANTS_TO_LEARN]->(skill:Skill)<-[hs:HAS_SKILL]-(candidate)
     WHERE hs.level = "expert"
     RETURN DISTINCT candidate.name AS name, candidate.title AS title,
            collect(DISTINCT proj.name) AS sharedProjects,
            collect(DISTINCT skill.name) AS matchingSkills
     ORDER BY size(matchingSkills) DESC
     LIMIT 10`,
    { personName }
  );
}

/**
 * Skill-gap analysis for a project: which required skills does nobody
 * currently on the project have at expert level, and who elsewhere in
 * the org could fill that gap?
 */
export async function skillGapForProject(projectName) {
  const gaps = await runQuery(
    `MATCH (proj:Project {name: $projectName})-[:REQUIRES_SKILL]->(skill:Skill)
     WHERE NOT EXISTS {
       MATCH (proj)<-[:WORKED_ON]-(member:Person)-[hs:HAS_SKILL]->(skill)
       WHERE hs.level = "expert"
     }
     RETURN skill.name AS skill`,
    { projectName }
  );

  const gapsWithCandidates = [];
  for (const gap of gaps) {
    const candidates = await runQuery(
      `MATCH (candidate:Person)-[hs:HAS_SKILL {level: "expert"}]->(skill:Skill {name: $skillName})
       WHERE NOT (candidate)-[:WORKED_ON]->(:Project {name: $projectName})
       RETURN candidate.name AS name, candidate.title AS title
       LIMIT 5`,
      { skillName: gap.skill, projectName }
    );
    gapsWithCandidates.push({ skill: gap.skill, candidates });
  }
  return gapsWithCandidates;
}

/**
 * Shortest mentorship path between two people through the shared
 * skill/project graph. Demonstrates variable-length pathfinding,
 * which is native to Cypher and painful with recursive SQL.
 */
export async function shortestPathBetween(fromName, toName) {
  const records = await runQuery(
    `MATCH (a:Person {name: $fromName}), (b:Person {name: $toName}),
           path = shortestPath((a)-[:KNOWS|WORKED_ON|HAS_SKILL*..6]-(b))
     RETURN [n IN nodes(path) | coalesce(n.name, n.title)] AS nodeNames,
            [n IN nodes(path) | labels(n)[0]] AS nodeLabels,
            [r IN relationships(path) | type(r)] AS relTypes,
            length(path) AS hops`,
    { fromName, toName }
  );
  return records[0] || null;
}

export async function listSkills() {
  return runQuery(`MATCH (s:Skill) RETURN s.name AS name, s.category AS category ORDER BY s.category, s.name`);
}

export async function listProjects() {
  return runQuery(`MATCH (p:Project) RETURN p.name AS name, p.description AS description ORDER BY p.name`);
}

export async function graphStats() {
  const records = await runQuery(
    `MATCH (n) WITH count(n) AS nodeCount
     MATCH ()-[r]->() RETURN nodeCount, count(r) AS relCount`
  );
  return records[0] || { nodeCount: 0, relCount: 0 };
}
