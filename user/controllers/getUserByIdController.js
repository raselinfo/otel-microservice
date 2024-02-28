const CustomError = require("../utils/Error");
const getUserByKeyService = require("../services/getUserByKeyService");

const getUserByIdController = async (req, res, next) => {
  try {
    const key = {
      name: req.params?.id ? "id" : "email",
      value: req.params?.id ? req.params.id : req.params.email,
    };

    console.log(req.params);

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
  }
};

module.exports = getUserByIdController;
