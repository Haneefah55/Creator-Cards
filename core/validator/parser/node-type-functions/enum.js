const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes } = require('../../constants');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError('enum rule must belong to an identifier', ERROR_CODE.APPERR);
  }

  const enumValues = regexInfo.matchMap.enumValues
    .split(',')
    .map(v => v.trim());
  
  closureNode.addRule(NodeTypes.ENUM, enumValues, RuleValidator[NodeTypes.ENUM]);
  
  return closureNode;
};