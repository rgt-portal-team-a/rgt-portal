export interface ApiResponse<T> {
    data: T;
    error?:string;
    message: string;
    success: boolean;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  }
  
  export interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
  }