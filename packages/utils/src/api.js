"use strict";
/**
 * API response envelope helpers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data, meta) {
    return { success: true, data, ...(meta !== undefined ? { meta } : {}) };
}
function errorResponse(code, message, details) {
    return {
        success: false,
        error: { code, message, ...(details !== undefined ? { details } : {}) },
    };
}
exports.ErrorCode = {
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
//# sourceMappingURL=api.js.map