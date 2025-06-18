import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
})

export interface Document {
  id: number
  title: string
  file_type: string
  uploaded_by: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface QueryResponse {
  answer: string
  chat_history: ChatMessage[]
}

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<Document>('/documents/', formData)

  return response.data
}

export const queryDocument = async (
  documentId: number,
  query: string,
  chatHistory: ChatMessage[]
): Promise<QueryResponse> => {
  const response = await api.post<QueryResponse>(`/documents/${documentId}/query/`, {
    query,
    chat_history: chatHistory,
  })

  return response.data
}

export const getDocumentStatus = async (documentId: number) => {
  const response = await api.get(`/documents/${documentId}/status/`)
  return response.data
}

export interface QueryRecord {
  id: number
  question: string
  answer: string
  created_at: string
}

export const getChatHistory = async (documentId: number) => {
  const response = await api.get<QueryRecord[]>(`/documents/${documentId}/chats/`)
  return response.data
}

// Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new APIError(
        error.response.data.error || 'An error occurred',
        error.response.status,
        error.response.data
      )
    } else if (error.request) {
      // The request was made but no response was received
      throw new APIError('No response from server')
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new APIError(error.message)
    }
  }
)

// Attach auth token if present
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api 