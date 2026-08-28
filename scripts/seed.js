/**
 * Seed script for MentorMesh.
 *
 * Loads a realistic (fictional) org's people, skills, projects and
 * the relationships between them into CognoDB.
 *
 * Usage:
 *   node scripts/seed.js            # seed the database
 *   node scripts/seed.js --reset    # wipe everything first, then seed
 */
require("dotenv").config({ path: ".env.local" });
const neo4j = require("neo4j-driver");

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER || "cognodb";
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  console.error(
    "Missing COGNODB_URI or COGNODB_PASSWORD. Copy .env.example to .env.local and fill in your CognoDB details."
  );
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const SKILLS = [
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "CSS/Design Systems", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "Python", category: "Backend" },
  { name: "Go", category: "Backend" },
  { name: "PostgreSQL", category: "Data" },
  { name: "Graph Databases", category: "Data" },
  { name: "Data Pipelines", category: "Data" },
  { name: "Kubernetes", category: "Infra" },
  { name: "AWS", category: "Infra" },
  { name: "CI/CD", category: "Infra" },
  { name: "Machine Learning", category: "AI/ML" },
  { name: "NLP", category: "AI/ML" },
  { name: "Product Strategy", category: "Product" },
  { name: "User Research", category: "Product" },
  { name: "Technical Writing", category: "Communication" },
  { name: "Public Speaking", category: "Communication" },
];

const PEOPLE = [
  { name: "Amara Okafor", title: "Staff Engineer", bio: "Backend and infra generalist, loves mentoring on distributed systems.", openToMentor: true },
  { name: "Ben Sato", title: "Frontend Engineer", bio: "React specialist, recently picked up design systems work.", openToMentor: false },
  { name: "Chinedu Eze", title: "Data Engineer", bio: "Builds pipelines, curious about graph databases.", openToMentor: false },
  { name: "Dara Adeyemi", title: "Engineering Manager", bio: "Ex-backend engineer, now focused on product strategy and coaching.", openToMentor: true },
  { name: "Elena Popescu", title: "ML Engineer", bio: "NLP-focused, published two internal papers on retrieval systems.", openToMentor: true },
  { name: "Femi Bello", title: "Junior Engineer", bio: "Six months in, learning React and Node.js.", openToMentor: false },
  { name: "Grace Kim", title: "Platform Engineer", bio: "Kubernetes and AWS, keeps the lights on.", openToMentor: true },
  { name: "Hassan Ali", title: "Product Manager", bio: "Runs discovery for the search team, wants to get more technical.", openToMentor: false },
  { name: "Ifeoma Nwosu", title: "Senior Engineer", bio: "Full-stack, mentors juniors on testing and code review.", openToMentor: true },
  { name: "Jorge Ramirez", title: "Backend Engineer", bio: "Go and PostgreSQL, previously at a fintech startup.", openToMentor: false },
  { name: "Kwame Mensah", title: "Frontend Engineer", bio: "New to the team, strong TypeScript background.", openToMentor: false },
  { name: "Lena Fischer", title: "Data Scientist", bio: "Machine learning models for churn prediction.", openToMentor: false },
  { name: "Musa Ibrahim", title: "DevOps Engineer", bio: "CI/CD pipelines and infra automation.", openToMentor: true },
  { name: "Nadia Hassan", title: "Tech Lead", bio: "Leads the payments team, strong public speaker.", openToMentor: true },
  { name: "Oluwaseun Fashola", title: "Engineer", bio: "Backend engineer transitioning into ML.", openToMentor: false },
];

const PROJECTS = [
  { name: "Search Revamp", description: "Rebuilding the internal search experience with better relevance.", startDate: "2024-01-15" },
  { name: "Payments Platform v2", description: "Migrating the payments stack to a new architecture.", startDate: "2023-09-01" },
  { name: "Graph Recommendations", description: "Prototype recommendation engine using graph traversals.", startDate: "2024-03-10" },
  { name: "Onboarding Redesign", description: "New hire onboarding flow and documentation overhaul.", startDate: "2024-02-01" },
  { name: "ML Model Serving", description: "Infrastructure for serving ML models at low latency.", startDate: "2023-11-20" },
];

