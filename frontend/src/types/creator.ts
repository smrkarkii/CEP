export interface Creator {
  id: string;
  name: string;
  bio: string;
  followers?: number;
  likes?: number;
  comments?: number;
  walletAddress: string;
}
