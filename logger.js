const pino = require("pino");

const transport = pino.transport({
  target: require.resolve("pino-loki"),
  options: {
    host: "http://loki-gateway.loki.svc.cluster.local", 
    
    // The multi-tenancy header Loki is expecting
    headers: {
      "X-Scope-OrgID": "tenant1", 
    },
    
    // Labels help you search in Grafana (service name is already handled by your base object)
    labels: {
      env: "development" 
    },
    propsToLabels: ["service"],
    replaceTimestamp: true,
    // Batching sends logs in chunks to avoid overwhelming the network
    batching: true,
    interval: 5, 
  },
});

const logger = pino(
  {
    level: "info",
    base: {
      service: "order-services",
    },
  },
  transport
);
transport.on('error', (err) => {
  console.error('🚨 Pino Transport Error (Failed to send to Loki):', err);
});
module.exports = logger;