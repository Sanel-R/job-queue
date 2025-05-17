export type JobQueueOptions = {
  maxConcurrency?: number;
  rateLimit?: number;
  timeoutLimit?: number;
};

export interface JobResult<T> {
  result: T;
  queueTime: number;
  executionTime: number;
}

export type Job<T> = {
  fn: (...args: any[]) => Promise<T>;
  args: any[];
  resolve: (value: JobResult<T>) => void;
  reject: (reason?: any) => void;
  queueTime: number;
};
