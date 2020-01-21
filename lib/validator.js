var validator = require('validator')
  , _         = require('underscore');

validator.type = function(value, Fn) {
  if (Fn === String) return _.isString(value);
  if (Fn === Number) return _.isNumber(value);
  if (Fn === Boolean) return value === false || value === true;
  return value instanceof Fn || ( value && Fn && value.__proto__ === Fn);
};

validator.max = function(value, compare) {
  return value <= compare;
};

validator.min = function(value, compare) {
  return value >= compare;
};

validator.length = function(value, range) {
  var len = value.length;
  return len >= range[0] && len <= range[1];
};

module.exports = validator;