// [personName, skillName, level, years]
const HAS_SKILL = [
  ["Amara Okafor", "Node.js", "expert", 8],
  ["Amara Okafor", "Kubernetes", "expert", 6],
  ["Amara Okafor", "AWS", "expert", 7],
  ["Amara Okafor", "Graph Databases", "intermediate", 2],
  ["Ben Sato", "React", "expert", 5],
  ["Ben Sato", "CSS/Design Systems", "expert", 4],
  ["Ben Sato", "TypeScript", "intermediate", 3],
  ["Chinedu Eze", "Data Pipelines", "expert", 5],
  ["Chinedu Eze", "Python", "expert", 6],
  ["Chinedu Eze", "PostgreSQL", "intermediate", 4],
  ["Dara Adeyemi", "Product Strategy", "expert", 6],
  ["Dara Adeyemi", "Node.js", "intermediate", 5],
  ["Dara Adeyemi", "Public Speaking", "expert", 8],
  ["Elena Popescu", "Machine Learning", "expert", 7],
  ["Elena Popescu", "NLP", "expert", 6],
  ["Elena Popescu", "Python", "expert", 8],
  ["Femi Bello", "React", "beginner", 1],
  ["Femi Bello", "Node.js", "beginner", 1],
  ["Grace Kim", "Kubernetes", "expert", 6],
  ["Grace Kim", "AWS", "expert", 8],
  ["Grace Kim", "CI/CD", "expert", 5],
  ["Hassan Ali", "Product Strategy", "expert", 5],
  ["Hassan Ali", "User Research", "expert", 6],
  ["Ifeoma Nwosu", "React", "expert", 6],
  ["Ifeoma Nwosu", "Node.js", "expert", 6],
  ["Ifeoma Nwosu", "TypeScript", "expert", 5],
  ["Jorge Ramirez", "Go", "expert", 5],
  ["Jorge Ramirez", "PostgreSQL", "expert", 6],
  ["Kwame Mensah", "TypeScript", "expert", 4],
  ["Kwame Mensah", "React", "intermediate", 2],
  ["Lena Fischer", "Machine Learning", "expert", 5],
  ["Lena Fischer", "Python", "expert", 6],
  ["Musa Ibrahim", "CI/CD", "expert", 6],
  ["Musa Ibrahim", "Kubernetes", "intermediate", 3],
  ["Musa Ibrahim", "AWS", "expert", 5],
  ["Nadia Hassan", "Node.js", "expert", 9],
  ["Nadia Hassan", "Public Speaking", "expert", 7],
  ["Nadia Hassan", "Graph Databases", "expert", 3],
  ["Oluwaseun Fashola", "Node.js", "intermediate", 3],
  ["Oluwaseun Fashola", "Python", "beginner", 1],
];

// [personName, skillName, priority]
const WANTS_TO_LEARN = [
  ["Femi Bello", "TypeScript", "high"],
  ["Femi Bello", "React", "high"],
  ["Chinedu Eze", "Graph Databases", "high"],
  ["Hassan Ali", "Node.js", "medium"],
  ["Oluwaseun Fashola", "Machine Learning", "high"],
  ["Oluwaseun Fashola", "NLP", "medium"],
  ["Kwame Mensah", "CI/CD", "medium"],
  ["Jorge Ramirez", "Graph Databases", "low"],
  ["Ben Sato", "Public Speaking", "medium"],
];

// [personName, projectName, role]
const WORKED_ON = [
  ["Amara Okafor", "Payments Platform v2", "Lead Engineer"],
  ["Nadia Hassan", "Payments Platform v2", "Tech Lead"],
  ["Jorge Ramirez", "Payments Platform v2", "Backend Engineer"],
  ["Musa Ibrahim", "Payments Platform v2", "DevOps"],
  ["Hassan Ali", "Search Revamp", "Product Manager"],
  ["Ben Sato", "Search Revamp", "Frontend Engineer"],
  ["Ifeoma Nwosu", "Search Revamp", "Senior Engineer"],
  ["Chinedu Eze", "Search Revamp", "Data Engineer"],
  ["Amara Okafor", "Graph Recommendations", "Architect"],
  ["Nadia Hassan", "Graph Recommendations", "Contributor"],
  ["Chinedu Eze", "Graph Recommendations", "Data Engineer"],
  ["Dara Adeyemi", "Onboarding Redesign", "Sponsor"],
  ["Femi Bello", "Onboarding Redesign", "Engineer"],
  ["Kwame Mensah", "Onboarding Redesign", "Engineer"],
  ["Elena Popescu", "ML Model Serving", "ML Engineer"],
  ["Lena Fischer", "ML Model Serving", "Data Scientist"],
  ["Grace Kim", "ML Model Serving", "Platform Engineer"],
  ["Oluwaseun Fashola", "ML Model Serving", "Engineer"],
];

// [projectName, skillName]
const REQUIRES_SKILL = [
  ["Payments Platform v2", "Node.js"],
  ["Payments Platform v2", "PostgreSQL"],
  ["Payments Platform v2", "Kubernetes"],
  ["Search Revamp", "React"],
  ["Search Revamp", "Data Pipelines"],
  ["Search Revamp", "Graph Databases"],
  ["Graph Recommendations", "Graph Databases"],
  ["Graph Recommendations", "Node.js"],
  ["Onboarding Redesign", "React"],
  ["Onboarding Redesign", "Technical Writing"],
  ["ML Model Serving", "Machine Learning"],
  ["ML Model Serving", "Kubernetes"],
  ["ML Model Serving", "AWS"],
];

