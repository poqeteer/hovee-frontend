var ApplicationAdapter = DS.RESTAdapter.extend({
  host: Ember.ENV.HOST,
  namespace: Ember.ENV.NAMESPACE,
});

export default ApplicationAdapter;
