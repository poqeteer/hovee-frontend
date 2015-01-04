var App;

module('Acceptances - Members New', {
  setup: function(){
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('members.new renders', function(){
  visit('/registrants/new').then(function() {
  }).then(function() {
    var instructions = find('h5');
    return equal(instructions.text(), 'To register, please enter your work e-mail address');
  }).then(function() {
    return fillIn('#registrant-email', new Date().getTime().toString() + '@hov.ee');
  //FIXME: We need to mock the adapters
  // }).then(function() {
    // return click('#submit-registrant');
  // }).then(function() {
    // ok(exists('#member-first-name'), "The member first name field exists");
  });
});
