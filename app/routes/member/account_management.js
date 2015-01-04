import AuthenticatedRoute from 'appkit/routes/authenticated';

var AccountManagementRoute = AuthenticatedRoute.extend({

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  model: function() {
    return this.modelFor('member');
  },

  actions: {
    didTransition: function() {
      var controller = this.controllerFor('member.account_management');
      controller.set('oldPassword', '');
      controller.set('password', '');
      controller.set('passwordConfirmation', '');
    }
  }
});

export default AccountManagementRoute;