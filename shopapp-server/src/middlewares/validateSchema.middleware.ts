import { NextFunction, Request, Response } from "express";
import * as yup from "yup";

export const validateSchema = async (
  req: Request,
  res: Response,
  next: NextFunction,
  schema: yup.ObjectSchema<any>
) => {
  try {
    if (req?.body || req?.params || req?.query) {
      await schema.validate(
        !req?.body ? (!req?.params ? req?.query : req?.params) : req?.body,
        { abortEarly: false }
      );
      next();
    } else {
      next();
    }
  } catch (error: any) {
    res.status(400).json({
      message: "Validation failed",
      errors: error.errors,
    });
  }
};
