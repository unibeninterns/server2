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
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});
