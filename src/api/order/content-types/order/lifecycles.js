const stripe = require("stripe");

const STRIPE_KEY = process.env.STRIPE_KEY;

module.exports = {
  async beforeCreate(event) {
    if (STRIPE_KEY) {
      const stripeInstance = stripe(STRIPE_KEY);
      const { address, amount, dishes } = event.params.data;

      const result = await stripeInstance.paymentIntents.create({
        amount: amount * 100,
        currency: "RSD",
        metadata: {
          address,
          dishes: JSON.stringify(dishes),
        },
      });

      event.params.data.token = result.client_secret;
    }
  },
};
