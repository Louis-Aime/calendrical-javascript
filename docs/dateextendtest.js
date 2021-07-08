/* JS routines for dateextendtest: test custom calendars formatting capabilities. 
To be used with dateextendtest.html
Character set is UTF-8
Contents: general structure is as MilesianClock.
	setDisplay: modify displayed page after a change
	putStringOnOptions : specifically modify date strings. Called by setDisplay.
Required:
	Install calendrical-javascript
*/
/* Version notes
	This file was initialy prepared from the original Milesian clock.
	Then adaptation to modular architecture was performed.
	Optimisation remains possible within this file and also with milesianclockdisplay.js.
*/
/* Version:	M2021-07-18	
		Use IIFE
		Fix bug when setting UTC date
	M2021-05-08 remove validity control on dates of certain calendars since ICU 68 fixes those bugs
	M2021-02-13	Fetch pldr from an external XML file, not from a stringified version
	M2021-02-12	Asynchronous import of calendrical objects - calendar classes are instantiated here
	M2021-01-09	Button for custom calendar
	M2020-12-29 Back to script (no module)
	M2020-12-15 Collect all page-specific routines in this file
	M2020-12-10 Aggregate links to module in this file
	M2020-12-09 Calendrical routines as ES modules
	M2020-11-27 deprecate manual TZ offset and all MilesianAlertMsg
	M2020-11-24 list of calendars is in Calendar.js file
	M2020-11 in progress
	2017-2020: Unicode Tester
	preceding versions were a personal makeup page
*/
/* Copyright Miletus 2017-2021 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
1. The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.
2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non-infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.

Inquiries: www.calendriermilesien.org
*/
"use strict";
// var calendrical = require("calendrical-javascript"), // for the CommonJS version


// import {calendars, milesian, julian, vatican, french, german, english, frenchRev} from "./aggregate.js";
// import {ExtDate, ExtDateTimeFormat} from "./aggregate.js";
// import {Milliseconds} from "./aggregate.js";;

var
	modules,		// all modules here once imported
	milesian,	// = new MilesianCalendar ("milesian",pldrDOM), // A Milesian calendar with pldr data.
	julian,		// = new JulianCalendar ("julian"),	// An instantied Julian calendar, no pldr
	vatican,	// = new WesternCalendar ("vatican", "1582-10-15"),
	french,		// = new WesternCalendar ("french", "1582-12-20"),
	german,		// = new WesternCalendar ("german", "1700-03-01"),
	english,	// = new WesternCalendar ("english","1752-09-14"),
	frenchRev,	// = new FrenchRevCalendar ("frenchrev"),
	calendars;

var register = {		// this register is also used by the small modules written in HTML page
	targetDate : {}, 	// new ExtDate(milesian),
	shiftDate : {}, 	// new ExtDate (milesian),			// unable to compute with unfinished object. register.targetDate.getTime() - register.targetDate.getRealTZmsOffset()),
	customCalendar : {}, 	// milesian,
	TZSettings : {mode : "TZ", msoffset : 0},	// initialisation to be superseded
	TZDisplay : "" 
};

(async function () {
	modules = await import ('./aggregate.js');
	let pldrString = await import ('./pldr.js');
	let	pldrDOM = await fetchDOM ("https://louis-aime.github.io/Milesian-calendar/pldr.xml")
			.then ( (pldrDOM) => pldrDOM ) // The pldr data used by the Milesian calendar (and possibly others).
			.catch ( (error) => { return pldrString.default() } );	// if error (no XML file) take default pldr 
	milesian = new modules.MilesianCalendar ("milesian",pldrDOM);
	julian = new modules.JulianCalendar ("julian");	// An instantied Julian calendar, no pldr
	vatican = new modules.WesternCalendar ("vatican", "1582-10-15");
	french = new modules.WesternCalendar ("french", "1582-12-20");
	german = new modules.WesternCalendar ("german", "1700-03-01");
	english = new modules.WesternCalendar ("english","1752-09-14");
	frenchRev = new modules.FrenchRevCalendar ("frenchrev");
	calendars = [milesian, julian, vatican, french, german, english, frenchRev];
	register.targetDate = new modules.ExtDate(milesian);
	register.shiftDate = new modules.ExtDate ( milesian, register.targetDate.getTime() - register.targetDate.getRealTZmsOffset() );
	register.customCalendar = milesian;
	setDateToNow ();	// initiate after all modules are loaded
})(); 

