// const tracer = require("../tracer-copy2");

// const { sdk } = tracer("auth-service");

const express = require("express");
const cors = require("cors");
const authRoutes = require("../routes/authRoutes");
const errorMiddleware = require("../middlewares/errorMiddleware");
const opentelemetry = require("@opentelemetry/api");

const app = express();

app.use((req, res, next) => {
  const tracer = opentelemetry.trace.getTracer("auth-service-tracer");
  // const tracer=sdk.getTracer("auth-service-tracer")
  const span = tracer.startSpan("auth-service-span");
  const traceId = span.spanContext().traceId;

  span.setAttribute("traceId 💖", traceId);
  span.setAttribute("http.method 💖", req.method);

  span.setAttribute("http.url 💖", req.url);

  opentelemetry.context.with(
    opentelemetry.trace.setSpan(opentelemetry.context.active(), span),
    () => {
      next();
    }
  );
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors("*"));

// Routes
app.use("/api/v1", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Your server is healthy" });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
