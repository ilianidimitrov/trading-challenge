import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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

const poolerHost = `aws-0-eu-west-1.pooler.supabase.com`;

async function connect() {
  const client = new pg.Client({
    host: poolerHost,
    port: 5432,
    user: `postgres.${projectRef}`,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

const cleanupSql = `
DELETE FROM public.trades
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@challenge.demo');

DELETE FROM public.profiles
WHERE id IN (SELECT id FROM auth.users WHERE email LIKE '%@challenge.demo');

DELETE FROM auth.identities
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@challenge.demo');

DELETE FROM auth.users
WHERE email LIKE '%@challenge.demo';
`;

async function main() {
  const client = await connect();
  console.log("Removing demo users and trades...");
  await client.query(cleanupSql);

  const { rows } = await client.query(`SELECT count(*)::int AS users FROM public.profiles`);
  const { rows: trades } = await client.query(`SELECT count(*)::int AS trades FROM public.trades`);
  console.log(`Done. Profiles: ${rows[0].users}, Trades: ${trades[0].trades}`);
  await client.end();
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
