"use strict";
/**
 * String utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = truncate;
exports.toKebabCase = toKebabCase;
exports.capitalize = capitalize;
/** Truncate a string to `maxLength` characters, appending `…` if truncated. */
function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 1) + '…';
}
/** Convert a string to kebab-case. */
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
/** Capitalize the first letter of a string. */
function capitalize(str) {
    if (str.length === 0)
        return str;
    return str[0].toUpperCase() + str.slice(1);
}
//# sourceMappingURL=string.js.map