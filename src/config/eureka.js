const { Eureka } = require('eureka-js-client');

const PORT = process.env.PORT || 8083;
const EUREKA_HOST = process.env.EUREKA_HOST || 'localhost';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const INSTANCE_HOST = process.env.INSTANCE_HOST || 'localhost';

const client = new Eureka({
  instance: {
    app: 'pacientesservice',
    instanceId: `pacientesservice:${PORT}`,
    hostName: INSTANCE_HOST,
    ipAddr: INSTANCE_HOST,
    port: {
      '$': PORT,
      '@enabled': true,
    },
    vipAddress: 'pacientesservice',
    statusPageUrl: `http://${INSTANCE_HOST}:${PORT}/health`,
    healthCheckUrl: `http://${INSTANCE_HOST}:${PORT}/health`,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: '/eureka/apps/',
  },
});

module.exports = client;