function setCalend() {	// set current custom calend to new value and compute fields
	register.customCalendar = calendars.find (item => item.id == document.custom.calend.value);  // change custom calendar
	register.targetDate = new modules.ExtDate(register.customCalendar, register.targetDate.valueOf());	// set custom calendar if changed, and set date.
	setDisplay();
}
function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String. Called by setDisplay
	let Locale = document.Locale.Locale.value;
	let unicodeAskedExtension = document.Locale.UnicodeExt.value;
	var askedOptions, usedOptions, extAskedOptions, extUsedOptions, cusAskedOptions; 

	// Test specified Locale
	try {
		if (Locale == "")
			askedOptions = new Intl.DateTimeFormat()
		else askedOptions = new Intl.DateTimeFormat(Locale);
	}
	catch (e) {
		alert (e.message + "\nCheck locale and extensions" ); 
		return
	}
	Locale = askedOptions.resolvedOptions().locale;	// Locale is no longer empty
	Locale = Locale.includes("-u-") ?  Locale.substring (0,Locale.indexOf("-u-")) : Locale; // Remove Unicode extension
	
	// Add extension
	let unicodeExtension = "-u";
	let extendedLocale = Locale;
	if (unicodeAskedExtension !== "") unicodeExtension += "-" + unicodeAskedExtension;
	if (unicodeExtension !== "-u") extendedLocale += unicodeExtension; 
	
	// Add presentation options
	let Options = {}; 
	if	(document.Locale.LocaleMatcher.value != "")	Options.localeMatcher = document.Locale.LocaleMatcher.value;
	if	(document.Locale.FormatMatcher.value != "")	Options.formatMatcher = document.Locale.FormatMatcher.value;
	if	(document.Locale.TimeZone.value != "")	Options.timeZone = document.Locale.TimeZone.value;
	if	(document.Locale.Calendar.value != "")	Options.calendar = document.Locale.Calendar.value;
	if	(document.Locale.DateStyle.value != "") 	Options.dateStyle = document.Locale.DateStyle.value;
	if	(document.Locale.TimeStyle.value != "") 	Options.timeStyle = document.Locale.TimeStyle.value;
	if	(document.dateOptions.Weekday.value != "")	Options.weekday = document.dateOptions.Weekday.value;
	if	(document.dateOptions.Day.value != "") 	Options.day = document.dateOptions.Day.value;
	if	(document.dateOptions.Month.value != "") 	Options.month = document.dateOptions.Month.value;
	if 	(document.dateOptions.Year.value != "")	Options.year = document.dateOptions.Year.value;
	if	(document.dateOptions.Era.value != "")	Options.era	= document.dateOptions.Era.value;
	if	(document.dateOptions.eraDisplay.value != "")	Options.eraDisplay	= document.dateOptions.eraDisplay.value;
	if	(document.timeOptions.Hour.value != "")	Options.hour = document.timeOptions.Hour.value;
	if	(document.timeOptions.Minute.value != "")	Options.minute = document.timeOptions.Minute.value;
	if	(document.timeOptions.Second.value != "")	Options.second	= document.timeOptions.Second.value;
	if	(document.timeOptions.Msdigits.value != "")	Options.fractionalSecondDigits	= document.timeOptions.Msdigits.value;
	if	(document.timeOptions.TimeZoneName.value != "")	Options.timeZoneName	= document.timeOptions.TimeZoneName.value;
	if	(document.timeOptions.Hour12.value != "")	Options.hour12	= (document.timeOptions.Hour12.value == "true");
	if	(document.timeOptions.HourCycle.value != "")	Options.hourCycle	= document.timeOptions.HourCycle.value;
	if	(document.timeOptions.AmPm.value != "")	Options.dayPeriod	= document.timeOptions.AmPm.value;
	
	// Test that Options set is acceptable. If not, display with empty options object
	try {
		askedOptions = new Intl.DateTimeFormat (extendedLocale, Options);
		}
	catch (e) {
		alert (e.message + "\nCheck options" ); 
		return
	}
	usedOptions = askedOptions.resolvedOptions();
	
	// Same for ExtDateTimeFormat
	try {
		extAskedOptions = new modules.ExtDateTimeFormat (extendedLocale, Options);
		}
	catch (e) {
		alert (e.message + "\nCheck options for ExtDateTimeFormat" ); 
		return
	}
	extUsedOptions = extAskedOptions.resolvedOptions();
	cusAskedOptions = new modules.ExtDateTimeFormat(extendedLocale, Options, register.customCalendar);


	
	// Display all effective options
	document.Locale.Elocale.value = usedOptions.locale;
	document.Locale.Enum.value = usedOptions.numberingSystem;
	document.Locale.Ecalend.value = usedOptions.calendar;
	document.Locale.EtimeZone.value = usedOptions.timeZone;
	document.Locale.EdateStyle.value = usedOptions.dateStyle;
	document.Locale.EtimeStyle.value = usedOptions.timeStyle ;
	document.dateOptions.Eweekday.value = usedOptions.weekday;
	document.dateOptions.Eera.value = usedOptions.era;
	document.dateOptions.Eyear.value = usedOptions.year;
	document.dateOptions.Emonth.value = usedOptions.month;
	document.dateOptions.Eday.value = usedOptions.day;
	document.timeOptions.EtimeZoneName.value = usedOptions.timeZoneName;
	document.timeOptions.Ehour.value = usedOptions.hour;
	document.timeOptions.Eminute.value = usedOptions.minute;
	document.timeOptions.Esecond.value = usedOptions.second;
	document.timeOptions.Emsdigits.value = usedOptions.fractionalSecondDigits;
	document.timeOptions.Ehour12.checked = usedOptions.hour12;
	document.timeOptions.EhourCycle.value = usedOptions.hourCycle;
	document.timeOptions.EAmPm.value = usedOptions.dayPeriod;
	
	// Display all effective options for extended formatter
	//document.Locale.Xlocale.value = extUsedOptions.locale;
	//document.Locale.Xcalend.value = extUsedOptions.calendar;
	//document.Locale.Xnum.value = extUsedOptions.numberingSystem;
	//document.Locale.XdateStyle.value = extUsedOptions.dateStyle;
	//document.Locale.XtimeStyle.value = extUsedOptions.timeStyle ;
	//document.Locale.XTimeZone.value = extUsedOptions.timeZone;
	document.dateOptions.Xweekday.value = extUsedOptions.weekday;
	document.dateOptions.Xera.value = extUsedOptions.era;
	document.dateOptions.Xyear.value = extUsedOptions.year;
	document.dateOptions.Xmonth.value = extUsedOptions.month;
	document.dateOptions.Xday.value = extUsedOptions.day;
	document.timeOptions.XtimeZoneName.value = extUsedOptions.timeZoneName;
	document.timeOptions.Xhour.value = extUsedOptions.hour;
	document.timeOptions.Xminute.value = extUsedOptions.minute;
	document.timeOptions.Xsecond.value = extUsedOptions.second;
	document.timeOptions.Xmsdigits.value = extUsedOptions.fractionalSecondDigits;
	document.timeOptions.Xhour12.checked = extUsedOptions.hour12;
	document.timeOptions.XhourCycle.value = extUsedOptions.hourCycle;
	document.timeOptions.XAmPm.value = extUsedOptions.dayPeriod;
	
	/*
	// Build "reference" format object with asked options and ISO8601 calendar, and display non-Unicode calendar string
	extendedLocale = Locale + "-u-ca-iso8601" + (unicodeAskedExtension == "" ? "" : "-" + unicodeAskedExtension); // Build Locale with ISO8601 calendar
	let referenceFormat = new Intl.DateTimeFormat(extendedLocale,usedOptions);
	
	let referenceExtFormat = new ExtDateTimeFormat(Locale,Options);
	extUsedOptions = referenceExtFormat.resolvedOptions();
	referenceExtFormat = new ExtDateTimeFormat(extUsedOptions.locale,extUsedOptions);
*/
	cusAskedOptions = new modules.ExtDateTimeFormat(extendedLocale, Options, register.customCalendar);
	// Certain Unicode calendars do not give a proper result: here is the control code. But this was solved with ICU 68
	// let valid = modules.ExtDateTimeFormat.unicodeValidDateinCalendar(register.targetDate, extUsedOptions.timeZone,usedOptions.calendar);
	// Display with extended DateTimeFormat
	document.getElementById("Calendname").innerHTML = usedOptions.calendar;
	document.getElementById("Xstring").innerHTML = extAskedOptions.format(register.targetDate); 	// (valid ? "" : "(!) ") +
	// Display custom calendar string - error control
	document.getElementById("Customname").innerHTML = register.customCalendar.id;
	try {
		document.getElementById("Cstring").innerHTML = cusAskedOptions.format(register.targetDate);
	}
	catch (e) {
		document.getElementById("Cstring").innerHTML = e.message
	}

	let	myUnicodeElement = document.getElementById("Ustring");
	try { 
		myUnicodeElement.innerHTML = askedOptions.format(register.targetDate); // (valid ? "" : "(!) ") +
		}
	catch (e) { 
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber);
		myUnicodeElement.innerHTML = "(!)"; 
		}
	// Add week computation
	calcWeek();
}
function calcWeek() {
	try {
		document.getElementById("fullyear").innerHTML = register.targetDate.fullYear(register.TZDisplay);
		document.yeartype.leapyear.value = register.targetDate.inLeapYear(register.TZDisplay);
		document.getElementById("weekyear").innerHTML = register.targetDate.fullWeekYear(register.TZDisplay);
		document.getElementById("weeknum").innerHTML = register.targetDate.weekNumber(register.TZDisplay);
		document.getElementById("dayownum").innerHTML = register.targetDate.weekday(register.TZDisplay);
		document.getElementById("weeksinyear").innerHTML = register.targetDate.weeksInYear(register.TZDisplay);
		document.getElementById("dayname").innerHTML = 
			new modules.ExtDateTimeFormat (document.Locale.Elocale.value,{weekday : "long", 
			timeZone : register.TZDisplay == "" ? undefined : register.TZDisplay },register.customCalendar)
			.format(register.targetDate);
	}
	catch (e) {
		document.getElementById("weekyear").innerHTML = "";
		document.getElementById("weeknum").innerHTML = "";
		document.getElementById("dayownum").innerHTML = "";
		document.getElementById("weeksinyear").innerHTML = "";
		document.getElementById("dayname").innerHTML = e.message;
	}
}

