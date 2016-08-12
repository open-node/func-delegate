var delegate  = require('../')
  , assert    = require('assert');


var add = function(a, b) { return a + b; };

describe("func-delegate", function() {
  describe("#normal", function() {
    it("Basics usage", function(done) {
      add = delegate(add, [{
        name: 'num1',
        type: Number
      }, {
        name: 'num2',
        type: Number
      }]);
      assert.ok(add instanceof Function, '处理后的仍然是一个函数');
      assert.ok(add.num1 instanceof Function);
      assert.ok(add.num2 instanceof Function);

      assert.equal(3, add(1, 2));
      assert.equal(3, add.num1(1).num2(2).exec());
      done();
    });
  });
});
