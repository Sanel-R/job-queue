import { JobQueue } from "./classes/JobQueue.js";

const jobQueue = new JobQueue();

// Just need to run test.
console.log(
  ` 
    📝 Returns the default rateLimit: ${jobQueue.getRateLimit}
    📝 Returns the default concurrent limit: ${jobQueue.getConcurrencyLimit}
    📝 Returns the default timeout limit:  ${jobQueue.getTimeoutLimit}
   `
);
