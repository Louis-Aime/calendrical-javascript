/* Julian calendar with CustomCalendar and ExtDate
	Character set is UTF-8
Required
	Package Chronos -> the general calendar computation engine.
Contents: 
	JulianCalendar: an object (a variable, maybe later a class, with the property / method corresponding to the projected Temporal.Calendar canvas
Comments: JSDocs comments to be added.
*/
/* Versions	M2020-11-21	Enhance with DateExtended
	M2020-11-11	Adapted to Chronos with week computations.
	M2020-10-29 adapted to Chronos with plain Date object 
	M2020-10-19 original (for Temporal project initially)
	Source: since 2017
*/
/* Copyright Miletus 2016-2020 - Louis A. de FOUQUIERES
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
/** Julian calendar reckoning
*/
class JulianCalendar  { // Construct a class at the same level as built-in, no pldr
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
		}, // end of calendRule
		{	// weekdayRule = ISO8601 rule applied to Julian calendar
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
	static invalidEra = new RangeError("invalid era value for calendar and date")
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
			case this.eras[0]: case this.eras[1]: if (fields.year < 1) throw JulianCalendar.invalidEra; break;
			default : throw JulianCalendar.invalidEra; break;
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
		let myFigures = this.julianClockwork.getWeekFigures
			(Math.floor(timeStamp/Chronos.DAY_UNIT), Math.floor(this.counterFromFields(characDayFields)/Chronos.DAY_UNIT), characDayFields.year);
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
const julian = new JulianCalendar ("julian");	// An instantied Julian calendar