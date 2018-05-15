export default {
  apiVersion: 'exocortex.com/v1',
  kind: 'Workflow',
  metadata: {
    name: 'test',
  },
  spec: {
    inputs: {
      test1: { name: 'test1' },
      test2: { name: 'test2' },
      test3: { name: 'test3' },
      test4: { name: 'test4' },
      test5: { name: 'test5' },
      test6: { name: 'test6' },
      test7: { name: 'test7' },
      test8: { name: 'test8' },
    },
    outputs: {},
    backoffLimit: 3,
  },
  status: {},
};
