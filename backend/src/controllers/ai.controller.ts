import { Request, Response } from "express";
import axios from "axios";
import { AttritionRequestDto, AttritionResponseDto } from "@/dtos/ai.dto";
import { BadRequestError } from "@/utils/error";

export class AiController {
  async predictAttrition(req: Request, res: Response): Promise<void> {
    try {
      const requestData: AttritionRequestDto = req.body;

      // Make request to AI endpoint
      const aiEndpoint = `${process.env.AI_API_ENDPOINT}/predict-attrition`;
      if (!aiEndpoint) {
        throw new BadRequestError("AI API endpoint not configured");
      }

      const response = await axios.post<AttritionResponseDto>(aiEndpoint, requestData);

      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error predicting attrition:", error);
      if (error instanceof BadRequestError) {
        res.status(400).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: "Failed to predict attrition",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

    // TODO:  predict-match : THIS CONTORLLER WILL BE CALLDED WHEN AN HR CHANGES A CANDIDATES STATUS TO NOT HIRED AND SEND THE UPDATED CANDIDATE DATA TO THE PREDICT-MATCH ENDPOINT  ON THE AI SERVICE AND THIS SERVICE WILL PROCESS AND PREDICT THE MATCH FOR THE CANDIDATE AND RETURN THE MATCHED JOB DETAILS FOR THE CANDIDATE TO BE SAVED IN A NEW TABLE IN THE DATABASE 
    // TODO: CV EXTRACTION : THIS CONTORLLER WILL BE CALLDED WHEN AN HR UPLOADS A CV AND SEND THE UPLOADED CV TO THE CV EXTRACTION ENDPOINT  ON THE AI SERVICE AND THIS SERVICE WILL PROCESS AND EXTRACT THE CV AND RETURN THE EXTRACTED DATA TO BE SAVED IN A NEW TABLE IN THE DATABASE 
} 