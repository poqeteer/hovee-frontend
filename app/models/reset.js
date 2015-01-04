var Reset = DS.Model.extend({
  registrationKey: DS.attr('string'),
  email: DS.attr('string'),
  password: DS.attr('string')
});

export default Reset;
