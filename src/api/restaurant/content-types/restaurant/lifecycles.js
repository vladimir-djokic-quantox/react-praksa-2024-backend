const slugify = require("slugify");

module.exports = {
  beforeCreate: async event => {
    const { data } = event.params;
    data.slug = slugify(data.name, { lower: true });
  },
  beforeUpdate: async event => {
    const { data } = event.params;
    data.slug = slugify(data.name, { lower: true });
  },
};
