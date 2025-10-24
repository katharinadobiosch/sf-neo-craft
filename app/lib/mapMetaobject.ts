// Minimal-Mapping für dein aktuelles Schema
type Field = {key: string; type: string; value: string};

export type DealerRow = {
  country?: string;
  name?: string;
  city?: string;
  website?: string;
};

export function mapMetaobject(fields: Field[]): DealerRow {
  const o: Record<string, string> = {};
  for (const f of fields ?? []) o[f.key] = f.value;
  return {
    country: o.country,
    name: o.name,
    city: o.city,
    website: o.website,
  };
}
