# func-deleglate

## Usage
<pre>npm install func-deleglate --save</pre>

```js
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
    it("Type assert", function(done) {
      assert.ok(add instanceof Function, '处理后的仍然是一个函数');
      assert.ok(add.num1 instanceof Function, '接收参数的函数 num1');
      assert.ok(add.num2 instanceof Function, '接收参数的函数 num2');
      done();
    });

    it("exec assert", function(done) {
      assert.equal(3, add(1, 2), '正常执行');
      assert.equal(3, add.num1(1).num2(2).exec(), '链式调用');
      done();
    });

    it("Exception assert", function(done) {
      assert.throws(function() {
        add(1, '2');
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      }, 'Num2 is string');

      assert.throws(function() {
        add.num2('2').num1(1).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      }, '链式调用 num2 is string')

      assert.throws(function() {
        add.num1(1).num2('2').exec();
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `num2` type must be `Number`';
      }, '链式调用 num2 是 string, 顺序无关')
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
    it("type assert", function(done) {
      assert.ok(add instanceof Function, '处理后的仍然是一个函数');
      assert.ok(add.num1 instanceof Function, 'num1 是接收参数的函数');
      assert.ok(add.num2 instanceof Function, 'num2 是接收参数的函数');
      assert.ok(add.sqrt instanceof Function, 'sqrt 是接收参数的函数');
      done();
    });

    it("exec assert", function(done) {
      assert.equal(3, add(1, 2), '普通调用，缺失 sqrt 参数');
      assert.equal(16, add.num1(7).num2(9).exec(), '链式执行缺失 sqrt 参数');
      assert.equal(4, add.num1(7).num2(9).sqrt(true).exec(), '链式执行 sqrt true');
      assert.equal(16, add.num1(7).num2(9).sqrt(false).exec(), 'sqrt false');
      assert.equal(16, add.sqrt(false).num1(7).num2(9).exec(), '顺序无关');
      done();
    });

    it("Exception assert", function(done) {
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

  describe("#validate rule and defaultValue", function() {
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
        person('赵导耳机', '223251686@qq.com')
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

  describe("#iterator validate", function() {
    var lib = function(books) {
      return {
        books: books,
        size: books.length
      };
    };
    lib = delegate(lib, [{
      name: 'books',
      type: Array,
      iterator: {
        name: {
          type: String,
          allowNull: false,
          validate: {
            length: [1, 20]
          },
          message: '书名必填是字符串，长度为 1 - 20'
        },
        price: {
          type: Number,
          allowNull: true,
          validate: {
            max: 300,
            min: 10
          },
          message: '价格选填，数字类型，最大 300， 最小 10'
        }
      }
    }]);
    it("Type assert", function(done) {
      assert.ok(lib instanceof Function, '处理后的仍然是一个函数');
      assert.ok(lib.books instanceof Function, 'books 是接收参数的函数');
      assert.ok(lib.exec instanceof Function, 'exec 是执行函数');
      done()
    });

    it("exec assert", function(done) {
      assert.deepEqual({
        books: [{
          name: 'JavaScript 权威指南',
          price: 35.26
        }, {
          name: 'MySQL 性能优化'
        }],
        size: 2
      }, lib([{name: 'JavaScript 权威指南', price: 35.26}, {name: 'MySQL 性能优化'}]))
      assert.deepEqual({
        books: [{
          name: 'JavaScript 权威指南',
          price: 35.26
        }, {
          name: 'MySQL 性能优化'
        }],
        size: 2
      }, lib.books([{name: 'JavaScript 权威指南', price: 35.26}, {name: 'MySQL 性能优化'}]).exec());
      done()
    });

    it("Exception assert", function(done) {
      assert.throws(function() {
        lib('hello world');
      }, function(err) {
        return (err instanceof Error) && err.message === 'Argument `books` type must be `Array`'
      }, '参数类型错误');

      assert.throws(function() {
        lib([{name: []}]);
      }, function(err) {
        return (err instanceof Error) && err.message === '书名必填是字符串，长度为 1 - 20'
      }, 'iterator 里类型错误');

      assert.throws(function() {
        lib.books([{name: 'Hello world', price: 'Redstone'}]).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === '价格选填，数字类型，最大 300， 最小 10'
      }, 'iterator 价格类型不对');

      assert.throws(function() {
        lib.books([{name: 'Hello world', price: 500}]).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === '价格选填，数字类型，最大 300， 最小 10'
      }, 'iterator 价格类型不对');

      assert.throws(function() {
        lib.books([{name: 'Hello world', price: 5}]).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === '价格选填，数字类型，最大 300， 最小 10'
      }, 'iterator 价格类型不对');

      assert.throws(function() {
        lib.books([{name: 'Hello world'}, {name: []}]).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === '书名必填是字符串，长度为 1 - 20'
      }, 'iterator 时某些数据的类型不正确');

      assert.throws(function() {
        lib.books([{name: 'Hello world Hello world Hello world Hello world'}]).exec();
      }, function(err) {
        return (err instanceof Error) && err.message === '书名必填是字符串，长度为 1 - 20'
      }, 'iterator 内书名超出长度');

      done();
    });
  });
});
```