// [personName, personName] -- direct existing connections (undirected, one row per pair)
const KNOWS = [
  ["Amara Okafor", "Nadia Hassan"],
  ["Amara Okafor", "Jorge Ramirez"],
  ["Amara Okafor", "Musa Ibrahim"],
  ["Ben Sato", "Hassan Ali"],
  ["Ben Sato", "Ifeoma Nwosu"],
  ["Chinedu Eze", "Hassan Ali"],
  ["Chinedu Eze", "Amara Okafor"],
  ["Dara Adeyemi", "Femi Bello"],
  ["Dara Adeyemi", "Kwame Mensah"],
  ["Elena Popescu", "Lena Fischer"],
  ["Elena Popescu", "Grace Kim"],
  ["Femi Bello", "Kwame Mensah"],
  ["Grace Kim", "Oluwaseun Fashola"],
  ["Ifeoma Nwosu", "Chinedu Eze"],
  ["Nadia Hassan", "Jorge Ramirez"],
  ["Nadia Hassan", "Musa Ibrahim"],
];

async function run() {
  const session = driver.session();
  const reset = process.argv.includes("--reset");

  try {
    await driver.verifyConnectivity();
    console.log("Connected to CognoDB.");

    if (reset) {
      console.log("Wiping existing data...");
      await session.run("MATCH (n) DETACH DELETE n");
    }

    console.log("Creating constraints...");
    await session.run(
      "CREATE CONSTRAINT person_name IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT project_name IF NOT EXISTS FOR (pr:Project) REQUIRE pr.name IS UNIQUE"
    );

    console.log(`Seeding ${SKILLS.length} skills...`);
    for (const skill of SKILLS) {
      await session.run(
        "MERGE (s:Skill {name: $name}) SET s.category = $category",
        skill
      );
    }

    console.log(`Seeding ${PEOPLE.length} people...`);
    for (const person of PEOPLE) {
      await session.run(
        `MERGE (p:Person {name: $name})
         SET p.title = $title, p.bio = $bio, p.openToMentor = $openToMentor`,
        person
      );
    }

    console.log(`Seeding ${PROJECTS.length} projects...`);
    for (const project of PROJECTS) {
      await session.run(
        `MERGE (pr:Project {name: $name})
         SET pr.description = $description, pr.startDate = $startDate`,
        project
      );
    }

    console.log(`Seeding ${HAS_SKILL.length} HAS_SKILL relationships...`);
    for (const [personName, skillName, level, years] of HAS_SKILL) {
      await session.run(
        `MATCH (p:Person {name: $personName}), (s:Skill {name: $skillName})
         MERGE (p)-[r:HAS_SKILL]->(s)
         SET r.level = $level, r.years = $years`,
        { personName, skillName, level, years }
      );
    }

    console.log(`Seeding ${WANTS_TO_LEARN.length} WANTS_TO_LEARN relationships...`);
    for (const [personName, skillName, priority] of WANTS_TO_LEARN) {
      await session.run(
        `MATCH (p:Person {name: $personName}), (s:Skill {name: $skillName})
         MERGE (p)-[r:WANTS_TO_LEARN]->(s)
         SET r.priority = $priority`,
        { personName, skillName, priority }
      );
    }

    console.log(`Seeding ${WORKED_ON.length} WORKED_ON relationships...`);
    for (const [personName, projectName, role] of WORKED_ON) {
      await session.run(
        `MATCH (p:Person {name: $personName}), (pr:Project {name: $projectName})
         MERGE (p)-[r:WORKED_ON]->(pr)
         SET r.role = $role`,
        { personName, projectName, role }
      );
    }

    console.log(`Seeding ${REQUIRES_SKILL.length} REQUIRES_SKILL relationships...`);
    for (const [projectName, skillName] of REQUIRES_SKILL) {
      await session.run(
        `MATCH (pr:Project {name: $projectName}), (s:Skill {name: $skillName})
         MERGE (pr)-[:REQUIRES_SKILL]->(s)`,
        { projectName, skillName }
      );
    }

    console.log(`Seeding ${KNOWS.length} KNOWS relationships (bidirectional)...`);
    for (const [a, b] of KNOWS) {
      await session.run(
        `MATCH (p1:Person {name: $a}), (p2:Person {name: $b})
         MERGE (p1)-[:KNOWS]->(p2)
         MERGE (p2)-[:KNOWS]->(p1)`,
        { a, b }
      );
    }

    console.log("\nSeed complete.");
    const counts = await session.run(
      `MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count ORDER BY label`
    );
    counts.records.forEach((r) => {
      console.log(`  ${r.get("label")}: ${r.get("count").toNumber()}`);
    });
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
