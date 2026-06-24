const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { ulid } = require('ulid');
const { CreatorCardModel } = require('@app/models');


const createSpec = `root {
  title is a required string {
    has min length of 3
    has max length of 100
  }
  description is a string {
    has max length of 500
  }
  slug is a string {
    has min length of 5
    has max length of 50
  }
  creator_reference is a required string {
    has min length of 20
    has max length of 20
  }
  status is a required string {
    is one of: draft, published
  }
  access_type is a string {
    is one of: public, private
  }
  access_code is a string {
    has min length of 6
    has max length of 6
  }
  links is an array {
    title is a required string {
      has min length of 1
      has max length of 100
    }
    url is a required string {
      has max length of 200
    }
  }
  service_rates is an object {
    currency is a required string {
      is one of: NGN, USD, GBP, GHS
    }
    rates is a required array {
      name is a required string {
        has min length of 3
        has max length of 100
      }
      description is a string {
        has max length of 250
      }
      amount is a required number {
        is between 1 and 2147483647
      }
    }
  }
}`;

// Parse once outside the function
//const parsedSpec = validator.parse(createSpec);



function lowercaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(lowercaseKeys);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = lowercaseKeys(obj[key]);
      return acc;
    }, {});
  }

  return obj;
}

async function createCreatorCard(serviceData) {

  //convert all input to lowercase
  const normalizeBody = lowercaseKeys(serviceData)

//const parsedSpec = validator.parse(createSpec);
//console.log('SPEC PARSED OK', JSON.stringify(parsedSpec, null, 2));

  // Validate fields
  //const validatedData = validator.validate(serviceData, parsedSpec);

  console.log("normalizeBody", normalizeBody)

// validate links array
if (normalizeBody.links) {
  for (const link of normalizeBody.links) {
    if (!link.title || link.title.length < 1 || link.title.length > 100) {
      throwAppError('Each link must have a valid title', 'VALIDATION_ERROR');
    }
    if (!link.url || (!link.url.startsWith('http://') && !link.url.startsWith('https://'))) {
      throwAppError('Each link must have a valid url starting with http:// or https://', 'VALIDATION_ERROR');
    }
  }
}


  
if(!normalizeBody.creator_reference){
  throwAppError('creator reference is required', 'VALIDATION_ERROR');
}

if(normalizeBody.creator_reference.length !== 20){
  throwAppError('creator reference is must be 20 characters', 'VALIDATION_ERROR');
  }
  
  // validate status
const validStatuses = ['draft', 'published'];

if(!validStatuses.includes(normalizeBody.status)) {
  throwAppError(
    `${normalizeBody.status} is not a valid status`,
    'VALIDATION_ERROR'
  );
}

// validate service_rates
if (normalizeBody.service_rates) {
  const { currency, rates } = normalizeBody.service_rates;
  const validCurrencies = ['NGN', 'USD', 'GBP', 'GHS'];
  if (!validCurrencies.includes(currency)) {
    throwAppError('Invalid currency', 'VALIDATION_ERROR');
  }
  if (!rates || rates.length === 0) {
    throwAppError('service_rates.rates must not be empty', 'VALIDATION_ERROR');
  }
  for (const rate of rates) {
    if (!rate.name || rate.name.length < 3 || rate.name.length > 100) {
      throwAppError('Each rate must have a valid name', 'VALIDATION_ERROR');
    }
    if (!rate.amount || !Number.isInteger(rate.amount) || rate.amount < 1) {
      throwAppError('Each rate amount must be a positive integer', 'VALIDATION_ERROR');
    }
  }
}

  

  let { title, slug, access_type, access_code } = normalizeBody;

  // Default access_type to 'public' if not provided
  if (!access_type) {
    access_type = 'public';
  }

  // Business rules
  if (access_type === 'private' && !access_code) {
    throwAppError('access_code is required when access_type is private', 'AC01');
  }
  if (access_type !== 'private' && access_code) {
    throwAppError('access_code can only be set on private cards', 'AC05');
  }

  // Slug auto-generation if not provided
  if (!slug) {
    slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_]/g, '');

    // if result is less than 5 chars, append random suffix
    if (slug.length < 5) {
      slug = slug + '-' + Math.random().toString(36).substring(2, 8);
    }

    // check if auto-generated slug is taken
    const existing = await CreatorCardModel.findOne({ slug, deleted: null });
    if (existing) {
      slug = slug + '-' + Math.random().toString(36).substring(2, 8);
    }
  } else {
    // if slug was provided, check uniqueness
    const existing = await CreatorCardModel.findOne({ slug, deleted: null });
    if (existing) {
      throwAppError('Slug is already taken', 'SL02');
    }
  }

  // create the document
  const now = Date.now();
  const card = {
    _id: ulid(),
    ...normalizeBody,
    slug,
    access_type,
    access_code: access_code || null,
    created: now,
    updated: now,
    deleted: null,  
  };

  // Save to MongoDB
  await CreatorCardModel.create(card);

  // Serialize: rename _id to id for response
  const result = { ...card, id: card._id };
  delete result._id;

  return result;
}

module.exports = createCreatorCard;