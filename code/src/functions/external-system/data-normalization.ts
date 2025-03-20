import { NormalizedAttachment, NormalizedItem } from '@devrev/ts-adaas';

export function normalizeHRData(item: any): NormalizedItem {
  return {
    id: item.id,
    created_date: item.created_date,
    modified_date: item.modified_date,
    data: {
      employee_id: item.employee_id,
      full_name: item.full_name,
      department: item.department,
      position: item.position,
      manager: item.manager,
      hire_date: item.hire_date,
      status: item.status
    },
  };
}

export function normalizeFinanceData(item: any): NormalizedItem {
  return {
    id: item.id,
    created_date: item.created_date,
    modified_date: item.modified_date,
    data: {
      transaction_id: item.transaction_id,
      amount: item.amount,
      currency: item.currency,
      category: item.category,
      description: item.description,
      status: item.status
    },
  };
}

export function normalizeUser(item: any): NormalizedItem {
  return {
    id: item.id,
    created_date: item.created_date,
    modified_date: item.modified_date,
    data: {
      email: item.email,
      name: item.name,
      role: item.role,
      department: item.department
    },
  };
}

export function normalizeAttachment(item: any): NormalizedAttachment {
  return {
    url: item.url,
    id: item.id,
    file_name: item.file_name,
    author_id: item.author_id,
    parent_id: item.parent_id,
  };
}

export function normalizeGongData(item: any): NormalizedItem {
  return {
    id: item.id,
    created_date: item.created_date,
    modified_date: item.modified_date,
    data: {
      call_data: item.call_data,
      participants: item.participants,
      duration: item.duration,
      notes: item.notes,
    },
  };
}
