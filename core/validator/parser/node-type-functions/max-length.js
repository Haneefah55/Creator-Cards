const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes } = require('../../constants');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError('max-length rule must belong to an identifier', ERROR_CODE.APPERR);
  }

  const maxLength = parseInt(regexInfo.matchMap.maxLength, 10);

  closureNode.addRule(NodeTypes.MAX_LENGTH, maxLength, RuleValidator[NodeTypes.MAX_LENGTH]);
  return closureNode;
};

