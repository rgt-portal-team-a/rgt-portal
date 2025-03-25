import { Role } from "@/entities";

export interface CreateUserDto {
  username: string;
  email: string;
  profileImage?: string;
  role_id?: number;
  role: { id: number };
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