function setDisplay () { // Considering that register.targetDate time has been set to the desired date, this routines updates all form fields.
	// Set time zone offset at asked date, display parameters
	register.TZSettings.msoffset = register.targetDate.getRealTZmsOffset().valueOf();
	let myElement = document.getElementById("sysTZoffset");
	myElement.innerHTML = new Intl.NumberFormat().format(register.targetDate.getTimezoneOffset());
	let
		systemSign = (register.TZSettings.msoffset > 0 ? 1 : -1), // sign is as of JS convention
		absoluteRealOffset = systemSign * register.TZSettings.msoffset,
		absoluteTZmin = Math.floor (absoluteRealOffset / modules.Milliseconds.MINUTE_UNIT),
		absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * modules.Milliseconds.MINUTE_UNIT) / modules.Milliseconds.SECOND_UNIT);
	switch (register.TZSettings.mode) {
		case "UTC" : 
			register.TZSettings.msoffset = 0; // Set offset to 0, but leave time zone offset on display
		case "TZ" : 
			document.querySelector("#realTZOffset").innerHTML = (systemSign == 1 ? "+ ":"- ") + absoluteTZmin + " min " + absoluteTZsec + " s";
	}
	// Initiate a representation of local date
	register.shiftDate = new modules.ExtDate (register.customCalendar,register.targetDate.getTime() - register.TZSettings.msoffset);	// The UTC representation of register.targetDate date is the local date of TZ
	// Initiate custom calendar form with present local date
	let fields = register.shiftDate.getFields("UTC");
	document.custom.calend.value = register.customCalendar.id	;	
	document.custom.year.value = register.customCalendar.fullYear(fields); // display fullYear, not just year. fields.year is displayed with era in date string.
	document.custom.monthname.value = fields.month; // Display month value in 1..12 range.
	document.custom.day.value = fields.day;

	// Initiate Gregorian form with present local date
    document.gregorian.year.value = register.shiftDate.getUTCFullYear(); // uses the local variable - not UTC
    document.gregorian.monthname.value = register.shiftDate.getUTCMonth() + 1; // Display month value in 1..12 range.
    document.gregorian.day.value = register.shiftDate.getUTCDate();
	try {
		document.custom.dayofweek.value = (new Intl.DateTimeFormat(undefined, {weekday : "long", timeZone : "UTC"})).format(register.shiftDate);
		}
	catch (e) {
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber);
		document.custom.dayofweek.value = "(!)"; 
		}
	// Update local time fields - using	Date properties
	document.time.hours.value = register.shiftDate.getUTCHours();
	document.time.mins.value = register.shiftDate.getUTCMinutes();
	document.time.secs.value = register.shiftDate.getUTCSeconds();
	document.time.ms.value = register.shiftDate.getUTCMilliseconds();

	// Display UTC date & time in custom calendar, ISO, and Posix number
	myElement = document.getElementById("dateString");
	myElement.innerHTML = register.targetDate.toCalString(register.TZDisplay);
	myElement = document.getElementById("ISOdatetime");
	myElement.innerHTML = register.targetDate.toISOString();
	myElement = document.getElementById("Posixnumber");
	myElement.innerHTML = register.targetDate.valueOf();

	// Write custom and Unicode strings following currently visible options
	putStringOnOptions();
}
function calcGregorian() {
	var 
	 day =  Math.round (document.gregorian.day.value),
	 month = Math.round (document.gregorian.monthname.value),
	 year =  Math.round (document.gregorian.year.value);
	 // HTML controls that day, month and year are numbers
	register.customCalendar = calendars.find (item => item.id == document.custom.calend.value);  // change custom calendar
	let testDate = new Date (register.targetDate.valueOf());
	switch (register.TZSettings.mode) {
		case "TZ": 
			testDate.setFullYear(year, month-1, day); 	// Set date object from calendar date indication, without changing time-in-the-day.
			break;
		case "UTC" : testDate.setUTCFullYear(year, month-1, day);
			break;
	} 
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		register.targetDate = new modules.ExtDate(register.customCalendar, testDate.valueOf());	// set custom calendar if changed, and set date.
		setDisplay();
	}
}
function calcCustom() {
	var 
	 day =  Math.round (document.custom.day.value),
	 month = Math.round (document.custom.monthname.value),
	 year =  Math.round (document.custom.year.value),
	 testDate;
	 // HTML controls that day, month and year are numbers
	register.customCalendar = calendars.find (item => item.id == document.custom.calend.value);	// global variable
	// let testDate = new modules.ExtDate (register.customCalendar, year, month, day);
	switch (register.TZSettings.mode) {
		case "TZ":  // Set date object from custom calendar date indication, and with time of day of currently displayed date.
			testDate = new modules.ExtDate (register.customCalendar, year, month, day, register.targetDate.getHours(), register.targetDate.getMinutes(), register.targetDate.getSeconds(), register.targetDate.getMilliseconds())
			break;
		case "UTC" : // // Set date object from custom calendar date indication, and with UTC time of day of currently displayed date.
			testDate = new modules.ExtDate (register.customCalendar, year, month, day);
			testDate.setUTCFullYear (testDate.getFullYear(), testDate.getMonth(), testDate.getDate()); // Ensure passed value are UTC converted
			testDate.setUTCHours ( register.targetDate.getUTCHours(), register.targetDate.getUTCMinutes(), 
							register.targetDate.getUTCSeconds(), register.targetDate.getUTCMilliseconds() );
			break;
	}
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		register.targetDate = new modules.ExtDate(register.customCalendar, testDate.valueOf());	// set custom calendar if changed, and set date.
		setDisplay();
		}
}
var 
	dayOffset = 1; // Days (decimal) to add or substract
