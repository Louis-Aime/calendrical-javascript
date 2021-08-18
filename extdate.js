/* extdate.js : Extension of Date objects
Character set is UTF-8
Purpose
	Handle custom calendars through an extension of the legacy Date object
Contents
	Description of Custom calendar objects
	ExtDate: extension of Date object that uses custom calendars (but not built-in calendars)
	One new method for Date for generalised time zone offset management
*/
/*	Version	M2021-08-28	Static objects are only methods
	M2021-07-28 introduce solveAskedFields
	M2021-07-25 : 
		Separate ExtDate and Intl.ExtDateTimeFormat
		Complete set of fields and complete parameter for getISOFields
		Fields year and earYear handled the same way as Temporal
		Set date-time from a date specified in week figures
		Generalised time getters and setter
	M2021-07-18 fill fields passed at construction with default values
	M2021-06-13	
		Error not as objects, but close to the corresponding code.
	M2020-12-27 no export
	M2020-12-08 Use import and export
	M2020-11-29 control calendar parameter to ExtDate and ExtDateTimeFormat constructors
	M2020-11-27
		add getISOFields method
		toCalString displays ISOString for built-in calendars
		two bugs in pseudo-properties functions day and inLeapYear
		bug in setFromFields, one field was forgotten
		setFromFields: day field was not taken into account
	M2020-11-22 complete comments
	M2020-11-19 Adapt to monthBase = 1 while keeping ancient getter and setter with monthBase = 0, add TZ parameter
	M2020-11-17 consolidate files
	M2020-10 : works in progress
	Sources: display function for the Julian and the Milesian calendars
*/
/* Copyright Miletus 2020-2021 - Louis A. de Fouquières
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
/*	Model for custom calendar classes or objects, inspired by Temporal but adapted to Date Object
class CustomCalendar {	
	** Properties **
	*id = (a string) 	// a specific name for this calendar, for the ExtDate.toCalString method
	*canvas: the name of a built-in calendar that provides the initial structure, and possible the names of months, weekdays etc. for the target calendar.
	pldr = a DOM		// the "private locale data register" to use for displaying certain fields (e.g. months) with ExtDateTimeFormat
	eras : an array of the string codes for the eras for this calendar, if eras used.
	stringFormat : a field expressing how date string is computed. Possible values are
		"built-in" : compute parts of displayed string as an ordinary DateTimeFormat, and then modify each part as stated by "partsFormat" object
		"fields" : general structure of string as stated from options, but values changed following fields of this calendar, and modified as stated by "partsFormat"
				// as of now, this option only works with Roman-like calendars
		"auto" (default): means "built-in".
	partsFormat : an Object, that specify how to format each part corresponding to each date field. Each tag is the name of a part to display (e.g. "era").
		Each value is itself an object with the following fields:
			mode: how to find the value: 
				"cldr" : leave value set by standard FormatToParts (equivalent to no object for this part name).
				"field": put field as is; if undefined, put "". For test and debug, and for void fields.
				"list" : (enumerable) values indicated in "source" field; if field is not a number, index to be found in "codes"
				"pldr" : values to be found in calendar.pldr, a DOM which represents a "private locale data register" designated with its URI/URL or identifier
			source : the reference to the values, if "list" or "pldr".
			codes : in case of "list" for a non-numeric field, the array of codes to search for
		(note: maybe we could just put "source" and test typeof source, to be seen later)
	** Methods **
	*fieldsFromCounter (number) 	// from a date stamp deemed UTC, give date and hour fields. Date fields shall be as follows: 
		The fields in the numericFields list: fullYear, month, day. 
		year, as it should be displayed
		era, to be displayed. If era is not in fields, year is fullYear
		month is 1-based 
		return {fields} // if (fields.era = undefined), year (if existing) is fullYear. Otherwhise a fullYear() method is provided. You may always get fullYear. 
	*counterFromFields (fields) {	// from a compound object that expresses the date in calendar (with month in base 1), create the Posix Value for the date (UTC)
		return (number)	// specify fields as in calendar. If era is specified, year is relative to era. If not, it is a fullYear.
	}
	*buildDateFromFields (fields, construct = ExtDate) { let a constructor build the date. This is not used here (and was abandonned in Temporal...)
		return (ExtDate or extended object)
	}
	*weekFieldsFromCounter (timeStamp) {	// week fields, from a timestamp deemed UTC
		return {
			weekYearOffset: number to add to current fullYear to get fullYear the week belongs to.
			weekYear : year for the week coordinates (civil full year + weekYearOffset).
			weekNumber : number of the week in the year.
			weekday : number of the day in the week, 0..6 for Sunday..Saturday or 1..7, depending on the calendar.
			weeksInYear : number of weeks in the weekYear the week belongs to.
		}
	}
	*counterFromWeekFields (fields) { // from a compound object that expresses the date in week coordinates for the calendar, compute the time stamp.
		required entry fields are weekYear, weekNumber, weekday
		return (timeStamp)
	}
	*solveAskedFields (fields) {
		from a set of fields, solve any ambiguity between year, era, fullYear, month, monthCode, before merging.
		return (fields)
	}
	fullYear (fields) : the signed integer number that unambigously represents the year in the calendar. If in regressive era, the year is translated into a negative or null number.
	era (date) : the era code
	year : the year displayed with the era (if existing), or the unambiguous year .
	*inLeapYear (fields) is this date a leap year
	// Possible fields elements from ExtDate
	era (date) : the era code
	month (date) :  month number, first month is 1
	day (date) : day number in month, first day is 1
	// Calendar dependant characteristics, used in Temporal
	daysinWeek (date) (from weekFieldsFromCounter)
	dayOfWeek (date) (from weekFieldsFromCounter)
	daysInYear (date) (computed)
	dayOfYear (date) (computed)
	weekOfYear (date) (from weekFieldsFromCounter)
	yearOfWeek (date) (from weekFieldsFromCounter)
	daysInMonth (date) (computed)
	monthsInYear (date) (simple)
	(no Duration method in this extended Date object)
}
*/
"use strict";
/** Compute the system time zone offset at this date, in ms. This extension is not exported.
 * rationale: with Chrome (and others ?), the TZOffset returned value losses the seconds. 
 * @returns {number} the time zone offset in milliseconds: UTC - local (same sign as TimezoneOffset)
*/
Date.prototype.getRealTZmsOffset = function () { // this prototype extension necessary prior to extending Date, and this method is redefined and enlarged within ExtDate.
/** Gregorian coordinates of the system local date */
	let localCoord = 
		{year: this.getFullYear(), month: this.getMonth(), date: this.getDate(), 
		hours: this.getHours(), minutes: this.getMinutes(), seconds: this.getSeconds(), milliseconds: this.getMilliseconds()};
/** UTC Date constructed with the local date coordinates */
	let localDate = new Date (0); 
	localDate.setUTCFullYear (localCoord.year, localCoord.month, localCoord.date); 
	localDate.setUTCHours (localCoord.hours, localCoord.minutes, localCoord.seconds, localCoord.milliseconds);
	return this.valueOf() - localDate.valueOf()
}
/** Extend Date object to cater with custom calendars, before Temporal is available
*/
export default class ExtDate extends Date {
	/** Construct a date to be deployed in a custom calendar. Date elements shall be integer.
	 * @param (Object) calendar : 
			the calendar object that describes the custom calendar,
			or a string that refers to a built-in calendar; however computations are not implemented in this version, except for "iso8601" (default) and "gregory".
			or undefined : deemed to be "iso8601"
	 * @param (parameter list): the arguments as passed to the Date object.
		empty -> now
		one numerical argument: Posix counter in milliseconds, as for Date.
		one string argument: an ISO string for the date, passed to Date.
		several numerical arguments: the arguments of Date constructor, as would be passed to Date, but
			year is full year, e.g. year 1 is 0001, not 1901,
			first month is always 1, not 0,
			the date elements are those of the target calendar, not of gregory neither iso8601; year is always a full year, not era dependant.
	 * @return Date value. The date is deemed local in system time zone.
	*/
	constructor (calendar, ...dateArguments) {
		let myCalendar = (calendar == undefined) ? "iso8601" : calendar;
		switch (typeof myCalendar) {
			case "string" : switch (myCalendar) {
				case "iso8601" : case "gregory" : break;
				default : throw new RangeError ("Only iso8601 and gregory built-in calendars enable ExtDate object construction, not " + myCalendar);
			} break;
			case "object": ; break; // ExtDate constructed although calendar object may be incomplete
			default : throw new TypeError ('Calendar parameter is neither a string nor an object'); 
		}
		if (dateArguments.length > 1) {	// more than 1 argument passed to Date: a date description, not a time stamp.
			if (myCalendar == "iso8601" || myCalendar == "gregory") { // First arguments are a year and a month. Year is alwasy full, month is always based 1.
				dateArguments[1]--;		// month argument decremented for the legacy Date
				super (...dateArguments);
				if (dateArguments[0] < 100 && dateArguments[0] >= 0) this.setFullYear(dateArguments[0]); 
				} 
			else {	// analyse fields in terms of the specified custom calendar
				let fields = new Object;
				for (let i = 0; i < ExtDate.numericFields().length; i++) {
					if (i < dateArguments.length) {
						if (!Number.isInteger(dateArguments[i])) throw new TypeError 
							('Argument ' + ExtDate.numericFields()[i].name + ' is not integer: ' + dateArguments[i]);
						fields[ExtDate.numericFields()[i].name] = dateArguments[i];
					} else {fields[ExtDate.numericFields()[i].name] = ExtDate.numericFields()[i].value} //	If no value specified among arguments, set default value.
				}
				let UTCDate = new Date (calendar.counterFromFields (fields));
				super (UTCDate.valueOf() + UTCDate.getRealTZmsOffset());
			}
		}
		else	// 0 or 1 argument for legacy Date, i.e. Now (0 argument), a string or a timestamp. Nothing calendar-dependant.
			super (...dateArguments);
		this.calendar = myCalendar;		// because this may only appear after super.
	}
	/** Basic data
	*/
	static numericFields() { return [ {name : "fullYear", value : 0}, {name : "month", value : 1}, {name : "day", value : 1},
		{name : "hours", value : 0}, {name : "minutes", value : 0}, {name : "seconds", value : 0}, {name : "milliseconds", value : 0} ] }
		// names of numeric date elements
	static numericWeekFields() { return [ {name : "weekYear", value : 0}, {name : "weekNumber", value : 1}, {name : "weekday", value : 1},
		{name : "hours", value : 0}, {name : "minutes", value : 0}, {name : "seconds", value : 0}, {name : "milliseconds", value : 0} ] }
		// names of numeric week figures elements
	/** Basic utility fonction: get UTC date from ISO fields in UTC, including full year i.e. 79 means year 79 AD, when Pompeii was buried under volcano ashes.
	*/
	static fullUTC (fullYear=0, month=1, day=1, hours=0, minutes=0, seconds=0, milliseconds=0) {
		arguments[1]--;		// From base 1 month to month of legacy Date
		let myDate = new Date(Date.UTC(...arguments));	// Date.UTC requires at least one argument, which is always the UTC year, shifted to 1900-1999 if specified 0..99
		if (fullYear <100 && fullYear >=0) myDate.setUTCFullYear(fullYear);
		return myDate.valueOf()
	}
	/** Compute the system time zone offset at this date, or the time zone offset of a named time zone in ms.
	 * rationale: with Chrome (and others ?), the TZOffset returned value losses the seconds. 
	 * @param (string) TZ: the named time zone. If undefined or "", system timezone.
	 * @returns {number} the time zone offset in milliseconds: UTC - local (same sign as TimezoneOffset)
	*/
	getRealTZmsOffset (TZ) {	// 2 functions in one: if TZ == undefined, compute real offset between system TZ offset at this time. if TZ = "UTC", 0. 
								// if TZ is a named zone, use toResolvedLocalDate in order to compute offset in ms.
		if (TZ == "UTC") return 0;		// avoid complex computation for a trivial and frequent case
		if (TZ == undefined || TZ == "") {	// system time zone
		// Gregorian coordinates of the system local date
			let localCoord = 
				{year: this.getFullYear(), month: this.getMonth(), date: this.getDate(), 
				hours: this.getHours(), minutes: this.getMinutes(), seconds: this.getSeconds(), milliseconds: this.getMilliseconds()};
		// UTC Date constructed with the local date coordinates
			let localDate = new Date (0); 
			localDate.setUTCFullYear (localCoord.year, localCoord.month, localCoord.date); 
			localDate.setUTCHours (localCoord.hours, localCoord.minutes, localCoord.seconds, localCoord.milliseconds);
			return this.valueOf() - localDate.valueOf()
		}
		else return this.valueOf() - this.toResolvedLocalDate(TZ).valueOf()
	}
	/** Construct a date that represents the "best fit" value of the given date shifted as UTC to the named time zone. 
	 * The computation of the time zone is that of Unicode, or of the standard TZOffset if Unicode's is not available.
	 * @param {Date} Date object the method is associated to, - the Date object to convert.
	 * @param {string} TZ - the name of the time zone.
	 * @returns {Date} - the best possible result given by the navigator.
	 */
	toResolvedLocalDate = function (TZ) { // This routine assumes that Intl.DateTimeFormat works. If not, exception is thrown.
		var	localTime = new ExtDate (this.calendar,this.valueOf()); // Initiate a draft date that is the same as this.
		if (TZ == "UTC") return localTime; // Trivial case: time zone asked is UTC.
		// There is no try ! TZ has to be a valid TZ name.
		if (TZ == (undefined || ""))
			var localOptions = new Intl.DateTimeFormat ("en-GB")
		else
			var localOptions = new Intl.DateTimeFormat ("en-GB", {timeZone : TZ}); // Submit specified time zone
		// Here localOptions is set with valid asked timeZone
		// Set a format object suitable to extract numeric components from Date string
		let numericSettings = {weekday: 'long', era: 'short', year: 'numeric',  month: 'numeric',  day: 'numeric',  
				hour: 'numeric',  minute: 'numeric',  second: 'numeric', hour12: false};
		if (!(TZ == (undefined || ""))) numericSettings.timeZone = TZ;	
		var numericOptions = new Intl.DateTimeFormat ("en-GB", numericSettings);	// gregory calendar in British english
		let	localTC = numericOptions.formatToParts(this); // Local date and time components at TZ
		return new ExtDate(this.calendar, ExtDate.fullUTC (
			localTC[8].value == "BC" ? 1-localTC[6].value : +localTC[6].value, // year component (a full year)
			+localTC[4].value, +localTC[2].value, // month and date components (month is 1..12)
			+localTC[10].value, +localTC[12].value, +localTC[14].value, //Hours, minutes and seconds
			localTime.getUTCMilliseconds())); // We can't obtain milliseconds from DateTimeFormat, but they always remain the same while changing time zone.
	}
	/** calendar date fields generator method from Date.valueOf(), local or UTC. Month in range 1..12
	 * @param (string) TZ: if "" or undefined (default value), local date and time. If "UTC", UTC date and time.
	 * @return (Object) object with date fields { (era if applicable), year, month (range 1..12), day, hours, minutes, seconds, milliseconds}
	*/
	getFields(TZ) {
		// compute offset to use
		var offset = this.getRealTZmsOffset(TZ), 
			shiftDate, result;
		// compute Fields from a shifted value. Month is in the range 1..12
		if (typeof this.calendar == "string") { 
			switch (this.calendar) {	// calendar is a string: a built-in calendar, presently only "gregory" or "iso8601"
				case "iso8601": case "gregory" : 
					shiftDate = new Date (this.valueOf() - offset);
					result = {
							fullYear : shiftDate.getUTCFullYear(),
							month : shiftDate.getUTCMonth()+1,
							day : shiftDate.getUTCDate(),
							hours : shiftDate.getUTCHours(),
							minutes : shiftDate.getUTCMinutes(),
							seconds : shiftDate.getUTCSeconds(),
							milliseconds : shiftDate.getUTCMilliseconds()
						};
					if (this.calendar == "gregory") [result.era, result.year] = result.fullYear <= 0 ? ["ERA0",1-result.fullYear] : ["ERA1", result.fullYear]
					else result.year = result.fullYear;
					break;
				default : throw new RangeError ("Only iso8601 and gregory built-in calendars enable getFields method: " + this.calendar);
				}
			return result;
		}
		else 
			return this.calendar.fieldsFromCounter (this.valueOf() - offset);
	}
	/**	ISO fields at UTC, like for Temporal.PlainDate
	*/
	getISOFields(TZ) {	// Fields with same name as in Temporal.
		var 
			shiftDate = new Date (this.valueOf - this.getRealTZmsOffset(TZ));
		return {
			isoYear : shiftDate.getUTCFullYear(),
			isoMonth : shiftDate.getUTCMonth() + 1,
			isoDay : shiftDate.getUTCDate(),
			hours : shiftDate.getUTCHours(),
			minutes : shiftDate.getUTCMinutes(),
			seconds : shiftDate.getUTCSeconds(),
			milliseconds : shiftDate.getUTCMilliseconds()
		}
	}
	/** week fields generator method from Date.valueOf(), local or UTC.
	 * @param (string) TZ: if "" or undefined (default value), local date and time. If "UTC", UTC date and time.
	 * @return (Object) object with week fields { weekNumber: number (1..53) of the week. weekday : number (1..7, 1 = Monday) of the weekday,
		weekYearOffset : -1/0/1 shift fullYear by one to obtain the year the week belongs to, weeksInYear: number of weeks in the year the week belons to }
	*/
	getWeekFields(TZ) {
		if (typeof this.calendar == "string") 
			throw new RangeError ("getWeekFields method not available for built-in calendars.")
		else return this.calendar.weekFieldsFromCounter (this.valueOf() - this.getRealTZmsOffset(TZ))
	}
	
