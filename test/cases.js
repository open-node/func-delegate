var delegate  = require('../')
  , assert    = require('assert');



describe("func-delegate", function() {
  describe("#normal-only-type", function() {
    var add = function(a, b) { return a + b; };
    add = delegate(add, [{
      name: 'num1',
      type: Number
    }, {
      name: 'num2',
      type: Number
    }]);
    it("Basics usage", function(done) {
      assert.ok(add instanceof Function, '处理后的仍然是一个函数');
      assert.ok(add.num1 instanceof Function);
      assert.ok(add.num2 instanceof Function);

      assert.equal(3, add(1, 2));
      assert.equal(3, add.num1(1).num2(2).exec());

      assert.throws(function() {
        add(1, '2');
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      });

      assert.throws(function() {
        add.num2('2').num1(1).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      })

      assert.throws(function() {
        add.num1(1).num2('2').exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      })
      done();
    });
  });

  describe("#validate allowNull", function() {
    var add = function(a, b, sqrt) {
      var sum = a + b;
      if (sqrt === true) {
        return Math.sqrt(sum);
      } else {
        return sum;
      }
    };
    add = delegate(add, [{
      name: 'num1',
      type: Number
    }, {
      name: 'num2',
      type: Number
    }, {
      name: 'sqrt',
      type: Boolean,
      allowNull: true
    }]);
    it("Basics usage", function(done) {
      assert.ok(add instanceof Function, '处理后的仍然是一个函数');
      assert.ok(add.num1 instanceof Function);
      assert.ok(add.num2 instanceof Function);
      assert.ok(add.sqrt instanceof Function);

      assert.equal(3, add(1, 2));
      assert.equal(16, add.num1(7).num2(9).exec());
      assert.equal(4, add.num1(7).num2(9).sqrt(true).exec());
      assert.equal(16, add.num1(7).num2(9).sqrt(false).exec());

      assert.throws(function() {
        add(1, '2');
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      });

      assert.throws(function() {
        add.num2('2').num1(1).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      })

      assert.throws(function() {
        add.num1(1).num2('2').exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      })

      assert.throws(function() {
        add.num1(1).num2(2).sqrt('hello').exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `sqrt` type must be `Boolean`';
      })
      done();
    });
  });

  describe("#validate rule", function() {
    var person = function(name, email, age) {
      return {
        name: name,
        email: email,
        age: age
      };
    };
    person = delegate(person, [{
      name: 'Name',
      type: String,
      validate: {
        matches: /^赵/,
        length: function(v) {
          return v.length > 1 && v.length < 4;
        }
      },
      message: 'Name must be a string, start with `赵`, lenght gt 1 and lt 4'
    }, {
      name: 'email',
      type: String,
      validate: {
        isEmail: true
      }
    }, {
      name: 'age',
      type: Number,
      defaultValue: 18,
      allowNull: true,
      validate: {
        max: 200
      },
      message: "Age must be a number, max value is 200, default is 18"
    }]);
    it("Type assert", function(done) {
      assert.ok(person instanceof Function, '处理后的仍然是一个函数');
      assert.ok(person.Name instanceof Function, 'Name');
      assert.ok(person.email instanceof Function, 'email');
      assert.ok(person.age instanceof Function, 'age');
      done()
    });

    it("exec assert", function(done) {
      assert.deepEqual({
        email: '13740080@qq.com',
        name: '赵雄飞',
        age: 18
      }, person('赵雄飞', '13740080@qq.com'));
      assert.deepEqual({
        email: '13740080@qq.com',
        name: '赵雄飞',
        age: 18
      }, person.Name('赵雄飞').email('13740080@qq.com').exec());
      assert.deepEqual({
        email: '13740080@qq.com',
        name: '赵雄飞',
        age: 36
      }, person.Name('赵雄飞').email('13740080@qq.com').age(36).exec());
      done()
    });

    it("Exception assert", function(done) {
      assert.throws(function() {
        person('王方', '223251686@qq.com')
      }, function(err) {
        return (err instanceof Error) && err.message === 'Name must be a string, start with `赵`, lenght gt 1 and lt 4'
      });

      assert.throws(function() {
        person.Name('王方').email('223251686@qq.com').exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Name must be a string, start with `赵`, lenght gt 1 and lt 4'
      })

      assert.throws(function() {
        person.Name('赵星梦').email('223251686').exec();
      }, function(err) {
        return (err instanceof Error) && err.message === '`email` validate failure: isEmail'
      })

      done();
    });
  });
});
