import neo4j from "neo4j-driver";

// Singleton driver instance, reused across API route invocations
// (important in serverless environments where modules are cached
// between invocations of the same warm instance).
let driver;

function getDriver() {
  if (driver) return driver;

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    throw new DatabaseConfigError(
      "Missing COGNODB_URI or COGNODB_PASSWORD environment variables. " +
        "Copy .env.example to .env.local and fill in your CognoDB connection details."
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
  });

  return driver;
}

export class DatabaseConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

/**
 * Run a Cypher query with parameters and return plain JS records.
 * Wraps connection/config failures in typed errors so API routes
 * and pages can show a meaningful message instead of a stack trace.
 */
export async function runQuery(cypher, params = {}) {
  let session;
  try {
    session = getDriver().session();
    const result = await session.run(cypher, params);
    return result.records.map((record) => {
      const obj = {};
      for (const key of record.keys) {
        obj[key] = neo4j.isInt?.(record.get(key))
          ? record.get(key).toNumber()
          : record.get(key);
      }
      return obj;
    });
  } catch (err) {
    if (err instanceof DatabaseConfigError) throw err;
    throw new DatabaseUnavailableError(
      "Could not reach the CognoDB instance. It may be paused, unreachable, or the connection details may be incorrect.",
      err
    );
  } finally {
    if (session) await session.close();
  }
}

export async function verifyConnectivity() {
  try {
    await getDriver().verifyConnectivity();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
