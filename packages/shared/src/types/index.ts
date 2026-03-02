export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type { User, AuthResponse } from './auth.js';
