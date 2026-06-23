const { throwAppError } = require('@app-core/errors');
const { CreatorCard } = require('@app/models');

async function retrieveCreatorCard(params, query) {
  const { slug } = params;
  const { access_code } = query;

  // Find card that is not deleted
  const card = await CreatorCard.findOne({ slug, deleted: null });

  // No card found
  if (!card) {
    throwAppError('Creator card not found', 'NF01');
  }

  // Card is a draft
  if (card.status === 'draft') {
    throwAppError('Creator card not found', 'NF02');
  }

  // Card is private but no access code supplied
  if (card.access_type === 'private' && !access_code) {
    throwAppError('This card is private. An access code is required', 'AC03');
  }

  // Card is private but wrong access_code
  if (card.access_type === 'private' && access_code !== card.access_code) {
    throwAppError('Invalid access code', 'AC04');
  }

  // convert _id to id, remove access_code from response
  const result = { ...card.toObject(), id: card._id };
  delete result._id;
  delete result.access_code; 

  return result;
}

module.exports = retrieveCreatorCard;