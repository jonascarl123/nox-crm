import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { PipelineIndex } from "../lib/tape/pipeline-index";

config({ path: resolve(__dirname, "../.env.local") });

const INDEX_PATH = resolve(__dirname, "../data/tape-pipeline.json");

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const index = JSON.parse(readFileSync(INDEX_PATH, "utf-8")) as PipelineIndex;
  const supabase = createClient(url, key);

  const { error: probeError } = await supabase
    .from("tape_customers")
    .select("pipeline_stage")
    .limit(1);

  if (probeError?.message.includes("pipeline_stage")) {
    console.error(
      "Missing pipeline columns. Run these in Supabase SQL editor first:\n" +
        "  supabase/migrations/002_tape_customers_pipeline.sql\n" +
        "  supabase/migrations/003_tape_customers_org.sql"
    );
    process.exit(1);
  }

  let updated = 0;
  for (const [tapeRecordId, entry] of Object.entries(index)) {
    const { error } = await supabase
      .from("tape_customers")
      .update({
        pipeline_stage: entry.pipelineStage,
        ntp_app_status: entry.ntpAppStatus,
        has_install: entry.hasInstall,
        install_completed_date: entry.installCompletedDate,
        division: entry.division,
        region: entry.region,
        team: entry.team,
        office_name: entry.officeName,
        state: entry.state,
        market: entry.market,
      })
      .eq("tape_record_id", Number(tapeRecordId));

    if (error) {
      console.warn(`Skip ${tapeRecordId}: ${error.message}`);
      continue;
    }
    updated++;
  }

  console.log(`Updated pipeline/org columns for ${updated} records.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
