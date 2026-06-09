/**
 * Applies schema + migrations + seed to Supabase Postgres.
 * Run: node scripts/apply-supabase-sql.mjs
 * Requires SUPABASE_DB_PASSWORD in .env (not VITE_ — stays server-side only)
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env manually (no dotenv dep)
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

// Direct host is IPv6-only on some networks — resolve or use pooler fallback
const directHost = `db.${projectRef}.supabase.co`;
const poolerHost = `aws-0-eu-west-1.pooler.supabase.com`;

async function connect() {
  const attempts = [
  {
    label: "direct",
    config: {
      host: directHost,
      port: 5432,
      user: "postgres",
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    },
  },
  {
    label: "pooler (session)",
    config: {
      host: poolerHost,
      port: 5432,
      user: `postgres.${projectRef}`,
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    },
  },
  {
    label: "pooler (transaction)",
    config: {
      host: poolerHost,
      port: 6543,
      user: `postgres.${projectRef}`,
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    },
  },
  ];

  let lastErr;
  for (const { label, config } of attempts) {
    const client = new pg.Client(config);
    try {
      await client.connect();
      console.log(`Connected via ${label}`);
      return client;
    } catch (err) {
      lastErr = err;
      console.warn(`${label} failed: ${err.message}`);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  throw lastErr;
}

const files = [
  "supabase/schema.sql",
  "supabase/migrations/002_storage_and_trade_fields.sql",
  "supabase/seed.sql",
];

async function main() {
  const client = await connect();

  for (const file of files) {
    const sql = readFileSync(join(root, file), "utf8");
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`  OK`);
  }

  const { rows } = await client.query(`
    SELECT count(*)::int AS users FROM public.profiles;
  `);
  const { rows: trades } = await client.query(`
    SELECT count(*)::int AS trades FROM public.trades;
  `);
  console.log(`Done. Profiles: ${rows[0].users}, Trades: ${trades[0].trades}`);
  await client.end();
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
