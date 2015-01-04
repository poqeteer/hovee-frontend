var TrackingCount = DS.Model.extend({
  onboardingPage: DS.attr('number'),
  count: DS.attr('number'),
  members: DS.attr(),

  pageName: function() {
    var names = ['sign-up', 'linked in', 'your work', 'about you', 'driving', 'where from', 'where to', 'schedule', 'ride', 'thanks/congrats', 'total on boarding', 'submitted', 'registrations', 'fan'];
    var page = this.get('onboardingPage');

    return names[page];
  }.property('onboardingPage')
});

export default TrackingCount;
