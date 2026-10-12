import pg from "pg";

let pool: pg.Pool | undefined;
export function getPool() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      statement_timeout: 5000,
      query_timeout: 5000,
    });
    // pg emits idle-client errors separately; log a fixed message without connection details.
    pool.on("error", () =>
      console.error("PostgreSQL idle connection interrupted."),
    );
  }
  return pool;
}
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
