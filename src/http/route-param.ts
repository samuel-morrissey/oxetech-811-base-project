export function routeParam(value: string | string[]): string {
  return typeof value === "string" ? value : value[0];
}
