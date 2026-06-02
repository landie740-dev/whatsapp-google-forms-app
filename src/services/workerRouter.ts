import { ChurchWorker, WorkerAssignment } from '../models/ChurchWorker';
import { FormResponse } from '../models/FormResponse';
import logger from '../utils/logger';

export class WorkerRouterService {
  private workers: Map<string, ChurchWorker> = new Map();
  private assignments: Map<string, WorkerAssignment> = new Map();

  /**
   * Register a church worker
   */
  registerWorker(worker: ChurchWorker): void {
    this.workers.set(worker.id, worker);
    logger.info(`Worker registered: ${worker.name}`);
  }

  /**
   * Get all available workers
   */
  getAvailableWorkers(): ChurchWorker[] {
    return Array.from(this.workers.values()).filter(
      (w) =>
        w.isAvailable &&
        w.currentAssignments < w.maxAssignments
    );
  }

  /**
   * Route form response to appropriate workers
   */
  routeResponse(formResponse: FormResponse): ChurchWorker[] {
    const category = formResponse.category || 'general';
    const priority = formResponse.priority || 'low';

    // Find workers for this category
    const matchedWorkers = Array.from(this.workers.values()).filter(
      (w) =>
        w.isAvailable &&
        w.assignedCategories.includes(category) &&
        w.currentAssignments < w.maxAssignments
    );

    if (matchedWorkers.length === 0) {
      logger.warn(
        `No available workers found for category: ${category}`
      );
      // Fallback to all available workers
      return this.getAvailableWorkers();
    }

    // Sort by current assignments (assign to least busy workers first)
    matchedWorkers.sort(
      (a, b) => a.currentAssignments - b.currentAssignments
    );

    // For high priority, assign to multiple workers
    const workersToAssign =
      priority === 'high' ? matchedWorkers.slice(0, 2) : [matchedWorkers[0]];

    logger.info(
      `Routing response ${formResponse.id} to ${workersToAssign.length} workers`
    );
    return workersToAssign;
  }

  /**
   * Create assignment for a worker
   */
  createAssignment(
    workerId: string,
    formResponseId: string
  ): WorkerAssignment | null {
    const worker = this.workers.get(workerId);
    if (!worker) {
      logger.error(`Worker not found: ${workerId}`);
      return null;
    }

    const assignment: WorkerAssignment = {
      id: `assign_${Date.now()}`,
      workerId,
      formResponseId,
      assignedAt: new Date(),
      status: 'pending',
    };

    this.assignments.set(assignment.id, assignment);
    worker.currentAssignments++;

    logger.info(`Assignment created: ${assignment.id}`);
    return assignment;
  }

  /**
   * Complete an assignment
   */
  completeAssignment(assignmentId: string, notes?: string): boolean {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      logger.error(`Assignment not found: ${assignmentId}`);
      return false;
    }

    const worker = this.workers.get(assignment.workerId);
    if (!worker) {
      return false;
    }

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    assignment.notes = notes;
    worker.currentAssignments--;

    logger.info(`Assignment completed: ${assignmentId}`);
    return true;
  }

  /**
   * Get assignments for a worker
   */
  getWorkerAssignments(workerId: string): WorkerAssignment[] {
    return Array.from(this.assignments.values()).filter(
      (a) => a.workerId === workerId && a.status !== 'completed'
    );
  }

  /**
   * Update worker availability
   */
  updateWorkerAvailability(workerId: string, isAvailable: boolean): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) {
      logger.error(`Worker not found: ${workerId}`);
      return false;
    }

    worker.isAvailable = isAvailable;
    logger.info(`Worker ${worker.name} availability updated to ${isAvailable}`);
    return true;
  }

  /**
   * Load workers from spreadsheet data
   */
  loadWorkersFromData(workersData: any[]): void {
    for (const data of workersData) {
      const worker: ChurchWorker = {
        id: data.id || `worker_${Date.now()}`,
        name: data.name,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        role: data.role,
        department: data.department || 'pastoral',
        specializations: (data.specializations || '')
          .split(',')
          .map((s: string) => s.trim()),
        assignedCategories: (data.assignedCategories || '')
          .split(',')
          .map((c: string) => c.trim()),
        isAvailable: data.isAvailable !== false,
        maxAssignments: parseInt(data.maxAssignments || '5', 10),
        currentAssignments: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.registerWorker(worker);
    }

    logger.info(`Loaded ${workersData.length} workers`);
  }
}

export default new WorkerRouterService();
