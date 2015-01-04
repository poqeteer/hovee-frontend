var Account = DS.Model.extend({
  registrationKey: DS.attr('string'),
  username: DS.attr('string'),
  password: DS.attr('string')
});

export default Account;
