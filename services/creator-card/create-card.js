const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { ulid } = require('ulid');
const { CreatorCard } = require('@app/models');


const createSpec = `root {
  title string required minLength(3) maxLength(100)
  description string maxLength(500)
  slug string minLength(5) maxLength(50)
  creator_reference string required length(20)
  links array {
    title string required minLength(1) maxLength(100)
    url string required maxLength(200)
  }
  service_rates object {
    currency enum(NGN, USD, GBP, GHS) required
    rates array required {
      name string required minLength(3) maxLength(100)
      description string maxLength(250)
      amount number required min(1)
    }
  }
  status enum(draft, published) required
  access_type enum(public, private)
  access_code string length(6)
}`;

// Parse once outside the function
const parsedSpec = validator.parse(createSpec);

async function createCreatorCard(serviceData) {
  // Validate fields
  const validatedData = validator.validate(serviceData, parsedSpec);

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