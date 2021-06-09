/* A set of calendars using Chronos, JulianDayIso and ExtDate.
	Character set is UTF-8
	Customise calendar with an extended Date object and an extended Intl.DateTimeFormat object.
Contents: 
	Classes and instances to define calendars
*/
/* General note
	Parameters data shall be integer numbers unless otherwhise specified. No special check is performed. 
	Passing non numeric value will yield NaN results.
	Paasing non integer values will yield erroneous results. Please control that figures are integer in your application.
*/
/* Versions:	M2021-06-19 wipe dead code away (Error objects...)
	M2021-06-13	Errors are defined on throw, not as specific objects; most type check are suppressed
	M2021-01-12 Use modules
	M2021-01-09 
		eras and decade for the French Rev. calendar
		separate class from instances
	M2021-01-06 adapt to new chronos.js
	M2020-12-29 no module, no myEthiopic, add Julian Day
	M2020-12-10 import all names export from other files, as a main entry point.
	M2020-12-08 use import from JS modules
	M2020-11-23 - Collect all calendars in a single file
	M2020-11-21	Enhance with DateExtended
	M2020-11-12	Adapt to week handler	Source: since 2017
	M2020-10-22 construct using class Chronos
	M2020-11-10 use Chronos week computations
*/ 
/* Required
	Package Chronos -> the general calendar computation engine.
	ExtDate
*/
/* Copyright Miletus 2016-2021 - Louis A. de FOUQUIERES
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
Inquiries: www.calendriermilesien.org
*/
"use strict";
import {Milliseconds, Chronos, WeekClock} from "./chronos.js";
import {ExtDate, ExtDateTimeFormat} from "./dateextended.js";

