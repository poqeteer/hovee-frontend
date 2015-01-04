var DomainSerializer = DS.RESTSerializer.extend({
  serialize: function(domain, options) {
    var json = this._super(domain, options);

    delete json.company;

    return json;
  }
});

export default DomainSerializer;
