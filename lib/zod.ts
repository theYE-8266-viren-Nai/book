import * as z from 'zod';

export const UploadSchema = z.object({
  pdfFile: z.any(),
  coverImage: z.any().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  author: z.string().min(2, 'Author name must be at least 2 characters'),
  voice: z.enum(['dave', 'daniel', 'chris', 'rachel', 'sarah']),
  persona: z.string().optional(),
});