	/** setter method, from fields representing partially a date or time in the target calendar, change date and computie timestamp.
	 * @param (Object) fields that change from presently held date, i.e. undefined fields are extracted from present date with same TZ (system (blank) or 'UTC')
	 * @param (string) TZ: if "" or undefined (default value), local date and time. If 'UTC', UTC date and time.
	 * @return (number) a new timeStamp
	*/
	setFromFields( myFields, TZ ) { 
		if (typeof this.calendar == "string") throw new TypeError ('setFromFields does not work with built-in calendars: ' + this.calendar);
		var askedFields = this.calendar.solveAskedFields (myFields),	// askedFields is not ambiguous. 
			fields = this.getFields(TZ);
		fields = Object.assign (fields, askedFields);
/*		This part seems unnecessary since fields already exist.
	// 3. Now field should be complete
		if (ExtDate.numericFields().some ( (item) =>  fields[item.name] == undefined ? false : !Number.isInteger(fields[item.name] ) ) ) 
			throw new TypeError 
				(ExtDate.numericFields().map(({name, value}) => {return (name + ':' + value);}).reduce((buf, part)=> buf + " " + part, "Missing or non integer element in date fields: "));
		ExtDate.numericFields().forEach ( (item) => { if (fields[item.name] == undefined) 
			fields[item.name] = startingFields[item.name] } );
*/
		// Construct an object with the date indication only, at 0 h UTC
		let dateFields = {}; ExtDate.numericFields().slice(0,3).forEach ( (item) => {dateFields[item.name] = fields[item.name]} );
		this.setTime(this.calendar.counterFromFields (dateFields));
		// finally set time to this date from TZ, using .setHours or .setUTCHours
		return this.setFullTime (TZ , fields.hours, fields.minutes, fields.seconds, fields.milliseconds)
	}
	/** setter method, from the fields representing the date in the target WEEK calendar, comput date timestamp
	 * @param (Object) week fields that change from presently held date, i.e. undefined week fields are extracted from present date with same TZ. 
	 * @param (string) TZ: if "" or undefined (default value), local date and time. If "UTC", UTC date and time.
	 * @return (number) same return as Date.setTime
	*/
	setFromWeekFields( myFields, TZ ) { 
		if (typeof this.calendar == "string") throw new TypeError ('setFromWeekFields does not work with built-in calendars: ' + this.calendar);
		var timeFields = this.getFields (TZ),	// interesting fields are time fields.
			weekFields = this.getWeekFields (TZ);
		weekFields = Object.assign (weekFields, myFields);	// add date expressed in week coordinates.
/*	This part seems unnecessary since fields already exist.
		if (ExtDate.numericWeekFields().some ( (item) =>  fields[item.name] == undefined ? false : !Number.isInteger(fields[item.name] ) ) ) 
			throw new TypeError 
				(ExtDate.numericWeekFields().map(({name, value}) => {return (name + ':' + value);}).reduce((buf, part)=> buf + " " + part, "Missing or non integer element in week date: "));
*/
		let dateFields = {}; ExtDate.numericWeekFields().slice(0,3).forEach ( (item) => {dateFields[item.name] = weekFields[item.name]} );
		this.setTime(this.calendar.counterFromWeekFields (dateFields));
		// finally set time to this date from TZ, using setFullTime
		return this.setFullTime (TZ, timeFields.hours, timeFields.minutes, timeFields.seconds, timeFields.milliseconds);
	}
	/** is this date in a leap year of the calendar ? 
	*/
	inLeapYear ( TZ ) {
		if (typeof this.calendar.inLeapYear != "function") throw new RangeError ('inLeapYear function not provided for this calendar');
		return this.calendar.inLeapYear( this.getFields (TZ) );
	}
	/** extract a simple string with the calendar name, then era code (if applicable), then the figures for year, month, day, and time components.
	 * @param (string) TZ: if "" or undefined (default value), local date and time. If "UTC", UTC date and time.
	 * @return (String) : the date as a string
	*/
	toCalString( TZ ) {
		if (typeof this.calendar == "string") return this.toISOString() + "[c=" + this.calendar + "]";
		let fn6 = Intl.NumberFormat(undefined,{minimumIntegerDigits : 6, useGrouping : false}),
			fn4 = Intl.NumberFormat(undefined,{minimumIntegerDigits : 4, useGrouping : false}), 
			fn3 = Intl.NumberFormat(undefined,{minimumIntegerDigits : 3}),
			fn2 = Intl.NumberFormat(undefined,{minimumIntegerDigits : 2}),
			fzs = Intl.DateTimeFormat(undefined, {hour: "2-digit", minute: "2-digit", second:"2-digit", timeZoneName : "short"}),
			compound = this.getFields (TZ);
		return "[" + this.calendar.id + "]" + ( compound.era == undefined ? "" : "(" + compound.era + ")" )
				+ (compound.year < 10000 && compound.year > 0 ? fn4.format(compound.year) : fn6.format(compound.year)) + "-"
				+ fn2.format(compound.month) + "-"+fn2.format(compound.day) 
				+ "T" + (TZ == undefined || TZ == "" ? fzs.format (this) 
					: fn2.format(compound.hours)+":"+fn2.format(compound.minutes)+":"+fn2.format(compound.seconds)+"."+fn3.format(compound.milliseconds) + "Z")
	}
	fullYear (TZ) {		// year as an unambiguous signed integer
		let fields = this.getFields(TZ);
		return fields.fullYear;
	}
	era (TZ) {			// era code
		let fields = this.getFields(TZ);
		return fields.era
	}
	year (TZ) {			//  Standard year, may be ambiguous if era is not known
		let fields = this.getFields(TZ);
		return fields.year
	}
	month (TZ) {			//  month, numbered starting with 1
		let fields = this.getFields(TZ);
		return fields.month
	}
	day (TZ) {			//  day in month
		let fields = this.getFields(TZ);
		return fields.day
	}
	weekday (TZ) {
		let fields = this.getWeekFields(TZ);
		return fields.weekday
	}
	weekNumber (TZ) {
		let fields = this.getWeekFields(TZ);
		return fields.weekNumber
	}
	weeksInYear (TZ) {
		let fields = this.getWeekFields(TZ);
		return fields.weeksInYear
	}
	weekYear (TZ) {		// unambiguous number of the year the numbered week belongs to
		let fields = this.getWeekFields(TZ);
		return fields.weekYear
	}
	hours (TZ) {
		let fields = this.getFields(TZ);
		return fields.hours
	}
	minutes (TZ) {
		let fields = this.getFields (TZ);
		return fields.minutes
	}
	seconds (TZ) {
		let fields = this.getFields (TZ);
		return fields.seconds
	}
	milliseconds (TZ) {
		let fields = this.getFields (TZ);
		return fields.milliseconds
	}
	setFullTime (TZ, hours, minutes, seconds, milliseconds) {
		if (TZ == undefined) TZ = "";
		if (hours == undefined || isNaN (hours)) throw new TypeError ('setFullTime: at least "hours" parameter should be specified: ' + hours);
		if (minutes == undefined) minutes = (TZ == "" ? this.getMinutes() : this.getUTCMinutes());
		if (seconds == undefined) seconds = (TZ == "" ? this.getSeconds() : this.getUTCSeconds());
		if (milliseconds == undefined) milliseconds = (TZ == "" ? this.getMilliseconds() : this.getUTCMilliseconds());
		switch (TZ) {
			case "" : return this.setHours (hours, minutes, seconds, milliseconds);
			case "UTC" : return this.setUTCHours (hours, minutes, seconds, milliseconds);
			default : throw new RangeError ('Only "UTC" or blank value is possible for TZ parameter: ' + TZ);
		}
	}
}