var validator = require('validator')
  , _         = require('underscore');

validator.type = function(value, Fn) {
  if (Fn === String) return _.isString(value);
  if (Fn === Number) return _.isNumber(value);
  return value instanceof Fn;
};

module.exports = validator;
