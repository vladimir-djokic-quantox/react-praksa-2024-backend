"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const { toEntityResponse, toEntityResponseCollection } = strapi
      .plugin("graphql")
      .service("format").returnTypes;
    const extensionService = strapi.plugin("graphql").service("extension");

    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: "UsersPermissionsMe",
          definition(t) {
            t.field("cart", {
              type: "CartEntityResponse",
              resolve: async (root, args) => {
                const userData = await strapi.db
                  .query("plugin::users-permissions.user")
                  .findOne({
                    where: { id: root.id },
                    populate: { cart: true },
                  });
                return toEntityResponse(userData.cart ?? {}, {
                  args,
                  resourceUID: "api::cart.cart",
                });
              },
            });
            t.field("orders", {
              type: "OrderRelationResponseCollection",
              resolve: async (root, args) => {
                const userData = await strapi.db
                  .query("plugin::users-permissions.user")
                  .findOne({
                    where: { id: root.id },
                    populate: { orders: true },
                  });
                return toEntityResponseCollection(userData.orders ?? [], {
                  args,
                  resourceUID: "api::order.order",
                });
              },
            });
          },
        }),
      ],
    }));
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
