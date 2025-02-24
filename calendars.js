/** A set of custom (non-Unicode) calendar classes following the customcalendarmodel.js specification.
	* Numeric parameters data shall be integer numbers unless otherwhise specified. No special check is performed. 
	* Passing non numeric values where numbers are expected will yield NaN results.
	* Passing non integer values will yield erroneous results. Please control that figures are integer in your application.
 * @module
 * @version M2025-03-05
 * @requires module:time-units.js
 * @requires module:chronos.js
 * @requires module:extdate.js
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2025
//	Character set is UTF-8
*/
/* Versions:	See Github
*/ 
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2024
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
	1. The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and noninfringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
*/
"use strict";
import {Cbcce, WeekClock} from "./chronos.js";
import Milliseconds from "./time-units.js";
import ExtDate from "./extdate.js";

	/** Generic Milesian calendar, as defined in www.calendriermilesien.org (short English presentation available from the welcome page).
	 * The Milesian calendar reorganises the months of the ISO 8601 year. 
	 * The year begins on Dec. 21 (Dec. 22 before a Gregorian leap year), and months have regular lengths: 30 and 31 days alternatively.
	 * Months have unambiguous notation and names: 1m, 2m, etc. to 12m, said Firstem, Secondem, Thirdem... Twelfthem.
	 * The intercalation day is the last day of the year: 12m 31, which always fall on Dec. 21.
	 * There is no era: years are always algebraic integer numbers.
	 * Since this calendar uses new month names, a private local data repository (PLDR) is necessary in order to display month names.
	 * @class
	 * @param {string} id	- the calendar identifier.
	 * @param {Object} pldr	- a document object, with the specific names for the Milesian calendar (after languages, countries etc.).
	*/
export class MilesianCalendar { 
	constructor (id,pldr) {
		this.id = id;
		this.pldr = pldr;
	}
	/* Basic references for the Milesian calendar
	*/
	canvas = "gregory"
	stringFormat = "fields"	// formatting options for Milesian calendars
	partsFormat = {
		era : {mode : "field"},
		year : {mode : "pldr"},
		month : {mode : "pldr", calname : "milesian"}
	}
	milesianClockwork = new Cbcce ( 
		{ 					//calendarRule object, used with Posix epoch
		timeepoch : -62168083200000, // Unix timestamp of 1 1m 000 00h00 UTC in ms
		coeff : [ 
		  {cyclelength : 12622780800000, ceiling : Infinity, subCycleShift : 0, multiplier : 400, target : "year"},
		  {cyclelength : 3155673600000, ceiling :  3, subCycleShift : 0, multiplier : 100, target : "year"},
		  {cyclelength : 126230400000, ceiling : Infinity, subCycleShift : 0, multiplier : 4, target : "year"},
		  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year"},
		  {cyclelength : 5270400000, ceiling : Infinity, subCycleShift : 0, multiplier : 2, target : "month"},
		  {cyclelength : 2592000000, ceiling : 1, subCycleShift : 0, multiplier : 1, target : "month"}, 
		  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day"},
		  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
		  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
		  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
		  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
		],
		canvas : [ 
			{name : "year", init : 0},
			{name : "month", init : 1},
			{name : "day", init : 1},
			{name : "hours", init : 0},
			{name : "minutes", init : 0},
			{name : "seconds", init : 0},
			{name : "milliseconds", init : 0},
		]
		})	// end of calendarRule
	milesianWeek = new WeekClock (
		{
			originWeekday: 4, 		// Use day part of Posix timestamp, week of day of 1970-01-01 is Thursday
			daysInYear: (year) => (this.inLeapYear( { year : year } ) ? 366 : 365),		// leap year rule for Milesian calendar
			characDayIndex: (year) => ( Math.floor(this.counterFromFields({year : year, month : 1, day : 7})/Milliseconds.DAY_UNIT) ),
			startOfWeek : 0,		// week start with 0 (Sunday).
			characWeekNumber : 0,	// we have a week 0 and the characteristic day for this week is 7 1m.
			dayBase : 0,			// use 0..6 display for weekdays.
			weekBase : 0,			// number of week begins with 0.
			weekLength : 7			// the Milesian week is the 7-days well-known week.
		}
		)
	/*	Field control
	*/
	solveAskedFields (askedFields) {
		var fields = {...askedFields};
		if (fields.year != undefined && fields.fullYear != undefined)
			{ if  (fields.year != fields.fullYear) throw new TypeError ('Unconsistent year and fullYear fields: ' + fields.year + ', ' + fields.fullYear) }
		else { if (fields.year != undefined) { fields.fullYear = fields.year } else if (fields.fullYear != undefined) fields.year = fields.fullYear };
		return fields
	}
	/* Basic conversion methods	
	*/
	fieldsFromCounter (timeStamp) { // year, month, day, from Posix timestamp, UTC
		let fields = this.milesianClockwork.getObject (timeStamp);
		fields.fullYear = fields.year;
		return fields
	}
	counterFromFields (fields) { // Posix timestamp at UTC, from year, month, day and possibly time in Milesian
		let myFields = { year : 0, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, this.solveAskedFields(fields));
		return this.milesianClockwork.getNumber( myFields )
	}
	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (UTC)
		return new construct (this, this.counterFromFields(fields))
	}
	weekFieldsFromCounter (timeStamp) { 			// week coordinates : number of week, weekday, last/this/next year, weeks in weekyear
		//let characDayFields = this.fieldsFromCounter (timeStamp); characDayFields.month = 1; characDayFields.day = 7; 
		let fields = this.milesianClockwork.getObject (timeStamp),
			myFigures = this.milesianWeek.getWeekFigures(Math.floor(timeStamp/Milliseconds.DAY_UNIT), fields.year);
		return {weekYearOffset : myFigures[2], weekYear : fields.year + myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3],
			hours : fields.hours, minutes : fields.minutes, seconds : fields.seconds, milliseconds : fields.milliseconds}
	}
	counterFromWeekFields (fields) { // Posix timestamp at UTC, from weekYear, weekNumber, dayOfWeek and time in Milesian
		let myFields = { weekYear : 0, weekNumber : 0, weekday : 0, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, fields);
		return this.milesianWeek.getNumberFromWeek (myFields.weekYear, myFields.weekNumber, myFields.weekday) * Milliseconds.DAY_UNIT 
			+ myFields.hours * Milliseconds.HOUR_UNIT + myFields.minutes * Milliseconds.MINUTE_UNIT 
			+ myFields.seconds * Milliseconds.SECOND_UNIT + myFields.milliseconds;
	}
	/* Simple properties and method as inspired by Temporal
	*/
	eras = null				// list of code values for eras. No era in Milesian calendar.
	inLeapYear (fields) { 	// is the Milesian year of this date a Milesian leap year.
		return Cbcce.isGregorianLeapYear ( this.solveAskedFields(fields).fullYear + 1 )
	}
}

	/** Generic proleptic Gregorian calendar, with no era. Years are algebraic numbers.
	 * this class is only usefull as long as Temporal is not provided. Used for week-related methods, and for signed full years.
	 * @class
	 * @param {string} id	- the calendar identifier.
	*/
