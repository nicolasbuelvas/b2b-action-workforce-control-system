export function isCooldownActive(
  lastActionDate: Date,
  cooldownDays: number,
): boolean {
  const now = new Date();
  const cooldownEnd = new Date(lastActionDate);
  cooldownEnd.setDate(cooldownEnd.getDate() + cooldownDays);

  return now < cooldownEnd;
}
