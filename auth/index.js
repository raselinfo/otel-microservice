const config = require("./config/config");
const tracer = require("./tracer");
// Initialize the tracer
const { sdk } = tracer("auth-service");
const opentelemetry = require("@opentelemetry/api");

const prisma = require("./utils/prisma");



const app = require("./app");
const PORT = config.port || 4000;


 prisma.user.findMany().then(data=> console.log("user",data[0]));


const server = app.listen(PORT, () => {
  console.log(`Server is running : http://localhost:${PORT}`);
});

// TODO: Graceful shutdown of the server
const graceFullShutdown = async (signal) => {
  process.on(signal, () => {
    server.close(() => {
      // TODO: Shutdown the tracer
      sdk
        .shutdown()
        .then(() => {
          // TODO: Send log data to your logging system
          console.log("Tracing Terminated Successfully");
        })
        .catch((err) => {
          // TODO: Send log data to your logging system
          console.log("Error in Tracing Termination", err);
        })
        .finally(() => process.exit(0));
    });
  });
};

const signals = ["SIGTERM", "SIGINT", "SIGQUIT"];

signals.forEach((signal) => {
  graceFullShutdown(signal);
});
