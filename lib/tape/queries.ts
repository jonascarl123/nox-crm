import { createServerSupabase } from "@/lib/supabase/server";
import {
  classifyPipelineStage,
  DEAL_STAGES,
  INSTALL_STAGES,
  signalsFromRow,
} from "@/lib/tape/pipeline";
import { mergePipelineIndex, readPipelineIndex } from "@/lib/tape/pipeline-index";
import { cleanRepTitle } from "@/lib/tape/org";
import type { TapeCustomer, TapeCustomerRow } from "@/lib/tape/types";

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
];

const PIPELINE_COLUMNS = [
  "ntp_app_status",
  "install_completed_date",
  "pipeline_stage",
  "has_install",
];

const ORG_COLUMNS = [
  "division",
  "region",
  "team",
  "office_name",
  "dealer_name",
  "state",
  "market",
];

const OPTIONAL_COLUMNS = [...PIPELINE_COLUMNS, ...ORG_COLUMNS];

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
      row.division ??
      indexed?.division ??
      row.dealer_name ??
      null,
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

async function fetchAllRows(): Promise<TapeCustomerRow[]> {
  const supabase = createServerSupabase();

  let select = [...BASE_COLUMNS, ...OPTIONAL_COLUMNS].join(", ");
  let result = await supabase
    .from("tape_customers")
    .select(select)
    .order("customer_name", { ascending: true, nullsFirst: false });

  if (
    result.error &&
    OPTIONAL_COLUMNS.some((col) => result.error!.message.includes(col))
  ) {
    select = BASE_COLUMNS.join(", ");
    result = await supabase
      .from("tape_customers")
      .select(select)
      .order("customer_name", { ascending: true, nullsFirst: false });
  }

  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as unknown as TapeCustomerRow[];
}

export async function listTapeCustomers(): Promise<TapeCustomer[]> {
  const index = readPipelineIndex();
  const rows = await fetchAllRows();
  return rows.map((row) => toTapeCustomer(row, index));
}

export async function listTapeDeals(): Promise<TapeCustomer[]> {
  const customers = await listTapeCustomers();
  return customers.filter((c) => DEAL_STAGES.includes(c.pipelineStage));
}

export async function listTapeInstalls(): Promise<TapeCustomer[]> {
  const customers = await listTapeCustomers();
  return customers.filter((c) => INSTALL_STAGES.includes(c.pipelineStage));
}
