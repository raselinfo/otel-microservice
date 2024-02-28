const { trace, SpanStatusCode } = require("@opentelemetry/api");

const signUpService = require("../services/signUpService");

const joi = require("joi");
const CustomError = require("../utils/Error");
const prisma = require("../utils/prisma");
const signUpController = async (req, res, next) => {
  // Start a new span
  const tracer = trace.getTracer("signUpController-tracer");
  const span = tracer.startSpan("signUpController-span");
  const traceId = span.spanContext().traceId;

  const user = await prisma.user.findMany();
  console.log("user", user[0])

  try {
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const validate = schema.validate(req.body);

    if (validate.error) {
      const error = CustomError.badRequest(validate.error);
      span.recordException(validate.error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      return next({ traceId, ...error });
    }

    const user = await signUpService(validate.value, tracer);

    res.status(201).json({
      message: "Please verify your email!",
      user,
      traceId,
    });

    // Set user in span
    span.setAttribute("user", JSON.stringify(user));
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (err) {
    const error = CustomError.severError(err, err.status);
    next({ traceId, ...error });
    // Set error in span
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR });
  } finally {
    span.end();
  }
};

module.exports = signUpController;
