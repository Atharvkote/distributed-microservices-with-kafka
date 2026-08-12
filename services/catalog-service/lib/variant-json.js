/**
 * Normalize Mongoose Map-typed or odd-shaped `attributes` for JSON responses.
 * @param {unknown} attributes
 * @returns {Record<string, string>}
 */
export function normalizeVariantAttributes(attributes) {
  if (attributes == null) return {};
  if (attributes instanceof Map) {
    const out = {};
    for (const [k, v] of attributes) {
      out[String(k)] = v == null ? "" : String(v);
    }
    return out;
  }
  if (typeof attributes === "object" && !Array.isArray(attributes)) {
    const out = {};
    for (const [k, v] of Object.entries(attributes)) {
      out[String(k)] = v == null ? "" : String(v);
    }
    return out;
  }
  return {};
}

/** @param {Record<string, unknown> | null | undefined} variant */
export function normalizeVariantDoc(variant) {
  if (!variant || typeof variant !== "object") return variant;
  return {
    ...variant,
    attributes: normalizeVariantAttributes(variant.attributes),
  };
}

/** @param {Array<Record<string, unknown>> | undefined} variants */
export function normalizeVariantDocs(variants) {
  return (variants || []).map((v) => normalizeVariantDoc(v));
}
