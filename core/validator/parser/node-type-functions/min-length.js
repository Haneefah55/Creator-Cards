const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes } = require('../../constants');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError('min-length rule must belong to an identifier', ERROR_CODE.APPERR);
  }

  const minLength = parseInt(regexInfo.matchMap.minLength, 10);
  closureNode.addRule(NodeTypes.MIN_LENGTH, minLength, RuleValidator[NodeTypes.MIN_LENGTH]);

  return closureNode;
};