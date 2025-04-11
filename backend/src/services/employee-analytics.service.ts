import { AppDataSource } from "@/database/data-source";
import { Repository, Between } from "typeorm";
import { Employee, LeaveType } from "@/entities/employee.entity";
import { Logger } from "@/services/logger.service";

export class EmployeeAnalyticsService {
  private employeeRepository: Repository<Employee>;
  private logger: Logger;

  constructor() {
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.logger = new Logger("EmployeeAnalyticsService");
  }

  async getTurnoverTrendsOverTime(startDate?: Date, endDate?: Date) {
    try {
      const queryBuilder = this.employeeRepository.createQueryBuilder("employee");
      
      queryBuilder.where("employee.endDate IS NOT NULL");

      if (startDate && endDate) {
        queryBuilder.andWhere("employee.endDate BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        });
      }

      const monthlyTurnover = await queryBuilder
        .select("DATE_TRUNC('month', employee.endDate)", "month")
        .addSelect("COUNT(employee.id)", "count")
        .groupBy("month")
        .orderBy("month", "ASC")
        .getRawMany();

      // 3-month moving average
      const movingAverage = monthlyTurnover.map((_, index, array) => {
        if (index < 2) return null;
        const sum = array.slice(index - 2, index + 1).reduce((acc, curr) => acc + parseInt(curr.count), 0);
        return sum / 3;
      });

      return {
        monthlyData: monthlyTurnover,
        movingAverage: movingAverage.filter(val => val !== null)
      };
    } catch (error) {
      this.logger.error("Error fetching turnover trends:", error);
      throw error;
    }
  }

  async getReasonsForLeaving() {
    try {
      const queryBuilder = this.employeeRepository.createQueryBuilder("employee");
      
      const reasonsData = await queryBuilder
        .select("employee.leaveType", "reason")
        .addSelect("COUNT(employee.id)", "count")
        .where("employee.endDate IS NOT NULL")
        .andWhere("employee.leaveType IS NOT NULL")
        .groupBy("employee.leaveType")
        .getRawMany();

      const total = reasonsData.reduce((acc, curr) => acc + parseInt(curr.count), 0);
      
      return reasonsData.map(item => ({
        reason: item.reason,
        count: parseInt(item.count),
        percentage: ((parseInt(item.count) / total) * 100).toFixed(1)
      }));
    } catch (error) {
      this.logger.error("Error fetching reasons for leaving:", error);
      throw error;
    }
  }

  async getTurnoverRatesByPosition() {
    try {
      const queryBuilder = this.employeeRepository.createQueryBuilder("employee");
      
      const positionData = await queryBuilder
        .select("employee.position", "position")
        .addSelect("COUNT(CASE WHEN employee.endDate IS NOT NULL THEN 1 END)", "leftCount")
        .addSelect("COUNT(employee.id)", "totalCount")
        .groupBy("employee.position")
        .getRawMany();

      return positionData.map(item => ({
        position: item.position,
        turnoverRate: ((parseInt(item.leftCount) / parseInt(item.totalCount)) * 100).toFixed(1),
        employeeCount: parseInt(item.totalCount)
      }))
      .sort((a, b) => parseFloat(b.turnoverRate) - parseFloat(a.turnoverRate))
      .slice(0, 10); // top 10 positions by turnover rate
    } catch (error) {
      this.logger.error("Error fetching turnover rates by position:", error);
      throw error;
    }
  }

  async getTurnoverByTenure() {
    try {
      const tenureBrackets = [
        { min: 0, max: 3, label: "0-3 months" },
        { min: 3, max: 6, label: "3-6 months" },
        { min: 6, max: 12, label: "6-12 months" },
        { min: 12, max: 24, label: "1-2 years" },
        { min: 24, max: 36, label: "2-3 years" },
        { min: 36, max: null, label: "3+ years" }
      ];

      const results = await Promise.all(
        tenureBrackets.map(async bracket => {
          const queryBuilder = this.employeeRepository.createQueryBuilder("employee")
            .where("employee.endDate IS NOT NULL");

          if (bracket.max) {
            queryBuilder.andWhere(
              "EXTRACT(EPOCH FROM (employee.endDate - employee.hireDate)) / 2592000 BETWEEN :min AND :max",
              { min: bracket.min, max: bracket.max }
            );
          } else {
            queryBuilder.andWhere(
              "EXTRACT(EPOCH FROM (employee.endDate - employee.hireDate)) / 2592000 > :min",
              { min: bracket.min }
            );
          }

          const count = await queryBuilder.getCount();
          return {
            tenure: bracket.label,
            count,
          };
        })
      );

      const total = results.reduce((acc, curr) => acc + curr.count, 0);
      
      return results.map(item => ({
        ...item,
        percentage: ((item.count / total) * 100).toFixed(1)
      }));
    } catch (error) {
      this.logger.error("Error fetching turnover by tenure:", error);
      throw error;
    }
  }
} 