export interface FormResponse {
  id: string;
  timestamp: Date;
  formId: string;
  formTitle: string;
  respondentEmail?: string;
  responses: Record<string, string>;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedWorkers?: string[];
}

export interface FormField {
  id: string;
  title: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'rating';
  required: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}
