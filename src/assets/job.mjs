export default {
  apiVersion: ' batch/v1',
  kind: 'Job',
  metadata: {},
  spec: {
    restartPolicy: 'Never',
    hostNetwork: true,
    dnsPolicy: 'ClusterFirstWithHostNet',
    nodeSelector: [{ cbtest: 'true' }],
    tolerations: [
      {
        key: 'gpu',
        operator: 'Exists',
      },
    ],
    containers: [
      {
        command: `bash -l -c source /opt/vray3/setenv36.sh;/opt/nvm/nvm-exec node /srv/clara/current/hub/screenshotVray/build/screenshotVray.js screenshotVray d68f3363-a2e8-431c-961c-9274a77e2eb1 /data/482_56_329_120.jpg width:1000 height:1000 configuration:'{"Fabric":"Kingston Snow"}' setupData:"{}"`,
        env: [
          {
            name: 'DISPLAY',
            value: ':10',
          },
          {
            name: 'NODE_VERSION',
            value: '8.6.0',
          },
          {
            name: 'VRAY_AUTH_CLIENT_FILE_PATH',
            value: '/root/.ChaosGroup/',
          },
          {
            name: 'POD_NAME',
            valueFrom: {
              fieldRef: {
                apiVersion: 'v1',
                filedPath: 'metadata.name',
              },
            },
          },
          {
            name: 'POD_IP',
            valueFrom: {
              fieldRef: {
                apiVersion: 'v1',
                filedPath: 'status.podIP',
              },
            },
          },
          {
            name: 'POD_NAMESPACE',
            valueFrom: {
              fieldRef: {
                apiVersion: 'v1',
                filedPath: 'metadata.namespace',
              },
            },
          },
        ],
        image:
          'us.gcr.io/studious-lore-148916/blue-worker-vrayv2:d893c6199dbb21ed08080224afe3b9a2175411be',
        imagePullPolicy: 'IfNotPresent',
        volumeMounts: [
          {
            name: 'secrets-json',
            mountPath: '/srv/clara/shared/secrets.json',
            subPath: 'foo/bar',
          },
          {
            name: 'xsocket',
            mountPath: '/tmp/.X11-unix',
          },
          {
            name: 'crateandbarrel',
            mountPath: '/data',
          },
        ],
        resources: {
          request: {
            memory: '8Gi',
            cpu: '5000m',
          },
        },
      },
    ],
    volumes: [
      {
        name: 'secrets-json',
        configMap: {
          items: [
            {
              key: 'secrets.json',
              path: 'foo/bar',
            },
          ],
        },
      },
      {
        name: 'xsocket',
        hostPath: {
          path: '/tmp/.X11-unix',
        },
      },
      {
        name: 'crateandbarrel',
        hostPath: {
          path: '/tmp',
        },
      },
    ],
  },
};
