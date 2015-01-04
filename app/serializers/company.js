var CompanySerializer = DS.RESTSerializer.extend({
  /*
    Format from the server:
    We're going to change the teams and locations to be sideloaded.

    {
      "company": {
        "domains": [
          {
            "id": 2,
            "name": "hov.ee"
          }
        ],
        "id": 1,
        "locations": [
          {
            "address": null,
            "id": 153,
            "latitude": 0,
            "longitude": 0,
            "name": "Building 2"
          }
          ,
          {
            "address": null,
            "id": 423,
            "latitude": 37.487865,
            "longitude": -122.14593,
            "name": "Building 3"
          }
        ],
        "memberCount": 71,
        "name": "Hovee",
        "teams": [
          {
            "id": 45,
            "name": "IT"
          },
          {
            "id": 42,
            "name": "HR"
          },
        ]
      }
    }
  */
  extractSingle: function(store, type, payload, id, requestType) {
    payload.teams = payload.company.teams;

    payload.company.teams = Ember.ArrayPolyfills.map.call(payload.teams, function(team) {
      return team.id;
    });

    payload.locations = payload.company.locations;

    payload.company.locations = Ember.ArrayPolyfills.map.call(payload.locations, function(location) {
      return location.id;
    });

    var companyAddresses = [];

    payload.locations.forEach(function(location) {
      if(!Ember.isNone(location.address)) {
        location.companyAddress = location.address.id;
        companyAddresses.push(location.address);
      }
    });

    payload.companyAddresses = companyAddresses;

    payload.domains = payload.company.domains;

    payload.company.domains = Ember.ArrayPolyfills.map.call(payload.domains, function(domain) {
      return domain.id;
    });

    return this._super(store, type, payload, id, requestType);
  },

  extractArray: function(store, type, payload, id, requestType) {
    var companies = payload.companies;
    var domains = [];
    var teams = [];
    var locations = [];
    var addresses = [];

    companies.forEach(function(company) {
      var domainIds = [];
      var teamIds = [];
      var locationIds = [];

      company.domains.forEach(function(domain) {
        domains.push(domain);
        domainIds.push(domain.id);
      });

      company.domains = domainIds;

      company.teams.forEach(function(team) {
        teams.push(team);
        teamIds.push(team.id);
      });

      company.teams = teamIds;

      company.locations.forEach(function(location) {
        locations.push(location);
        locationIds.push(location.id);

        if (!Ember.isNone(location.address)) {
          addresses.push(location.address);
          location.companyAddress = location.address.id;
        }
      });

      company.locations = locationIds;
    });

    payload = {
      companies: companies,
      domains: domains,
      teams: teams,
      locations: locations,
      companyAddresses: addresses
    };

    return this._super(store, type, payload, id, requestType);
  }
});

export default CompanySerializer;
