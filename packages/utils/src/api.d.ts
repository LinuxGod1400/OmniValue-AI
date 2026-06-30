/**
 * API response envelope helpers.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface ResponseMeta {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
}
export declare function successResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T>;
export declare function errorResponse(code: string, message: string, details?: Record<string, unknown>): ApiResponse<never>;
export declare const ErrorCode: {
    readonly BAD_REQUEST: "BAD_REQUEST";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
};
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
//# sourceMappingURL=api.d.ts.map