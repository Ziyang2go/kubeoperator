const template = {
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    labels: {},
  },
  spec: {
    backoffLimit: 3,
    template: {
      metadata: {},
      spec: {
        hostNetwork: true,
        dnsPolicy: 'ClusterFirstWithHostNet',
        containers: [
          {
            volumeMounts: [
              {
                mountPath: '/tmp/.X11-unix',
                name: 'xsocket',
              },
            ],
            env: [
              {
                name: 'DISPLAY',
                value: ':1',
              },
            ],
          },
        ],
        restartPolicy: 'Never',
        volumes: [
          {
            name: 'xsocket',
            hostPath: {
              path: '/tmp/.X11-unix',
            },
          },
        ],
      },
    },
  },
};

export default template;
