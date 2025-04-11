import { Request, Response } from "express";
import axios from "axios";
import { AttritionRequestDto, AttritionResponseDto, CvExtractionResponseDto } from "@/dtos/ai.dto";
import { BadRequestError } from "@/utils/error";
import { logger } from "@/config/logger.config";
import { Recruitment } from "@/entities/recruitment.entity";
import { JobMatchResult } from "@/entities/job-match-result.entity";
import { AppDataSource } from "@/database/data-source";
import { In } from "typeorm";
import { Readable } from "stream";
import FormData from "form-data";
import { RecruitmentStatus, RecruitmentType } from "@/defaults/enum";
export class AiController {
  private readonly aiEndpoint: string;
  private readonly recruitmentRepository;
  private readonly jobMatchResultRepository;

  constructor() {
    const endpoint = process.env.AI_API_ENDPOINT;
    if (!endpoint) {
      throw new Error("AI API endpoint not configured");
    }
    this.aiEndpoint = endpoint;
    this.recruitmentRepository = AppDataSource.getRepository(Recruitment);
    this.jobMatchResultRepository = AppDataSource.getRepository(JobMatchResult);
  }

  async predictAttrition(req: Request, res: Response): Promise<void> {
    try {
      const requestData: AttritionRequestDto = req.body;
      const response = await axios.post<AttritionResponseDto>(`${this.aiEndpoint}/predict-attrition`, requestData);
      res.status(200).json(response.data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async generateReport(req: Request, res: Response): Promise<void> {

    const { type, format } = req.query;
    try {
      const response = await axios.get<any>(`${this.aiEndpoint}/api/${type}?format=${format || "html"}`);
      res.status(200).json(response.data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async kairoChatbot(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      if (!query) {
        throw new BadRequestError("Query is required");
      }
      const formData = new FormData();
      formData.append("query", query);
      formData.append("api_key", process.env.KAIRO_API_KEY || "");

      const response = await axios.post<any>(`${this.aiEndpoint}/query`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      res.status(200).json(response.data);
    } catch (error) {
      this.handleError(error, res);
    }
  }


  // PREDICT CANDIDATES DROP OFF FOR A JOB

  static async predictCandidatesDropOff(candidate_id: string): Promise<void> {
    try {
      const candidate = await AppDataSource.getRepository(Recruitment).findOne({
        where: { id: candidate_id },
      });

      if (!candidate) {
        throw new Error(`Candidate with ID ${candidate_id} not found`);
      }

      const formatDate = (date: Date | null | undefined): string | null => {
        if (!date) return null;
        return date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0];
      };

      const requestData = [{
        date: formatDate(candidate.createdAt),
        highestDegree: candidate.highestDegree,
        statusDueDate: formatDate(candidate.statusDueDate || candidate.createdAt),
        seniorityLevel: "Mid",
        totalYearsInTech: 2,
        source: candidate.source,
        position: candidate.position,
      }];

      console.log(requestData);

      const response = await axios.post(`${process.env.AI_API_ENDPOINT}/predict-dropoff`, {
        applicants: requestData
      }); 
      console.log(response.data);

      // update the candidates's predicted dropoff
      candidate.predictedDropOff = `${response?.data?.[0]?.probability}`;
      candidate.predictedDropOffStage = response?.data?.[0]?.predicted_stage;
      await AppDataSource.getRepository(Recruitment).save(candidate);

      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(`Failed to predict candidates drop off: ${error.message}`);
    }
  }

  // PREDICT CANDIDATE SCORE FOR A JOB
  static async predictCandidateScore(candidate_id: string): Promise<void> {
    try {
      const candidate = await AppDataSource.getRepository(Recruitment).findOne({
        where: { id: candidate_id },
      });

      if (!candidate) {
        throw new Error(`Candidate with ID ${candidate_id} not found`);
      }
      const requestData = {
        name: candidate.name,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        position: candidate?.position || candidate?.firstPriority,
        currentTitle: candidate.currentTitle,
        highestDegree: candidate.highestDegree,
        graduationYear: candidate.graduationYear,
        technicalSkills: candidate.technicalSkills?.join(","),
        programmingLanguages: candidate.programmingLanguages?.join(","),
        toolsAndTechnologies: candidate.toolsAndTechnologies?.join(","),
        softSkills: candidate.softSkills?.join(","),
        industries: candidate.industries?.join(","),
        certifications: candidate.certifications?.join(","),
        keyProjects: candidate.keyProjects?.join(","),
        recentAchievements: candidate.recentAchievements?.join(","),
        location: candidate.location,
        university: candidate.university || "Not specified",
        programOfStudy: candidate.programOfStudy || "Not specified",
        currentCompany: "Not specified",
        totalYearsInTech: 2,
      };

      console.log({ requestData, applied_position: candidate.position || candidate.firstPriority });
      

      const response = await axios.post(`${process.env.AI_API_ENDPOINT}/predict-score`, {
        profile: requestData,
        applied_position: candidate.position || candidate.firstPriority,
      });

      candidate.predictedScore = response?.data?.match_score;
      await AppDataSource.getRepository(Recruitment).save(candidate);

      console.log(response.data);

      return response.data;
    } catch (error: any) {
      console.log(error?.response?.data.detail);
      throw new Error(`Failed to predict candidate score: ${error.message}`);
    }
  }

  // PREDICT JOB MATCH FOR A CANDIDATE
  static async predictMatch(candidate_id: string): Promise<void> {
    try {
      const candidate = await AppDataSource.getRepository(Recruitment).findOne({
        where: { id: candidate_id },
      });

      if (!candidate) {
        throw new Error(`Candidate with ID ${candidate_id} not found`);
      }

      const requestData = {
        name: candidate.name,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        position: candidate?.position || candidate?.firstPriority,
        currentTitle: candidate.currentTitle,
        highestDegree: candidate.highestDegree,
        graduationYear: candidate.graduationYear,
        technicalSkills: candidate.technicalSkills?.join(","),
        programmingLanguages: candidate.programmingLanguages?.join(","),
        toolsAndTechnologies: candidate.toolsAndTechnologies?.join(","),
        softSkills: candidate.softSkills?.join(","),
        industries: candidate.industries?.join(","),
        certifications: candidate.certifications?.join(","),
        keyProjects: candidate.keyProjects?.join(","),
        recentAchievements: candidate.recentAchievements?.join(","),
        location: candidate.location,
        university: candidate.university,
        programOfStudy: candidate.programOfStudy,
      };

      const response = await axios.post(`${process.env.AI_API_ENDPOINT}/predict-match`, {
        profile: requestData,
        applied_position: candidate.position || candidate.firstPriority,
      });

      const existingMatchResult = await AppDataSource.getRepository(JobMatchResult).findOne({
        where: { candidateId: candidate_id },
      });

      if (existingMatchResult) {
        existingMatchResult.isActive = false;
        await AppDataSource.getRepository(JobMatchResult).save(existingMatchResult);
      }

      const matchResult = new JobMatchResult();
      matchResult.candidateId = candidate_id;
      matchResult.jobTitle = response.data["Job Title"];
      matchResult.matchPercentage = response.data["Match Percentage"];
      matchResult.isActive = true;

      await AppDataSource.getRepository(JobMatchResult).save(matchResult);

      logger.info(`Successfully matched job for candidate ${candidate_id} with match percentage ${matchResult.matchPercentage}%`);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        const validationErrors = error.response.data.detail;
        const errorMessages = validationErrors.map((err: any) => `Field ${err.loc.join(".")}: ${err.msg}`).join("; ");

        logger.error(`AI endpoint validation error for candidate ${candidate_id}: ${errorMessages}`);
        throw new Error(`AI validation error: ${errorMessages}`);
      }

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`AI endpoint error for candidate ${candidate_id}: ${errorMessage}`);
        throw new Error(`AI service error: ${errorMessage}`);
      }

      logger.error(`Error predicting job match for candidate ${candidate_id}:`, error);
      throw new Error(`Failed to predict job match: ${error.message}`);
    }
  }

  async extractCv(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError("No file uploaded");
      }

      logger.info(`Extracting CV data from file: ${req.file.originalname}`);

      const formData = new FormData();

      const fileStream = Readable.from(req.file.buffer);
      formData.append("file", fileStream, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post<CvExtractionResponseDto>(`${this.aiEndpoint}/upload-cv`, formData, {
        headers: {
          ...formData.getHeaders(),
          Accept: "application/json",
        },
        timeout: 50000,
      });

      logger.info(`Successfully extracted CV data for candidate ${response.data.candidate_id}`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error("CV extraction error:", error);
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.log(error);
    logger.error("AI Service Error:", error);

    if (error instanceof BadRequestError) {
      res.status(400).json({
        error: error.message,
      });
    } else if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || "AI service error";
      res.status(status).json({
        error: message,
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllJobMatchResults(req: Request, res: Response): Promise<void> {
    try {
      const jobMatchResults = await this.jobMatchResultRepository.find();
      const candidateIds = jobMatchResults.map((result) => result.candidateId);
      const candidateDetails = await this.recruitmentRepository.findBy({
        id: In(candidateIds),
      });

      res.status(200).json({ jobMatchResults, candidateDetails });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getProgramOfStudyHired(req: Request, res: Response): Promise<void> {
    try {
      const programOfStudyHired = await this.recruitmentRepository.find({
        where: { currentStatus: RecruitmentStatus.HIRED, type: RecruitmentType.NSS },
      });

      const programOfStudy = programOfStudyHired.map((candidate) => candidate.programOfStudy).filter(Boolean);
      const programOfStudyCount = programOfStudy.reduce<Record<string, number>>((acc, program) => {
        if (program) {
          acc[program] = (acc[program] || 0) + 1;
        }
        return acc;
      }, {});

      res.status(200).json(programOfStudyCount);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
