var LinkedInProfile = DS.Model.extend({
  lastUpdatedTimestamp: DS.attr('string'),
  pictureUrl: DS.attr('string'),
  publicProfileUrl: DS.attr('string')
});

export default LinkedInProfile;
