import { In, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { AppDataSource } from "@/database/data-source";
import { CreateUserDto, UpdateUserDto } from "@/dtos/user.dto";
import { Employee } from "@/entities/employee.entity";
import { UserStatus } from "@/entities/user.entity";
import { Logger } from "@/services/logger.service";

export class UserService {
  private userRepository: Repository<User>;
  private employeeRepository: Repository<Employee>;
  private logger: Logger;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.logger = new Logger("UserService");
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

  async createBatch(userData: CreateUserDto[]): Promise<User[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const users = userData.map(data => this.userRepository.create(data));
      const savedUsers = await this.userRepository.save(users);
      await queryRunner.commitTransaction();
      return savedUsers;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) {
        return null;
      }

      // Merge the update data with the existing user
      const updatedUser = this.userRepository.merge(user, updateUserDto);
      
      // Save the updated user
      const savedUser = await this.userRepository.save(updatedUser);
      
      this.logger.debug("Updated user", { userId: id, additionalInfo: { username: savedUser.username } });
      return savedUser;
    } catch (error) {
      this.logger.error("Error updating user", { userId: id, error });
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // find all users whose ids are in a given list of usersids
  async findUsersByIds(userIds: number[]): Promise<User[]> {
    return this.userRepository.find({
      where: { id: In(userIds) },
      relations: ["role", "employee"],
    });
  }

  async findByRole(roleName: string): Promise<User[]> {
    return this.userRepository.find({
      where: { role: { name: roleName } },
      relations: ["role", "employee"],
    });
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    return this.userRepository.find({
      where: { status },
      relations: ["role", "employee"],
    });
  }

}
