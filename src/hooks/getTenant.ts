import { headers } from "next/headers";

export function getTenant() {
  const tenant = headers().get("x-tenant") || "prototype";
  return tenant;
}
