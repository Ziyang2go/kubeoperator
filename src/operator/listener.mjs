import crdTpl from '../assets/crd';
import JSONStream from 'json-stream';

export default class Listener {
  constructor(client) {
    this.client = client;
  }

  watchJobs(decider) {
    const stream = this.client.apis.batch.v1.watch
      .namespaces('blue')
      .jobs.getStream();
    const jsonStream = new JSONStream();
    stream.pipe(jsonStream);
    jsonStream.on('data', async event => {
      const jobs = await this.getActiveJobs();
      const workflows = await this.getActiveWorkflows();
      await decider.listen('job', { event, jobs, workflows });
    });
    jsonStream.on('error', e => {
      console.error(e);
      stream.abort();
      process.exit(1);
    });
  }

  watchWorkflows(decider) {
    this.client.addCustomResourceDefinition(crdTpl);
    const stream = this.client.apis[
      'exocortex.com'
    ].v1.watch.workflows.getStream();
    const jsonStream = new JSONStream();
    stream.pipe(jsonStream);
    jsonStream.on('data', async event => {
      const workflows = await this.getActiveWorkflows();
      const jobs = await this.getActiveJobs();
      await decider.listen('workflow', { event, workflows, jobs });
    });
    jsonStream.on('error', e => {
      console.error(e);
      stream.abort();
      process.exit(1);
    });
  }

  async getActiveJobs() {
    const res = await this.client.apis.batch.v1
      .namespaces('blue')
      .jobs.get({ qs: { fieldSelector: { status: 'active=1' } } });
    const jobs = res.body && res.body.items;
    // FIXME: should be able to add this filter to the query
    const activeJobs = jobs.filter(item => {
      return !item.status.succeeded && !item.status.failed;
    });
    return activeJobs;
  }

  async getActiveWorkflows() {
    this.client.addCustomResourceDefinition(crdTpl);
    const res = await this.client.apis['exocortex.com'].v1
      .namespaces('blue')
      .workflows.get();
    const items = res.body && res.body.items;
    // TODO: use same status as jobs
    const activeItems =
      items &&
      items.filter(item => item =>
        !item.status.succeeded && !item.status.failed
      );
    return items;
  }
}
