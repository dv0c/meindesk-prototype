// Deterministic, cycle-safe JSON stringify.
// - Sorts object keys for stable output
// - Preserves shared references (duplicates structure) and only replaces true cycles
export function stableStringify(value: unknown): string {
  const inStack = new WeakSet<object>();

  const normalize = (val: any): any => {
    if (val === null) return null;
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean") return val;
    if (t === "bigint") return val.toString();
    if (t === "undefined" || t === "function" || t === "symbol") return undefined;

    if (Array.isArray(val)) {
      if (inStack.has(val)) return "[Circular]";
      inStack.add(val);
      const out = val.map((v) => normalize(v));
      inStack.delete(val);
      return out;
    }

    if (t === "object") {
      if (inStack.has(val)) return "[Circular]";
      inStack.add(val);
      const keys = Object.keys(val).sort();
      const out: Record<string, any> = {};
      for (const k of keys) out[k] = normalize(val[k]);
      inStack.delete(val);
      return out;
    }

    return val;
  };

  return JSON.stringify(normalize(value));
}
