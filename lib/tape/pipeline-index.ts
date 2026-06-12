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

/** Bundled index shipped with the app (works on Vercel without a local build step). */
const BUNDLED_INDEX_PATH = resolve(
  process.cwd(),
  "data/tape-pipeline.json"
);

/** Local dev output from import / build-pipeline-index (optional override). */
const LOCAL_INDEX_PATH = resolve(process.cwd(), "tape-pipeline.json");

let memoryCache: PipelineIndex | null = null;

export function writePipelineIndex(index: PipelineIndex) {
  const json = JSON.stringify(index, null, 2);
  writeFileSync(LOCAL_INDEX_PATH, json);
  writeFileSync(BUNDLED_INDEX_PATH, json);
  memoryCache = index;
}

function readIndexFile(path: string): PipelineIndex | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as PipelineIndex;
  } catch {
    return null;
  }
}

export function readPipelineIndex(): PipelineIndex {
  if (memoryCache) return memoryCache;

  // Prefer freshly generated local index during dev; fall back to bundled data.
  memoryCache =
    readIndexFile(LOCAL_INDEX_PATH) ??
    readIndexFile(BUNDLED_INDEX_PATH) ??
    {};

  return memoryCache;
}

export function mergePipelineIndex(
  tapeRecordId: number,
  index: PipelineIndex
): PipelineIndexEntry | null {
  return index[String(tapeRecordId)] ?? null;
}
