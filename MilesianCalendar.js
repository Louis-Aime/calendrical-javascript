/* Milesian calendar using CustomCalendar and ExtDate
	Character set is UTF-8
	The Milesian calendar as a CustomCalendar
Required
	Package Chronos -> the general calendar computation engine.
	pldrDOM (only for the "milesian" instance) 
Contents: 
	MilesianCalendarClass: a class 
	method toDateString is added - just to facilitate control.
Comments: JSDocs comments to be added.
*/
/* Versions:	M2020-11-21	Enhance with DateExtended
	M2020-11-12	Adapt to week handler	Source: since 2017
	M2020-10-22 construct using class Chronos
	M2020-11-10 use Chronos week computations
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
class MilesianCalendar { // generic Milesian calenda
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
		},	// end of calendRule
		{	// weekdayRule
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
		return this.milesianClockwork.getObject (timeStamp)
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
		let myFigures = this.milesianClockwork.getWeekFigures
			(Math.floor(timeStamp/Chronos.DAY_UNIT), Math.floor(this.counterFromFields(characDayFields)/Chronos.DAY_UNIT), characDayFields.year);
		return {weekYearOffset : myFigures[2], weekNumber : myFigures[0], weekday : myFigures[1], weeksInYear : myFigures[3]}
	}
	/* Simple properties and method as inspired by Temporal
	*/
	eras = null				// list of code values for eras. No era in Milesian calendar.
	fullYear (fields) {	// year expressed in full, that is as a relative number (no era). Here, it is the same.
		if (isNaN(fields.year) || !Number.isInteger(fields.year)) throw ExtDate.invalidDateFields;
		return fields.year
	}
	inLeapYear (fields) { 	// is the Milesian year of this date a Milesian leap year.
		return Chronos.isGregorianLeapYear ( this.fullYear(fields) + 1 )
	}
}

const milesian = new MilesianCalendar ("milesian",pldrDOM); // A Milesian calendar with pldr data.