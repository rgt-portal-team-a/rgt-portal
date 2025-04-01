import { AppDataSource } from "@/database/data-source";
import { Repository, In, Between, Not, IsNull } from "typeorm";
import { Recruitment } from "@/entities/recruitment.entity";
import { Employee, WorkType } from "@/entities/employee.entity";
import { User } from "@/entities/user.entity";
import { EmergencyContact } from "@/entities/emergency-contact.entity";
import { DatabaseService } from "@/services/database.service";
import { Logger } from "@/services/logger.service";
import { CreateRecruitmentDto, UpdateRecruitmentDto, RecruitmentFilterDto } from "@/dtos/recruitment.dto";
import { FailStage, RecruitmentStatus } from "@/defaults/enum";
import { CreateEmployeeDto } from "@/dtos/employee.dto";

export class RecruitmentService {
  private recruitmentRepository: Repository<Recruitment>;
  private employeeRepository: Repository<Employee>;
  private userRepository: Repository<User>;
  private emergencyContactRepository: Repository<EmergencyContact>;
  private databaseService: DatabaseService;
  private logger: Logger;

  constructor() {
    this.recruitmentRepository = AppDataSource.getRepository(Recruitment);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.userRepository = AppDataSource.getRepository(User);
    this.emergencyContactRepository = AppDataSource.getRepository(EmergencyContact);
    this.databaseService = new DatabaseService();
    this.logger = new Logger("RecruitmentService");
  }

