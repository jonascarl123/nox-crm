import type { TapeCustomer } from "./types";

export function fullAddress(c: TapeCustomer): string {
  return [
    c.customerAddress,
    c.customerCity,
    c.customerState,
    c.customerZip,
  ]
    .filter(Boolean)
    .join(", ");
}
