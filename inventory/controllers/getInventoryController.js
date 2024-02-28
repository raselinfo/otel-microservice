const CustomError = require("../utils/Error");
const getInventoryService = require("../services/getInventoryService");

const getInventoryController = async (req, res, next) => {
  try {
    const history = req.query?.history;

    const key = {
      name: req.params?.skuId ? "sku" : "productId",
      value: req.params?.skuId || req.params?.productId,
    };
    const result = await getInventoryService(key, history);

    res.status(200).json({
      message: "Success",
      ...result,
    });
  } catch (err) {
    const error = CustomError.severError(err, err.status);
    next(error);
  }
};

module.exports = getInventoryController;
