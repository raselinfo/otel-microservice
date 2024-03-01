const CustomError = require("../utils/Error");
const getUserByKeyService = require("../services/getUserByKeyService");
const { propagation, context, trace } = require("@opentelemetry/api");
const getUserByIdController = async (req, res, next) => {
  const ctx = propagation.extract(context.active(), req.headers);
  console.log("Context", trace.getSpan(ctx)?.spanContext());

  const tracer = trace.getTracer("getUserByIdController");
  const span = tracer.startSpan(
    "Get-User-By-Id-Controller",
    {
      attributes: {
        "http.method": "GET",
        "http.url": req.url,
      },
    },
    ctx
  );


  // tracer.startActiveSpan("Get-User-By-Id-Controlle2222r", (span) => {
  //   console.log("Span", span);
  //   span.end()
  // })

  try {
    const key = {
      name: req.params?.id ? "id" : "email",
      value: req.params?.id ? req.params.id : req.params.email,
    };

    // console.log(req.params);

    if (!key.name) {
      const error = CustomError.badRequest("Bad Request", 400);
      next(error);
    }

    // Get user
    const user = await getUserByKeyService(key);

    res.status(200).json({ message: "Success", user: user });
  } catch (err) {
    const error = CustomError.severError(err.message, err.status);
    next(error);
  } finally {
    span.end();
  }
};

module.exports = getUserByIdController;
