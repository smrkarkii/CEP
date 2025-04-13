export interface Post {
  id: string;
  author: string;
  authorId: string;
  wallet: string;
  title: string;
  content: string;
  timestamp: string;
  file_type: string;
  likes: number;
  blob_id: string;
  comments?: number;
}
