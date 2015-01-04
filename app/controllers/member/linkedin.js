var MemberLinkedinController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'member'],

  memberLinkedInData: null, // assigned in route (if exists)
  hasLinkedInData: false, // set in memberLinkedInData observer

  linkedInObject: {
    linkedInProfile: {
      linkedInMemberId: null,
      pictureUrl: null,
      publicProfileUrl: null
    }
  },

  isLinkedIn: false,

  foundMemberLinkedInData: function() {
    if (!Ember.isNone(this.get('memberLinkedInData'))) {
      // has LinkedIn data in member data
      this.set('hasLinkedInData', true);
    }
  }.observes('memberLinkedInData'),

  // receive this from linkedinsignin view
  // and assign to currentMember
  headline: function(key, value) {
    this.set('isLinkedIn', true);
    if (arguments.length > 0) {
      this.set('jobHeadline', value);
    }
    return this.get('jobHeadline');
  }.property('jobHeadline'),




  // receive this from linkedinsignin view
  // and assign to currentMember
  linkedInPhoto: function(key, value) {
    if (arguments.length > 0) {

      this.set('photoUrl', value);
      this.set('linkedInObject.linkedInProfile.pictureUrl', value);
    }
    return this.get('photoUrl');
  }.property('photoUrl', 'linkedInObject.linkedInProfile.pictureUrl'),


  linkedInProfileUrl: function() {
    return this.get('linkedInProfile.publicProfileUrl');
  }.property('linkedInProfile.publicProfileUrl'),


  firstPage: true,

  actions: {

    nope:function() {
      window.IN.User.logout();
      this.set('isLinkedIn', false);
    },
    noLinkedIn: function() {
      this.set('firstPage', !this.get('firstPage'));
    },

    // save LinkedIn info (from linkinsignin.js view)
    saveLinkedIn: function() {
      var data = this.get("linkedInObject");
      var memberId = this.get('id');
      //Ember.Logger.debug("> Linkedin: Sending user info to Hovee PS.");
      //Ember.Logger.debug('> Headline from LinkedIn:', headline);

      var type = "POST",
        postFix = '/linkedInProfiles';

      Ember.$.ajax({
        type: type,
        url: Ember.ENV.APIHOST + '/members/' + memberId + postFix,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).then(function(response) {
        // Ember.Logger.debug("> Linkedin: Save to PS successful");
        // view.rerender();

      }).fail(function(error) {
        var err = JSON.parse(error.responseText);
          Ember.Logger.error('error sending to PS:', err.error.errorText);
      }); // end Ember.$.ajax chain
    }
  }
});

export default MemberLinkedinController;
