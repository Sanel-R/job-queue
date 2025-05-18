import { JobQueueOptions, JobResult, Job } from "../types/types.js";

export class JobQueue {
  private concurrencyLimit: number;
  private rateLimit: number;
  private timeoutLimit: number;
  private activeJobs: number = 0;
  private queue: Job<any>[] = [];
  private isDisposed: boolean = false;
  private rateLimitWindowStart: number = 0;
  private jobsInCurrentWindow: number = 0;

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

    // Rate limiting logic
    const now = Date.now();
    const windowSize = 60 * 1000; // 1 minute in ms
    const maxJobsPerWindow = this.rateLimit;

    // Initialize or reset the rate limit tracking
    if (!this.rateLimitWindowStart) {
      this.rateLimitWindowStart = now;
      this.jobsInCurrentWindow = 0;
    } else if (now - this.rateLimitWindowStart >= windowSize) {
      // If the current window has expired, start a new one
      this.rateLimitWindowStart = now;
      this.jobsInCurrentWindow = 0;
    }

    // Check if we've exceeded the rate limit
    if (
      maxJobsPerWindow !== Infinity &&
      this.jobsInCurrentWindow >= maxJobsPerWindow
    ) {
      // Calculate when the next window starts
      const nextWindowStart = this.rateLimitWindowStart + windowSize;
      const delay = nextWindowStart - now;

      setTimeout(() => this.processQueue(), delay);
      return;
    }

    // Get the next job
    const job = this.queue.shift()!;
    this.activeJobs++;
    this.jobsInCurrentWindow++;

    try {
      const startTime = Date.now();
      const queueTime = startTime - job.queueTime;
      let timeoutId: NodeJS.Timeout | null = null;
      let timedOut = false;

      const jobPromise = new Promise<any>(async (resolve, reject) => {
        if (this.timeoutLimit > 0) {
          timeoutId = setTimeout(() => {
            timedOut = true;
            reject(new Error(`Job timed out after ${this.timeoutLimit}ms`));
            this.activeJobs--;
            this.processQueue();
          }, this.timeoutLimit);
        }

        try {
          const result = await job.fn(...job.args);
          if (!timedOut) {
            resolve(result);
          }
        } catch (error) {
          if (!timedOut) {
            reject(error);
          }
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      });

      const result = await jobPromise;
      const executionTime = Date.now() - startTime;

      job.resolve({
        result,
        queueTime,
        executionTime,
      });
    } catch (error) {
      job.reject(error);
    } finally {
      this.activeJobs--;
      this.processQueue();
    }
  }

  public constructor(options?: JobQueueOptions) {
    this.concurrencyLimit = options?.maxConcurrency ?? 1000;
    this.rateLimit = options?.rateLimit ?? Infinity;
    this.timeoutLimit =
      options?.timeoutLimit !== undefined ? options.timeoutLimit * 1000 : 12000;
  }
}
