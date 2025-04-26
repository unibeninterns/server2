// src/validators/submission.validators.js
import { z } from 'zod';

// Common validators
const emailValidator = z
  .string()
  .email('Invalid email address')
  .regex(/^.+@.+\.uniben\.edu$/, 'Please provide a valid UNIBEN email address');

const alternativeEmailValidator = z
  .string()
  .email('Invalid alternative email address')
  .optional();

const phoneValidator = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must not exceed 15 digits');

// Staff proposal validation schema
export const staffProposalSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    academicTitle: z.string().min(2, 'Academic title is required'),
    department: z.string().min(2, 'Department is required'),
    faculty: z.string().min(2, 'Faculty is required'),
    email: emailValidator,
    alternativeEmail: alternativeEmailValidator,
    phoneNumber: phoneValidator,
    projectTitle: z
      .string()
      .min(5, 'Project title must be at least 5 characters'),
    backgroundProblem: z
      .string()
      .min(10, 'Background problem statement is required')
      .max(200, 'Background problem statement must not exceed 200 words'),
    researchObjectives: z.string().min(10, 'Research objectives are required'),
    methodologyOverview: z
      .string()
      .min(10, 'Methodology overview is required')
      .max(250, 'Methodology overview must not exceed 250 words'),
    expectedOutcomes: z.string().min(10, 'Expected outcomes are required'),
    workPlan: z.string().min(10, 'Work plan is required'),
    estimatedBudget: z
      .string()
      .or(z.number())
      .transform((value) => parseFloat(value)),
    coInvestigators: z
      .array(
        z.object({
          name: z.string().min(2, 'Co-investigator name is required'),
          department: z.string().optional(),
          faculty: z.string().optional(),
        })
      )
      .optional(),
  }),
});

// Master student proposal validation schema
export const masterStudentProposalSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    matricNumber: z.string().min(2, 'Matriculation number is required'),
    programme: z.string().min(2, 'Programme is required'),
    department: z.string().min(2, 'Department is required'),
    faculty: z.string().min(2, 'Faculty is required'),
    email: emailValidator,
    alternativeEmail: alternativeEmailValidator,
    phoneNumber: phoneValidator,
    projectTitle: z
      .string()
      .min(5, 'Project title must be at least 5 characters'),
    problemStatement: z.string().min(10, 'Problem statement is required'),
    objectivesOutcomes: z
      .string()
      .min(10, 'Objectives and outcomes are required'),
    researchApproach: z.string().min(10, 'Research approach is required'),
    innovationNovelty: z.string().min(10, 'Innovation novelty is required'),
    innovationContribution: z
      .string()
      .min(10, 'Innovation contribution is required'),
    interdisciplinaryRelevance: z
      .string()
      .min(10, 'Interdisciplinary relevance is required'),
    implementationPlan: z.string().min(10, 'Implementation plan is required'),
    estimatedBudget: z
      .string()
      .or(z.number())
      .transform((value) => parseFloat(value)),
  }),
});
