import { JobQueue } from "./classes/job-queue.js";

const jobQueue = new JobQueue();

console.log("Job Queue Concurrency Limit:", jobQueue.getConcurrencyLimit());
console.log("Job Queue Rate Limit:", jobQueue.getRateLimit());
console.log("Job Queue Timeout Limit:", jobQueue.getTimeoutLimit());
