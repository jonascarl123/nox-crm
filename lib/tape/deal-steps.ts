/**
 * @deprecated Import from `@/lib/workflow/constants` instead.
 * Kept for backward-compatible imports during migration.
 */
export {
  DEAL_STEP_ORDER as TAPE_DEAL_STEP_ORDER,
  DEAL_STEP_LABELS as TAPE_DEAL_STEP_LABELS,
  activeDealStepKey as activeDealStep,
  type DealStepKey as TapeDealStep,
  type DealStepStatus as TapeStepStatus,
} from "@/lib/workflow/constants";

export { inferDealStepsFromTape as inferDealSteps } from "@/lib/workflow/infer";
