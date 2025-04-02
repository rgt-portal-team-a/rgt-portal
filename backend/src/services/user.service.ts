import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { AppDataSource } from "@/database/data-source";
import { CreateUserDto, UpdateUserDto } from "@/dtos/user.dto";
import { Employee } from "@/entities/employee.entity";

export class UserService {
  private userRepository: Repository<User>;
  private employeeRepository: Repository<Employee>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.employeeRepository = AppDataSource.getRepository(Employee);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ["role", "employee"],
    });
  }

  async findById(id: number): Promise<User | null> {
    const user = this.userRepository.findOne({
      where: { id },
      relations: ["role", "employee"],
    });
    console.log(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ["role"],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

}
