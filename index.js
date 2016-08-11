var _         = require('underscore')
  , validator = require('validator');

var validate = function(schema, value) {
  // allowNull check
  if (schema.allowNull === true && value == null) return;

  // type check
  if (!(value instanceof schema.type)) throw Error(schema.message || 'Argument `' + schema.name + '` type must be `' + schema.type.name + '`');

  // validate check
  schema.validate && _.each(validate, function(val, key) {
    if (_.isFunction(val)) return val(value);
    if (!validator[key]) throw Error('`' + schema.name + '` found non-exists validate rule: ' + key);
    validator[key](value, val);
  });

  // iterator check
  if (schema.type !== Array && schema.iterator) throw Error('`iterator` enabled when `Type` must be `Array`');
  if (schema.iterator) {
    _.each(value, function(v, i) {
      _.each(schema.iterator, function(val, key) {
        validate(val, v[key])
      });
    });
  }
};

var delegate = function(fn, schemas) {
  var args = [];
  var getArgument = function(index) {
    return function(value) {
      args[index] = value;
    };
  };

  var func = function() {
    args = [].slice(arguments, 0);
    func.exec();
  };

  _.each(schemas, function(schema, index) {
    if (func[schema.name]) throw Error("Function " + schema.name + " already exists!");
    func[schema.name] = getArgument(index)
  });

  func.exec = function() {
    _.each(schemas, function(schema, index) {
      validate(schema, args[index]);
    });
    fn.apply(null, args);
  };

  return func;
};

module.exports = delegate(delegate, [{
  name: 'func',
  allowNull: false,
  type: Function,
  message: 'The first argument `func` must be a function'
}, {
  name: 'schemas',
  type: Array,
  allowNull: false,
  iterator: {
    name: {
      type: String
      allowNull: false,
      validate: {
        matches: /^[\$_\W][\$_\w]+$/
      },
      message: 'The `name` must be a string, A-z0-9$_, Can\'t start with numbers'
    },
    type: {
      type: Function
      allowNull: false,
      message: 'The `type` must be a Type Function, eg. Array, Object, String...'
    },
    allowNull: Boolean,
    validate: Object,
    iterator: Object,
    message: String
  }
}]);