// no setDateToToday
function changeDayOffset () { 
	let days = +document.control.shift.value;
	if (isNaN(days) || days < 0) {
		alert ("Invalid input");
		// clockRun(0);
		}
	else 
	{ 
		dayOffset = days; // Global variable updated
		document.control.shift.value = days; // Confirm changed value
	}
}
function setDayOffset (sign=1) {
	changeDayOffset();	// Force a valid value in field
	let testDate = new Date(register.targetDate.valueOf());
	testDate.setTime (testDate.getTime() + sign * dayOffset * modules.Milliseconds.DAY_UNIT);
	if (isNaN(testDate.valueOf())) { 
		alert ("Out of range");
		// clockRun(0);
		}
	else {
		register.targetDate.setTime( testDate.valueOf() );
		setDisplay();
	}
}
function calcTime() { // Here the hours are deemed local hours
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), 
		secs = Math.round (document.time.secs.value), ms = Math.round (document.time.ms.value);
	if (isNaN(hours) || isNaN (mins) || isNaN (secs) || isNaN (ms)) 
		alert ("Invalid date " + '"' + document.time.hours.value + '" "' + document.time.mins.value + '" "' 
		+ document.time.secs.value + '.' + document.time.ms.value + '"')
	 else {
	  let testDate = new modules.ExtDate (register.customCalendar,register.targetDate.valueOf());
	  switch (register.TZSettings.mode) {
		case "TZ" : testDate.setHours(hours, mins, secs, ms); break;
		case "UTC" : testDate.setUTCHours(hours, mins, secs, ms); break;
/*		case "Fixed" : 
			testDate = new Date(modules.ExtDate.fullUTC (document.gregorian.year.value, document.gregorian.monthname.value, document.gregorian.day.value));
			testDate.setUTCHours(hours, mins, secs, ms); 
			testDate.setTime(testDate.getTime() + register.TZSettings.msoffset);
*/		}
		if (isNaN(testDate.valueOf())) alert ("Out of range")
		else {
			register.targetDate = new modules.ExtDate (register.customCalendar,testDate.valueOf());
			setDisplay();
		}
	}
}
var addedTime = 60000; //Global variable, time to add or substract, in milliseconds.
function changeAddTime() {
	let msecs = +document.timeShift.shift.value; 
	if (isNaN(msecs) || msecs <= 0) 
		alert ("Invalid input")
	else
		{ 
		addedTime = msecs; // Global variable updated
		document.timeShift.shift.value = msecs; // Confirm changed value
		}
	}

