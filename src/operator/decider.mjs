export default class Decider {
  constructor(handler, concurrentJobNum) {
    this.handler = handler;
    this.concurrentJobNum = concurrentJobNum;
  }

  listen(type, data) {
    const handler = this.handler;
    let result = null;
    if (type === 'job') {
      result = this.jobDecider(data);
    } else if (type === 'workflow') {
      result = this.workflowDecider(data);
    }
    if (result) handler.run(result);
  }

  jobDecider({ event, jobs, workflows }) {
    const eventType = event.type;
    const job = event.object;
    const status = job.status;
    const isFinish = status && (status.succeeded || status.failed);
    const currentWorkflow = workflows && workflows[0];
    if (!currentWorkflow) return;
    console.log('JOB EVENT', eventType);
    const jobName = job.metadata.name;
    const inputs = currentWorkflow.spec.inputs;
    const outputs = currentWorkflow.spec.outputs;
    if (!inputs || !inputs[jobName]) return;
    if (status.succeeded || status.failed) {
      const succeeded = currentWorkflow.spec.succeeded;
      if (!outputs || !outputs[jobName]) {
        if (!outputs) outputs = { jobName: status.succeeded ? 'ok' : 'failed' };
        else outputs[jobName] = true;
        return {
          type: 'UPDATE_WORKFLOW',
          name: currentWorkflow.metadata.name,
          update: currentWorkflow,
        };
      }
    }
  }

  workflowDecider({ event, jobs, workflows }) {
    const eventType = event.type;
    const workflow = event.object;
    const status = workflow.status;
    console.log('WORKFLOW EVENT', eventType);
    if (!status.succeeded || !status.failed) {
      console.log('Check job');
      const numActiveJobs = jobs.length;
      if (numActiveJobs >= this.concurrentJobNum) return;
      const inputKeys = Object.keys(workflow.spec.inputs);
      const outputs = workflow.spec.outputs;
      const keys = inputKeys.filter(key => {
        const isFinish = outputs[key];
        const isWorking = jobs.find(job => job.metadata.name === key);
        return !isFinish && !isWorking;
      });
      const numQueueJobs = this.concurrentJobNum - numActiveJobs;
      if (keys.length) {
        const jobData = keys
          .map(key => workflow.spec.inputs[key])
          .slice(0, numQueueJobs);
        return {
          type: 'QUEUE_JOB',
          data: jobData,
        };
      } else {
        workflow.status.succeeded = 1;
        return {
          type: 'UPDATE_WORKFLOW',
          name: workflow.metadata.name,
          update: workflow,
        };
      }
    }
  }
}
