import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const DEFAULT_COLLECTION = process.env.REACT_APP_COLLECTION_NAME || 'default_collection';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface AddDataWithImageRequest {
  text: string;
  metadata?: string;
  add_metadata?: boolean;
  collection_name?: string;
  file?: File;
}

export interface ChatWithImageRequest {
  query: string;
  collection_name?: string;
  metadata_filter?: string;
  limit?: number;
  use_metadata?: boolean;
  model_name?: string;
  file?: File;
}

export const aiChatService = {
  async addDataWithImage({
    text,
    metadata,
    add_metadata,
    collection_name = DEFAULT_COLLECTION,
    file,
  }: AddDataWithImageRequest) {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('collection_name', collection_name);
    
    if (metadata) {
      formData.append('metadata', metadata);
    }
    if (add_metadata !== undefined) {
      formData.append('add_metadata', String(add_metadata));
    }
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await apiClient.post('/add_data_with_image', formData);
      return response.data;
    } catch (error) {
      console.error('Error adding data with image:', error);
      throw error;
    }
  },

  async chatWithImage({
    query,
    collection_name = DEFAULT_COLLECTION,
    metadata_filter,
    limit,
    use_metadata,
    model_name,
    file,
  }: ChatWithImageRequest) {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('collection_name', collection_name);
    
    if (metadata_filter) {
      formData.append('metadata_filter', metadata_filter);
    }
    if (limit !== undefined) {
      formData.append('limit', String(limit));
    }
    if (use_metadata !== undefined) {
      formData.append('use_metadata', String(use_metadata));
    }
    if (model_name) {
      formData.append('model_name', model_name);
    }
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await apiClient.post('/chat_with_image_rag', formData);
      return response.data;
    } catch (error) {
      console.error('Error in chat with image:', error);
      throw error;
    }
  },
}; 
