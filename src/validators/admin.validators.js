import { z } from 'zod';

// Proposal status update validation schema
export const proposalStatusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(
      [
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'revision_requested',
      ],
      {
        errorMap: () => ({ message: 'Invalid status value' }),
      }
    ),
  }),
  params: z.object({
    id: z.string().min(24, 'Invalid proposal ID'),
  }),
});

// Admin login validation schema
export const adminLoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .regex(
        /^.+@.+\.uniben\.edu$/,
        'Please provide a valid UNIBEN email address'
      ),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
