export function getLogicalDay(date: Date | string | number = new Date()): string {
  const d = new Date(date);
  d.setHours(d.getHours() - 6);
  return d.toISOString().split('T')[0];
}
