const { NodeTracerProvider } = require("@opentelemetry/node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  RedisInstrumentation,
} = require("@opentelemetry/instrumentation-redis");

const { PrismaInstrumentation } = require("@prisma/instrumentation");

const { PgInstrumentation } = require("@opentelemetry/instrumentation-pg");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

function configureOpenTelemetry(serviceName) {
  console.log(serviceName);
  // Create a tracer provider and register the Express instrumentation
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      // Add other resource attributes as needed
    }),
  });
  // provider.register();

  // Configure and register Jaeger exporter
  const exporter = new JaegerExporter({
    // serviceName: serviceName,
    // agentHost: "localhost", // Change this to your Jaeger host
    // agentPort: 16686, // Change this to your Jaeger port
    endpoint: "http://localhost:14268/api/traces",
  });

  // Use BatchSpanProcessor
  const spanProcessor = new BatchSpanProcessor(exporter);
  provider.addSpanProcessor(spanProcessor);

  // Register the Express instrumentation
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // new ExpressInstrumentation(),
      // new RedisInstrumentation(),
      // new PgInstrumentation(),
      // new HttpInstrumentation()
      new PrismaInstrumentation({middleware: true}),
    ],
  });

  provider.register();

  return { sdk: provider };
}

module.exports = configureOpenTelemetry;
