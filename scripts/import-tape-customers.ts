import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import {
  addressPart,
  dateField,
  decimalField,
  relationId,
  relationTitle,
  textField,
  type TapeRecord,
} from "../lib/tape/record";
import {
  classifyPipelineStage,
  signalsFromTapeRecord,
} from "../lib/tape/pipeline";
import { extractOrgFromRecord } from "../lib/tape/org";
import { writePipelineIndex, type PipelineIndex } from "../lib/tape/pipeline-index";

config({ path: resolve(__dirname, "../.env.local") });

const INPUT_FILE = resolve(__dirname, "../customers.json");

function mapRecord(record: TapeRecord) {
  const signals = signalsFromTapeRecord(record);
  const org = extractOrgFromRecord(record);
  const pipelineStage = classifyPipelineStage(signals);
  const hasInstall =
    signals.hasPvInstall || !!signals.installCompletedDate;

  return {
    tape_record_id: record.record_id,
    pid: textField(record, "our_"),
    prospect_id: relationId(record, "prospect"),
    homeowner_id: record.record_id,
    product_name: relationTitle(record, "finance_company__rel"),
    customer_name: textField(record, "customer_name"),
    customer_address: addressPart(record, "street_address"),
    customer_city: addressPart(record, "city"),
    customer_state: relationTitle(record, "state"),
    customer_zip: addressPart(record, "postal_code"),
    customer_email: textField(record, "email_address"),
    customer_phone: textField(record, "phone_number"),
    gross_account_value: decimalField(record, "total_system_cost_calc__h"),
    job_status: signals.jobStatus,
    ntp_app_status: signals.ntpAppStatus,
    has_install: hasInstall,
    install_completed_date: signals.installCompletedDate,
    pipeline_stage: pipelineStage,
    kw: decimalField(record, "contracted_system_size"),
    net_epc: decimalField(record, "net_epc"),
    sow_amount: decimalField(record, "total_system_cost_calc__h"),
    notes: textField(record, "next_steps___notes"),
    sale_date: signals.saleDate,
    cancel_date: signals.cancelDate,
    closer_1: relationTitle(record, "primary_sales_rep"),
    setter_1: relationTitle(record, "setter"),
    closer_2: relationTitle(record, "secondary_account_executive"),
    dealer_name: org.dealerName,
    office_name: org.officeName,
    division: org.division,
    region: org.region,
    team: org.team,
    state: org.state,
    market: org.market,
    raw_tape: record,
    synced_at: new Date().toISOString(),
  };
}

const BASE_COLUMNS = [
  "tape_record_id",
  "pid",
  "prospect_id",
  "homeowner_id",
  "product_name",
  "customer_name",
  "customer_address",
  "customer_city",
  "customer_state",
  "customer_zip",
  "customer_email",
  "customer_phone",
  "gross_account_value",
  "job_status",
  "kw",
  "net_epc",
  "sow_amount",
  "notes",
  "sale_date",
  "cancel_date",
  "closer_1",
  "setter_1",
  "closer_2",
  "raw_tape",
  "synced_at",
] as const;

const PIPELINE_COLUMNS = [
  "ntp_app_status",
  "has_install",
  "install_completed_date",
  "pipeline_stage",
] as const;

const ORG_COLUMNS = [
  "dealer_name",
  "office_name",
  "division",
  "region",
  "team",
  "state",
  "market",
] as const;

const OPTIONAL_COLUMNS = [...PIPELINE_COLUMNS, ...ORG_COLUMNS] as const;

function stripOptionalFields(row: ReturnType<typeof mapRecord>) {
  const copy = { ...row };
  for (const key of OPTIONAL_COLUMNS) {
    delete (copy as Record<string, unknown>)[key];
  }
  return copy;
}

function stageCounts(rows: ReturnType<typeof mapRecord>[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.pipeline_stage] = (counts[row.pipeline_stage] ?? 0) + 1;
  }
  return counts;
}

async function upsertRows(
  supabase: ReturnType<typeof createClient>,
  rows: Record<string, unknown>[]
) {
  const { data, error } = await supabase
    .from("tape_customers")
    .upsert(rows, { onConflict: "tape_record_id" })
    .select("tape_record_id");

  if (error) throw new Error(error.message);
  return data?.length ?? rows.length;
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const payload = JSON.parse(readFileSync(INPUT_FILE, "utf-8")) as {
    records: TapeRecord[];
  };

  const rows = payload.records.map(mapRecord);
  const supabase = createClient(url, key);

  const pipelineIndex: PipelineIndex = {};
  for (const row of rows) {
    pipelineIndex[String(row.tape_record_id)] = {
      pipelineStage: row.pipeline_stage,
      ntpAppStatus: row.ntp_app_status,
      hasInstall: row.has_install,
      installCompletedDate: row.install_completed_date,
      division: row.division,
      region: row.region,
      team: row.team,
      officeName: row.office_name,
      state: row.state,
      market: row.market,
    };
  }
  writePipelineIndex(pipelineIndex);
  console.log(`Wrote tape-pipeline.json (${rows.length} entries)`);

  let imported: number;
  try {
    imported = await upsertRows(supabase, rows as Record<string, unknown>[]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("pipeline_stage") ||
      message.includes("ntp_app_status") ||
      message.includes("has_install") ||
      message.includes("install_completed_date") ||
      message.includes("division") ||
      message.includes("office_name") ||
      message.includes("dealer_name")
    ) {
      console.warn(
        "Optional columns missing — run supabase/migrations/002 and 003, then re-import."
      );
      console.warn("Importing without optional columns (index still updated).");
      imported = await upsertRows(
        supabase,
        rows.map(stripOptionalFields) as Record<string, unknown>[]
      );
    } else {
      throw err;
    }
  }

  console.log(`Imported ${imported} records into tape_customers`);
  console.log("Pipeline stages:", stageCounts(rows));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
