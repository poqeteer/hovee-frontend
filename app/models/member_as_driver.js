var MemberAsDriver = DS.Model.extend({
  outboundLeg: DS.belongsTo('outboundLeg'),
  returnLeg: DS.belongsTo('returnLeg')
});

export default MemberAsDriver;