export class ProlepticGregorianCalendar {
	constructor (id) {
		this.id = id;
	}
	eras = null			// no era with the "real" proleptic Gregorian calendar.
	canvas = "gregory"
	stringFormat = "built-in"	// formatting options start from canvas calendars values
	partsFormat = {
		era : { mode : "field" },
		year : { mode : "field" }
	}
	// no clockwork, use standard Date routines
	gregorianWeek = new WeekClock (
		{
			originWeekday : 4,	// 1 Jan. 1970 ISO is Thursday
			daysInYear : (year) => (this.inLeapYear( { year : year } ) ? 366 : 365),
			characDayIndex: (year) => ( Math.floor(this.counterFromFields({fullYear : year, month : 1, day : 4})/Milliseconds.DAY_UNIT) ),
			startOfWeek : 1	// ISO week starts with Monday
			// the rest by default
		}
	) 	// set for gregorian week elements.
	solveAskedFields (askedFields) {
		var fields = {...askedFields};
		if (fields.year != undefined && fields.fullYear != undefined)
			{ if  (fields.year != fields.fullYear) throw new TypeError ('Unconsistent year and fullYear fields: ' + fields.year + ', ' + fields.fullYear) }
		else { if (fields.year != undefined) { fields.fullYear = fields.year } else if (fields.fullYear != undefined) fields.year = fields.fullYear };
		return fields
	}
	fieldsFromCounter (timeStamp) {
		let myDate = new ExtDate ("iso8601", timeStamp),
			myFields = {
				fullYear : myDate.getUTCFullYear(),
				month : myDate.getUTCMonth() + 1,
				day : myDate.getUTCDate(),
				hours : myDate.getUTCHours(),
				minutes : myDate.getUTCMinutes(),
				seconds : myDate.getUTCSeconds(),
				milliseconds : myDate.getUTCMilliseconds()
			};
			myFields.year = myFields.fullYear; 
		return myFields;
	}
	counterFromFields (fields) {
		let myFields = { fullYear : 0, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, this.solveAskedFields(fields));
		let myDate = new ExtDate 
			("iso8601", ExtDate.fullUTC(myFields.fullYear, myFields.month, myFields.day, myFields.hours, myFields.minutes, myFields.seconds, myFields.milliseconds));
		return myDate.valueOf()
	}
	buildDateFromFields (fields, construct = ExtDate) {
		let myFields = { fullYear : 0, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, this.solveAskedFields(fields));
		return new construct (this, this.counterFromFields(fields))
	}
	weekFieldsFromCounter (timeStamp) {
		let myDate = new ExtDate ("iso8601", timeStamp),
			fullYear = myDate.getUTCFullYear(),
			myFigures = this.gregorianWeek.getWeekFigures (Math.floor(myDate.valueOf()/Milliseconds.DAY_UNIT), fullYear);
		return {weekYearOffset : myFigures[2], weekYear : fullYear + myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	counterFromWeekFields (fields) {
		let myFields = { weekYear : 0, weekNumber : 1, weekday : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, fields);
		return this.gregorianWeek.getNumberFromWeek (myFields.weekYear, myFields.weekNumber, myFields.weekday) * Milliseconds.DAY_UNIT 
			+ myFields.hours * Milliseconds.HOUR_UNIT + myFields.minutes * Milliseconds.MINUTE_UNIT 
			+ myFields.seconds * Milliseconds.SECOND_UNIT + myFields.milliseconds;
	}
	inLeapYear (fields) {
		return Cbcce.isGregorianLeapYear ( this.solveAskedFields(fields).fullYear )
	}
}

	/** Generic Julian calendar, with eras (bc/ad). The numbering rules for weeks are those of ISO 8601.
	 * @class
	 * @param {string} id	- the calendar identifier.
	 * @param {Object} pldr	- an optional Document Object, if specific names are used for months, e.g. for the kabyle calendar.
	*/
export class JulianCalendar  {
	constructor (id, pldr) { // specific name, possible pldr for kabyle or so
		this.id = id;
		this.pldr = pldr;
	}
	/* Julian conversion mechanism, using the "shifted" julian calendar : 'year' is full year, an algebraic figure; 
	* the year begins in March, the months are counted from 3 to 14.
	*/
	julianClockwork = new Cbcce ({ 
		timeepoch : -62162208000000, // 1 March of year 0, Julian calendar, relative to Posix epoch
		coeff : [
			{cyclelength : 126230400000, ceiling : Infinity, subCycleShift : 0, multiplier : 4, target : "fullYear"}, // Olympiade
			{cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "fullYear"}, // One 365-days year
			{cyclelength : 13219200000, ceiling : Infinity, subCycleShift : 0, multiplier : 5, target : "month"}, // Five-months cycle
			{cyclelength : 5270400000, ceiling : Infinity, subCycleShift : 0, multiplier : 2, target : "month"}, // 61-days bimester
			{cyclelength : 2678400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // 31-days month
			{cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day"}, // Date in month
			{cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
			{cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
			{cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
			{cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
		],
		canvas : [ 
			{name : "fullYear", init : 0},
			{name : "month", init : 3}, // The shifted year begins with month number 3 (March) and finishes with month 14 (February of next tradional year).
			{name : "day", init : 1},
			{name : "hours", init : 0},
			{name : "minutes", init : 0},
			{name : "seconds", init : 0},
			{name : "milliseconds", init : 0},
		]	
		}) // end of calendarRule
	julianWeek = new WeekClock (
		{	// ISO 8601 rule applied to Julian calendar
			originWeekday: 4, 		// Use day part of Posix timestamp, week of day of ISO 1970-01-01 is Thursday
			daysInYear: (year) => (this.inLeapYear( { fullYear : year } ) ? 366 : 365),		// leap year rule for this calendar
			characDayIndex: (year) => ( Math.floor(this.counterFromFields({fullYear : year, month : 1, day : 4})/Milliseconds.DAY_UNIT) ),
			startOfWeek : 1,		// week start with 1 (Monday)
			characWeekNumber : 1,	// we have a week 1 and the characteristic day for this week is 4 January.
			dayBase : 1,			// use 1..7 display for weekday
			weekBase : 1,			// number of week begins with 1
			weekLength : 7			
		}
	)
	/** Era codes: "bc" for backwards counted years before year 1, "ad" (Anno Domini) for years counted after Dionysius' specification.
	*/
	eras = ["bc", "ad"]	// may be given other codes, the codes are purely external, only indexes are used
	canvas = "gregory"
	stringFormat = "fields"	// prepare string parts based on value of fields, but using the set of value of the canvas calendar.
	partsFormat = null	// format each part exactly as if it were a canvas calendar date
	shiftYearStart (dateFields, shift, base) { // Shift start of fullYear to March, or back to January, for calendrical calculations
		let shiftedFields = {...dateFields};
		[ shiftedFields.fullYear, shiftedFields.month ] = Cbcce.shiftCycle (dateFields.fullYear, dateFields.month, 12, shift, base ); //+ dateEnvironment.monthBase);
		return shiftedFields
	}
	fields (theFields) {	// List of fields. add "era" if "year" is present and "era" is not.
		let myFields = [...theFields];	// a brand new Array
		if (myFields.indexOf ("year") >= 0 && myFields.indexOf("era") == -1) myFields.unshift("era");
		return myFields;
	}
	solveAskedFields (askedFields) {
		var fields = {...askedFields};
		if (fields.era != undefined) {
			// compute value from deemed existing fields, throw if NaN
			if (fields.year <= 0) throw new RangeError ('If era is defined, year shall be > 0: ' + fields.year);
			let fullYear = fields.era == this.eras [0] ? 1 - fields.year : fields.year;
			if (fields.fullYear == undefined) { fields.fullYear = fullYear }
				else if (fields.fullYear != fullYear) 
					throw new RangeError ('Existing fullYear field inconsistent with era and year:' + fields.era + ', ' + fields.year + ', ' + fields.fullYear);
			}
		else {
			if (fields.year != undefined && fields.fullYear != undefined)
				{ if  (fields.year != fields.fullYear) throw new TypeError ('Unconsistent year and fullYear fields: ' + fields.year + ', ' + fields.fullYear) }
			else { if (fields.year != undefined) { fields.fullYear = fields.year } else if (fields.fullYear != undefined) fields.year = fields.fullYear }
		}
		return fields;
	}
	fieldsFromCounter (timeStamp) {		// from a date, give the compound object of the calendar, unshifted to date in January
		let myFields = this.shiftYearStart(this.julianClockwork.getObject(timeStamp),-2,3);
		if (myFields.fullYear < 1) {
			myFields.year = 1 - myFields.fullYear;
			myFields.era = this.eras[0];
		} else {
			myFields.year = myFields.fullYear;
			myFields.era = this.eras[1];
		}
		return myFields
	}
	counterFromFields(fields) {			// from the set of date fields, give time stamp. If no era specified, negative year is authorised
		var myFields = { fullYear : 0, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, this.solveAskedFields(fields));
		switch (fields.era) {
			case undefined: break;// year without era is fullYear
			case this.eras[0]: case this.eras[1]: 
				if (fields.year < 1) throw new RangeError ("If era is specified, year shall be stricly positive: " + fields.year); 
				break;
			default : throw new RangeError ("Invalid era value: " + fields.era); break;
		}
		return this.julianClockwork.getNumber(this.shiftYearStart(myFields,2,1));
	}
	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (deemed UTC)
		return new construct (this, this.counterFromFields(fields))
	}
	weekFieldsFromCounter (timeStamp) {	// week fields, from a timestamp deemed UTC
		let	year = this.fieldsFromCounter (timeStamp).fullYear,
			myFigures = this.julianWeek.getWeekFigures (Math.floor(timeStamp/Milliseconds.DAY_UNIT), year);
		return {weekYearOffset : myFigures[2], weekYear : year + myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	counterFromWeekFields (fields) { // Posix timestamp at UTC, from year, weekNumber, dayOfWeek and time
		let myFields = { weekYear : 0, weekNumber : 1, weekday : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, fields);
		return this.julianWeek.getNumberFromWeek (myFields.weekYear, myFields.weekNumber, myFields.weekday) * Milliseconds.DAY_UNIT 
			+ myFields.hours * Milliseconds.HOUR_UNIT + myFields.minutes * Milliseconds.MINUTE_UNIT 
			+ myFields.seconds * Milliseconds.SECOND_UNIT + myFields.milliseconds;
	}
	/* properties and other methods
	*/
	inLeapYear (fields) { // 
		return Cbcce.isJulianLeapYear(this.solveAskedFields(fields).fullYear)
	}
} // end of calendar class

	/** Generic non-proleptic Gregorian calendar, with a date of switchover to the Gregorian reckoning system as parameter.
	 * @class
	 * @param {string} id	- the calendar identifier.
	 * @param {number|string} switchingDate	- first date where Gregorien calendar was used; switchingDate may be an ISO string or a Posix timestamp.
	 * @param {document} pldr	- the private locale data registry that holds the era names.
	*/
export class GregorianCalendar {
	constructor (id, switchingDate, pldr) {
		this.id = id;
		this.pldr = pldr;
		this.switchingDate = new Date(switchingDate);	// first date where Gregorien calendar is used. switchingDate may be an ISO string
		this.switchingDate.setUTCHours (0,0,0,0);		// set to 00:00 UTC at switching date
		if (this.switchingDate.valueOf() < Date.parse ("1582-10-15T00:00:00Z")) 
			throw new RangeError ("Switching date to Gregorian shall be not earlier than 1582-10-15: " + this.switchingDate.toISOString());
	}
	/** Era codes: "bc" for backwards counted years before year 1, 
	* "os" (Old Style) for years since Dionysius era in Julian reckoning system, 
	* "ns" (New Style) for years in Gregorian reckoning system.
	*/
	eras = ["bc", "os", "ns"]	// define before partsFormat in order to refer to it.
	canvas = "gregory"
	stringFormat = "fields"	// formatting options differ from base calendars'.
	partsFormat = {	era : { mode : "pldr", calname : "gregory" }	}
	firstSwitchDate = new Date ("1582-10-15T00:00:00Z") // First date of switchover from Old Style (Julian reckoning) to New Style (Gregorian reckoning) era
	julianCalendar = new JulianCalendar (this.id) 
	prolepticGregorianCalendar = new ProlepticGregorianCalendar (this.id)
	solveAskedFields (askedFields) {
		var fields = {...askedFields};
		if (fields.era != undefined) {
			// compute value from deemed existing fields, throw if NaN
			if (fields.year <= 0) throw new RangeError ('If era is defined, year shall be > 0: ' + fields.year);
			let fullYear = fields.era == this.eras [0] ? 1 - fields.year : fields.year;
			if (fields.fullYear == undefined) { fields.fullYear = fullYear }
				else if (fields.fullYear != fullYear) 
					throw new RangeError ('Existing fullYear field inconsistent with era and year:' + fields.era + ', ' + fields.year + ', ' + fields.fullYear);
			}
		else {	// era is undefined -> leave it that way
			if (fields.year != undefined && fields.fullYear != undefined)
				{ if  (fields.year != fields.fullYear) throw new TypeError ('Unconsistent year and fullYear fields: ' + fields.year + ', ' + fields.fullYear) }
			else { if (fields.year != undefined) { fields.fullYear = fields.year } else if (fields.fullYear != undefined) fields.year = fields.fullYear }
		}
		return fields;
	}
	fieldsFromCounter (number) {
		if (number < this.switchingDate.valueOf())	{	// Julian calendar
			var myFields = this.julianCalendar.fieldsFromCounter(number);
			myFields.era = this.eras[this.julianCalendar.eras.indexOf(myFields.era)];
		}
		else {
			let myDate = new Date (number);
			var myFields = this.prolepticGregorianCalendar.fieldsFromCounter(number);
			myFields.era = this.eras[2];
		}
		return myFields
	}
	counterFromFields(askedFields) { // given fields may be out of scope
		var testDate, fields = { fullYear : 0, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		fields = Object.assign (fields, this.solveAskedFields(askedFields));
		switch (fields.era) {
			case this.julianCalendar.eras[1] :		// "A.D." weak indication, just year shall not be < 1, but similar to no indication at all
				if (fields.year < 1) throw new RangeError ("If era is specified, year shall be stricly positive: " + fields.year);
			case undefined: // here we have to guess. Oberve that year may be negative (astronomer's notation)
				testDate = new Date (ExtDate.fullUTC(fields.year, fields.month, fields.day, fields.hours, fields.minutes, fields.seconds, fields.milliseconds));
				if (testDate.valueOf() < this.switchingDate.valueOf())	// deemed Julian
					return this.julianCalendar.counterFromFields(fields);
				else return testDate.valueOf();
			case this.eras[0]: case this.eras[1]:	// Julian calendar, year field must be >=1
				if (fields.year < 1) throw new RangeError ("If era is specified, year shall be stricly positive: " + fields.year);
				fields.era = this.julianCalendar.eras[this.eras.indexOf(fields.era)] // set julianCalendar era code instead of this.
				return this.julianCalendar.counterFromFields(fields);
			case this.eras[2]:				// Specified as New Style (Gregorian), but cannot be before 1582-10-15
				if (fields.year < 1) throw new RangeError ("Era specified as Gregorian, year shall be stricly positive: " + fields.year);
				testDate = new Date (ExtDate.fullUTC(fields.year, fields.month, fields.day, fields.hours, fields.minutes, fields.seconds, fields.milliseconds));
				if (testDate.valueOf() < this.firstSwitchDate) throw new RangeError ("Gregorian era cannot match such date: " + testDate.toISOString());
				return testDate.valueOf();
			default : throw new RangeError ("Invalid era: " + fields.era);
		}
		
	}
	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (deemed UTC)
		return new construct (this, this.counterFromFields(fields))
	}
	weekFieldsFromCounter (timeStamp) {
		if (timeStamp < this.switchingDate.valueOf()) 
			return this.julianCalendar.weekFieldsFromCounter (timeStamp)
			else return this.prolepticGregorianCalendar.weekFieldsFromCounter (timeStamp);
	}
	counterFromWeekFields (fields) {
		let result = this.prolepticGregorianCalendar.counterFromWeekFields (fields);
		if (result < this.switchingDate.valueOf()) result = this.julianCalendar.counterFromWeekFields (fields);
		return result;
	}
	inLeapYear (fields) { 
		if (this.counterFromFields(fields) < this.switchingDate.valueOf()) return this.julianCalendar.inLeapYear(fields)
		else return this.prolepticGregorianCalendar.inLeapYear (fields)
	}
} // end of calendar class

	/** Generic French revolution calendar. This calendar was defined and enforced in France in 1993, and cancelled in Januray 1806. 
	 * Strictly speaking, it is not an algorithmic calendar. The new year is supposed to fall on the autumnal equinox as observed in Paris.
	 * This algorithmic implementation is based on a 128-year cycle comprising 31 leap years. 
	 * A leap years occur most often 4 years after the last one, and sometimes 5 years after.
	 * This algorithm gives exact results for the period 1992-1806, and also for 1870 where the calendar was briefly enforced under the Commune de Paris.
	 * Only one new year does not match the initial definition during the first 128-years cycle: 
	 * the equinox occurred at 23:44 on the 6 ss day of 81 Ere des Français, 82 should have been a sextile year instead of 81.
	 * A PLDR is necessary to display this calendar's date expression, however names are given in comments, as a simple implementation is also possible.
	 * @class
	 * @param {string} id	- the calendar identifier.
	 * @param {Object} pldr	- a Document Object, with the specific names for the French revolution calendar in several languages, for several countries etc.
	*/
export class FrenchRevCalendar {
	constructor (id, pldr) {
		this.id = id;
		this.pldr = pldr;
	}
	/* Basic references
	*/
	canvas = "gregory"
	stringFormat = "fields"
	/* 
	dayNames = ["primidi","duodi", "tridi", "quartidi", "quintidi", "sextidi", "septidi", "octidi", "nonidi", "décadi",
		"jour de la Vertu", "jour du Génie", "jour du Travail", "jour de l'Opinion", "jour des Récompenses", "jour de la Révolution"]
	monthNames = ["vendémiaire", "brumaire", "frimaire", "nivôse", "pluviôse", "ventôse", "germinal", "floréal", "prairial", "messidor", "thermidor", "fructidor","sans-culottides"]
	eraNames = ["ère des Français"]
	*/
	/** One era code, "ef" for "ère des Français"
	*/
	eras = ["ef"]	// list of code values for eras; one single era here, "ef" for "ère des Français"
	partsFormat = {
		// weekday: {mode : "list", source : this.dayNames}
		weekday : { mode : "pldr", 
					calname : "frenchrev",
					key : i => i },
		month : { mode : "pldr", calname : "frenchrev" },		// {mode : "list", source : this.monthNames},
		year : {mode : "field" },
		// era : {mode : "list", codes : this.eras, source : this.eraNames} 
		era : { mode : "pldr", calname : "frenchrev" }
	}
	frenchClockWork = new Cbcce ({ // To be used with a Unix timestamp in ms. Decompose into years, months, day, hours, minutes, seconds, ms
		timeepoch : -6004454400000, // Unix timestamp of 3 10m 1779 00h00 UTC in ms, the origin for the algorithm
		coeff : [ 
		  {cyclelength : 4039286400000, ceiling : Infinity, subCycleShift : 0, multiplier : 128, target : "year"}, // 128 (julian) years minus 1 day.
		  {cyclelength : 1041379200000, ceiling : 3, subCycleShift : -1, multiplier : 33, target : "year", notify : "inShortOctoCycle"}, // 33 years cycle. Last franciade is 5 years.
			// The 33-years cycle contains 7 4-years franciades, and one 5-years. 
			// subCycleShift set to -1 means: if the 33-years is the last one of the 128-years cycle, i.e. number 3 starting from 0,
			// then it turns into a 7 franciades cycle, the first 6 being 4-years, the 7th (instead of the 8th) is 5-years.
		  {cyclelength : 126230400000, ceiling : 7, subCycleShift : +1, multiplier : 4, target : "year", notify : "inLongFranciade"}, 	//The ordinary "Franciade" (4 years)
			// Same principle as above: if franciade is the last one (#7 or #6 starting form #0) of upper cycle, then it is 5 years long instead of 4 years.
		  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year", notify : "inSextileYear"},	//The ordinary year within the franciade
		  {cyclelength : 2592000000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, 
		  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day"},
		  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
		  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
		  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
		  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
		],
		canvas : [ 
			{name : "year", init : -12},
			{name : "month", init : 1},
			{name : "day", init : 1},
			{name : "hours", init : 0},
			{name : "minutes", init : 0},
			{name : "seconds", init : 0},
			{name : "milliseconds", init : 0}
			]
		})
	decade = new WeekClock (
		{ 
			originWeekday: 1, 		// Use day part of Posix timestamp, week of day of 1970-01-01 is Primidi (11 Nivôse 178)
			daysInYear: (year) => (this.inLeapYear({ year : year, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 }) ? 366 : 365),
								// leap year rule for this calendar
			characDayIndex: (year) => ( Math.floor(this.counterFromFields({year : year, month : 1, day : 1})/Milliseconds.DAY_UNIT) ),
			startOfWeek : 1,		// week is decade, start with 1 (Primidi)
			characWeekNumber : 1,	// we have a decade 1 and the characteristic day for this first decade is 1 Vendémiaire.
			dayBase : 1,			// use 1..10 display for decade days
			weekBase : 1,			// number of decade begins with 1
			weekLength : 10,			// The length of week (decade) is 10 within a year.
			weekReset : true,		// decade cycle is reset to startOfWeek at at the beginning of each year
			uncappedWeeks : [36]	// sans-culottides days are assigned to last decade.
		}
	)
	solveAskedFields (askedFields) {
		var fields = {...askedFields};
		if (fields.year != undefined && fields.fullYear != undefined)
			{ if  (fields.year != fields.fullYear) throw new TypeError ('Unconsistent year and fullYear fields: ' + fields.year + ', ' + fields.fullYear) }
		else { if (fields.year != undefined) { fields.fullYear = fields.year } else if (fields.fullYear != undefined) fields.year = fields.fullYear };
		return fields
	}
	counterFromFields (fields) {
		let myFields = { year : 0, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, this.solveAskedFields(fields));
		return this.frenchClockWork.getNumber (myFields)
	}
	fieldsFromCounter (timeStamp) {
		let fields = this.frenchClockWork.getObject (timeStamp);
		fields.fullYear = fields.year; fields.era = this.eras[0];
		return fields
	}
	weekFieldsFromCounter (timeStamp) {	// week fields, from a timestamp deemed UTC
		let year = this.frenchClockWork.getObject (timeStamp).year,
			myFigures = this.decade.getWeekFigures (Math.floor(timeStamp/Milliseconds.DAY_UNIT), year);
		return {weekYearOffset : myFigures[2], weekYear : year + myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	counterFromWeekFields (fields) { // Posix timestamp at UTC, from year, weekNumber, dayOfWeek and time
		let myFields = { weekYear : 0, weekNumber : 1, weekday : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, fields);
		return this.decade.getNumberFromWeek (myFields.weekYear, myFields.weekNumber, myFields.weekday) * Milliseconds.DAY_UNIT 
			+ myFields.hours * Milliseconds.HOUR_UNIT + myFields.minutes * Milliseconds.MINUTE_UNIT 
			+ myFields.seconds * Milliseconds.SECOND_UNIT + myFields.milliseconds;
	}
	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (UTC)
		return new construct (this, this.counterFromFields(fields))
	}
	inLeapYear (fields) {
		let myFields = this.solveAskedFields(fields);
		if (myFields.inSextileYear == undefined) myFields = this.fieldsFromCounter (this.counterFromFields (myFields));
		return myFields.inSextileYear
	}
	valid (fields) {	// enforced at date expressed by those fields
		let counter = this.counterFromFields (fields);
		return counter >= -5594227200000 && counter < -5175360000000
	}
}

	/** Generic algorithmic Persian calendar, as recommended by Mohammad Heydari-Malayeri and used by Unicode
	 * The main point: the intercalation rule is based on a 33 years cycle where 8 years are long.
	 * This implementation uses the integral postfix intercalation principle, 
	 * hence the technical epoch of the calendar is set to the beginning of year -10 A.P.
	 * the computation of the day and month figures are done separately.
	 * There is only one era, coded 'ap'.
	 * Month names of CLDR are used.
	 * @class
	 * @param {string} id	- the calendar identifier.
	*/
export class Persian33Calendar { 
	constructor (id) {
		this.id = id;
	}
	/* Basic references
	*/
	canvas = "persian"
	eras = ["ap"]
	stringFormat = "built-in"	// This calendar is exactly the same as "persian" of Unicode.

	persian33Clockwork = new Cbcce ( 
		{ 					//calendarRule object, used with Posix epoch
		timeepoch : -42879024000000, // Unix timestamp of 1 Farvardin -10 (1 4m 611) 00h00 UTC in ms
		coeff : [ 
		  {cyclelength : 1041379200000, ceiling : Infinity, subCycleShift : 0, multiplier : 33, target : "year"},	// The main 33-years cycle.
		  {cyclelength : 126230400000, ceiling : 7, subCycleShift : +1, multiplier : 4, target : "year"},			// The cycle. If last of upper cycle, add one year.
		  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year", notify : "inLongYear"},	// The year, grouped by 4 (3+1).
		  {cyclelength : 16070400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "semester"},	// First semester of 6 x 31 month.
		  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "semday"},
		  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
		  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
		  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
		  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
		],
		canvas : [ 
			{name : "year", init : -10},
			{name : "semester", init : 0},
			{name : "semday", init : 0},
			{name : "hours", init : 0},
			{name : "minutes", init : 0},
			{name : "seconds", init : 0},
			{name : "milliseconds", init : 0},
		]
		})	// end of calendarRule
	persianWeek = new WeekClock (
		{
			originWeekday: 4, 		// Use day part of Posix timestamp, week of day of 1970-01-01 is Thursday
			daysInYear: (year) => (this.inLeapYear({ year : year, month : 1, day : 1, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 }) ? 366 : 365),
								// leap year rule for this calendar
			characDayIndex: (year) => ( Math.floor(this.counterFromFields({year : year, month : 1, day : 4})/Milliseconds.DAY_UNIT) ),
			startOfWeek : 7		// week start with Sunday
			// The rest by default
		}
		)
	/*	Field control
	*/
	solveAskedFields (askedFields) {
		var fields = {...askedFields};
		if (fields.year != undefined && fields.fullYear != undefined)
			{ if  (fields.year != fields.fullYear) throw new TypeError ('Unconsistent year and fullYear fields: ' + fields.year + ', ' + fields.fullYear) }
		else { if (fields.year != undefined) { fields.fullYear = fields.year } else if (fields.fullYear != undefined) fields.year = fields.fullYear };
		if (fields.month != undefined) {
			fields.semester = Math.floor((fields.month - 1)/6);
			if (fields.day != undefined) fields.semday = (fields.month < 7 ? (fields.month-1) * 31 : (fields.month-7) * 30) + fields.day - 1;
		} else [fields.semester, fields.semday] = [undefined, undefined];
		return fields
	}
	/* Basic conversion methods	
	*/
	fieldsFromCounter (timeStamp) { // year, month, day, from Posix timestamp, UTC
		let fields = this.persian33Clockwork.getObject (timeStamp);
		fields.fullYear = fields.year;
		// Computation of month and day in month
		[fields.month, fields.day] = Cbcce.divmod (fields.semday, 31 - fields.semester);
		[fields.month, fields.day] = [fields.month + 1 + 6*fields.semester, fields.day+1];
		return fields
	}
	counterFromFields (fields) { // Posix timestamp at UTC, from year, month, day and possibly time
		let myFields = { hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, this.solveAskedFields(fields));	// Here semester and day in semester are computed
		return this.persian33Clockwork.getNumber( myFields )
	}
	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (UTC)
		return new construct (this, this.counterFromFields(fields))
	}
	weekFieldsFromCounter (timeStamp) { 			// week coordinates : number of week, weekday, last/this/next year, weeks in weekyear
		//let characDayFields = this.fieldsFromCounter (timeStamp); characDayFields.month = 1; characDayFields.day = 7; 
		let fields = this.persian33Clockwork.getObject (timeStamp),
			myFigures = this.persianWeek.getWeekFigures(Math.floor(timeStamp/Milliseconds.DAY_UNIT), fields.year);
		return {weekYearOffset : myFigures[2], weekYear : fields.year + myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3],
			hours : fields.hours, minutes : fields.minutes, seconds : fields.seconds, milliseconds : fields.milliseconds}
	}
	counterFromWeekFields (fields) { // Posix timestamp at UTC, from weekYear, weekNumber, dayOfWeek and time
		let myFields = { weekYear : 0, weekNumber : 0, weekday : 0, hours : 0, minutes : 0, seconds : 0, milliseconds : 0 };
		myFields = Object.assign (myFields, fields);
		return this.persianWeek.getNumberFromWeek (myFields.weekYear, myFields.weekNumber, myFields.weekday) * Milliseconds.DAY_UNIT 
			+ myFields.hours * Milliseconds.HOUR_UNIT + myFields.minutes * Milliseconds.MINUTE_UNIT 
			+ myFields.seconds * Milliseconds.SECOND_UNIT + myFields.milliseconds;
	}
	/* Simple properties and method as inspired by Temporal
	*/
	inLeapYear (fields) { 	// is this year a long year.
		let myFields = this.solveAskedFields(fields);
		if (myFields.inLongYear == undefined) myFields = this.fieldsFromCounter (this.counterFromFields (myFields));
		return myFields.inLongYear
	}
}
