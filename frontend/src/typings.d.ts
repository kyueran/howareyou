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

  type UserRole = 'volunteer' | 'public' | 'staff';

  type UserInfo = {
    id?: number;
    name?: string;
    role?: UserRole;
  };

  type ResidentInfo = {
    id: number; // Unique identifier for the resident
    name: string; // Resident's name
    address: string; // Resident's address
    gender: number; // 0 for male, 1 for female
    phoneNumber: string; // Resident's phone number
    [key: string]: any; // Optional: Allows for additional properties
  };
}
