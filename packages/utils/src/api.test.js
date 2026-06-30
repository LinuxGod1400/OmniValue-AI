"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const api_js_1 = require("./api.js");
(0, vitest_1.describe)('successResponse', () => {
    (0, vitest_1.it)('returns success: true with data', () => {
        const res = (0, api_js_1.successResponse)({ id: '1' });
        (0, vitest_1.expect)(res.success).toBe(true);
        (0, vitest_1.expect)(res.data).toEqual({ id: '1' });
        (0, vitest_1.expect)(res.error).toBeUndefined();
    });
    (0, vitest_1.it)('includes meta when provided', () => {
        const meta = { page: 1, pageSize: 10, total: 100, totalPages: 10 };
        const res = (0, api_js_1.successResponse)([], meta);
        (0, vitest_1.expect)(res.meta).toEqual(meta);
    });
});
(0, vitest_1.describe)('errorResponse', () => {
    (0, vitest_1.it)('returns success: false with error envelope', () => {
        const res = (0, api_js_1.errorResponse)(api_js_1.ErrorCode.NOT_FOUND, 'Resource not found');
        (0, vitest_1.expect)(res.success).toBe(false);
        (0, vitest_1.expect)(res.error?.code).toBe('NOT_FOUND');
        (0, vitest_1.expect)(res.error?.message).toBe('Resource not found');
    });
    (0, vitest_1.it)('includes details when provided', () => {
        const res = (0, api_js_1.errorResponse)(api_js_1.ErrorCode.BAD_REQUEST, 'Validation failed', { field: 'email' });
        (0, vitest_1.expect)(res.error?.details).toEqual({ field: 'email' });
    });
});
//# sourceMappingURL=api.test.js.map