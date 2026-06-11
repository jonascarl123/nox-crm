import { readFileSync } from "fs";
import { resolve } from "path";
import { type TapeRecord } from "../lib/tape/record";
import {
  classifyPipelineStage,
  signalsFromTapeRecord,
} from "../lib/tape/pipeline";
import { extractOrgFromRecord } from "../lib/tape/org";
import { writePipelineIndex, type PipelineIndex } from "../lib/tape/pipeline-index";

const INPUT_FILE = resolve(__dirname, "../customers.json");

function main() {
  const payload = JSON.parse(readFileSync(INPUT_FILE, "utf-8")) as {
    records: TapeRecord[];
  };

  const index: PipelineIndex = {};
  for (const record of payload.records) {
    const signals = signalsFromTapeRecord(record);
    const org = extractOrgFromRecord(record);
    index[String(record.record_id)] = {
      pipelineStage: classifyPipelineStage(signals),
      ntpAppStatus: signals.ntpAppStatus,
      hasInstall: signals.hasPvInstall || !!signals.installCompletedDate,
      installCompletedDate: signals.installCompletedDate,
      division: org.division,
      region: org.region,
      team: org.team,
      officeName: org.officeName,
      state: org.state,
      market: org.market,
    };
  }

  writePipelineIndex(index);
  const counts: Record<string, number> = {};
  for (const entry of Object.values(index)) {
    counts[entry.pipelineStage] = (counts[entry.pipelineStage] ?? 0) + 1;
  }
  console.log(`Wrote tape-pipeline.json (${payload.records.length} entries)`);
  console.log("Pipeline stages:", counts);
}

main();