function addTime (sign = 1) { // addedTime ms is added or subtracted to or from the Timestamp.
	changeAddTime();	// Force a valid value in field
	let testDate = new Date(register.targetDate.valueOf());
	testDate.setTime (testDate.getTime() + sign * addedTime); 
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		register.targetDate.setTime( testDate.valueOf() );
		setDisplay();
	}
}
function getMode() {
	// Initiate Time zone mode for the "local" time from main display
	register.TZSettings.mode = document.TZmode.TZcontrol.value;
	register.TZDisplay = register.TZSettings.mode == "UTC" ? "UTC" : "";
	/** register.TZSettings.msoffset is JS time zone offset in milliseconds (UTC - local time)
	 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
	*/

}
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours specified.
	if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
	let testDate = new Date (register.targetDate.valueOf());
	testDate.setUTCHours(UTChours, 0, 0, 0);
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		register.targetDate.setTime (testDate.valueOf());
		setDisplay();
	}
}
function setDateToNow(){ // Self explanatory
	register.targetDate = new modules.ExtDate(register.customCalendar); // set new Date object.
	setDisplay ();
}
/* Events handlers
*/
window.onload = function () {

	document.gregorian.addEventListener("submit", function (event) {
		event.preventDefault();
		calcGregorian()
	})
	document.getElementById("customCalend").addEventListener("click", function (event) {
		event.preventDefault();
		setCalend()
	})
	document.custom.addEventListener("submit", function (event) {
		event.preventDefault();
		calcCustom()
	})
	document.control.addEventListener("submit", function (event) {
		event.preventDefault();
		changeDayOffset()
	})
	document.control.now.addEventListener("click", function (event) {
		setDateToNow()
	})
	document.control.minus.addEventListener("click", function (event) {
		setDayOffset(-1)
	})
	document.control.plus.addEventListener("click", function (event) {
		setDayOffset(+1)
	})
	document.time.addEventListener("submit", function (event) {
		event.preventDefault();
		calcTime()
	})
	document.timeShift.addEventListener("submit", function (event) {
		event.preventDefault();
		changeAddTime()
	})
	document.timeShift.minus.addEventListener("click", function (event) {
		addTime(-1)
	})
	document.timeShift.plus.addEventListener("click", function (event) {
		addTime(+1)
	}) 
	document.TZmode.addEventListener("submit", function (event) {
		event.preventDefault();
		getMode();
		setDisplay();
	})
	document.getElementById("h0").addEventListener("click", function (event) {
		setUTCHoursFixed(0)
	})
	document.getElementById("h12").addEventListener("click", function (event) {
		setUTCHoursFixed(12)
	})
	document.Locale.addEventListener ("submit", function (event) {
		event.preventDefault();
		putStringOnOptions()
	})
	document.dateOptions.addEventListener ("submit", function (event) {
		event.preventDefault();
		putStringOnOptions()
	})
	document.timeOptions.addEventListener ("submit", function (event) {
		event.preventDefault();
		putStringOnOptions()
	})
}