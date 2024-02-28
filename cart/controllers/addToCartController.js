const CustomError = require("../utils/Error");
const addToCartService = require("../services/addToCartService");

const joi = require("joi");
const generateSessionId = require("../utils/generateSessionId");

const addToCartController = async (req, res, next) => {
  try {

    /* This code is checking if the `sessionid` header is present in the request. If it is not present,
    it generates a new session ID using the `generateSessionId()` function. This session id allow user to add items to cart without logging in. */
    
    let sessionId = req.headers.sessionid;
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    const schema = joi.object({
      sessionId: joi.string().required(),
      productId: joi.string().required(),
      quantity: joi.number().required(),
    });

    const { error, value } = schema.validate({
      ...req.body,
      sessionId,
    });
    if (error) {
      return next(CustomError.badRequest(error));
    }

    const cart = await addToCartService(value);

    // Add sessionId to response header
    res.setHeader("sessionid", cart.sessionId);
    res.status(201).json({ message: "Success" });
  } catch (err) {
    next(CustomError.severError(err));
  }
};

module.exports = addToCartController;
