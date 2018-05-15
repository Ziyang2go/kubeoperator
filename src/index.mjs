import WorkflowOp from './operator';

(async function main() {
  try {
    const workflowop = new WorkflowOp(2);
    await workflowop.load();
    //    const res = await workflowop.listener.getActiveWorkflows();

    //  console.log(res[0].spec);
    //await workflowop.start();
    //const res = await workflowop.handler.deleteWorkflow('test');
    //console.log(res);
    //const res = await workflowop.handler.createWorkflow();
    //console.log(res);
    //    const res = await workflowop.handler.createJob({ name: 'test1' });
    const res = await workflowop.listener.getActiveJobs();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
