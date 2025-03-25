export interface CreateRecognitionDto {
  recognizedById: number;
  recognizedEmployeeId: number;
  category?: string;
  message: string;
  project: string;
}

export interface UpdateRecognitionDto {
  category?: string;
  message?: string;
  project?: string;
}
