import JobOp from './operator';

(async function main() {
  try {
    const jobop = new JobOp(10);
    await jobop.load();
    await jobop.evaluateJobs();
    await jobop.watchJobs();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
