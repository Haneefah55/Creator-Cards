const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { CreatorCardModel } = require('@app/models');

const deleteSpec = `root {
  creator_reference string required length(20)
}`;

//const parsedSpec = validator.parse(deleteSpec);

async function deleteCreatorCard(params, body) {
  const { slug } = params;

  // Validate body
//  validator.validate(body, parsedSpec);

  //  Find card that is not deleted
  const card = await CreatorCardModel.findOne({ slug, deleted: null });

  // No card found
  if (!card) {
    throwAppError('Creator card not found', 'NF01');
  }

  // Soft delete — set deleted timestamp
  const now = Date.now();
  card.deleted = now;
  card.updated = now;
  await card.save();

  
  // access_code is returned in delete response (same as create)
  const result = { ...card.toObject(), id: card._id };
  delete result._id;

  return result;
}

module.exports = deleteCreatorCard;