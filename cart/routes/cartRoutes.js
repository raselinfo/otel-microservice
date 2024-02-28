const router = require("express").Router();

const addToCartController = require("../controllers/addToCartController");
const checkoutController = require("../controllers/checkoutController");

const authMiddleware = require("../middlewares/authMiddleware");

// Add to cart
router.post("/cart/items", addToCartController);

// Checkout
router.post("/cart/checkout", authMiddleware, checkoutController);

module.exports = router;
