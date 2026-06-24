const { createHandler } = require('@app-core/server');

function normalizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = normalizeKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

module.exports = createHandler({
  path: '*',
  async handler(rc) {
    return {
      augments: {
        body: normalizeKeys(rc.body),
      },
    };
  },
});