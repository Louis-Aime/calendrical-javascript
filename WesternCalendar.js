/* Western (Julian-Gregorian) calendar with CustomCalendar and ExtDate
	Character set is UTF-8
	The Julian-Gregorioan calendar with the legacy Date objet, contructed with the day of transition to Gregorian
	3 eras with this calendar:
		0. BC
		1. AS i.e. Anno Domini, and ancient style, using the Julian calendar, from 0000-12-30 to at least 1582-10-15, or later if wished.
		2. NS New style, must be after 1582-10-15 (else use directly iso8601).
	A date for the Gregorian transition is given with the calendar instatiation. 
	Date conversion from the external world, or fields conversion without expressing the era, use this transition date.
	Valid date object may be built overlaping the transition date but any N.S. date before 1582-10-15 shall be converted to A.S.
	AD is always converted to AS
Required
	Package Chronos: basic calendrical computations
	Julian calendar
Contents: 
	WesternCalendar: a class (a variable, maybe later a class, with the property / method corresponding to the projected Temporal.Calendar canvas
	vaticanCalendar: switching date is 1582-10-15
	frenchCalendar: switchin date is 1582-12-20
	germanCalendar: switching dae is 1700-03-01, this year was leap year until 18 February, then not...
Comments: JSDocs comments to be added.
*/
/* Version	M2020-11-21 adapted to ExtDate enhancements
	M2020-10-29 adapted to ExtDate
	M2020-10-19 original with Temporal
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
/** Define Western calendar structure: era with Julian calendar B.C., era with A.S. (ancient style), then Gregorian era N.S.
*/
class WesternCalendar {
	constructor (id, switchingDate) {
		this.id = id;
		this.switchingDate = new Date(switchingDate);	// first date where Gregorien calendar is used. switchingDate may be a ISO string
		this.switchingDate.setUTCHours (0,0,0,0);		// set to Oh UTC at switching date
		if (this.switchingDate.valueOf() < Date.parse ("1582-10-15T00:00:00Z")) 
			throw WesternCalendar.gregorianTransition;
	}
	/** Errors
	*/
	// static dateUnderflow = new RangeError ("date element underflow")
	static dateOverflow = new RangeError ("date element overflow for specified calendar")
	static yearUnderflow = new RangeError ("invalid negative year value, check or specify era")
	static invalidEra = new RangeError("invalid era value for calendar and date")
	static gregorianTransition = new RangeError ("Gregorian transition is on or after 1582-10-15")
	/** Base properties and methods
	 
	*/
	canvas = "gregory"
	firstSwitchDate = new Date ("1582-10-15T00:00:00Z") // First date of A.S. or N.S. era
	julianCalendar = new JulianCalendar (this.name,this.id); 
	gregorianJD = new JulianDayIso (0); 	// set for gregorian week elements. 0 is for first month = 0 in Date-style instanciation.
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
				if (fields.year < 1) throw WesternCalendar.yearUnderflow;		// test this, the	n go to no-era case
			case undefined: // here we have to guess. Oberve that year may be negative (astronomer's notation)
				testDate = new Date (ExtDate.fullUTC(fields.year, fields.month, fields.day, fields.hours, fields.minutes, fields.seconds, fields.milliseconds));
				if (testDate.valueOf() < this.switchingDate.valueOf())	// deemed Julian
					return this.julianCalendar.counterFromFields(fields);
				else return testDate.valueOf();
			case this.eras[0]: case this.eras[1]:	// Julian calendar, year field must be >=1
				if (fields.year < 1) throw WesternCalendar.yearUnderflow;
				fields.era = this.julianCalendar.eras[this.eras.indexOf(fields.era)] // set julianCalendar era code instead of this.
				return this.julianCalendar.counterFromFields(fields);
			case this.eras[2]:				// Specified as New Style (Gregorian), but cannot be before 1582-10-15
				if (fields.year < 1) throw WesternCalendar.yearUnderflow;
				testDate = new Date (ExtDate.fullUTC(fields.year, fields.month, fields.day, fields.hours, fields.minutes, fields.seconds, fields.milliseconds));
				if (testDate.valueOf() < this.firstSwitchDate) throw WesternCalendar.invalidEra;
				return testDate.valueOf();
			default : throw WesternCalendar.invalidEra;
		}
		
	}

	buildDateFromFields (fields, construct = ExtDate) {			// Construct an ExtDate object from the date in this calendar (deemed UTC)
		let number = this.setCounterFromFields (fields);
		return new construct (this, number)
	}

	weekFieldsFromCounter (timeStamp) {
		if (timeStamp < this.switchingDate.valueOf()) return this.julianCalendar.weekFieldsFromCounter(timeStamp)
			else {
				let myDate = new Date (timeStamp);
				return this.gregorianJD.toIsoWeekFields
					(this.gregorianJD.toJulianDay ({isoYear : myDate.getUTCFullYear(), isoMonth : myDate.getUTCMonth(), isoDay : myDate.getUTCDate()}))
			}
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

const vatican = new WesternCalendar ("vatican", "1582-10-15");
const french = new WesternCalendar ("france", "1582-12-20");
const german = new WesternCalendar ("germany", "1700-03-01");
const english = new WesternCalendar ("unitedkg","1752-09-14")