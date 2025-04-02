import axios from "axios"
import {ApiResponse} from "./types"

export function getApiErrorMessage(error: unknown): Error {
  // Handle axios or fetch network errors
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const apiError = error.response.data as ApiResponse<null>;
      return new Error(
        apiError.message || 
        error.response.statusText || 
        'An API error occurred'
      );
    }
    
    // For network errors without response
    return new Error(
      error.message || 
      'Network error occurred'
    );
  }

  if (error instanceof Error) {
    return error;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unexpected error occurred');
}