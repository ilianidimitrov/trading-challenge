import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const file = process.argv[2];

if (!file) {
  console.error("Usage: node scripts/run-migration.mjs <sql-file>");
  process.exit(1);
}

try {
  const envText = readFileSync(join(root, ".env"), "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
} catch {
  console.error("Missing .env file");
  process.exit(1);
}

const projectRef = "kwwiapngowswthuybavs";
const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Add SUPABASE_DB_PASSWORD to .env");
  process.exit(1);
}

const client = new pg.Client({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${projectRef}`,
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const sql = readFileSync(join(root, file), "utf8");

await client.connect();
console.log(`Running ${file}...`);
await client.query(sql);
console.log("OK");
await client.end();
