describe('Home factory', function() {
  var Home;

  // Before each test load our api.users module
  beforeEach(angular.mock.module('api.home'));

  // Before each test set our injected Users factory (_Users_) to our local Users variable
  beforeEach(inject(function(_Home_) {
    Home = _Home_;
  }));

  // A simple test to verify the Users factory exists
  it('should exist', function() {
    expect(Home).toBeDefined();
  });
  describe('.all()', function() {
      it('should exist', function() {
          expect(Home.all).toBeDefined();
      })
  })
});
