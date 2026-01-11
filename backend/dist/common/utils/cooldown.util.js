"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCooldownActive = isCooldownActive;
function isCooldownActive(lastActionDate, cooldownDays) {
    const now = new Date();
    const cooldownEnd = new Date(lastActionDate);
    cooldownEnd.setDate(cooldownEnd.getDate() + cooldownDays);
    return now < cooldownEnd;
}
//# sourceMappingURL=cooldown.util.js.map