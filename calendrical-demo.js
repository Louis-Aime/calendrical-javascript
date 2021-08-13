/* JS routines for calendrical-demo: test custom calendars formatting capabilities. 
To be used with suitable calendrical-demo-**.html file.
Character set is UTF-8
Contents: animtation routines for the html page.
Required objects initiated by calendrical-init or equivalent
	loadCalendrical: promise that modules are imported
	calendrical: prefix name for imported modules
*/
/* Version notes
	This file is associated with calendrical-demo-**.html files.
	The event listeners are designed as to follow forms value. A "refresh" action will set to value in forms. 
	Control are done as to avoid changes to illegal values in forms (except dates that cab be balanced).
*/
/* Version:	M2021-08-23	try / catch each .format
	M2021-08-22 splitted from initialiser and renamed
	M2021-08-13 optimised, and switch to Gregorian
	V2021-07-28: fullYear is no more a function.
	V2021-07-25	
		Control week figures, 
		Add one calendar (Gregorian with week management)
		Simplify management of system time zone / UTC time zone
	M2021-07-22 separate extdate.js and extdatetimeformat.js, aggregate pldrString wiht other modules
	M2021-07-18	
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

// global var calendrical is initiated as prefix name for user modules.
// global const loadComplete is Promise object that all modules and data are imported.

var 
	switchingDate = { day : 15, month : 10, year : 1582 },
	calendars = [],	// an array (pointers to) calendar objects
	customCalIndex = 0,	// initialised and later changed.
	targetDate = new Date(0), 	// An initial date
	TZ = "",
	TZOffset = 0,
	askedOptions, usedOptions, extAskedOptions, extUsedOptions, cusAskedOptions; 

function setDisplay () { // Considering that targetDate time has been set to the desired date, this routines updates all form fields.
	// Set time zone offset at asked date, display parameters
	TZOffset = targetDate.getRealTZmsOffset().valueOf();
	let myElement = document.getElementById("sysTZoffset");
	myElement.innerHTML = new Intl.NumberFormat().format(targetDate.getTimezoneOffset());
	let
		systemSign = (TZOffset > 0 ? 1 : -1), // sign is as of JS convention
		absoluteRealOffset = systemSign * TZOffset,
		absoluteTZmin = Math.floor (absoluteRealOffset / calendrical.TimeUnits.MINUTE_UNIT),
		absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * calendrical.TimeUnits.MINUTE_UNIT) / calendrical.TimeUnits.SECOND_UNIT);
	switch (TZ) {
		case "UTC" : 
			TZOffset = 0; // Set offset to 0, but leave time zone offset on display
		case "" : 
			document.querySelector("#realTZOffset").innerHTML = (systemSign == 1 ? "+ ":"- ") + absoluteTZmin + " min " + absoluteTZsec + " s";
	}
	// Initiate a representation of local date
//	isoDate = new calendrical.ExtDate ('iso8601',targetDate.valueOf());	// The UTC representation of targetDate date is the local date of TZ
	// Initiate custom calendar form with present local date
	// let fields = targetDate.getFields(TZ);
	document.custom.calend.value = calendars[customCalIndex].id	;	
	document.custom.year.value = targetDate.fullYear(TZ); // display fullYear, not just year. fields.year is displayed with era in date string.
	document.custom.monthname.value = targetDate.month(TZ); // Display month value in 1..12 range.
	document.custom.day.value = targetDate.day(TZ);

	document.week.weekyear.value = targetDate.weekYear(TZ); //getElementById("weekyear").innerHTML
	document.week.weeknumber.value = targetDate.weekNumber(TZ);	//getElementById("weeknum").innerHTML
	document.week.weekday.value = targetDate.weekday(TZ);	//getElementById("dayownum").innerHTML
	document.week.weeksinyear.value = targetDate.weeksInYear(TZ);	// getElementById("weeksinyear").innerHTML

	try {
		document.week.dayofweek.value = 	// getElementById("dayname").innerHTML
			new calendrical.ExtDateTimeFormat 
				( document.Locale.Elocale.value == "" ? undefined : document.Locale.Elocale.value,
					{ weekday : "long", timeZone : TZ == "" ? undefined : TZ }, calendars[customCalIndex] )
						.format(targetDate);
		}
	catch (e) { document.week.dayofweek.value = e.message + "\n" + e.fileName + " line " + e.lineNumber };

	// Update system local time fields
	document.time.hours.value = targetDate.hours(TZ);
	document.time.mins.value = targetDate.minutes(TZ);
	document.time.secs.value = targetDate.seconds(TZ);
	document.time.ms.value = targetDate.milliseconds(TZ);

	// Display UTC date & time in custom calendar, ISO, and Posix number
	document.getElementById("dateString").innerHTML = targetDate.toCalString(TZ);
	document.getElementById("ISOdatetime").innerHTML = targetDate.toISOString();
	document.getElementById("Posixnumber").innerHTML = targetDate.valueOf();

	// Display formatted date strings - all with try / catch
	document.getElementById("Calendname").innerHTML = usedOptions.calendar;
	myElement = document.getElementById("Ustring");
	try { myElement.innerHTML = askedOptions.format(targetDate) }
	catch (e) { myElement.innerHTML = e.message + "\n" + e.fileName + " line " + e.lineNumber };
	myElement = document.getElementById("Xstring");
	try { myElement.innerHTML = extAskedOptions.format(targetDate) }
	catch (e) { myElement.innerHTML = e.message + "\n" + e.fileName + " line " + e.lineNumber };
	document.getElementById("Customname").innerHTML = calendars[customCalIndex].id;
	myElement = document.getElementById("Cstring");
	try { myElement.innerHTML = cusAskedOptions.format(targetDate) }
	catch (e) { myElement.innerHTML = e.message + "\n" + e.fileName + " line " + e.lineNumber };
	// Add supplemental computations
		document.getElementById("fullyear").innerHTML = targetDate.fullYear(TZ);
		document.yeartype.leapyear.value = targetDate.inLeapYear(TZ);
}

function compLocalePresentationCalendar() { // Compute new formatting objects

	let 
		Locale = document.Locale.Locale.value,
		Calendar = document.Locale.Calendar.value,
		timeZone = document.Locale.TimeZone.value,
		unicodeAskedExtension = document.Locale.UnicodeExt.value,
		testDTF;
	// modified global variables: askedOptions, usedOptions, extAskedOptions, extUsedOptions, cusAskedOptions; 
	// Test specified Locale
	Locale = Locale == "" ? undefined : Locale;
	try {
		testDTF = new Intl.DateTimeFormat(Locale);
	}
	catch (e) { 
		alert (e.message + "\nCheck locale and extensions" ); 
		return
	}
	Locale = testDTF.resolvedOptions().locale;	// Locale is no longer empty
	Locale = Locale.includes("-u-") ?  Locale.substring (0,Locale.indexOf("-u-")) : Locale; // Remove Unicode extension
	
	// Add extension
	let unicodeExtension = "-u", extendedLocale = Locale;
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
	
	// Same for ExtDateTimeFormat
	try {
		extAskedOptions = new calendrical.ExtDateTimeFormat (extendedLocale, Options);
		}
	catch (e) {
		alert (e.message + "\nCheck options for ExtDateTimeFormat" ); 
		return
	}
	usedOptions = askedOptions.resolvedOptions();
	extUsedOptions = extAskedOptions.resolvedOptions();
	cusAskedOptions = new calendrical.ExtDateTimeFormat(extendedLocale, Options, calendars[customCalIndex]);
	
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

}

function setCalend() {	// set current custom calend to new value and compute fields
	customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);  // change custom calendar
	targetDate = new calendrical.ExtDate(calendars[customCalIndex], targetDate.valueOf());	// set custom calendar if changed, and set date.
	compLocalePresentationCalendar(); // necessary to recompute formatters
	// setDisplay();
}
function calcCustom() {
	var 
	 day =  Math.round (document.custom.day.value),
	 month = Math.round (document.custom.monthname.value),
	 year =  Math.round (document.custom.year.value),
	 testDate;
	 // HTML controls that day, month and year are numbers
	// customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);	// global variable
	// let testDate = new calendrical.ExtDate (calendars[customCalIndex], year, month, day);
	switch (TZ) {
		case "":  // Set date object from custom calendar date indication, and with time of day of currently displayed date.
			testDate = new calendrical.ExtDate (calendars[customCalIndex], year, month, day, targetDate.getHours(), targetDate.getMinutes(), targetDate.getSeconds(), targetDate.getMilliseconds())
			break;
		case "UTC" : // // Set date object from custom calendar date indication, and with UTC time of day of currently displayed date.
			testDate = new calendrical.ExtDate (calendars[customCalIndex], year, month, day);
			testDate.setUTCFullYear (testDate.getFullYear(), testDate.getMonth(), testDate.getDate()); // Ensure passed value are UTC converted
			testDate.setUTCHours ( targetDate.getUTCHours(), targetDate.getUTCMinutes(), 
							targetDate.getUTCSeconds(), targetDate.getUTCMilliseconds() );
			break;
	}
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		targetDate = new calendrical.ExtDate(calendars[customCalIndex], testDate.valueOf());	// set custom calendar if changed, and set date.
		// setDisplay();
		}
}
function calcWeek() {
	var myFields = {
			weekYear : Math.round (document.week.weekyear.value),
			weekNumber : Math.round (document.week.weeknumber.value),
			weekday : Math.round (document.week.weekday.value)
		},
		testDate = new calendrical.ExtDate(calendars[customCalIndex], targetDate.valueOf());
	customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);	// global variable
	switch (TZ) {
		case "":  // Set date object from custom calendar week date indication, and with time of day of currently displayed date.
			myFields.hours = targetDate.getHours();
			myFields.minutes = targetDate.getMinutes();
			myFields.seconds = targetDate.getSeconds();
			myFields.milliseconds = targetDate.getMilliseconds();
			break;
		case "UTC" : // // Set date object from custom calendar date indication, and with UTC time of day of currently displayed date.
			myFields.hours = targetDate.getUTCHours();
			myFields.minutes = targetDate.getUTCMinutes();
			myFields.seconds = targetDate.getUTCSeconds();
			myFields.milliseconds = targetDate.getUTCMilliseconds();
			break;
	}
	try {
		testDate.setFromWeekFields( myFields, TZ )
	}
	catch (e) {
		alert (e)
		return;
	}
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		targetDate = new calendrical.ExtDate(calendars[customCalIndex], testDate.valueOf());	// set custom calendar if changed, and set date.
		// setDisplay();
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
	let testDate = new Date(targetDate.valueOf());
	testDate.setTime (testDate.getTime() + sign * dayOffset * calendrical.TimeUnits.DAY_UNIT);
	if (isNaN(testDate.valueOf())) { 
		alert ("Out of range");
		// clockRun(0);
		}
	else {
		targetDate.setTime( testDate.valueOf() );
		// setDisplay();
	}
}
function calcTime() { // Here the hours are deemed local hours
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), 
		secs = Math.round (document.time.secs.value), ms = Math.round (document.time.ms.value);
	let testDate = new calendrical.ExtDate (calendars[customCalIndex],targetDate.valueOf());
	switch (TZ) {
		case "" : testDate.setHours(hours, mins, secs, ms); break;
		case "UTC" : testDate.setUTCHours(hours, mins, secs, ms); break;
	}
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		targetDate = new calendrical.ExtDate (calendars[customCalIndex],testDate.valueOf());
		// setDisplay();
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
	let testDate = new Date(targetDate.valueOf());
	testDate.setTime (testDate.getTime() + sign * addedTime); 
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		targetDate.setTime( testDate.valueOf() );
		// setDisplay();
	}
}
function getMode() {
	// Initiate Time zone mode for the "local" time from main display
	TZ = document.TZmode.TZcontrol.value;
	// TZDisplay = TZ == "UTC" ? "UTC" : "";
	/** TZOffset is JS time zone offset in milliseconds (UTC - local time)
	 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
	*/

}
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours specified.
	if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
	let testDate = new Date (targetDate.valueOf());
	testDate.setUTCHours(UTChours, 0, 0, 0);
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		targetDate.setTime (testDate.valueOf());
		// setDisplay();
	}
}
function setDateToNow(){ // Self explanatory
	targetDate = new calendrical.ExtDate(calendars[customCalIndex]); // set new Date object.
	// setDisplay ();
}
/* Events handlers
*/
window.onload = function () {
	// Initial values are taken from forms in page
	[ switchingDate.day, switchingDate.month, switchingDate.year ]
		= [document.gregorianswitch.day.value, +document.gregorianswitch.month.value, document.gregorianswitch.year.value ];	// computed here for 'historic' calendar.
	loadCalendrical.then (() => {
		calendars.push (new calendrical.MilesianCalendar ("milesian",calendrical.pldrDOM));
		calendars.push (new calendrical.GregorianCalendar ("iso_8601"));
		calendars.push (new calendrical.JulianCalendar ("julian"));
		calendars.push (new calendrical.WesternCalendar ("historic", calendrical.ExtDate.fullUTC(switchingDate.year, switchingDate.month, switchingDate.day)));
		calendars.push (new calendrical.FrenchRevCalendar ("frenchrev"));
		customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);  // set initial custom calendar - but calendars must exist !
		getMode();
		compLocalePresentationCalendar();	// set initial formatters to presentation options
		calcTime();		// set time as found on page
		calcCustom();	// set date as found on page
		// setDateToNow();	// this is a variant to those above.
		setDisplay();	// initial display of computed target date and time.
	});

	document.gregorianswitch.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		let 
			day =  Math.round (event.srcElement.elements.day.value),
			month = event.srcElement.elements.month.value,
			year =  Math.round (event.srcElement.elements.year.value),
			testDate = new calendrical.ExtDate (calendars.find(item => item.id == "iso_8601"),calendrical.ExtDate.fullUTC(year, month, day)),
			index = calendars.findIndex (item => item.id == "historic");
		if ( (testDate.valueOf() >= Date.UTC(1582,9,15,0,0,0,0)) && (testDate.day() == day) ) {
			calendars[index] = new calendrical.WesternCalendar("historic", testDate.valueOf());
			[document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ]
				= [ switchingDate.day, switchingDate.month, switchingDate.year ] = [ day, month, year ];
			compLocalePresentationCalendar();	// because we changed one calendar, disseminate change.
			if (calendars[customCalIndex].id == "historic") targetDate = new calendrical.ExtDate (calendars[index], targetDate.valueOf());	
				// sweep former historic calendar out of current data
		}
		else {
			alert ("Invalid switching date to Gregorian calendar: " + day + '/' + month + '/' + year );
			[document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ]
				= [ switchingDate.day, switchingDate.month, switchingDate.year ];	// display former approved switching date.
		} 
		setDisplay();
	})	

	document.custom.addEventListener("submit", function (event) {
		event.preventDefault();
		calcCustom();
		setDisplay()
	})
	document.custom.calend.addEventListener("blur", function (event) {
		event.preventDefault();
		setCalend();
		setDisplay()
	})
	document.week.addEventListener("submit", function (event) {
		event.preventDefault();
		calcWeek();
		setDisplay()
	})
	document.control.addEventListener("submit", function (event) {
		event.preventDefault();
		changeDayOffset()
	})
	document.control.now.addEventListener("click", function (event) {
		setDateToNow();
		setDisplay()
	})
	document.control.minus.addEventListener("click", function (event) {
		setDayOffset(-1);
		setDisplay()
	})
	document.control.plus.addEventListener("click", function (event) {
		setDayOffset(+1);
		setDisplay()
	})
	document.time.addEventListener("submit", function (event) {
		event.preventDefault();
		calcTime();
		setDisplay()
	})
	document.timeShift.addEventListener("submit", function (event) {
		event.preventDefault();
		changeAddTime()
	})
	document.timeShift.minus.addEventListener("click", function (event) {
		addTime(-1);
		setDisplay()
	})
	document.timeShift.plus.addEventListener("click", function (event) {
		addTime(+1);
		setDisplay()
	}) 
	document.TZmode.addEventListener("submit", function (event) {
		event.preventDefault();
		getMode();
		setDisplay()
	})
	document.getElementById("h0").addEventListener("click", function (event) {
		setUTCHoursFixed(0);
		setDisplay()
	})
	document.getElementById("h12").addEventListener("click", function (event) {
		setUTCHoursFixed(12);
		setDisplay()
	})
	document.Locale.addEventListener ("submit", function (event) {
		event.preventDefault();
		compLocalePresentationCalendar();
		setDisplay()
	})
	document.dateOptions.addEventListener ("submit", function (event) {
		event.preventDefault();
		compLocalePresentationCalendar();
		setDisplay();
	})
	document.timeOptions.addEventListener ("submit", function (event) {
		event.preventDefault();
		compLocalePresentationCalendar();
		setDisplay()
	})
}