export type TapeField = {
  external_id?: string;
  values?: Array<Record<string, unknown>>;
};

export type TapeRecord = {
  record_id: number;
  fields: TapeField[];
};

export function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function getField(record: TapeRecord, externalId: string) {
  return record.fields.find((f) => f.external_id === externalId);
}

export function textField(record: TapeRecord, externalId: string): string | null {
  const field = getField(record, externalId);
  const val = field?.values?.[0]?.value;
  if (val == null || val === "") return null;
  if (typeof val === "object" && val !== null && "text" in val) {
    return String((val as { text?: string }).text ?? "").trim() || null;
  }
  return stripHtml(String(val));
}

export function decimalField(record: TapeRecord, externalId: string): number | null {
  const field = getField(record, externalId);
  const v = field?.values?.[0];
  if (v?.decimal != null) return Number(v.decimal);
  const val = v?.value;
  if (val == null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function relationTitle(record: TapeRecord, externalId: string): string | null {
  const field = getField(record, externalId);
  const val = field?.values?.[0]?.value;
  if (val && typeof val === "object" && "title" in val) {
    return String((val as { title?: string }).title ?? "").trim() || null;
  }
  return null;
}

export function relationId(record: TapeRecord, externalId: string): number | null {
  const field = getField(record, externalId);
  const val = field?.values?.[0]?.value;
  if (val && typeof val === "object" && "record_id" in val) {
    return Number((val as { record_id?: number }).record_id) || null;
  }
  return null;
}

export function dateField(record: TapeRecord, externalId: string): string | null {
  const field = getField(record, externalId);
  const startDate = field?.values?.[0]?.start_date;
  return startDate ? String(startDate) : null;
}

export function addressPart(record: TapeRecord, key: string): string | null {
  const field = getField(record, "address");
  const part = field?.values?.[0]?.[key];
  return part ? String(part).trim() : null;
}

export function hasPvInstallLink(record: TapeRecord): boolean {
  return (
    relationId(record, "pv_install_2_0__h") != null ||
    relationId(record, "pv_install_2_0") != null
  );
}
