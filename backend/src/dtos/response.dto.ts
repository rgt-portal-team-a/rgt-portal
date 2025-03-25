export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  metadata?: {
    page?: number;
    totalPages?: number;
    total?: number;
  };
}
