import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

export function validateDto(type: any, skipMissingProperties = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const source = req.method === "DELETE" ? req.params : req.body;

    console.log("Source Object:", source);

    const dtoObj = plainToInstance(type, source, {
      // excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });

    console.log("Transformed DTO Object:", dtoObj);

    const errors = await validate(dtoObj, {
      skipMissingProperties,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const validationErrors = errors.map((error) => {
        return {
          property: error.property,
          constraints: error.constraints,
        };
      });

      res.status(400).json({
        success: false,
        errors: validationErrors,
      });
      return;
    }

    if (req.method === "DELETE") {
      req.params = { ...req.params, ...(dtoObj as any) };
    } else {
      req.body = { ...req.body, ...dtoObj };
    }

    next();
  };
}