import KubeOp from './kubeop';

(async function main() {
  try {
    const k8sOp = new KubeOp();
    await k8sOp.load();
    await k8sOp.watchJobs();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
