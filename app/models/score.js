var Score = DS.Model.extend({
  compatibility: DS.attr('number'),
  deflection: DS.attr('number'),
  gender: DS.attr('number'),
  industry: DS.attr('number'),
  match: DS.attr('number'),
  schedule: DS.attr('number'),
  trip: DS.attr('number')
});

export default Score;
