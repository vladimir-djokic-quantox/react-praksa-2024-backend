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

    /** Add `restaurant(slug: String!)` query. */
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Query {
          restaurantBySlug(slug: String!): RestaurantEntityResponse
        }
      `,
      resolvers: {
        Query: {
          restaurantBySlug: {
            resolve: async (parent, args, context) => {
              const restaurants = await strapi.entityService.findMany(
                "api::restaurant.restaurant",
                {
                  filters: { slug: { $eq: args.slug } },
                }
              );

              return toEntityResponse(restaurants[0]);
            },
          },
        },
      },
      resolversConfig: {
        "Query.restaurantBySlug": {
          auth: false,
        },
      },
    }));

    /** Add `addToCart(dish: ID!)` mutation. */
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Mutation {
          addToCart(dish: ID!): CartEntityResponse!
        }
      `,
      resolvers: {
        Mutation: {
          addToCart: {
            resolve: async (parent, args, context) => {
              const userId = context.state.user.id;
              const dishId = parseInt(args.dish);

              const carts = await strapi.entityService.findMany(
                "api::cart.cart",
                {
                  filters: {
                    user: {
                      id: {
                        $eq: userId,
                      },
                    },
                  },
                  populate: { dishes: true },
                }
              );

              const shouldUpdate = !!carts.length;

              const cart = shouldUpdate
                ? carts[0]
                : await strapi.entityService.create("api::cart.cart", {
                    data: {
                      user: userId,
                      dishes: [dishId],
                    },
                  });

              const dishAlreadyInCart = cart.dishes.some(
                dish => dish.id === dishId
              );

              if (shouldUpdate && !dishAlreadyInCart) {
                await strapi.entityService.update("api::cart.cart", cart.id, {
                  data: {
                    user: userId,
                    dishes: [...cart.dishes.map(dish => dish.id), dishId],
                  },
                });
              }

              return toEntityResponse(cart);
            },
          },
        },
      },
    }));

    /** Add `removeFromCart(dish: ID!)` mutation. */
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Mutation {
          removeFromCart(dish: ID!): CartEntityResponse!
        }
      `,
      resolvers: {
        Mutation: {
          removeFromCart: {
            resolve: async (parent, args, context) => {
              const userId = context.state.user.id;
              const dishId = parseInt(args.dish);

              const carts = await strapi.entityService.findMany(
                "api::cart.cart",
                {
                  filters: {
                    user: {
                      id: {
                        $eq: userId,
                      },
                    },
                  },
                  populate: { dishes: true },
                }
              );

              const shouldUpdate = !!carts.length;

              const cart = shouldUpdate
                ? carts[0]
                : await strapi.entityService.create("api::cart.cart", {
                    data: {
                      user: userId,
                      dishes: [],
                    },
                  });

              if (shouldUpdate) {
                await strapi.entityService.update("api::cart.cart", cart.id, {
                  data: {
                    user: userId,
                    dishes: [...cart.dishes.filter(dish => dish.id !== dishId)],
                  },
                });
              }

              return toEntityResponse(cart);
            },
          },
        },
      },
    }));

    /** Add `clearCart()` mutation. */
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Mutation {
          clearCart: CartEntityResponse!
        }
      `,
      resolvers: {
        Mutation: {
          clearCart: {
            resolve: async (parent, args, context) => {
              const userId = context.state.user.id;

              const carts = await strapi.entityService.findMany(
                "api::cart.cart",
                {
                  filters: {
                    user: {
                      id: {
                        $eq: userId,
                      },
                    },
                  },
                }
              );

              const shouldUpdate = !!carts.length;

              const cart = shouldUpdate
                ? carts[0]
                : await strapi.entityService.create("api::cart.cart", {
                    data: {
                      user: userId,
                      dishes: [],
                    },
                  });

              if (shouldUpdate) {
                /** Clear dishes from the cart. */
                await strapi.entityService.update("api::cart.cart", cart.id, {
                  data: {
                    user: userId,
                    dishes: [],
                  },
                });
              }

              return toEntityResponse(cart);
            },
          },
        },
      },
    }));

    /** Extend `me` query with `cart` and `orders`. */
    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: "UsersPermissionsMe",
          definition: t => {
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
