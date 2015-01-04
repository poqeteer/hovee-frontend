var App;

module('Acceptances - Index', {
  setup: function(){
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('redirects to login', function(){
  expect(3);

  visit('/').then(function(){
    var title = find('h1');

    equal(title.text(), 'Welcome to Hovee');
    ok(exists('input[placeholder="E-mail address"]'), "The email field exists");
    ok(exists('input[placeholder="Password"]'), "The password field exists");
  });
});
