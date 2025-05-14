import { JobQueueOptions, JobResult } from "../types/types.js";

type Job<T> = {
  fn: (...args: any[]) => Promise<T>;
  args: any[];
  resolve: (value: JobResult<T>) => void;
  reject: (reason?: any) => void;
  queueTime: number;
};

export class JobQueue {
  private concurrencyLimit: number;
  private rateLimit: number;
  private timeoutLimit: number;
  private activeJobs: number = 0;
  private queue: Job<any>[] = [];
  private lastRateLimitTime: number = 0;
  private isDisposed: boolean = false;

  // Public methods
  public schedule<T>(
    fn: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<JobResult<T>> {
    if (this.isDisposed) {
      return Promise.reject(new Error("JobQueue has been disposed"));
    }

    return new Promise((resolve, reject) => {
      const queueTime = Date.now();
      const job: Job<T> = {
        fn,
        args,
        resolve,
        reject,
        queueTime,
      };

      this.queue.push(job);
      this.processQueue();
    });
  }

  public size(): number {
    return this.queue.length;
  }

  public active(): number {
    return this.activeJobs;
  }

  public dispose(): void {
    this.isDisposed = true;
    this.queue.forEach((job) => {
      job.reject(new Error("JobQueue has been disposed"));
    });
    this.queue = [];
  }

  public getConcurrencyLimit(): number {
    return this.concurrencyLimit;
  }

  public getRateLimit(): number {
    return this.rateLimit;
  }

  public getTimeoutLimit(): number {
    return this.timeoutLimit;
  }

  public setConcurrencyLimit(concurrencyLimit: number): void {
    this.concurrencyLimit = concurrencyLimit;
  }

  public setRateLimit(rateLimit: number): void {
    this.rateLimit = rateLimit;
  }

  public setTimeoutLimit(timeoutLimit: number): void {
    this.timeoutLimit = timeoutLimit;
  }

  private async processQueue(): Promise<void> {
    if (
      this.isDisposed ||
      this.queue.length === 0 ||
      this.activeJobs >= this.concurrencyLimit
    ) {
      return;
    }

    // Check rate limiting
    const now = Date.now();
    if (
      this.rateLimit > 0 &&
      now - this.lastRateLimitTime < 1000 / this.rateLimit
    ) {
      // We need to wait before processing the next job
      const delay = 1000 / this.rateLimit - (now - this.lastRateLimitTime);
      setTimeout(() => this.processQueue(), delay);
      return;
    }

    // Get the next job
    const job = this.queue.shift()!;
    this.activeJobs++;
    this.lastRateLimitTime = Date.now();

    try {
      const startTime = Date.now();
      const queueTime = startTime - job.queueTime;

      // Set up timeout if needed
      let timeoutId: NodeJS.Timeout | null = null;
      let timedOut = false;

      if (this.timeoutLimit > 0) {
        timeoutId = setTimeout(() => {
          timedOut = true;
          job.reject(new Error(`Job timed out after ${this.timeoutLimit}ms`));
          this.activeJobs--;
          this.processQueue();
        }, this.timeoutLimit);
      }

      // Execute the job
      const result = await job.fn(...job.args);

      if (timedOut) {
        // Job completed but already timed out - don't resolve/reject again
        return;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const executionTime = Date.now() - startTime;

      job.resolve({
        result,
        queueTime,
        executionTime,
      });
    } catch (error) {
      job.reject(error);
    } finally {
      if (!timedOut) {
        this.activeJobs--;
      }
      this.processQueue();
    }
  }

  public constructor(options?: JobQueueOptions) {
    this.concurrencyLimit = options?.maxConcurrency ?? 1000;
    this.rateLimit = options?.rateLimit ?? -1; // infinity
    this.timeoutLimit = options?.timeoutLimit ?? 1200;
  }
}
