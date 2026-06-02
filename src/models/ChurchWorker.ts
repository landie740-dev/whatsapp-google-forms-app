export interface ChurchWorker {
  id: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  role: string;
  department: 'pastoral' | 'counseling' | 'outreach' | 'admin' | 'prayer';
  specializations: string[];
  isAvailable: boolean;
  assignedCategories: string[];
  maxAssignments: number;
  currentAssignments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerAvailability {
  workerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface WorkerAssignment {
  id: string;
  workerId: string;
  formResponseId: string;
  assignedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'escalated';
  notes?: string;
}
