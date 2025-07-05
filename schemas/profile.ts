import { z } from 'zod';

export const profileSchema = z
  .object({
    displayName: z.string().min(2, 'Name is too short'),
    changePassword: z.boolean(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.changePassword) {
      if (!data.currentPassword) {
        ctx.addIssue({
          path: ['currentPassword'],
          code: z.ZodIssueCode.custom,
          message: 'Current password is required',
        });
      }

      if (!data.newPassword || data.newPassword.length < 6) {
        ctx.addIssue({
          path: ['newPassword'],
          code: z.ZodIssueCode.custom,
          message: 'New password must be at least 6 characters',
        });
      }

      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
        });
      }
    }
  });
