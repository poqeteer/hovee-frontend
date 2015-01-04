var App;

module('Acceptances - Registrant New', {
  setup: function(){
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('registrant.new renders', function(){
  expect(1);

  visit('/registrants/new').then(function(){
    var instructions = find('h5');

    equal(instructions.text(), 'To register, please enter your work e-mail address');
  });
});

