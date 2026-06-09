const PREFIX = "tc_checklist_";

export function getChecklistKey(userId, phaseId) {
  return `${PREFIX}${userId || "local"}_${phaseId}`;
}

export function loadChecklist(userId, phaseId, ruleCount) {
  try {
    const raw = localStorage.getItem(getChecklistKey(userId, phaseId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === ruleCount) return parsed;
    }
  } catch { /* ignore */ }
  return Array(ruleCount).fill(false);
}

export function saveChecklist(userId, phaseId, checked) {
  try {
    localStorage.setItem(getChecklistKey(userId, phaseId), JSON.stringify(checked));
  } catch { /* ignore */ }
}
