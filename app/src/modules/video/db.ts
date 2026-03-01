export const TableName = "videos";

export interface Table {
  id: number;
  user_id: string;
  user_display_name: string;
  channel_id: string;
  message_id: string;
  video_url: string;
  video_id: string;
  title: string;
  dearrow_title: string | null;
  thumbnail_url: string;
  author_name: string;
  author_url: string;
  created_at: Date;
}

export type InsertInput = Omit<Table, "id" | "created_at">;
