import k8s from 'kubernetes-client';
import JSONStream from 'json-stream';

const Client = k8s.Client;
const config = k8s.config;

export default class JobOp {
  constructor(concurrentJob) {
    const client = new Client({
      config: config.fromKubeconfig(), //config.getInCluster()
      version: '1.9',
    });
    this.client = client;
    this.concurrentJob = concurrentJob;
  }

  async load() {
    await this.client.loadSpec();
  }

  async evaluateJobs() {
    const res = await this.client.apis.batch.v1.namespaces('blue').jobs.get();
    const jobs = res.body && res.body.items;
    const activeJobs = jobs.filter(item => {
      const metadata = item.metadata;
      const status = item.status;
      return status.active;
    });
    if (activeJobs.length > this.concurrentJob) return;
    await this.queueJob();
  }

  async queueJob() {
    console.log('QUEUUE JOB');
  }

  async createCRD(crd) {
    try {
      await this.client.apis[
        'apiextensions.k8s.io'
      ].v1beta1.customresourcedefinitions.post({ body: crd });
      this.client.addCustomResourceDefinition(crd);
    } catch (e) {
      if (e.statusCode !== 409) throw err;
    }
  }

  async watchJobs() {
    const stream = this.client.apis.batch.v1.watch
      .namespaces('blue')
      .jobs.getStream();
    const jsonStream = new JSONStream();
    stream.pipe(jsonStream);
    jsonStream.on('data', async object => {
      try {
        const type = object.type;
        const job = object.object;
        const status = job.status;
        if (type === 'MODIFIED' && (status.succeeded || status.failed)) {
          await this.evaluateJobs();
        }
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });
  }
}
