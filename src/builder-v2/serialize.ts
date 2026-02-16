import { createStarterDocument } from "./defaults";
import { BuilderDocument } from "./types";

export function isBuilderDocument(value: unknown): value is BuilderDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as BuilderDocument;
  return candidate.version === 1 && Array.isArray(candidate.rootIds) && !!candidate.nodes;
}

export function parseBuilderDocument(input: unknown): BuilderDocument {
  if (isBuilderDocument(input)) return input;
  return createStarterDocument();
}
