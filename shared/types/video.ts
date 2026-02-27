import { z } from "zod";

export const VideoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  publishedAt: z.string().datetime(),
  description: z.string().optional(),
});

export type Video = z.infer<typeof VideoSchema>;
