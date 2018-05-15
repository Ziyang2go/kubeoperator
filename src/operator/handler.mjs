import crdTpl from '../assets/crd';
//import workflowTpl from '../assets/workflow';
//import jobTpl from '../assets/job';
import jobTpl from '../test/job';
import workflowTpl from '../test/workflow';

export default class Handler {
  constructor(client) {
    this.client = client;
  }

  async run(data) {
    switch (data.type) {
      case 'QUEUE_JOB':
        await this.createJobs(data);
        break;
      case 'UPDATE_WORKFLOW':
        await this.updateWorkflow(data);
        break;
      default:
        console.log('Unknown update type');
        break;
    }
  }

  async createCRD() {
    try {
      await this.client.apis[
        'apiextensions.k8s.io'
      ].v1beta1.customresourcedefinitions.post({ body: crdTpl });
      this.client.addCustomResourceDefinition(crdTpl);
    } catch (e) {
      if (e.statusCode !== 409) throw e;
    }
  }

  async deleteCRD(name) {
    const res = await this.client.apis['apiextensions.k8s.io'].v1beta1
      .customresourcedefinitions(name)
      .delete();
    return res;
  }

  async deleteWorkflow(name) {
    this.client.addCustomResourceDefinition(crdTpl);
    const res = await this.client.apis['exocortex.com'].v1
      .namespaces('blue')
      .workflows(name)
      .delete();
    return res;
  }

  async createWorkflow() {
    this.client.addCustomResourceDefinition(crdTpl);
    const res = await this.client.apis['exocortex.com'].v1
      .namespaces('blue')
      .workflows.post({ body: workflowTpl });
    return res;
  }

  async updateWorkflow(data) {
    this.client.addCustomResourceDefinition(crdTpl);
    const { name, update } = data;
    const res = await this.client.apis['exocortex.com'].v1
      .namespaces('blue')
      .workflows(name)
      .put({ body: update });
    return res;
  }

  async createJob(job) {
    try {
      console.log('Create job', job);
      const { name, scene, configuration } = job;
      const template = Object.assign({}, jobTpl);
      const runCommand = `bash -l -c source /opt/vray3/setenv36.sh;/opt/nvm/nvm-exec node /srv/clara/current/hub/screenshotVray/build/screenshotVray.js screenshotVray ${scene} /data/${name}.jpg width:2000 height:2000 configuration:${JSON.stringify(
        configuration
      )}`;
      template.metadata.name = name;
      template.spec.template.spec.containers[0].name = name;
      //    template.spec.containers[0].command = runCommand;
      const res = await this.client.apis.batch.v1
        .namespaces('blue')
        .jobs.post({ body: template });
      return res;
    } catch (e) {
      if (e.statusCode !== 409) throw e;
      return null;
    }
  }

  async getJob(job) {
    try {
      const { name } = job;
      const res = await this.client.apis.batch.v1
        .namespaces('blue')
        .jobs(name)
        .get();
      if (res.statusCode === 200) return res.body;
      return null;
    } catch (e) {
      if (e.statusCode !== 404) throw e;
      return null;
    }
  }

  async createJobs(jobs) {
    const res = {};
    for (let i = 0; i < jobs.data.length; i++) {
      res[jobs.data[i].name] = await this.createJob(jobs.data[i]);
    }
    return res;
  }

  async deleteJob() {}
}
