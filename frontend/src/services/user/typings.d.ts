// Type definitions for API responses
declare namespace API {
  type SuccessResponse<T> = {
    status: 'ok'; // When the status is 'ok', data is required and is of type T
    data: T;
  };

  type ErrorResponse = {
    status: 'error'; // When the status is 'error', data is not present
    errorCode: string;
    message: string;
  };

  type APIResponse<T> = SuccessResponse<T> | ErrorResponse;

  type LoginParams = {
    username?: string;
    password?: string;
  };

  type LoginResponse = ApiResponse<UserInfo>;

  type UserRole = 'volunteer' | 'public';

  type UserInfo = {
    id?: number;
    name?: string;
    role?: UserRole;
  };
}
