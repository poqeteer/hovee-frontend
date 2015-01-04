var IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('login');
  }
});

export default IndexRoute;
