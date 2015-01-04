var TeamSerializer = DS.RESTSerializer.extend({
  serialize: function(team, options) {
    var json = this._super(team, options);

    delete json.company;

    return json;
  }
});

export default TeamSerializer;
