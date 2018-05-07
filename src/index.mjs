import k8s from 'kubernetes-client';
import JSONStream from 'json-stream';

const Client = k8s.Client;
const config = k8s.config;

class KubeOp {
  constructor() {
    const client = new Client({
      config: config.fromKubeconfig(),
      version: '1.9',
    });
    this.client = client;
  }

  async load() {
    await this.client.loadSpec();
  }

  async getNamespaces() {
    const namespaces = await this.client.api.v1.namespaces.get();
    return namespaces;
  }

  async getJobs() {
    const res = await this.client.apis.batch.v1.namespaces('blue').jobs.get();
    const jobs = res.body && res.body.items;
    return jobs.map(item => {
      const metadata = item.metadata;
      const status = item.status;
      const conditions = status.conditions;
      const isSuccess = conditions.find(item => item.type === 'Complete');
      return {
        name: metadata && metadata.name,
        status: isSuccess ? 'ok' : null,
      };
    });
  }

  async queueJob() {}

  async watchJob() {}
}

(async function main() {
  try {
    const k8sOp = new KubeOp();
    await k8sOp.load();
    const jobs = await k8sOp.getJobs();
    console.log(jobs);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
