const { createHandler } = require('@app-core/server');
const { retrieveCreatorCard } = require('@app/services');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await retrieveCreatorCard(rc.params, rc.query);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});