/* export */ class isoWeek {	// only to compute ISO week figures with a date in Posix timestamp (UTC)
	constructor () {}
	static isoWeekClock = new WeekClock ({	// Display ISO week figures
			originWeekday : 4,	// 1 Jan. 1970 ISO is Thursday
			daysInYear : (year) => (Chronos.isGregorianLeapYear ( year ) ? 366 : 365),
			startOfWeek : 1
			// the rest of by default
		}) 	// set for gregorian week elements.
	static weekFieldsFromCounter (myDate,TZ) {
		// let myDate = new Date (timeStamp),
		let
			dayFields = new ExtDate ("iso8601", myDate.valueOf()).getFields (TZ),
			dateStamp = ExtDate.fullUTC (dayFields.year, dayFields.month, dayFields.day) / Milliseconds.DAY_UNIT,
			refStamp = ExtDate.fullUTC (dayFields.year, 1, 4) / Milliseconds.DAY_UNIT,
			myFigures = isoWeek.isoWeekClock.getWeekFigures (dateStamp, refStamp, dayFields.year);
		return {weekYearOffset : myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
}
/* export */ class MilesianCalendar { 
	/** Define a specific Milesian calendar
	 * @param (string) name : the name used with .toCalString method of ExtDate
	 * @param (string) id: a built-in calendar for ExtDateTimeFormat. Must be in the list of existing built-in.
	 * @param (Object) pldr: a DOM object, with the specific names for the Milesian calendar (in languages and countries e.g. etc.)
	*/
	constructor (id,pldr) {
		this.id = id;
		this.pldr = pldr;
	}
	/* Basic references for the Milesian calendar
	*/
	canvas = "iso8601"
	stringFormat = "fields"	// formatting options for Milesian calendars
	partsFormat = {
		era : {mode : "field"},
		year : {mode : "pldr"},
		month : {mode : "pldr"}
	}
	milesianClockwork = new Chronos ( 
		{ 					//calendRule object, used with Posix epoch
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
		})	// end of calendRule
	milesianWeek = new WeekClock (
		{
			originWeekday: 4, 		// Use day part of Posix timestamp, week of day of 1970-01-01 is Thursday
			daysInYear: (year) => (Chronos.isGregorianLeapYear( year + 1 ) ? 366 : 365),		// leap year rule for Milesian calendar
			startOfWeek : 0,		// week start with 0
			characWeekNumber : 0,	// we have a week 0 and the characteristic day for this week is 7 1m.
			dayBase : 0,			// use 0..6 display for weekday
			weekBase : 0,			// number of week begins with 0
			weekLength : 7			// the Milesian week is the 7-days well-known week
		}
		)
	/* Basic conversion methods	
	*/
	fieldsFromCounter (timeStamp) { // year, month, day, from Posix timestamp, UTC
		// let TZOffset = TZ == "UTC" ? 0 : new ExtDate("iso8601",timeStamp).getRealTZmsOffset(); // decide not to use TZ here
		let fields = this.milesianClockwork.getObject (timeStamp);
		fields.fullYear = fields.year;
		return fields
	}
	counterFromFields (fields) { // Posix timestamp at UTC, from year, month, day in Milesian
		return this.milesianClockwork.getNumber( fields )
	}
	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (UTC)
		// let timeStamp = this.counterFromFields (fields, TZ);
		return new construct (this, this.counterFromFields(fields))
	}
	weekFieldsFromCounter (timeStamp) { 			// week coordinates : number of week, weekday, last/this/next year, weeks in weekyear
		let characDayFields = this.fieldsFromCounter (timeStamp);
		characDayFields.month = 1; characDayFields.day = 7;
		let myFigures = this.milesianWeek.getWeekFigures
			(Math.floor(timeStamp/Milliseconds.DAY_UNIT), Math.floor(this.counterFromFields(characDayFields)/Milliseconds.DAY_UNIT), characDayFields.year);
		return {weekYearOffset : myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	/* Simple properties and method as inspired by Temporal
	*/
	eras = null				// list of code values for eras. No era in Milesian calendar.
	fullYear (fields) {	// year expressed in full, that is as a relative number (no era). Here, it is the same.
		return fields.year
	}
	inLeapYear (fields) { 	// is the Milesian year of this date a Milesian leap year.
		return Chronos.isGregorianLeapYear ( this.fullYear(fields) + 1 )
	}
}
/* export */ class JulianCalendar  {
	constructor (id, pldr) { // specific name, possible pldr for kabyle or so
		this.id = id;
		this.pldr = pldr;
	}
	/* Julian conversion mechanism, using the "shifted" julian calendar : year is full Year, a relative number; year begin in March, months counted from 3 to 14
	*/
	canvas = "gregory"
	julianClockwork = new Chronos ({ 
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
			{name : "month", init : 3}, // Shifted year begins with month number 3 (March) and goes to month 14 (February of next tradional year)
			{name : "day", init : 1},
			{name : "hours", init : 0},
			{name : "minutes", init : 0},
			{name : "seconds", init : 0},
			{name : "milliseconds", init : 0},
		]	
		}) // end of calendRule
	julianWeek = new WeekClock (
		{	// ISO8601 rule applied to Julian calendar
			originWeekday: 4, 		// Use day part of Posix timestamp, week of day of 1970-01-01 is Thursday
			daysInYear: (year) => (Chronos.isJulianLeapYear( year ) ? 366 : 365),		// leap year rule for this calendar
			startOfWeek : 1,		// week start with 1 (Monday)
			characWeekNumber : 1,	// we have a week 1 and the characteristic day for this week is 4 January.
			dayBase : 1,			// use 1..7 display for weekday
			weekBase : 1,			// number of week begins with 1
			weekLength : 7			
		}
	)
	/* Basic erros, data and conversion methods
	*/
	eras = ["BC", "AD"]	// may be given other codes, the codes are purely external, only indexes are used
	partsFormat = null	// no special instruction
	stringFormat = "fields"	// formatting options differ from base calendars
	canvas = "gregory"
	shiftYearStart (dateFields, shift, base) { // Shift start of fullYear to March, or back to January, for calendrical calculations
		let shiftedFields = {...dateFields};
		[ shiftedFields.fullYear, shiftedFields.month ] = Chronos.shiftCycle (dateFields.fullYear, dateFields.month, 12, shift, base ); //+ dateEnvironment.monthBase);
		return shiftedFields
	}
	fields (theFields) {	// List of fields. add "era" if "year" is present and "era" is not.
		let myFields = [...theFields];	// a brand new Array
		if (myFields.indexOf ("year") >= 0 && myFields.indexOf("era") == -1) myFields.unshift("era");
		return myFields;
	}
	fieldsFromCounter (timeStamp) {		// from a date, give the compound object of the calendar, unshifted to date in January
		let myFields = this.shiftYearStart(this.julianClockwork.getObject(timeStamp),-2,3);
		if (myFields.fullYear < 1) {
			myFields.year = 1 - myFields.fullYear;
			myFields.era = this.eras[0];
		} else {
			myFields.era = this.eras[1];
			myFields.year = myFields.fullYear;
		}
		return myFields
	}
	counterFromFields(fields) {			// from the set of date fields, give time stamp. If no era specified, negative year is authorised
		let myFields = {...fields};
		myFields.fullYear = this.fullYear (fields);
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
		let timeStamp = this.setCounterFromFields (fields);
		return new construct (this, timeStamp)
	}
	weekFieldsFromCounter (timeStamp) {	// week fields, from a timestamp deemed UTC
		let characDayFields = this.fieldsFromCounter (timeStamp);
		characDayFields.month = 1; characDayFields.day = 4;	// 4 of January always in week 1
		let myFigures = this.julianWeek.getWeekFigures
			(Math.floor(timeStamp/Milliseconds.DAY_UNIT), Math.floor(this.counterFromFields(characDayFields)/Milliseconds.DAY_UNIT), characDayFields.year);
		return {weekYearOffset : myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	/* properties and other methods
	*/
	fullYear (fields) {				// switch to full year (possibly negative)
		if (fields.era == undefined) return fields.year
		else return fields.era == this.eras[0] ? 1 - fields.year : fields.year
	}
	inLeapYear (fields) { // 
		return Chronos.isJulianLeapYear(this.fullYear(fields))
	}
} // end of calendar class
/* export */ class WesternCalendar { // Framework for calendars of European countries, first Julian calendar, then switching to Gregorian at a specified date.
	constructor (id, switchingDate) {
		this.id = id;
		this.switchingDate = new Date(switchingDate);	// first date where Gregorien calendar is used. switchingDate may be an ISO string
		this.switchingDate.setUTCHours (0,0,0,0);		// set to Oh UTC at switching date
		if (this.switchingDate.valueOf() < Date.parse ("1582-10-15T00:00:00Z")) 
			throw new RangeError ("Switching date to Gregorian shall be not earlier than 1582-10-15: " + this.switchinDate.toISOString());
	}
	/** Base properties and methods
	 
	*/
	canvas = "gregory"
	firstSwitchDate = new Date ("1582-10-15T00:00:00Z") // First date of A.S. or N.S. era
	julianCalendar = new JulianCalendar (this.name,this.id); 
	gregorianWeek = new WeekClock (
		{
			originWeekday : 4,	// 1 Jan. 1970 ISO is Thursday
			daysInYear : (year) => (Chronos.isGregorianLeapYear ( year ) ? 366 : 365),
			startOfWeek : 1
			// the rest of by default
		}
		); 	// set for gregorian week elements.
	stringFormat = "fields"	// formatting options differ from base calendars
	eras = ["BC", "AS", "NS"]
	partsFormat = {
		era : { mode : "list", codes : this.eras, source : this.eras }
	}

	fieldsFromCounter (number) {
		if (number < this.switchingDate.valueOf())	{	// Julian calendar
			var myFields = this.julianCalendar.fieldsFromCounter(number);
			myFields.era = this.eras[this.julianCalendar.eras.indexOf(myFields.era)];
		}
		else {
			let myDate = new Date (number);
			var myFields = // (we'd like a Gregorian custom calendar !!)
				Object ({era : this.eras[2], year : myDate.getUTCFullYear(),
				month : myDate.getUTCMonth()+1, day : myDate.getUTCDate(),
				hours : myDate.getUTCHours(), minutes : myDate.getUTCMinutes(),
				seconds : myDate.getUTCSeconds(), milliseconds : myDate.getUTCMilliseconds()});
		}
		return myFields
	}

	counterFromFields(askedFields) { // given fields may be out of scope
		var testDate, fields = {...askedFields};
		ExtDate.numericFields.forEach( (item) => { if (fields[item.name] == undefined)  fields[item.name] = item.value } )
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
		let number = this.setCounterFromFields (fields);
		return new construct (this, number)
	}

	weekFieldsFromCounter (timeStamp) {
		if (timeStamp < this.switchingDate.valueOf()) 
			return this.julianCalendar.weekFieldsFromCounter (timeStamp)
			else return isoWeek.weekFieldsFromCounter (timeStamp)
	}

	fullYear (fields) {
		if (fields.era == undefined) return fields.year
		else return fields.era == this.eras[0] ? 1 - fields.year : fields.year
	}

	inLeapYear (fields) { 
		if (this.counterFromFields(fields) < this.switchingDate.valueOf()) return this.julianCalendar.inLeapYear(fields)
		else return Chronos.isGregorianLeapYear (this.fullYear (fields))
	}
} // end of calendar class
/* export */ class FrenchRevCalendar {
	constructor (id, pldr) {
		this.id = id;
		this.pldr = pldr;
	}
	/* Basic references
	*/
	canvas = "iso8601"
	stringFormat = "fields"
	dayNames = ["primidi","duodi", "tridi", "quartidi", "quintidi", "sextidi", "septidi", "octidi", "nonidi", "décadi",
		"jour de la Vertu", "jour du Génie", "jour du Travail", "jour de l'Opinion", "jour des Récompenses", "jour de la Révolution"]
	monthNames = ["vendémiaire", "brumaire", "frimaire", "nivôse", "pluviôse", "ventôse", "germinal", "floréal", "prairial", "messidor", "thermidor", "fructidor","sans-culottides"]
	eraNames = ["ère des Français"]
	eras = ["ef"]	// list of code values for eras; one single era here.
	partsFormat = {
		weekday : {mode : "list", source : this.dayNames},
		month : {mode : "list", source : this.monthNames},
		year : {mode : "field" },
		era : {mode : "list", codes : this.eras, source : this.eraNames} 
	}
	frenchClockWork = new Chronos ({ // To be used with a Unix timestamp in ms. Decompose into years, months, day, hours, minutes, seconds, ms
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
			startOfWeek : 1,		// week is decade, start with 1 (Primidi)
			characWeekNumber : 1,	// we have a decade 1 and the characteristic day for this first decade is 1 Vendémiaire.
			dayBase : 1,			// use 1..10 display for decade days
			weekBase : 1,			// number of decade begins with 1
			weekLength : 10,			// The length of week (decade) is 10 within a year.
			weekReset : true,		// decade cycle is reset to startOfWeek at at the beginning of each year
			uncappedWeeks : [36]	// sans-culottides days are assigned to last decade.
		}
	)
	counterFromFields (fields) {
		return this.frenchClockWork.getNumber (fields)
	}
	fieldsFromCounter (timeStamp) {
		let fields = this.frenchClockWork.getObject (timeStamp);
		fields.fullYear = fields.year; fields.era = this.eras[0];
		return fields
	}
	weekFieldsFromCounter (timeStamp) {	// week fields, from a timestamp deemed UTC
		let characDayFields = this.fieldsFromCounter (timeStamp);
		characDayFields.month = 1; characDayFields.day = 1;	// 1 of Vendémiaire
		let myFigures = this.decade.getWeekFigures
			(Math.floor(timeStamp/Milliseconds.DAY_UNIT), Math.floor(this.counterFromFields(characDayFields)/Milliseconds.DAY_UNIT), characDayFields.year);
		return {weekYearOffset : myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	fullYear (fields) {	// year expressed in full, that is as a relative number (no era). Here, it is the same.
		return fields.year
	}
	inLeapYear (fields) {
		let myFields = {...fields};
		if (myFields.inSextileYear == undefined) myFields = this.frenchClockWork.getObject (this.frenchClockWork.getNumber (fields));
		return myFields.inSextileYear
	}
	valid (fields) {	// enforced at date expressed by those fields
		let counter = this.counterFromFields (fields);
		return counter >= -5594227200000 && counter < -5175360000000
	}

}

export {isoWeek, MilesianCalendar, JulianCalendar, WesternCalendar, FrenchRevCalendar};
