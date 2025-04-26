// src/middleware/validateRequest.js
import { z } from 'zod';
import logger from '../utils/logger.js';
import { BadRequestError } from '../utils/customErrors.js';
export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const dataToValidate = {};
      if (schema.body) dataToValidate.body = req.body;
      if (schema.query) dataToValidate.query = req.query;
      if (schema.params) dataToValidate.params = req.params;

      const validatedData = await schema.parseAsync(dataToValidate);

      req.validated = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        logger.warn(`Validation error: ${JSON.stringify(errors)}`);
        return next(new BadRequestError(errors[0].message));
      }

      logger.error('Unexpected validation error:', error);
      return next(new BadRequestError('Invalid request data'));
    }
  };
};

export default validateRequest;
