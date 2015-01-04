var RecommenderConfig = DS.Model.extend({
  deflectionScalePower: DS.attr('number'),
  deflectionScaleDivisor: DS.attr('number'),
  scheduleScalePower: DS.attr('number'),
  scheduleScaleDivisor: DS.attr('number'),
  compatibilityMatchWeight: DS.attr('number'),
  tripMatchWeight: DS.attr('number'),
  dailyProbDiscount: DS.attr('number'),
  industryCompatibilityWeight: DS.attr('number'),
  genderCompatibilityWeight: DS.attr('number'),
  deflectionTripWeight: DS.attr('number'),
  scheduleTripWeight: DS.attr('number'),
  googleCreditsPerQuery: DS.attr('number'),
  googleCreditsPer10s: DS.attr('number'),
  googleCreditsPer24h: DS.attr('number'),
  googleTimeBufferMs: DS.attr('number'),
  googleNumThreads:  DS.attr('number')
});

export default RecommenderConfig;
