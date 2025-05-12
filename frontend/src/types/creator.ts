export interface Creator {
  id: string;
  name: string;
  bio: string;
  walletAddress?: string;
  followers?: number;
  likes?: number;
  comments?: number;
  publishedContentsCount?: number;
  totalEngagement?: string;
}
