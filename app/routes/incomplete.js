import AuthenticatedRoute from 'appkit/routes/authenticated';

var IncompleteRoute = AuthenticatedRoute.extend({

  actions: {

    willTransition: function(transition) {
      this.controllerFor('application').send('logout');
    }
  }

});

export default IncompleteRoute;