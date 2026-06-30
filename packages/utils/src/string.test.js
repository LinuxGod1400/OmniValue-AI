"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const string_js_1 = require("./string.js");
(0, vitest_1.describe)('truncate', () => {
    (0, vitest_1.it)('returns string unchanged when within limit', () => {
        (0, vitest_1.expect)((0, string_js_1.truncate)('hello', 10)).toBe('hello');
    });
    (0, vitest_1.it)('truncates and appends ellipsis', () => {
        const result = (0, string_js_1.truncate)('hello world', 8);
        (0, vitest_1.expect)(result).toHaveLength(8);
        (0, vitest_1.expect)(result.endsWith('…')).toBe(true);
    });
});
(0, vitest_1.describe)('toKebabCase', () => {
    (0, vitest_1.it)('converts camelCase to kebab-case', () => {
        (0, vitest_1.expect)((0, string_js_1.toKebabCase)('myVariableName')).toBe('my-variable-name');
    });
    (0, vitest_1.it)('converts spaces to hyphens', () => {
        (0, vitest_1.expect)((0, string_js_1.toKebabCase)('hello world')).toBe('hello-world');
    });
});
(0, vitest_1.describe)('capitalize', () => {
    (0, vitest_1.it)('capitalizes the first letter', () => {
        (0, vitest_1.expect)((0, string_js_1.capitalize)('hello')).toBe('Hello');
    });
    (0, vitest_1.it)('handles empty string', () => {
        (0, vitest_1.expect)((0, string_js_1.capitalize)('')).toBe('');
    });
});
//# sourceMappingURL=string.test.js.map