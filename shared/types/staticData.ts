export enum StaticDataType {
  WeekRecap = "weekRecap",
}

export interface WeekRecapMessage {
  id: string;
  createdAt: Date;
  content: string;
  firstAttachment: {
    id: string;
    isImage: boolean;
    isVideo: boolean;
    url: string;
  } | null;
  guild: { id: string };
  channel: { id: string; name: string };
  member: { id: string; displayName: string; username: string };
  reactions: Array<{
    emoji: {
      identifier: string;
      id: string | null;
      name: string | null;
      url: string;
    };
    count: number;
  }>;
  reactionCount: number;
}

export interface WeekRecapData {
  createdAt: Date;
  messages: WeekRecapMessage[];
}

export type StaticData = {
  [StaticDataType.WeekRecap]: WeekRecapData;
};
