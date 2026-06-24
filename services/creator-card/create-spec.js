

const spec = {
  isRoot: true,
  children: [
    //title
    {
      identifier: 'title',
      rules: {
        required: { conditionValue: true },
        'identifier-type': { conditionValue: 'string' },
        'min-length': { conditionValue: 3 },
        'max-length': { conditionValue: 100 },
      },
      attributes: {},
    },

    //description

    {
      identifier: 'description',
      rules: {
        'identifier-type': { conditionValue: 'string' },
        'min-length': { conditionValue: 3 },
        'max-length': { conditionValue: 500 },
      },
      attributes: {},
    },

    //slug

    {
      identifier: 'slug',
      rules: {
        'identifier-type': { conditionValue: 'string' },
        'min-length': { conditionValue: 5 },
        'max-length': { conditionValue: 50 },
      },
      attributes: {},
    },

    //creator_reference

    {
      identifier: 'creator_reference',
      rules: {
        required: { conditionValue: true },
        'identifier-type': { conditionValue: 'string' },
        'min-length': { conditionValue: 20 },
        'max-length': { conditionValue: 20 },
      },
      attributes: {},
    },


    // status
    {
      identifier: 'status',
      rules: {
        required: { conditionValue: true },
        'identifier-type': { conditionValue: 'string' },
        enum: {
          conditionValue: ['draft', 'published'],
        },
      },
      attributes: {},
    },

    //links
    {
      identifier: 'links',
      rules: {
        'identifier-type': {
          conditionValue: 'array',
        },
      },
      children: [
        {
          identifier: 'title',
          rules: {
            required: { conditionValue: true },
            'identifier-type': { conditionValue: 'string' },
          },
          attributes: {},
        },

        {
          identifier: 'url',
          rules: {
            required: { conditionValue: true },
            'identifier-type': { conditionValue: 'string' },
          },
          attributes: {},
        },
      ],
      attributes: {},
    },

    //access_type
    {
      identifier: 'access_type',
      rules: {
        'identifier-type': { conditionValue: 'string' },
        enum: {
          conditionValue: ['public', 'private'],
        },
      },
      attributes: {},
    },

    //access_code

    {
      identifier: 'access_code',
      rules: {
        'identifier-type': { conditionValue: 'string' },
        'min-length': { conditionValue: 6 },
        'max-length': { conditionValue: 6 },
      },
      attributes: {},
    },


    
  ],
};


module.exports = spec;