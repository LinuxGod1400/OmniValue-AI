"use strict";
/**
 * Date / time utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nowIso = nowIso;
exports.parseDate = parseDate;
exports.formatDate = formatDate;
/** Return an ISO-8601 timestamp string for the current moment. */
function nowIso() {
    return new Date().toISOString();
}
/** Parse a date-like value and return a Date, or null if invalid. */
function parseDate(value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}
/** Format a Date as a human-readable short date (locale-independent). */
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}
//# sourceMappingURL=date.js.map