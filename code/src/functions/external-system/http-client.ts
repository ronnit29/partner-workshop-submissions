import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import {
  AirdropEvent,
  ExternalSystemItem,
  ExternalSystemItemLoadingParams,
  ExternalSystemItemLoadingResponse,
} from '@devrev/ts-adaas';

interface WorkdayResponse<T> {
  data: T;
  status: string;
  message?: string;
}

export class HttpClient {
  private client: AxiosInstance;
  private tenantUrl: string;

  constructor(event: AirdropEvent) {
    this.tenantUrl = event.payload.connection_data.tenant_url || '';
    const apiEndpoint = `${this.tenantUrl}/api/v1`;
    
    this.client = axios.create({
      baseURL: apiEndpoint,
      headers: {
        'Authorization': `Bearer ${event.payload.connection_data.key}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleApiError(error)
    );
  }

  private handleApiError(error: any): never {
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    const status = error.response?.status || 500;
    
    throw {
      status,
      message: `Workday API Error: ${errorMessage}`,
      originalError: error
    };
  }

  async getHRData<T>(params: Record<string, any>): Promise<WorkdayResponse<T>> {
    const response = await this.client.get<WorkdayResponse<T>>('/hr/workers', { params });
    return response.data;
  }

  async getFinanceData<T>(params: Record<string, any>): Promise<WorkdayResponse<T>> {
    const response = await this.client.get<WorkdayResponse<T>>('/finance/reports', { params });
    return response.data;
  }

  async createWorkdayItem({
    item,
    mappers,
    event,
  }: ExternalSystemItemLoadingParams<ExternalSystemItem>): Promise<ExternalSystemItemLoadingResponse> {
    try {
      const response = await this.client.post<WorkdayResponse<any>>('/items', item);
      
      if (response.data.status === 'success') {
        return { 
          items: [response.data.data],
          metadata: {
            status: response.data.status,
            message: response.data.message
          }
        };
      }
      
      return {
        error: response.data.message || 'Failed to create item in Workday'
      };
    } catch (error: any) {
      return {
        error: error.message || 'Could not create an item in Workday.'
      };
    }
  }

  async updateWorkdayItem({
    item,
    mappers,
    event,
  }: ExternalSystemItemLoadingParams<ExternalSystemItem>): Promise<ExternalSystemItemLoadingResponse> {
    try {
      const response = await this.client.put<WorkdayResponse<any>>(`/items/${item.id}`, item);
      
      if (response.data.status === 'success') {
        return { 
          items: [response.data.data],
          metadata: {
            status: response.data.status,
            message: response.data.message
          }
        };
      }

      return {
        error: response.data.message || 'Failed to update item in Workday'
      };
    } catch (error: any) {
      return {
        error: error.message || 'Could not update an item in Workday.'
      };
    }
  }
}
