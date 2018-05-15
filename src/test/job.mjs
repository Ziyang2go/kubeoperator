export default {
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {},
  spec: {
    template: {
      spec: {
        hostNetwork: true,
        containers: [
          {
            image: 'perl',
            command: ['perl', '-Mbignum=bpi', '-wle', 'print bpi(2000)'],
          },
        ],
        restartPolicy: 'Never',
      },
    },
    backoffLimit: 4,
  },
};
