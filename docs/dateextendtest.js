/* JS routines for dateextendtest: test custom calendars formatting capabilities. 
To be used with dateextendtest.html
Character set is UTF-8
Contents: general structure is as MilesianClock.
	setDisplay: modify displayed page after a change
	putStringOnOptions : specifically modify date strings. Called by setDisplay.
Required:
	Install calendrical-javascript
*/
/* Version:	M2020-12-10 Aggregate links to module in this file
	M2020-12-09 Calendrical routines as ES modules
	M2020-11-27 deprecate manual TZ offset and all MilesianAlertMsg
	M2020-11-24 list of calendars is in Calendar.js file
	M2020-11 in progress
	2017-2020: Unicode Tester
	preceding versions were a personal makeup page
*/
/* Copyright Miletus 2017-2020 - Louis A. de Fouquières
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
 
import {calendars, milesian, julian, vatican, french, german, english, myEthiopic, frenchRev} from "./aggregate.js";
import {ExtDate, ExtDateTimeFormat} from "./aggregate.js";
import {Chronos} from "./aggregate.js";;

var register = {		// this register is also used by the small modules written in HTML page
	targetDate : new ExtDate(milesian),
	shiftDate : new ExtDate (milesian),			// unable to compute with unfinished object. register.targetDate.getTime() - register.targetDate.getRealTZmsOffset()),
	customCalendar : milesian,
	TZSettings : {mode : "TZ", msoffset : 0},	// initialisation to be superseded
	TZDisplay : "" 
}
function setDateToNow(){ // Self explanatory
	register.targetDate = new ExtDate(register.customCalendar); // set new Date object.
	setDisplay ();
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
function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String. Called by setDisplay
	let Locale = document.LocaleOptions.Locale.value;
	let unicodeAskedExtension = document.LocaleOptions.UnicodeExt.value;
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
	if	(document.LocaleOptions.LocaleMatcher.value != "")	Options.localeMatcher = document.LocaleOptions.LocaleMatcher.value;
	if	(document.LocaleOptions.FormatMatcher.value != "")	Options.formatMatcher = document.LocaleOptions.FormatMatcher.value;
	if	(document.LocaleOptions.TimeZone.value != "")	Options.timeZone = document.LocaleOptions.TimeZone.value;
	if	(document.LocaleOptions.Calendar.value != "")	Options.calendar = document.LocaleOptions.Calendar.value;
	if	(document.LocaleOptions.DateStyle.value != "") 	Options.dateStyle = document.LocaleOptions.DateStyle.value;
	if	(document.LocaleOptions.TimeStyle.value != "") 	Options.timeStyle = document.LocaleOptions.TimeStyle.value;
	if	(document.LocaleOptions.Weekday.value != "")	Options.weekday = document.LocaleOptions.Weekday.value;
	if	(document.LocaleOptions.Day.value != "") 	Options.day = document.LocaleOptions.Day.value;
	if	(document.LocaleOptions.Month.value != "") 	Options.month = document.LocaleOptions.Month.value;
	if 	(document.LocaleOptions.Year.value != "")	Options.year = document.LocaleOptions.Year.value;
	if	(document.LocaleOptions.Era.value != "")	Options.era	= document.LocaleOptions.Era.value;
	if	(document.LocaleOptions.Hour.value != "")	Options.hour = document.LocaleOptions.Hour.value;
	if	(document.LocaleOptions.Minute.value != "")	Options.minute = document.LocaleOptions.Minute.value;
	if	(document.LocaleOptions.Second.value != "")	Options.second	= document.LocaleOptions.Second.value;
	if	(document.LocaleOptions.TimeZoneName.value != "")	Options.timeZoneName	= document.LocaleOptions.TimeZoneName.value;
	if	(document.LocaleOptions.Hour12.value != "")	Options.hour12	= (document.LocaleOptions.Hour12.value == "true");
	if	(document.LocaleOptions.HourCycle.value != "")	Options.hourCycle	= document.LocaleOptions.HourCycle.value;
	if	(document.LocaleOptions.AmPm.value != "")	Options.dayPeriod	= document.LocaleOptions.AmPm.value;
	if	(document.LocaleOptions.eraDisplay.value != "")	Options.eraDisplay	= document.LocaleOptions.eraDisplay.value;
	
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
		extAskedOptions = new ExtDateTimeFormat (extendedLocale, Options);
		}
	catch (e) {
		alert (e.message + "\nCheck options for ExtDateTimeFormat" ); 
		return
	}
	extUsedOptions = extAskedOptions.resolvedOptions();
	cusAskedOptions = new ExtDateTimeFormat(extendedLocale, Options, register.customCalendar);


	
	// Display all effective options
	document.LocaleOptions.Elocale.value = usedOptions.locale;
	document.LocaleOptions.Ecalend.value = usedOptions.calendar;
	document.LocaleOptions.Enum.value = usedOptions.numberingSystem;
	document.LocaleOptions.EtimeZoneName.value = usedOptions.timeZoneName;
	document.LocaleOptions.EdateStyle.value = usedOptions.dateStyle;
	document.LocaleOptions.EtimeStyle.value = usedOptions.timeStyle ;
	document.LocaleOptions.ETimeZone.value = usedOptions.timeZone;
	document.LocaleOptions.Eweekday.value = usedOptions.weekday;
	document.LocaleOptions.Eera.value = usedOptions.era;
	document.LocaleOptions.Eyear.value = usedOptions.year;
	document.LocaleOptions.Emonth.value = usedOptions.month;
	document.LocaleOptions.Eday.value = usedOptions.day;
	document.LocaleOptions.Ehour.value = usedOptions.hour;
	document.LocaleOptions.Eminute.value = usedOptions.minute;
	document.LocaleOptions.Esecond.value = usedOptions.second;
	document.LocaleOptions.Ehour12.checked = usedOptions.hour12;
	document.LocaleOptions.EhourCycle.value = usedOptions.hourCycle;
	document.LocaleOptions.EAmPm.value = usedOptions.dayPeriod;
	
	// Display all effective options for extended formatter
	//document.LocaleOptions.Xlocale.value = extUsedOptions.locale;
	//document.LocaleOptions.Xcalend.value = extUsedOptions.calendar;
	//document.LocaleOptions.Xnum.value = extUsedOptions.numberingSystem;
	//document.LocaleOptions.XdateStyle.value = extUsedOptions.dateStyle;
	//document.LocaleOptions.XtimeStyle.value = extUsedOptions.timeStyle ;
	//document.LocaleOptions.XTimeZone.value = extUsedOptions.timeZone;
	document.LocaleOptions.XtimeZoneName.value = extUsedOptions.timeZoneName;
	document.LocaleOptions.Xweekday.value = extUsedOptions.weekday;
	document.LocaleOptions.Xera.value = extUsedOptions.Xra;
	document.LocaleOptions.Xyear.value = extUsedOptions.year;
	document.LocaleOptions.Xmonth.value = extUsedOptions.month;
	document.LocaleOptions.Xday.value = extUsedOptions.day;
	document.LocaleOptions.Xhour.value = extUsedOptions.hour;
	document.LocaleOptions.Xminute.value = extUsedOptions.minute;
	document.LocaleOptions.Xsecond.value = extUsedOptions.second;
	document.LocaleOptions.Xhour12.checked = extUsedOptions.hour12;
	document.LocaleOptions.XhourCycle.value = extUsedOptions.hourCycle;
	document.LocaleOptions.XAmPm.value = extUsedOptions.dayPeriod;
	
	/*
	// Build "reference" format object with asked options and ISO8601 calendar, and display non-Unicode calendar string
	extendedLocale = Locale + "-u-ca-iso8601" + (unicodeAskedExtension == "" ? "" : "-" + unicodeAskedExtension); // Build Locale with ISO8601 calendar
	let referenceFormat = new Intl.DateTimeFormat(extendedLocale,usedOptions);
	
	let referenceExtFormat = new ExtDateTimeFormat(Locale,Options);
	extUsedOptions = referenceExtFormat.resolvedOptions();
	referenceExtFormat = new ExtDateTimeFormat(extUsedOptions.locale,extUsedOptions);
*/
	cusAskedOptions = new ExtDateTimeFormat(extendedLocale, Options, register.customCalendar);
	// Certain Unicode calendars do not give a proper result: here is the control code.
	let valid = ExtDateTimeFormat.unicodeValidDateinCalendar(register.targetDate, extUsedOptions.timeZone,usedOptions.calendar);
	// Display with extended DateTimeFormat
	document.getElementById("Xstring").innerHTML = (valid ? "" : "(!) ") + extAskedOptions.format(register.targetDate);
	// Display custom calendar string - error control
	try {
		document.getElementById("Cstring").innerHTML = cusAskedOptions.format(register.targetDate);
	}
	catch (e) {
		document.getElementById("Cstring").innerHTML = e.message
	}

	let	myUnicodeElement = document.getElementById("Ustring");
	try { 
		myUnicodeElement.innerHTML = (valid ? "" : "(!) ") + askedOptions.format(register.targetDate); // askedOptions.format(register.targetDate); 
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
			new ExtDateTimeFormat (document.LocaleOptions.Elocale.value,{weekday : "long", 
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
		absoluteTZmin = Math.floor (absoluteRealOffset / Chronos.MINUTE_UNIT),
		absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * Chronos.MINUTE_UNIT) / Chronos.SECOND_UNIT);
	switch (register.TZSettings.mode) {
		case "UTC" : 
			register.TZSettings.msoffset = 0; // Set offset to 0, but leave time zone offset on display
		case "TZ" : 
			document.TZmode.TZOffsetSign.value = systemSign;
			document.TZmode.TZOffset.value = absoluteTZmin;
			document.TZmode.TZOffsetSec.value = absoluteTZsec;
			break;
/*		case "Fixed" : register.TZSettings.msoffset = // Here compute specified time zone offset
			- document.TZmode.TZOffsetSign.value 
			* (document.TZmode.TZOffset.value * Chronos.MINUTE_UNIT + document.TZmode.TZOffsetSec.value * Chronos.SECOND_UNIT);
*/	}
	// Initiate a representation of local date
	register.shiftDate = new ExtDate (register.customCalendar,register.targetDate.getTime() - register.TZSettings.msoffset);	// The UTC representation of register.targetDate date is the local date of TZ
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
/* Events handlers
*/
window.onload = function () {setDateToNow()};
/* Export
*/
export {register, setDisplay, setDateToNow, putStringOnOptions}
