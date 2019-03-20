describe("Player", function () {
  var Formulas = require('../../lib/jasmine_examples/Player');
  var player;

  beforeEach(function () {
    player = new Formulas();
  });

  describe("Utilities", function() {
    it("should be able to clarify an array", function () {
      expect(player.supZeros({
        "1": 2,
        2: 0,
        "3": 0,
        "4": undefined,
        "5": "vr",
        "6": "",
        "7": '',
        9: "4",
      })).toEqual({
        "1": 2,
        9: 4
      });
    });

    it("Checks emptiness", function () {
      expect(player.isEmpty({})).toEqual(true);
      expect(player.isEmpty({"5": undefined})).toEqual(false);
    });

    
  });
});