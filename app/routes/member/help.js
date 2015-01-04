import AuthenticatedRoute from 'appkit/routes/authenticated';

var MemberHelpRoute = AuthenticatedRoute.extend({
  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function() {
    var member = this.modelFor('member');
    return member.reload(true);
  },
  afterModel: function(member) {
    var controller = this.controllerFor('member.help');
    controller.set('controllers.application.lastPage', 'help');
    controller.set('memberId', member.id);
  }
});

export default MemberHelpRoute;