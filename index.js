var _         = require('underscore')
  , validator = require('./lib/validator');

var validate = function(schema, name, value) {
  // simple usage schema is constructor
  if (schema instanceof Function) {
    schema = {
      allowNull: true,
      type: schema
    }
  }

  // allowNull check
  if (schema.allowNull === true && value == null) return;

  // type check
  if (!validator.type(value, schema.type)) throw Error(schema.message || 'Argument `' + name + '` type must be `' + schema.type.name + '`');

  // validate check
  schema.validate && _.each(schema.validate, function(val, key) {
    var pass = false;
    if (_.isFunction(val)) {
      pass = val(value);
    } else if (!validator[key]) {
      throw Error('`' + name + '` found non-exists validate rule: ' + key);
    } else if (val === false) {
      pass = !validator[key](value);
    } else if (val === true) {
      pass = validator[key](value);
    } else {
      pass = validator[key](value, val);
    }
    if (!pass) throw Error(schema.message || '`' + name + '` validate failure: ' + key);
  });

  // iterator check
  if (schema.type !== Array && schema.iterator) throw Error('`iterator` enabled when `Type` must be `Array`');
  if (schema.iterator) {
    _.each(value, function(v, i) {
      _.each(schema.iterator, function(val, key) {
        validate(val, key, v[key])
      });
    });
  }
};

var delegate = function(fn, schemas) {
  var args = [];
  var getArgument = function(index) {
    return function(value) {
      args[index] = value;
      return func;
    };
  };

  var func = function() {
    args = [].slice.call(arguments, 0);
    return func.exec();
  };

  _.each(schemas, function(schema, index) {
    if (func[schema.name]) throw Error("Function " + schema.name + " already exists!");
    func[schema.name] = getArgument(index)
  });

  func.exec = function() {
    _.each(schemas, function(schema, index) {
      validate(schema, schema.name, args[index]);
    });
    return fn.apply(null, args);
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
      type: String,
      allowNull: false,
      validate: {
        matches: /^[\$_A-z][\$_\w]+$/
      },
      message: 'The `name` must be a string, A-z0-9$_, Can\'t start with numbers'
    },
    type: {
      type: Function,
      allowNull: false,
      message: 'The `type` must be a Type Function, eg. Array, Object, String...'
    },
    allowNull: Boolean,
    validate: Object,
    iterator: Object,
    message: String
  }
}]);
