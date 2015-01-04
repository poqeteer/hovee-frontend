var MemberSerializer = DS.RESTSerializer.extend({
    /*
      Format from the server:
      {
        "member": {
          "car": {
            "color": "Black",
            "id": 3516,
            "make": "Ford",
            "model": "Escape",
            "year": 2012
          },
          "companyId": 1,
          "companyLocationId": null,
          "companyTeamId": null,
          "email": "mattm+789@hov.ee",
          "firstName": "fdsa",
          "freeTextPersonal": null,
          "gender": null,
          "hasCar": null,
          "id": 258,
          "jobHeadline": "fdsa",
          "lastName": "fdsa",
          "photoUrl": null,

          "homeLocation": {
            "id": 259,
            "latitude": 37.895702,
            "longitude": -122.294365,
            "name": "fdsa",
            "neighborhood": "Albany",
            "tag": "PRIMARY",
            "address": {
              "address1": "649 san gabriel ave.",
              "address2": null,
              "address3": null,
              "city": "albany",
              "country": "US",
              "id": 260,
              "state": "ca",
              "version": 0,
              "zip": "94706"
            }
          },
          licenseState: "NY"
          linkedInProfile: {
            headline: "Principal Software Engineer"
            id: 7094
            lastUpdatedTimestamp: 1389887205991
            pictureUrl: "http://m.c.lnkd.licdn.com/mpr/mprx/0_tBVQ93T_w6u0j2w1NXZe9hCTEBO0R7F1vzkIr8l7FixpxmvgcbUEtQ7GNeM"
            publicProfileUrl: "http://www.linkedin.com/in/jenmellor"
          },
          listeningPrefs: [
            {
              id: 9653
              optionId: 6
            }],
          mobilePhone: "4155180791",
          musicPrefs: [
            {
              id: 9658
              optionId: 8
            },
            {
            id: 9650
            optionId: 1
            }],
          photoUrl: "http://m.c.lnkd.licdn.com/mpr/mprx/0_tBVQ93T_w6u0j2w1NXZe9hCTEBO0R7F1vzkIr8l7FixpxmvgcbUEtQ7GNeM",
          tagline: {
            id: 1
            text: "Not sure what to say here, but I'm saying it."
            timestamp: 1408053046786
          },
         timezone: "America/Los_Angeles"
     }
      }
    */
  extractSingle: function(store, type, payload, id, requestType) {
    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function(payload) {
    if(!Ember.isNone(payload.member.companyId)) {
      payload.member.company = payload.member.companyId;
      delete payload.member.companyId;
    }

    if(!Ember.isNone(payload.member.companyLocationId)) {
      payload.member.workLocation = payload.member.companyLocationId;
      //delete payload.member.companyLocationId;
    }

    if(!Ember.isNone(payload.member.companyTeamId)) {
      payload.member.companyTeam = payload.member.companyTeamId;
      delete payload.member.companyTeamId;
    }

    if(!Ember.isNone(payload.member.homeLocation)) {
      payload.homeAddresses = [payload.member.homeLocation.address];
      payload.member.homeLocation.homeAddress = payload.member.homeLocation.address.id;
      delete payload.member.homeLocation.address;

      payload.member.homeLocation.member = payload.member.id;
      payload.homeLocations = [payload.member.homeLocation];
      payload.member.homeLocation = payload.member.homeLocation.id;
    }

    if(!Ember.isNone(payload.member.car)) {
      payload.member.car.carMake = payload.member.car.makeId;
      delete payload.member.car.makeId;
      payload.cars = [payload.member.car];
      payload.member.car = payload.member.car.id;
    }

    if(!Ember.isNone(payload.member.linkedInProfile)) {
      payload.linkedInProfiles = [payload.member.linkedInProfile];
      payload.member.linkedInProfile = payload.member.linkedInProfile.id;
    }

    if(!Ember.isNone(payload.member.tagline)) {
      payload.taglines = [payload.member.tagline];
      payload.member.tagline = payload.member.tagline.id;
    }

    return payload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this,
        singlePayload,
          newPayload = {
          members: [],
          cars: [],
          linkedInProfiles: [],
          homeLocations: [],
          homeAddresses: [],
          taglines: []
        };

    payload.members.forEach(function(member) {
      singlePayload = serializer.munge({ member: member });

      newPayload.members.push(singlePayload.member);

      if(!Ember.isEmpty(singlePayload.homeLocations)) {
        newPayload.homeLocations.push(singlePayload.homeLocations[0]);
      }

      if(!Ember.isEmpty(singlePayload.homeAddresses)) {
        newPayload.homeAddresses.push(singlePayload.homeAddresses[0]);
      }

      if(!Ember.isEmpty(singlePayload.cars)) {
        newPayload.cars.push(singlePayload.cars[0]);
      }

      if(!Ember.isEmpty(singlePayload.linkedInProfiles)) {
        newPayload.linkedInProfiles.push(singlePayload.linkedInProfiles[0]);
      }

      if(!Ember.isEmpty(singlePayload.taglines)) {
        newPayload.taglines.push(singlePayload.taglines[0]);
      }
    });

    return this._super(store, type, newPayload, id, requestType);
  },

  serialize: function(member, options) {
    var json = this._super(member, options);

    json.companyId = json.company;
    json.companyLocationId = json.workLocation;
    json.companyTeamId = json.companyTeam;

    delete json.company;
    delete json.workLocation;
    delete json.companyTeam;

    // Have to remove the car, linkedin, listening, and music objects because PS doesn't like them...
    delete json.car;
    delete json.conversationPrefs;
    delete json.linkedInProfile;
    delete json.listeningPrefs;
    delete json.musicPrefs;

    return json;
  }
});

export default MemberSerializer;
