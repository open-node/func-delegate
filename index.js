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
      pass = val(value, schema);
    } else if (val === false) {
      pass = !validator[key]('' + value);
    } else if (val === true) {
      pass = validator[key]('' + value);
    } else {
      pass = validator[key]('' + value, val);
    }
    if (!pass) {
      throw Error(schema.message || '`' + name + '` validate failure: ' + key);
    }
  });

  // iterator check
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
      if (value != null) args[index] = value;
      return func;
    };
  };

  var func = function() {
    [].slice.call(arguments, 0).forEach(function(x, i) {
      if (x != null) args[i] = x;
    });
    return func.exec();
  };

  _.each(schemas, function(schema, index) {
    if (func.hasOwnProperty(schema.name)) throw Error("Function " + schema.name + " already exists!");
    func[schema.name] = getArgument(index);
  });

  func.exec = function() {
    var result;
    try {
      _.each(schemas, function(schema, index) {
        if (schema.hasOwnProperty('defaultValue')) {
          if (args[index] == null) args[index] = schema.defaultValue;
        }
        validate(schema, schema.name, args[index]);
      });
      result = fn.apply(null, args);
    } catch(e) {
      throw e;
    } finally {
      args = [];
    }
    return result;
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
  validate: {
    iteratorCheck: function(schemas) {
      _.each(schemas, function(schema, index) {
        if (schema.type === Array || !schema.iterator) return;
        throw Error('`iterator` enabled when `Type` must be `Array` schemas[' + index + ']');
      });
      return true;
    }
  },
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
    validate: {
      type: Object,
      allowNull: true,
      validate: {
        exists: function(obj) {
          var k, v;
          for (k in obj) {
            v = obj[k];
            if (!_.isFunction(v) && !_.isFunction(validator[k])) {
              throw Error('Not found validate rule: ' + k);
            }
          };
          return true;
        }
      }
    },
    iterator: Object,
    message: String
  }
}]);
