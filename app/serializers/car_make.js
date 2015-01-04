var CarMakeSerializer = DS.RESTSerializer.extend({
  serialize: function(team, options) {
    var json = this._super(team, options);

    delete json.car;

    return json;
  }
});

export default CarMakeSerializer;
