import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { EmployeeRecognition } from "@/entities/employee-recognition.entity";
import { CreateRecognitionDto } from "@/dtos/employee-recognition.dto";

export class EmployeeRecognitionService {
  private recognitionRepository: Repository<EmployeeRecognition>;

  constructor() {
    this.recognitionRepository = AppDataSource.getRepository(EmployeeRecognition);
  }

  async findAll(): Promise<EmployeeRecognition[]> {
    return this.recognitionRepository.find({
      relations: ["recognizedBy.user", "recognizedEmployee.user"],
    });
  }

  async findByEmployee(employeeId: number): Promise<EmployeeRecognition[]> {
    return this.recognitionRepository.find({
      where: [{ recognizedEmployee: { id: employeeId } }, { recognizedBy: { id: employeeId } }],
      relations: ["recognizedBy", "recognizedEmployee"],
    });
  }

  async create(recognitionData: CreateRecognitionDto): Promise<EmployeeRecognition> {
    const recognition = this.recognitionRepository.create(recognitionData);
    return this.recognitionRepository.save(recognition);
  }

  async createBulk(recognitionsData: CreateRecognitionDto[]): Promise<EmployeeRecognition[]> {
    const recognitions = recognitionsData.map((data) => this.recognitionRepository.create(data));
    return this.recognitionRepository.save(recognitions);
  }

  async delete(id: number): Promise<void> {
    await this.recognitionRepository.delete(id);
  }

  async findByCategory(category: string): Promise<EmployeeRecognition[]> {
    return this.recognitionRepository.find({
      where: { category },
      relations: ["recognizedBy", "recognizedEmployee", "project"],
    });
  }
}
