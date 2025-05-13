import { JobQueueOptions } from "../types/types.js";

export class JobQueue {
  // Define our private variables.
  private concurrencyLimit: number;
  private rateLimit: number;
  private timeoutLimit: number;

  /**
   * Creates a new job queue.
   * @param options The options for the job queue.
   * @param options.maxConcurrency The maximum number of concurrent jobs.
   * @param options.rateLimit The rate limit for the job queue.
   * @param options.timeoutLimit The timeout limit for the job queue.
   */
  public constructor(options?: JobQueueOptions) {
    this.concurrencyLimit = options?.maxConcurrency ?? 1000;
    this.rateLimit = options?.rateLimit ?? -1; // infinity
    this.timeoutLimit = options?.timeoutLimit ?? 1200;
  }

  /**
   * Returns the concurrency limit for the job queue.
   * @param concurrencyLimit The concurrency limit for the job queue.
   * @returns The concurrency limit for the job queue.
   */
  public getConcurrencyLimit(): number {
    return this.concurrencyLimit;
  }

  /**
   * Returns the rate limit for the job queue.
   * @param rateLimit The rate limit for the job queue.
   * @returns The rate limit for the job queue.
   */
  public getRateLimit(): number {
    return this.rateLimit;
  }

  /**
   * Returns the timeout limit for the job queue.
   * @param timeoutLimit The timeout limit for the job queue.
   * @returns The timeout limit for the job queue.
   */
  public getTimeoutLimit(): number {
    return this.timeoutLimit;
  }

  /**
   * Sets the concurrency limit for the job queue.
   * @param concurrencyLimit The concurrency limit for the job queue.
   */
  public setConcurrencyLimit(concurrencyLimit: number): void {
    this.concurrencyLimit = concurrencyLimit;
  }

  /**
   * Sets the rate limit for the job queue.
   * @param rateLimit The rate limit for the job queue.
   */
  public setRateLimit(rateLimit: number): void {
    this.rateLimit = rateLimit;
  }

  /**
   * Sets the timeout limit for the job queue.
   * @param timeoutLimit The timeout limit for The job queue.
   * @returns The timeout limit for the job queue.
   */
  public setTimeoutLimit(timeoutLimit: number): void {
    this.timeoutLimit = timeoutLimit;
  }
}
