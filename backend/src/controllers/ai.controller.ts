import { Request, Response } from "express";
import axios from "axios";
import { 
  AttritionRequestDto, 
  AttritionResponseDto,
  CandidateMatchRequestDto,
  CandidateMatchResponseDto,
  CvExtractionRequestDto,
  CvExtractionResponseDto
} from "@/dtos/ai.dto";
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

  async predictMatch(req: Request, res: Response): Promise<void> {
    try {
      const { candidate_id }: CandidateMatchRequestDto = req.body;

      const candidate = await this.recruitmentRepository.findOne({
        where: { id: candidate_id },
      });

      if (!candidate) {
        throw new BadRequestError("Candidate not found");
      }

      logger.info(`Predicting job match for candidate ${candidate_id}`);

      const requestData = {
        name: candidate.name,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        position: candidate.position,
        currentTitle: candidate.currentTitle,
        highestDegree: candidate.highestDegree,
        graduationYear: candidate.graduationYear,
        technicalSkills: candidate.technicalSkills,
        programmingLanguages: candidate.programmingLanguages,
        toolsAndTechnologies: candidate.toolsAndTechnologies,
        softSkills: candidate.softSkills,
        industries: candidate.industries,
        certifications: candidate.certifications,
        keyProjects: candidate.keyProjects,
        recentAchievements: candidate.recentAchievements,
        location: candidate.location,
        university: candidate.university,
        programOfStudy: candidate.programOfStudy,
      };

      const response = await axios.post<CandidateMatchResponseDto>(`${this.aiEndpoint}/predict-match`, requestData);

      const matchResult = new JobMatchResult();
      matchResult.candidateId = candidate_id;
      matchResult.jobTitle = response.data.matched_job.position;
      matchResult.matchPercentage = response.data.matched_job.match_percentage;
      matchResult.isActive = true;

      await this.jobMatchResultRepository.save(matchResult);

      logger.info(`Successfully matched job for candidate ${candidate_id} with match percentage ${matchResult.matchPercentage}%`);

      res.status(200).json(response.data);
    } catch (error) {
      this.handleError(error, res);
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

  //  GET ALL JOB MATCH RESULTS TOGETHER WITH THE CANDIDATE DETAILS
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
