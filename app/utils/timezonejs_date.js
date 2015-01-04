// this function returns a timezone.js Date object. 
function timezonejsDate() {
  if(window.timezoneJSinitialized !== true) { 
    // set the olsen timezone files directory
    window.timezoneJS.timezone.zoneFileBasePath = '/assets/tz';
    // use the passed in value or set default to northamerica
    window.timezoneJS.timezone.defaultZoneFile = ['northamerica']; 
    window.timezoneJS.timezone.init({async: false});
    window.timezoneJSinitialized = true;
  }
  var dt;
  var defaultTimezone ='America/Los_Angeles'; 
  var arrArgs = Array.prototype.slice.apply(arguments);
  if(arrArgs.length) {
    arrArgs.push(defaultTimezone);
    dt = new window.timezoneJS.Date(arrArgs);
  } else {
    dt = new window.timezoneJS.Date();
    dt.setTimezone(defaultTimezone);
  }
  return dt;
}

export default timezonejsDate;

