import k8s from 'kubernetes-client';
import JSONStream from 'json-stream';

const Client = k8s.Client;
const config = k8s.config;

class KubeOp {
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
      const conditions = status.conditions;
      const isSuccess = conditions.find(item => item.type === 'Complete');
      return !isSuccess;
    });
    if (activeJobs.length > concurrentJob) return;
    await this.queueJob();
  }

  async queueJob() {}

  async watchJobs() {
    const stream = this.client.apis.batch.v1.watch
      .namespaces('blue')
      .jobs.getStream();
    const jsonStream = new JSONStream();
    stream.pipe(jsonStream);
    jsonStream.on('data', object => {
      const type = object.type;
      const job = object.object;
      const status = job.status;
      if (status.succeeded) {
        await this.evaluateJobs();
      }
    });
  }
}

(async function main() {
  try {
    const k8sOp = new KubeOp();
    await k8sOp.load();
    const jobs = await k8sOp.getJobs();
    await k8sOp.watchJobs();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
