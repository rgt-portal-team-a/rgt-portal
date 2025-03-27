import { Role } from "@/entities";
import { CreateEmployeeDto } from "./employee.dto";

export interface CreateUserDto {
  username: string;
  email: string;
  profileImage?: string;
  role_id?: number;
  role?: { id: number };
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}


export interface UpdateUserAndEmployeeDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  username?: string;
}
