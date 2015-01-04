var BaseRoute = Ember.Mixin.create({
  activate: function() {
    this.controllerFor('application').closeNotification();
  }
});

export default BaseRoute;
