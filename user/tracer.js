const config = require("./config/config");

const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const {ExpressInstrumentation}= require("@opentelemetry/instrumentation-express")


const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");


const tracer = (serviceName) => {
  const traceExporter = new JaegerExporter({
    // Jaeger agent UDP Thrift endpoint
    endpoint: "http://localhost:14268/api/traces",
  });

  // OpenTelemetry SDK Configuration
  const sdk = new NodeSDK({
    traceExporter, // Tracing Exporter
    serviceName: serviceName, // Service Name

    // Instrumentation Configuration
    instrumentations: [
      // getNodeAutoInstrumentations({
      //   "@opentelemetry/instrumentation-fs": {
      //     enabled: false,
      //   },
      //   "@opentelemetry/instrumentation-express": {
      //     enabled: true,
      //   },
      // }),

      // new PrismaInstrumentation(),

      new ExpressInstrumentation()
    ],
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      environment: config.node_env,
      scope: "users",
    }),
  });

  sdk.start();
  return { sdk };
};

module.exports = tracer;
