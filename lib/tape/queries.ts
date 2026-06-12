import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  classifyPipelineStage,
  DEAL_STAGES,
  INSTALL_STAGES,
  signalsFromRow,
} from "@/lib/tape/pipeline";
import { mergePipelineIndex, readPipelineIndex } from "@/lib/tape/pipeline-index";
import { getTapeSchema } from "@/lib/tape/schema";
import { cleanRepTitle } from "@/lib/tape/org";
import type { PipelineStage, TapeCustomer, TapeCustomerRow } from "@/lib/tape/types";

const BASE_COLUMNS = [
  "id",
  "tape_record_id",
  "pid",
  "customer_name",
  "customer_address",
  "customer_city",
  "customer_state",
  "customer_zip",
  "customer_email",
  "customer_phone",
  "product_name",
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
  "synced_at",
] as const;

const PIPELINE_COLUMNS = [
  "ntp_app_status",
  "install_completed_date",
  "pipeline_stage",
  "has_install",
] as const;

const ORG_COLUMNS = [
  "division",
  "region",
  "team",
  "office_name",
  "dealer_name",
  "state",
  "market",
] as const;

function toTapeCustomer(
  row: TapeCustomerRow,
  index = readPipelineIndex()
): TapeCustomer {
  const indexed = mergePipelineIndex(row.tape_record_id, index);
  const signals = signalsFromRow({
    ...row,
    ntp_app_status: row.ntp_app_status ?? indexed?.ntpAppStatus ?? null,
    install_completed_date:
      row.install_completed_date ?? indexed?.installCompletedDate ?? null,
    has_install: row.has_install ?? indexed?.hasInstall ?? null,
    raw_tape: null,
  });

  const pipelineStage =
    row.pipeline_stage ??
    indexed?.pipelineStage ??
    classifyPipelineStage(signals);

  return {
    id: row.id,
    tapeRecordId: row.tape_record_id,
    pid: row.pid,
    customerName: row.customer_name,
    customerAddress: row.customer_address,
    customerCity: row.customer_city,
    customerState: row.customer_state,
    customerZip: row.customer_zip,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    productName: row.product_name,
    grossAccountValue: row.gross_account_value,
    jobStatus: row.job_status,
    ntpAppStatus: signals.ntpAppStatus,
    kw: row.kw,
    netEpc: row.net_epc,
    sowAmount: row.sow_amount,
    notes: row.notes,
    saleDate: row.sale_date,
    cancelDate: row.cancel_date,
    installCompletedDate: signals.installCompletedDate,
    closer1: cleanRepTitle(row.closer_1),
    setter1: cleanRepTitle(row.setter_1),
    closer2: cleanRepTitle(row.closer_2),
    division:
      row.division ?? indexed?.division ?? row.dealer_name ?? null,
    region: row.region ?? indexed?.region ?? null,
    team: row.team ?? indexed?.team ?? null,
    officeName: row.office_name ?? indexed?.officeName ?? null,
    state: row.state ?? indexed?.state ?? null,
    market: row.market ?? indexed?.market ?? null,
    pipelineStage,
    hasInstall: signals.hasPvInstall || !!signals.installCompletedDate,
    syncedAt: row.synced_at,
  };
}

async function fetchRows(stages?: PipelineStage[]): Promise<TapeCustomerRow[]> {
  const supabase = createServerSupabase();
  const schema = await getTapeSchema();

  const optionalColumns = [
    ...(schema.hasPipeline ? PIPELINE_COLUMNS : []),
    ...(schema.hasOrg ? ORG_COLUMNS : []),
  ];
  const select = [...BASE_COLUMNS, ...optionalColumns].join(", ");

  let query = supabase
    .from("tape_customers")
    .select(select)
    .order("customer_name", { ascending: true, nullsFirst: false });

  if (schema.hasPipeline && stages?.length) {
    query = query.in("pipeline_stage", stages);
  }

  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as unknown as TapeCustomerRow[];
}

async function loadRows(stageKey: string): Promise<TapeCustomerRow[]> {
  const stages =
    stageKey === "all" ? undefined : (stageKey.split(",") as PipelineStage[]);
  return fetchRows(stages);
}

function getRowsCached(stageKey: string) {
  return unstable_cache(
    async () => loadRows(stageKey),
    ["tape-customer-rows", stageKey],
    { revalidate: 60, tags: ["tape-customers"] }
  )();
}

async function loadCustomers(stages?: PipelineStage[]): Promise<TapeCustomer[]> {
  const stageKey = stages?.length ? stages.join(",") : "all";
  const index = readPipelineIndex();
  const rows = await getRowsCached(stageKey);
  const customers = rows.map((row) => toTapeCustomer(row, index));

  if (stages?.length) {
    return customers.filter((c) => stages.includes(c.pipelineStage));
  }
  return customers;
}

export const listTapeCustomers = cache(async () => loadCustomers());

export const listTapeDeals = cache(async () => {
  const customers = await loadCustomers(DEAL_STAGES);
  return customers.filter((c) => DEAL_STAGES.includes(c.pipelineStage));
});

export const listTapeInstalls = cache(async () => {
  const customers = await loadCustomers(INSTALL_STAGES);
  return customers.filter((c) => INSTALL_STAGES.includes(c.pipelineStage));
});
