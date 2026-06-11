import type { PipelineStage } from "./types";
import {
  dateField,
  hasPvInstallLink,
  textField,
  type TapeRecord,
} from "./record";

export type PipelineSignals = {
  jobStatus: string | null;
  ntpAppStatus: string | null;
  saleDate: string | null;
  cancelDate: string | null;
  installCompletedDate: string | null;
  hasPvInstall: boolean;
};

export function signalsFromTapeRecord(record: TapeRecord): PipelineSignals {
  return {
    jobStatus: textField(record, "project_status"),
    ntpAppStatus: textField(record, "ntp_app_status"),
    saleDate: dateField(record, "sale_date"),
    cancelDate: dateField(record, "cancel_date"),
    installCompletedDate: dateField(record, "install_completed_date"),
    hasPvInstall: hasPvInstallLink(record),
  };
}

export function signalsFromRow(row: {
  job_status: string | null;
  ntp_app_status?: string | null;
  sale_date: string | null;
  cancel_date: string | null;
  install_completed_date?: string | null;
  has_install?: boolean | null;
  pipeline_stage?: string | null;
  raw_tape: unknown;
}): PipelineSignals {
  const fromDb =
    row.ntp_app_status != null ||
    row.install_completed_date != null ||
    row.has_install != null ||
    row.pipeline_stage != null;

  if (fromDb) {
    return {
      jobStatus: row.job_status,
      ntpAppStatus: row.ntp_app_status ?? null,
      saleDate: row.sale_date,
      cancelDate: row.cancel_date,
      installCompletedDate: row.install_completed_date ?? null,
      hasPvInstall: row.has_install ?? false,
    };
  }

  const record = row.raw_tape as TapeRecord;
  if (record?.fields) {
    return signalsFromTapeRecord(record);
  }

  return {
    jobStatus: row.job_status,
    ntpAppStatus: null,
    saleDate: row.sale_date,
    cancelDate: row.cancel_date,
    installCompletedDate: null,
    hasPvInstall: false,
  };
}

function isCancelled(signals: PipelineSignals): boolean {
  if (signals.cancelDate) return true;
  const job = signals.jobStatus?.toUpperCase() ?? "";
  const ntp = signals.ntpAppStatus?.toUpperCase() ?? "";
  return job.includes("CANCEL") || ntp.includes("CANCEL");
}

function hasInstall(signals: PipelineSignals): boolean {
  return signals.hasPvInstall || !!signals.installCompletedDate;
}

function hasDeal(signals: PipelineSignals): boolean {
  if (signals.saleDate) return true;
  const ntp = signals.ntpAppStatus?.trim();
  return !!ntp;
}

export function classifyPipelineStage(signals: PipelineSignals): PipelineStage {
  if (isCancelled(signals)) return "cancelled";
  if (hasInstall(signals)) return "install";
  if (hasDeal(signals)) return "deal";
  return "lead";
}

export const DEAL_STAGES: PipelineStage[] = ["deal", "install", "cancelled"];
export const INSTALL_STAGES: PipelineStage[] = ["install", "cancelled"];
