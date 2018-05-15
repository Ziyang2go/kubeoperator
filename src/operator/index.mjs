import k8s from 'kubernetes-client';
import Decider from './decider.mjs';
import Listener from './listener.mjs';
import Handler from './handler.mjs';

const Client = k8s.Client;
const config = k8s.config;

export default class WorkflowOp {
  constructor(concurrentJob) {
    const client = new Client({
      config: config.fromKubeconfig(), //config.getInCluster(),
      version: '1.9',
    });
    this.client = client;
    this.listener = new Listener(this.client);
    this.handler = new Handler(this.client);
    this.decider = new Decider(this.handler, concurrentJob);
  }

  async load() {
    await this.client.loadSpec();
    await this.handler.createCRD();
  }

  start() {
    const listener = this.listener;
    const decider = this.decider;
    if (!listener || !decider) throw new Error('Failed to start process');
    listener.watchJobs(decider);
    listener.watchWorkflows(decider);
  }
}
