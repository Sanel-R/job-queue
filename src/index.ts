import { JobQueue } from "./classes/JobQueue.js";

const test = {
  passed: 0,
  failed: 0,
  testNames: new Set<string>(), // Track test names to prevent duplicates

  async run(name: string, fn: () => Promise<void>): Promise<void> {
    // Prevent duplicate test runs
    if (this.testNames.has(name)) {
      console.log(`⚠️ Skipping duplicate test: ${name}`);
      return;
    }

    this.testNames.add(name);

    try {
      console.log(`\n🧪 Testing: ${name}`);
      await fn();
      console.log(`✅ Passed: ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ Failed: ${name}`);
      console.error(error);
      this.failed++;
    }
  },

  assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    } else {
      console.log(`  ✓ ${message}`);
    }
  },

  async assertThrows(
    fn: () => Promise<any>,
    expectedErrorMsg?: string
  ): Promise<void> {
    try {
      await fn();
      throw new Error(
        `Expected to throw${
          expectedErrorMsg
            ? ` with message containing "${expectedErrorMsg}"`
            : ""
        }, but did not throw`
      );
    } catch (error: any) {
      if (expectedErrorMsg && !error.message.includes(expectedErrorMsg)) {
        throw new Error(
          `Expected error message to contain "${expectedErrorMsg}", but got: "${error.message}"`
        );
      }
      console.log(
        `  ✓ Correctly threw error${
          expectedErrorMsg ? ` containing "${expectedErrorMsg}"` : ""
        }`
      );
    }
  },

  summary(): void {
    console.log(
      `\n📊 Test Summary: ${this.passed} passed, ${this.failed} failed`
    );
    if (this.failed > 0) {
      process.exit(1);
    }
  },

  // Log function for verbose output
  log(message: string): void {
    console.log(`  📝 ${message}`);
  },
};

const maxConcurrency = 2;
const queue = new JobQueue({ maxConcurrency });
test.log(`Created queue with concurrency limit of ${maxConcurrency}`);

// Initially the queue should be empty
test.assert(
  queue.size() === 0,
  `Initial queue size should be 0, got ${queue.size()}`
);
test.assert(
  queue.active() === 0,
  `Initial active count should be 0, got ${queue.active()}`
);
