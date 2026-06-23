const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { ulid } = require('ulid');
const { CreatorCard } = require('@app/models');


const createSpec = `root {
  title string required minLength(3) maxLength(100)
  description string maxLength(500)
  slug string minLength(5) maxLength(50)
  creator_reference string required length(20)
  links any
  service_rates any
  status enum(draft, published) required
  access_type enum(public, private)
  access_code string length(6)
}`;

// Parse once outside the function
const parsedSpec = validator.parse(createSpec);

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
  // Validate fields
  const validatedData = validator.validate(normalizeBody, parsedSpec);

  console.log("validateData", validatedData)

// validate links array
if (validatedData.links) {
  for (const link of validatedData.links) {
    if (!link.title || link.title.length < 1 || link.title.length > 100) {
      throwAppError('Each link must have a valid title', 'LK01');
    }
    if (!link.url || (!link.url.startsWith('http://') && !link.url.startsWith('https://'))) {
      throwAppError('Each link must have a valid url starting with http:// or https://', 'LK02');
    }
  }
}

// validate service_rates
if (validatedData.service_rates) {
  const { currency, rates } = validatedData.service_rates;
  const validCurrencies = ['NGN', 'USD', 'GBP', 'GHS'];
  if (!validCurrencies.includes(currency)) {
    throwAppError('Invalid currency', 'SR01');
  }
  if (!rates || rates.length === 0) {
    throwAppError('service_rates.rates must not be empty', 'SR02');
  }
  for (const rate of rates) {
    if (!rate.name || rate.name.length < 3 || rate.name.length > 100) {
      throwAppError('Each rate must have a valid name', 'SR03');
    }
    if (!rate.amount || !Number.isInteger(rate.amount) || rate.amount < 1) {
      throwAppError('Each rate amount must be a positive integer', 'SR04');
    }
  }
}

  

  let { title, slug, access_type, access_code } = validatedData;

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
    const existing = await CreatorCard.findOne({ slug, deleted: null });
    if (existing) {
      slug = slug + '-' + Math.random().toString(36).substring(2, 8);
    }
  } else {
    // if slug was provided, check uniqueness
    const existing = await CreatorCard.findOne({ slug, deleted: null });
    if (existing) {
      throwAppError('Slug is already taken', 'SL02');
    }
  }

  // create the document
  const now = Date.now();
  const card = {
    _id: ulid(),
    ...validatedData,
    slug,
    access_type,
    access_code: access_code || null,
    created: now,
    updated: now,
    deleted: null,  
  };

  // Save to MongoDB
  await CreatorCard.create(card);

  // Serialize: rename _id to id for response
  const result = { ...card, id: card._id };
  delete result._id;

  return result;
}

module.exports = createCreatorCard;