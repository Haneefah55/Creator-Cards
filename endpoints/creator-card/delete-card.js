const { createHandler } = require('@app-core/server');
const { deleteCreatorCard } = require('@app/services');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await deleteCreatorCard(rc.params, rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});