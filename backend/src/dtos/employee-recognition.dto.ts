export interface CreateRecognitionDto {
  recognizedBy: { id: number };
  recognizedEmployee: { id: number };
  category?: string;
  message: string;
  project: string;
}

export interface UpdateRecognitionDto {
  category?: string;
  message?: string;
  project?: string;
}
