var LocationSerializer = DS.RESTSerializer.extend({
  serialize: function(location, options) {
    var json = this._super(location, options);

    delete json.company;

    return json;
  }
});

export default LocationSerializer;
