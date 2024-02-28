const joi = require("joi");
const createUserService = require("../services/createUserService");
const CustomError = require("../utils/Error");

const userController = async (req, res, next) => {
  try {
    const userSchema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      address: joi.string().optional(),
    });

    const validate = userSchema.validate(req.body);

    if (validate.error) {
      const error = CustomError.badRequest(validate.error, 400);
      next(error);
    }

    // Create User
    const newUser = await createUserService(validate.value);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    const error = CustomError.severError(err, err.status);
    next(error);
  }
};

module.exports = userController;
