import { ConnectionData } from '@devrev/ts-adaas';
import { ExternalSystemItemLoadingResponse } from '@devrev/ts-adaas';

declare module '@devrev/ts-adaas' {
  interface ConnectionData {
    tenant_url?: string;
  }
}

export interface WorkdayHRData {
  employee_id: string;
  full_name: string;
  department: string;
  position: string;
  manager: string;
  hire_date: string;
  status: string;
}

export interface WorkdayFinanceData {
  transaction_id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  status: string;
}

export type LoaderState = {
  hrData?: WorkdayHRData[];
  financeData?: WorkdayFinanceData[];
};

// This will help us see what properties are allowed
type ResponseKeys = keyof ExternalSystemItemLoadingResponse;