  async findAll(
    filters?: RecruitmentFilterDto,
    relations: string[] = ["createdBy", "employee"],
    page = 1,
    limit = 20,
  ): Promise<{ recruitments: Recruitment[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      if (relations.includes("createdBy")) {
        queryBuilder.leftJoinAndSelect("recruitment.createdBy", "createdBy");
      }

      if (relations.includes("employee")) {
        queryBuilder.leftJoinAndSelect("recruitment.employee", "employee");
      }

      if (relations.includes("emergencyContacts")) {
        queryBuilder.leftJoinAndSelect("recruitment.emergencyContacts", "emergencyContacts");
      }

      if (filters) {
        if (filters.name) {
          queryBuilder.andWhere("recruitment.name LIKE :name", { name: `%${filters.name}%` });
        }

        if (filters.email) {
          queryBuilder.andWhere("recruitment.email LIKE :email", { email: `%${filters.email}%` });
        }

        if (filters.status) {
          queryBuilder.andWhere("recruitment.currentStatus = :status", { status: filters.status });
        }

        if (filters.type) {
          queryBuilder.andWhere("recruitment.type = :type", { type: filters.type });
        }

        if (filters.assignee) {
          queryBuilder.andWhere("recruitment.assignee = :assignee", { assignee: filters.assignee });
        }

        if (filters.dateFrom && filters.dateTo) {
          queryBuilder.andWhere("recruitment.date BETWEEN :dateFrom AND :dateTo", {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          });
        }

        if (filters.createdFrom && filters.createdTo) {
          queryBuilder.andWhere("recruitment.createdAt BETWEEN :createdFrom AND :createdTo", {
            createdFrom: filters.createdFrom,
            createdTo: filters.createdTo,
          });
        }

        if (filters.position) {
          queryBuilder.andWhere("recruitment.position LIKE :position", { position: `%${filters.position}%` });
        }

        if (filters.source) {
          queryBuilder.andWhere("recruitment.source = :source", { source: filters.source });
        }

        if (filters.location) {
          queryBuilder.andWhere("recruitment.location = :location", { location: filters.location });
        }
      }

      queryBuilder.orderBy("recruitment.createdAt", "DESC");

      const total = await queryBuilder.getCount();

      queryBuilder.skip(skip).take(limit);

      const recruitments = await queryBuilder.getMany();

      const totalPages = Math.ceil(total / limit);

      return {
        recruitments,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error("Error fetching recruitments:", error);
      throw error;
    }
  }

  async findById(id: string, relations: string[] = ["createdBy", "employee", "emergencyContacts"]): Promise<Recruitment | null> {
    try {
      return this.recruitmentRepository.findOne({
        where: { id },
        relations,
      });
    } catch (error) {
      this.logger.error(`Error fetching recruitment with ID ${id}:`, error);
      throw error;
    }
  }

  // create batch recruitment
  async createBatch(recruitmentData: CreateRecruitmentDto[]): Promise<Recruitment[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const recruitments = recruitmentData.map((data) => this.recruitmentRepository.create(data));
      const savedRecruitments = await queryRunner.manager.save(recruitments);
      await queryRunner.commitTransaction();
      return savedRecruitments;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Error creating batch recruitments:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(data: CreateRecruitmentDto, currentUserId: number): Promise<Recruitment> {
    const queryRunner = await DatabaseService.createTransaction();

    try {
      const user = await this.userRepository.findOne({ where: { id: currentUserId } });
      if (!user) {
        throw new Error("User not found");
      }

      if (data.assignee) {
        const assignee = await this.employeeRepository.findOne({ where: { id: parseInt(data.assignee) } });
        if (!assignee) {
          throw new Error("Assigned employee not found");
        }
      }

      const recruitment = this.recruitmentRepository.create({
        ...data,
        createdBy: user,
      });

      const savedRecruitment = await queryRunner.manager.save(recruitment);

      if (data.emergencyContacts && data.emergencyContacts.length > 0) {
        const emergencyContacts = data.emergencyContacts.map((contact) =>
          this.emergencyContactRepository.create({
            ...contact,
            recruitment: savedRecruitment,
          }),
        );

        await queryRunner.manager.save(emergencyContacts);
      }

      await queryRunner.commitTransaction();

      return this.findById(savedRecruitment.id) as Promise<Recruitment>;
    } catch (error) {
      this.logger.error("Error creating recruitment:", error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, data: UpdateRecruitmentDto): Promise<Recruitment> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const recruitment = await this.findById(id);
      if (!recruitment) {
        throw new Error("Recruitment not found");
      }

      if (data.assignee) {
        const assignee = await this.employeeRepository.findOne({ where: { id: parseInt(data.assignee) } });
        if (!assignee) {
          throw new Error("Assigned employee not found");
        }
      }

      Object.assign(recruitment, data);

      await queryRunner.manager.save(recruitment);

      if (data.emergencyContacts) {
        if (recruitment.emergencyContacts?.length > 0) {
          await queryRunner.manager.remove(recruitment.emergencyContacts);
        }

        const emergencyContacts = data.emergencyContacts.map((contact) =>
          this.emergencyContactRepository.create({
            ...contact,
            recruitment,
          }),
        );

        await queryRunner.manager.save(emergencyContacts);
      }

      await queryRunner.commitTransaction();

      return this.findById(id) as Promise<Recruitment>;
    } catch (error) {
      this.logger.error(`Error updating recruitment with ID ${id}:`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, status: RecruitmentStatus, failStage?: FailStage, failReason?: string): Promise<Recruitment> {
    try {
      const recruitment = await this.findById(id);
      if (!recruitment) {
        throw new Error("Recruitment not found");
      }

      recruitment.currentStatus = status;

      if (status === RecruitmentStatus.NOT_HIRED && failStage) {
        recruitment.failStage = failStage;
        recruitment.failReason = failReason;
      }

      //   if (status === RecruitmentStatus.HIRED && !recruitment.employee) {
      //     const employee = this.employeeRepository.create({
      //       name: recruitment.name,
      //       email: recruitment.email,
      //       phoneNumber: recruitment.phoneNumber,
      //     });

      //     const savedEmployee = await this.employeeRepository.save(employee);
      //     recruitment.employee = savedEmployee;
      //   }

      if (
        ![
          RecruitmentStatus.HIRED,
          RecruitmentStatus.NOT_HIRED,
          RecruitmentStatus.CONSIDER_FOR_FUTURE,
          RecruitmentStatus.QUIT,
          RecruitmentStatus.FIRED,
        ].includes(status)
      ) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        recruitment.statusDueDate = dueDate;
      }

      return this.recruitmentRepository.save(recruitment);
    } catch (error) {
      this.logger.error(`Error updating status for recruitment with ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const recruitment = await this.findById(id);
      if (!recruitment) {
        throw new Error("Recruitment not found");
      }

      if (recruitment.emergencyContacts?.length > 0) {
        await this.emergencyContactRepository.remove(recruitment.emergencyContacts);
      }

      const result = await this.recruitmentRepository.remove(recruitment);
      return !!result;
    } catch (error) {
      this.logger.error(`Error deleting recruitment with ID ${id}:`, error);
      throw error;
    }
  }

  async getStatistics(): Promise<any> {
    try {
      const statusStats = await this.recruitmentRepository
        .createQueryBuilder("recruitment")
        .select("recruitment.currentStatus", "status")
        .addSelect("COUNT(recruitment.id)", "count")
        .groupBy("recruitment.currentStatus")
        .getRawMany();

      const sourceStats = await this.recruitmentRepository
        .createQueryBuilder("recruitment")
        .select("recruitment.source", "source")
        .addSelect("COUNT(recruitment.id)", "count")
        .groupBy("recruitment.source")
        .getRawMany();

      const monthlyStats = await this.recruitmentRepository
        .createQueryBuilder("recruitment")
        .select("DATE_FORMAT(recruitment.createdAt, '%Y-%m')", "month")
        .addSelect("COUNT(recruitment.id)", "count")
        .groupBy("month")
        .orderBy("month", "ASC")
        .getRawMany();

      const totalCount = await this.recruitmentRepository.count();
      const hiredCount = await this.recruitmentRepository.count({
        where: { currentStatus: RecruitmentStatus.HIRED },
      });

      const conversionRate = totalCount > 0 ? (hiredCount / totalCount) * 100 : 0;

      return {
        statusStats,
        sourceStats,
        monthlyStats,
        conversionRate,
        totalRecruitments: totalCount,
        totalHired: hiredCount,
      };
    } catch (error) {
      this.logger.error("Error fetching recruitment statistics:", error);
      throw error;
    }
  }

  async getByDueDate(days: number = 7): Promise<Recruitment[]> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      return this.recruitmentRepository.find({
        where: {
          statusDueDate: Between(today, futureDate),
          notified: false,
          currentStatus: Not(
            In([
              RecruitmentStatus.HIRED,
              RecruitmentStatus.NOT_HIRED,
              RecruitmentStatus.CONSIDER_FOR_FUTURE,
              RecruitmentStatus.QUIT,
              RecruitmentStatus.FIRED,
            ]),
          ),
        },
        relations: ["createdBy"],
      });
    } catch (error) {
      this.logger.error(`Error fetching recruitments by due date:`, error);
      throw error;
    }
  }

  async markAsNotified(id: string): Promise<Recruitment> {
    try {
      const recruitment = await this.findById(id);
      if (!recruitment) {
        throw new Error("Recruitment not found");
      }

      recruitment.notified = true;
      return this.recruitmentRepository.save(recruitment);
    } catch (error) {
      this.logger.error(`Error marking recruitment as notified:`, error);
      throw error;
    }
  }

  async getHiringLadderData(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      if (startDate && endDate) {
        queryBuilder.where("recruitment.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const agencyData = await queryBuilder
        .select("recruitment.source", "name")
        .addSelect("COUNT(recruitment.id)", "value")
        .addSelect("COUNT(CASE WHEN recruitment.currentStatus = :hiredStatus THEN 1 END) * 100.0 / COUNT(recruitment.id)", "percent")
        .setParameter("hiredStatus", RecruitmentStatus.HIRED)
        .groupBy("recruitment.source")
        .getRawMany();

      const nspCountData = await queryBuilder
        .select("to_char(recruitment.createdAt, 'YYYY')", "year")
        .addSelect("COUNT(recruitment.id)", "value")
        .groupBy("year")
        .orderBy("year", "ASC")
        .getRawMany();

      return {
        agencyData: agencyData.map((item) => ({
          ...item,
          color: this.getRandomColor(item.name),
        })),
        nspCountData,
      };
    } catch (error) {
      this.logger.error("Error fetching hiring ladder data:", error);
      throw error;
    }
  }

  async getConversionRateByStage(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      if (startDate && endDate) {
        queryBuilder.where("recruitment.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const stageData = await queryBuilder
        .select("recruitment.currentStatus", "stage")
        .addSelect("COUNT(recruitment.id)", "value")
        .groupBy("recruitment.currentStatus")
        .getRawMany();

      return {
        stageData: stageData.map((item) => ({
          ...item,
          color: this.getRandomColor(item.stage),
        })),
      };
    } catch (error) {
      this.logger.error("Error fetching conversion rate by stage data:", error);
      throw error;
    }
  }

  async getSourceToHireSuccessRate(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      if (startDate && endDate) {
        queryBuilder.where("recruitment.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const successData = await queryBuilder
        .select("recruitment.source", "source")
        .addSelect("COUNT(CASE WHEN recruitment.currentStatus = :hiredStatus THEN 1 END)", "hires")
        .setParameter("hiredStatus", RecruitmentStatus.HIRED)
        .groupBy("recruitment.source")
        .getRawMany();

      return {
        successData,
      };
    } catch (error) {
      this.logger.error("Error fetching source to hire success rate data:", error);
      throw error;
    }
  }

  async getDropoutRateByStage(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      if (startDate && endDate) {
        queryBuilder.where("recruitment.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const dropoutData = await queryBuilder
        .select("recruitment.failStage", "stage")
        .addSelect("COUNT(recruitment.id)", "value")
        .where("recruitment.currentStatus = :notHiredStatus")
        .setParameter("notHiredStatus", RecruitmentStatus.NOT_HIRED)
        .groupBy("recruitment.failStage")
        .getRawMany();

      return {
        dropoutData: dropoutData.map((item) => ({
          ...item,
          color: this.getRandomColor(item.stage),
        })),
      };
    } catch (error) {
      this.logger.error("Error fetching dropout rate by stage data:", error);
      throw error;
    }
  }

  async getEmployeeHeadCountByWorkType(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.employeeRepository.createQueryBuilder("employee");

      if (startDate && endDate) {
        queryBuilder.where("employee.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const headcountData = await queryBuilder
        .select("employee.workType", "workType")
        .addSelect("COUNT(employee.id)", "count")
        .groupBy("employee.workType")
        .getRawMany();

      // Todo : change the null to hybrid
      headcountData.forEach((item) => {
        if (item.workType === null) {
          item.workType = WorkType.HYBRID;
        }
      });

      return {
        headcountData: headcountData.map((item) => ({
          ...item,
          color: this.getRandomColor(item.workType),
        })),
      };
    } catch (error) {
      this.logger.error("Error fetching employee head count by work type data:", error);
      throw error;
    }
  }

  async getHeadcountByWorkType(): Promise<any> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      const headcountData = await queryBuilder
        .select("recruitment.type", "type")
        .addSelect("COUNT(recruitment.id)", "count")
        .where("recruitment.currentStatus = :hiredStatus")
        .setParameter("hiredStatus", RecruitmentStatus.HIRED)
        .groupBy("recruitment.type")
        .getRawMany();

      return {
        headcountData: headcountData.map((item) => ({
          ...item,
          color: this.getRandomColor(item.type),
        })),
      };
    } catch (error) {
      this.logger.error("Error fetching headcount by work type data:", error);
      throw error;
    }
  }

  async getCandidatesByDepartment(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      if (startDate && endDate) {
        queryBuilder.where("recruitment.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const candidatesData = await queryBuilder
        .select("recruitment.position", "department")
        .addSelect("COUNT(CASE WHEN to_char(recruitment.createdAt, 'YYYY') = '2021' THEN 1 END)", "2021")
        .addSelect("COUNT(CASE WHEN to_char(recruitment.createdAt, 'YYYY') = '2022' THEN 1 END)", "2022")
        .groupBy("recruitment.position")
        .getRawMany();

      return {
        candidatesData,
      };
    } catch (error) {
      this.logger.error("Error fetching candidates by department data:", error);
      throw error;
    }
  }

  async getEmployeeCountByDepartment(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const queryBuilder = this.employeeRepository.createQueryBuilder("employee").leftJoinAndSelect("employee.department", "department"); // Ensure to join the department

      if (startDate && endDate) {
        queryBuilder.where("employee.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const employeeCountData = await queryBuilder
        .select("department.name", "department")
        .addSelect("COUNT(employee.id)", "count")
        .groupBy("department.name")
        .getRawMany();

      // Todo : chage the  null for department to Other
      employeeCountData.forEach((item) => {
        if (item.department === null) {
          item.department = "Not Assigned";
        }
      });

      const totalEmployeeCount = await this.employeeRepository.count();

      return {
        employeeCountData,
        totalEmployeeCount,
      };
    } catch (error) {
      this.logger.error("Error fetching employee count by department data:", error);
      throw error;
    }
  }

  //  set all employees who worktype is null to hybrid
  async setAllEmployeesToHybrid(): Promise<void> {
    try {
      const employees = await this.employeeRepository.find({ where: { workType: IsNull() } });
      employees.forEach((employee) => {
        employee.workType = WorkType.HYBRID;
      });
      await this.employeeRepository.save(employees);
    } catch (error) {
      this.logger.error("Error setting all employees to hybrid:", error);
      throw error;
    }
  }

  private getRandomColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str?.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  async getEmployeeHiringTrendsOverTime(startDate?: Date, endDate?: Date): Promise<Array<{ month: string; count: number }>> {
    try {
      const queryBuilder = this.recruitmentRepository.createQueryBuilder("recruitment");

      queryBuilder.where("recruitment.currentStatus = :hiredStatus", {
        hiredStatus: RecruitmentStatus.HIRED,
      });

      if (startDate && endDate) {
        queryBuilder.andWhere("recruitment.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const hiringTrendsData = await queryBuilder
        .select("to_char(recruitment.createdAt, 'YYYY Month')", "month")
        .addSelect("COUNT(recruitment.id)", "count")
        .groupBy("month")
        .orderBy("month")
        .getRawMany();

      return hiringTrendsData;
    } catch (error) {
      this.logger.error("Error fetching employee hiring trends over time data:", error);
      throw error;
    }
  }
}
