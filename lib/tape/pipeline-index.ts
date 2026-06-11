import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import type { PipelineStage } from "./types";

export type PipelineIndexEntry = {
  pipelineStage: PipelineStage;
  ntpAppStatus: string | null;
  hasInstall: boolean;
  installCompletedDate: string | null;
  division: string | null;
  region: string | null;
  team: string | null;
  officeName: string | null;
  state: string | null;
  market: string | null;
};

export type PipelineIndex = Record<string, PipelineIndexEntry>;

const INDEX_PATH = resolve(process.cwd(), "tape-pipeline.json");

export function writePipelineIndex(index: PipelineIndex) {
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

export function readPipelineIndex(): PipelineIndex {
  try {
    return JSON.parse(readFileSync(INDEX_PATH, "utf-8")) as PipelineIndex;
  } catch {
    return {};
  }
}

export function mergePipelineIndex(
  tapeRecordId: number,
  index: PipelineIndex
): PipelineIndexEntry | null {
  return index[String(tapeRecordId)] ?? null;
}
