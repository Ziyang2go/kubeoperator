export default {
  apiVersion: 'exocortex.com/v1',
  kind: 'Workflow',
  metadata: {
    name: 'my-test',
  },
  spec: {
    backoffLimit: 3,
  },
};
