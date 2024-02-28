const app = require("./app");
const RedisClient = require("./utils/redis_client");
const updateInventoryForCustomerService = require("./services/updateInventoryForCustomerService");
const resetInventoryService = require("./services/resetInventoryService");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running : http://localhost:${PORT}`);

  // Todo: Consume cart_item_added event and update inventory
  const redisCartConsumer = new RedisClient();
  redisCartConsumer.consume({
    channel: "cart_item_added",
    callback: async (message) => {
      const { sessionId, productId, quantity } = JSON.parse(message);
      const data = await updateInventoryForCustomerService({
        quantity,
        productId,
      });
      console.log("data", data);
    },
  });

  // Todo: Add keyspace notification for cart keys expired
  const redisExpireNotification = new RedisClient();
  redisExpireNotification.keyspaceNotification({
    callback: async ({ message: cartKey }) => {
      if (!cartKey.startsWith("cart:")) return;

      resetInventoryService(cartKey);
    },
  });
});
