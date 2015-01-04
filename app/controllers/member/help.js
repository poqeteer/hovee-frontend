import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberHelpController = Ember.ObjectController.extend({
  needs: ['application', 'currentMember', 'login', 'member'],

  memberId: null,

  // TODO - instead of hard coding, query for the available topics using GET /api/v1/supportRequestTopics
  availableTopics: [
    {description: "Commute Profile", id: 1},
    {description: "Finding Ride Partners", id: 2},
    {description: "Scheduling Rides", id: 3},
    {description: "Managing the Carpool", id: 4},
    {description: "Costs and Promotions", id: 5},
    {description: "About Hovee", id: 6}
  ],

  mobileHeaderString: "Help",

  currentMember: function() {
    return this.get('controllers.currentMember.member');
  }.property('controllers.currentMember.member'),

  actions: {
    askQuestion: function(topicId, question) {
      var controller = this;
      Ember.$.ajax({
        type: "POST",
        url: Ember.ENV.APIHOST + '/members/' + this.get("memberId") + '/supportRequests',
        data: JSON.stringify({ "supportRequest": {"question": question, "topicId": topicId}}),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
      then(function(returnData) {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: "Thanks!",
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: Em.I18n.translations.error.login.load.access.id,
            dialogText: "We've received your question and appreciate your feedback."
          });
      }).
      fail(function(error){
        Ember.Logger.error("Error attempting to ask question; error.status=" + error.status);
        // TODO - define some reasonable retry or fail logic here
        // if (error.status === 401) {
        //   controller.get('controllers.login').send('refreshToken');
        // } else {
        //   new GenericModalDialog().modalDialog(
        //     {
        //       dialogTitle: Em.I18n.translations.error.trip.rating.submit.title,
        //       dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
        //       dialogImageTitle: Em.I18n.translations.error.trip.rating.submit.id,
        //       dialogText: Em.I18n.translations.error.trip.rating.submit.message + controller.get("tripId")
        //     });
        // }
      });
    }
  }
});

export default MemberHelpController;
