export interface ApiResponse<T> {
    accessToken: string;
    success: boolean;
    data: T;
    message?: string;
  }
  export interface ErrorResponse {
    success?: boolean;
    data: {
      message?: string,
    }
    error?: [
      message?: string,
      field?: string,
    ]
  }