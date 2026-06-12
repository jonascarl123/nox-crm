import { unstable_cache } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export type TapeSchema = {
  hasPipeline: boolean;
  hasOrg: boolean;
};

function columnMissing(error: { message?: string } | null, column: string) {
  return Boolean(error?.message?.includes(column));
}

export const getTapeSchema = unstable_cache(
  async (): Promise<TapeSchema> => {
    const supabase = createServerSupabase();
    const [{ error: pipelineError }, { error: orgError }] = await Promise.all([
      supabase.from("tape_customers").select("pipeline_stage").limit(1),
      supabase.from("tape_customers").select("division").limit(1),
    ]);

    return {
      hasPipeline: !columnMissing(pipelineError, "pipeline_stage"),
      hasOrg: !columnMissing(orgError, "division"),
    };
  },
  ["tape-schema"],
  { revalidate: 3600 }
);
