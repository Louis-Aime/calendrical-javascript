/* Miscellaneous calendars with ~#ExtDate
	Character set is UTF-8
Required
	Package Chronos: basic calendrical computations
Contents: 
	partial calendar as specified for ExtDate.
Comments: JSDocs comments to be added.
*/
/* Versions	M2020-11-21
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
/** Define Ethiopic
*/
class EthiopicCalendar {
	constructor (name) {
		this.id = name;
		this.canvas = "ethiopic";
	}
	/** Errors
	*/
	// static dateUnderflow = new RangeError ("date element underflow")
	static dateOverflow = new RangeError ("date element overflow for specified calendar")
	static yearUnderflow = new RangeError ("invalid negative year value, check or specify era")
	static invalidEra = new RangeError("invalid era value for calendar and date")
	static unimplemented = new TypeError ("not implemented")
	/** Base properties and methods
	 
	*/
	eras = ["ERA0", "ERA1"]
	eraNames = ["Amete Alem", "Amete Mihret"]
	stringFormat = "auto"
	partsFormat =
		{era : {mode : "list", source : this.eraNames, codes : this.eras}}
	fieldsNames = ["era", "year", "month", "day", "hour", "minute", "second", "millisecond"]
	fieldsFromCounter (number) {
		let uReckoning = Intl.DateTimeFormat("en-GB", {calendar : "ethiopic", timeZone : "UTC", 
			era : "short", year : "numeric", month : "numeric", day : "numeric",
			hour : "numeric", minute : "numeric", second : "numeric", millisecond : "numeric"}),
			myParts = uReckoning.formatToParts(new Date().setTime(number)),
			thisFieldsNames = this.fieldsNames,
			myFields = new Object;
		myParts.forEach( function (item, index) { 
			let pindex = thisFieldsNames.findIndex((name) => name == item.type);
			if (pindex >= 0) switch (item.type) {
				case "era": myFields[item.type] = myParts[index].value; break;
				default : myFields[item.type] = +(myParts[index].value); break;
			}
		}
		);
		switch (myFields.era) {
			case "ERA0" : myFields.era = this.eras[0]; break;
			case "ERA1" : myFields.era = this.eras[1]; break;
			default : throw myEthiopic.invalidEra;
		}
		return myFields;
	}
	
	//counterFromFields(askedFields) {} // not available given fields may be out of scope
	counterFromFields (fields) {
		throw  EthiopicCalendar.unimplemented;
	}
	buildDateFromFields (fields, construct = ExtDate) {
		throw  EthiopicCalendar.unimplemented;
	}
	weekFieldsFromCounter (timeStamp) {	// week fields, from a timestamp deemed UTC
		throw  EthiopicCalendar.unimplemented;
	}
	fullYear (fields) {
		if (isNaN(fields.year) || !Number.isInteger(fields.year)) throw ExtDate.invalidDateFields;
		return fields.era == this.eras[1] ? fields.year + 5500 : fields.year
	}
	inLeapYear (fields) { 
		return Chronos.isJulianLeapYear (this.relativeYear (fields) + 1)
	}
} // end of calendar class
const myEthiopic = new EthiopicCalendar ("ethiopicf");
