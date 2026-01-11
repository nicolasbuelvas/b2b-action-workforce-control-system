"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDomain = normalizeDomain;
exports.normalizeLinkedInUrl = normalizeLinkedInUrl;
exports.normalizeText = normalizeText;
function normalizeDomain(domain) {
    return domain
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .trim();
}
function normalizeLinkedInUrl(url) {
    return url
        .toLowerCase()
        .split('?')[0]
        .replace(/\/$/, '')
        .trim();
}
function normalizeText(value) {
    return value.toLowerCase().trim();
}
//# sourceMappingURL=normalization.util.js.map