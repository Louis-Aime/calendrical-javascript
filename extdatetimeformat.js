/* extdatetimeformat.js : Extension of Intl.DateTimeFormat objects, linked to ExtDate but could be used with Temporal
Character set is UTF-8
Purpose
	Handle custom calendars
	New functionnalities for Intl.DateTimeFormat
Contents
	Description of Custom calendar objects
	ExtDateTimeFormat: extension of Intl.DateTimeFormat
*/
/*	Version	M2021-08-17	time fields delimiter ":" or "." are changed to " h " or " min " (only ":" was changed previously)
	M2021-08-16 options object passed as parameter shall not be changed
	M2021-08-07	Any type of calendar, not only custom, can be specified as the last parameter.
	M2021-07-28	Use fullYear as a field of ExtDate, not as a function
	M2021-07-24 separate ExtDateTimeFormat (purge version history)
	M2021-07-18 (last change before splitting - nothing here)
	M2021-06-13	
		Error not as objects, but close to the corresponding code.
		Suppress unicodeValidDateinCalendar, calendar validity control (all calendars work since ICU 68)
	M2021-01-09 set h12 and hourCycle as in original Intl
	M2021-01-08 - when a field is undefined and should be displayed, tagging as "field" yield a void field
	M2020-12-27 no export
	M2020-12-18 resolving partly eraDisplay at construction
	M2020-12-08 Use import and export
	M2020-12-07	Do not change time part if language is among right-to-left.
	M2020-11-29 control calendar parameter to ExtDate and ExtDateTimeFormat constructors
	M2020-11-27 Modify literals of time part only, not of date part, solve a few bugs
		only replace ":" literals in time part of string with " h ", " min " or " s " indication if corresponding option is "numeric"
		empty option case of DateTimeFormat was not properly evaluated
		setFromFields: day field was not taken into account
	M2020-11-25 replace any literal other than " " that follows numeric field with option "numeric" (not with option "2-digit")
	M2020-11-24 - Add week-related fields added to date object for formatToParts
	M2020-11-22 complete comments
	M2020-11-19 (nothing here)
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
/*	Model for custom calendar classes or objects, inspired by Temporal but adapted to Date & DateTimeFormat
	Only fields used with ExtDateTimeFormat are given here.
	*starred fields are used for ExtDateTimeFormat, **double-starred are required.
class CustomCalendar {	
	** Properties **
	id = (a string) 	// a specific name for this calendar, for the ExtDate.toCalString method (not in ExtDateTimeFormat)
	**canvas: the name of a built-in calendar that provides the initial structure, and possible the names of months, weekdays etc. for the target calendar.
	* pldr = a DOM		// the "private locale data register" to use for displaying certain fields (e.g. months) with ExtDateTimeFormat
	* eras : an array of the string codes for the eras for this calendar, if eras used.
	* stringFormat : a field expressing how date string is computed. Possible values are
		"built-in" : compute parts of displayed string as an ordinary DateTimeFormat, and then modify each part as stated by "partsFormat" object
		"fields" : general structure of string as stated from options, but values changed following fields of this calendar, and modified as stated by "partsFormat"
				// as of now, this option only works with Roman-like calendars
		"auto" (default): means "built-in".
	* partsFormat : an Object, that specify how to format each part corresponding to each date field. Each tag is the name of a part to display (e.g. "era").
		Each value is itself an object with the following fields:
			mode: how to find the value: 
				"cldr" : leave value set by standard FormatToParts (equivalent to no object for this part name).
				"field": put field as is; if undefined, put "". For test and debug, and for void fields.
				"list" : (enumerable) values indicated in "source" field; if field is not a number, index to be found in "codes"
				"pldr" : values to be found in calendar.pldr, a DOM which represents a "private locale data register" designated with its URI/URL or identifier
			source : the reference to the values, if "list" or "pldr".
			codes : in case of "list" for a non-numeric field, the array of codes to search for
		(note: maybe we could just put "source" and test typeof source, to be seen later)
	** Methods (see extdate)**
	// Possible fields elements from ExtDate
	era (date) : the era code
	year : the year associated to era, to be displayed (eraYear of Temporal)
	fullYear : the uniquely-definied year 
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
	// Elements for ExtDateTimeFormat
	eraDisplay field is deemed added to options, (see proposal), value are : "auto" (default) / "always" / "never"
	a calendar field is optional. This field may only be a custom calendar (options exist fir built-in calendars).
*/
"use strict";
import ExtDate from './extdate.js';
/** Extend Intl.DateTimeFormat object, display dates in custom calendars.
*/
export default class ExtDateTimeFormat extends Intl.DateTimeFormat {
	/** Extend and customise capacities to display dates in different calendars
	 * @param (string) locale : as for Intl.DateTimeFormat
	 * @param (Object) options : as for Intl.DateTimeFormat + this field
		eraDisplay : ("never"/"always"/"auto"), default to "auto": should era be displayed ?
	 * @param (Object) a calendar. 
			If this parameter is not specified, the calendar resolved with locale and options will be used.
			If specified as a built-in calendar string, this calendar supersedes the one resolved with locale and options.
			If specified as a custom calendar and if a Private Locale Data Register is given, this will be used for calendar's entity names. 
			If no pldr is provided, the calendar.canvas field refers to the built-in calendar to use for entity names.
	*/
	constructor (locale, options, calendar) { // options should not be set to null, not accepted by Unicode
		let myOptions = {...options}; // copy originally asked options.
		if (typeof calendar == "string") myOptions.calendar = calendar;
		super (locale, myOptions);
		// Resolve this.calendar options
		if (typeof calendar == "object") this.calendar = calendar;
		this.options = myOptions;	// this.options may be changed without changing the parameter
		this.locale = locale;
		// Resolve case where no field is asked for display : if none of weekday, year, month, day, hour, minute, second is asked, set a standard suite
		if (this.options == undefined) this.options = {};
		if (this.options.weekday == undefined
			&& this.options.year == undefined
			&& this.options.month == undefined
			&& this.options.day == undefined
			&& this.options.hour == undefined
			&& this.options.minute == undefined
			&& this.options.second == undefined
			&& this.options.dateStyle == undefined
			&& this.options.timeStyle == undefined) this.options.year = this.options.month = this.options.day = "numeric";
		this.DTFOptions = super.resolvedOptions();	// should hold all locale resolved information in DTFOptions.locale
		this.options.locale = this.DTFOptions.locale;
		this.options.calendar = (this.calendar != undefined && this.calendar.canvas != undefined) ? this.calendar.canvas : this.DTFOptions.calendar; 
		// set calendar option for standard DTF after calendar.canvas if specified, and re-compute DTF resolved options
		if (this.options.calendar != this.DTFOptions.calendar) { 
			this.DTFOptions.calendar = this.options.calendar 
			this.DTFOptions = new Intl.DateTimeFormat(this.DTFOptions.locale, this.DTFOptions).resolvedOptions();
		}
		this.options.numberingSystem = this.DTFOptions.numberingSystem;
		this.options.timeZone = this.DTFOptions.timeZone;
		this.options.timeZoneName = this.DTFOptions.timeZoneName;
		this.options.dayPeriod = this.DTFOptions.dayPeriod;
		this.options.hour12 = this.DTFOptions.hour12;
		this.options.hourCycle = this.DTFOptions.hourCycle;

		// Control and resolve specific options
		if (this.options.eraDisplay == undefined) this.options.eraDisplay = "auto";
		switch (this.options.eraDisplay) {
			case "always":	if (options.era == undefined) options.era = "short";
			case "auto": 	// we should insert here the preceding statement, however this can have impact if era is asked from the user.
			case "never": break;
			default: throw new RangeError ("Unknown option for displaying era: " + this.options.eraDisplay);
		}
		if (this.options.eraDisplay == "auto" && this.DTFOptions.year == undefined) this.options.eraDisplay = "never";
		if (this.calendar != undefined) {
			if (this.calendar.stringFormat == undefined) this.calendar.stringFormat = "auto";
			switch (this.calendar.stringFormat) {
				case "built-in" : case "fields" : case "auto" : break;
				default : throw new RangeError ("Unknown option for date string computing method ('auto', 'built-in' or 'fields'): " + this.calendar.stringFormat);
				}
		}
		// Prepare implied parameters for formatting
		this.lang = this.options.locale.includes("-") ? this.options.locale.substring (0,this.options.locale.indexOf("-")) : this.options.locale;
		this.figure1 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 1, useGrouping : false});
		this.figure2 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 2, useGrouping : false});
		this.figure4 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 4, useGrouping : false});
		this.figure6 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 6, useGrouping : false});

		// Resolve extended options for timeStyle and dateStyle
		if (this.options.timeStyle != undefined) {
			this.options.timeZoneName = this.options.timeStyle == "full" ? "long" : "short";
			this.options.hour = this.options.minute = this.options.second = "2-digit"; 
			delete this.options.fractionalSecondDigits;
			switch (this.options.timeStyle) {
				case "short" : delete this.options.second;
				case "medium" : delete this.options.timeZoneName;
				case "long" : case "full": ;		// options.timeZoneName already computed
			}
			delete this.options.timeStyle;
		}
		if (this.options.dateStyle != undefined) {
			delete this.options.weekday;
			this.options.day = "numeric"; this.options.month = "short"; this.options.year = "numeric";
			switch (this.options.dateStyle)  {
				case "medium" : break; 
				case "short" : this.options.day = this.options.month = "2-digit"; break;
				case "full" : this.options.weekday = "long";
				case "long" : this.options.month = "long";
			}
			delete this.options.dateStyle;
		}
		// Resolve numeric options for date and time elements: day or hour elements' 2-digit options overwrite other numeric options of other date resp. time elements.
		if (this.options.day == "2-digit" && this.options.month != undefined && this.options.month == "numeric") this.options.month = "2-digit";
		if (this.options.hour == "2-digit" && this.options.minute != undefined) this.options.minute = "2-digit";
		if (this.options.minute == "2-digit" && this.options.second != undefined) this.options.second = "2-digit";
		// Special options for month
		this.monthContext =  // the context for month may be 'format' or 'stand-alone'
				(this.options.day == null && this.options.year == null) ? 'stand-alone' : 'format';
		if (this.options.month != undefined) {
			this.monthWidth = "";
			switch (this.options.month) {	// analyse month asked option, deduct month display option
				case "numeric" : case "2-digit": this.monthWidth = "numeric"; break;
				case "narrow":	this.monthWidth = "narrow" ; break;
				case "short": this.monthWidth = "abbreviated"; break; 
				case "long" : this.monthWidth = "wide"; break;
			}
		}
		// Special options for days of week
		this.dayContext = (this.options.day == null && this.options.month == null && this.options.year == null) ? 'stand-alone' : 'format';
		// stringFormat "fields" option is only possible with a calendar that uses Roman months
		if (this.calendar != undefined && this.calendar.stringFormat == "fields") switch (this.calendar.canvas) {
			case "iso8601": case "gregory": case "buddhist": case "japanese": case "roc": break;
			default : throw new RangeError ("Canvas formatting implemented only from gregory-like built-in calendars: " + this.calendar.canvas);
		}
		// Exclude lunar calendar models as canvas - for now...
		if (this.calendar != undefined) switch (this.calendar.canvas) {
			case "chinese": case "dangi": case "hebraic" : throw new RangeError ("No canvas formatting from luni-solar calendars: " + this.calendar.canvas);
			default : ;
		}
	}	// end constructor
	static dateFieldNames = ["era", "year", "month", "day"]
	/** the resolved options for this object, that slightly differ from those of Intl.DateTimeFormat.
	 * @return (Object) the options revised to reflect what will be provided. eraDisplay is also resolved.
	*/
	resolvedOptions() { 
		return this.options
	}
	/** Should era be displayed for a given date in reference calendar ? manage eraDisplay option.
	*/
	displayEra (aDate) {	// Should era be displayed for this date, with these calendar and options ?
		let date = new ExtDate(this.calendar, aDate.valueOf());
		switch (this.options.eraDisplay) {
			case "never" : return false;
			case "always": return true;
			case "auto":
				if ((this.options.year == null && this.options.era == null)	// Neither year option nor era option set
					|| (this.calendar != undefined && this.calendar.eras == null))		// this calendar has no era whatsoever
					return false;
				var today = new ExtDate(this.calendar);
				if (this.calendar == undefined) {	// a built-in calendar, let us just compare with a particular formatting - with Temporal, this part of code is cancelled
					let eraFormat = new Intl.DateTimeFormat ( this.options.locale, { calendar : this.options.calendar, year : "numeric", era : "short" } ),
						dateParts = eraFormat.formatToParts(date),
						todaysParts = eraFormat.formatToParts(today);
						let eraIndex = dateParts.findIndex(item => item.type == "era");
						if (eraIndex >= 0) return !(dateParts[eraIndex].value == todaysParts[eraIndex].value);
						return false; // no era part was found... answer no because no era part 
				}
				else 	// a custom calendar with era, simplier to use
					return this.calendar.fieldsFromCounter(date.toResolvedLocalDate(this.options.timeZone).valueOf()).era 
						!= this.calendar.fieldsFromCounter(today.toResolvedLocalDate (this.options.timeZone).valueOf()).era ;
		}
	}
	/** Fetch a value from a Private Locale Date Registry (pldr)
	 * @param (String) - name of the element (era / month / dayofweek)
	 * other parameters are linked to this.
	*/
	pldrFetch (name,options,value) {	// return string value to insert to Parts
		const weekdaytypes = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
		let selector = "", Xpath1 = "", node = {}, result = "";
		switch (name) {
			case "era" :	// analyse era options here since at construction it is not known whether era shall be displayed
				switch (options) { 
					case "long" : selector = "eraNames"; break;
					case "short": selector = "eraAbbr"; break;
					case "narrow":selector = "eraNarrow"; break;
				}
				Xpath1 = "/pldr/ldmlBCP47/calendar[@type='"+this.calendar.id+"']/eras/"+selector
					+"']/era[@type="+value+ "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				result = node.stringValue;
				// language specific ?
				Xpath1 = "/pldr/ldml/identity/language[@type='"+this.lang
					+"']/../calendar[@type='"+this.calendar.id+"']/eras/"+selector
					+"']/era[@type="+value+ "]",
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				if (node.stringValue != "") result = node.stringValue; // If found, replace international name with language specific one.
				return result; break;
			case "month": 	// this.monthWidth may be initiated with month being numeric.
				Xpath1 = "/pldr/ldmlBCP47/calendar[@type='"+this.calendar.id+"']/months/monthContext[@type='"+this.monthContext
					+"']/monthWidth[@type='" + this.monthWidth
					+"']/month[@type="+ value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				result = node.stringValue;
				// Search if a language specific name exists
				Xpath1 = "/pldr/ldml/identity/language[@type='"+this.lang
					+"']/../calendar[@type='"+this.calendar.id+"']/months/monthContext[@type='"+this.monthContext
					+"']/monthWidth[@type='" + this.monthWidth
					+"']/month[@type=" + value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				if (node.stringValue != "") result = node.stringValue; // If found, replace international name with language specific one.
				if (result == "")		// no result obtained, give a number, or a 2-digit number if this option is set.
					result = options == "2-digit" ? this.figure2.format(value) : this.figure1.format(value);
				return result;
				break;
			case "weekday": 
				switch (options) {
					case "long" : selector = this.dayContext == "format" ? "wide" : "wide"; break;
					case "short": selector = this.dayContext == "format" ? "abbreviated" : "short"; break;
					case "narrow":selector = this.dayContext == "format" ? "short" : "narrow"; break;
				}
				Xpath1 = "/pldr/ldmlBCP47/calendar[@type='"+this.calendar.id+"']/days/dayContext[@type='"+this.dayContext
					+"']/dayWidth[@type='"+selector
					+"']/day[@type="+weekdaytypes[value] + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				result = node.stringValue;
				// Search if a language specific name exists
				Xpath1 = "/pldr/ldml/identity/language[@type='"+this.lang
					+"']/../calendar[@type='"+this.calendar.id+"']/days/dayContext[@type='"+this.dayContext
					+"']/dayWidth[@type='"+selector
					+"']/day[@type="+weekdaytypes[value] + "]",
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				if (node.stringValue != "") result = node.stringValue; // If found, replace international name with language specific one.
				return result; break;
		}
	}
	/** Extend FormatToParts method
	 * @param (Object) the date to be displayed
	 * @return (Array of Object) like the Intl.DateTimeFormat, but enhanced
	*/
	formatToParts (aDate) {	
		// Prepare parameters
		let	date = new ExtDate (this.calendar, aDate),
			options = {...this.options},
			displayEraOfDate = this.displayEra(date); // should Era for this date be displayed
			//DTFOptions = {...this.DTFOptions}, // a copy, with era option set to some value if eraDisplay != "never"

		if (!displayEraOfDate) delete options.era // Alas, this is not enough
		else if (options.era == null) options.era = "short";

		// Determine the date fields (the Temporal Date numeric + era code elements) using UTC representation of expected date
		let myAbsoluteDate = new ExtDate (this.calendar,date.toResolvedLocalDate (options.timeZone).valueOf()), // this the absolute date to print in UTC.
			myDateFields,
			myParts = new Intl.DateTimeFormat(options.locale, options).formatToParts(date), // first try, in desired language and timeZone
			myPartsTZ = myParts.find (item => (item.type == "timeZoneName")),
			myTZ = (myPartsTZ != undefined) ? myPartsTZ.value : null;	// Remember Time zone name since we compute on UTC date values.
		if (this.calendar != undefined) {
			myDateFields = this.calendar.fieldsFromCounter (myAbsoluteDate.valueOf()); // the fields of the date in the calendar, not TZ-dependant.
			try {
				Object.assign(myDateFields, this.calendar.weekFieldsFromCounter (myAbsoluteDate.valueOf()));	// Add week-related fields, including "weekday".
			}
			catch (e) {}	// week fields may not have been implemented. 
		}
		if (this.calendar != undefined && this.calendar.stringFormat == "fields") {	// order of parts is OK, but parts should be computed from fields. Week is considered OK. canvas calendar is Roman.
			options.timeZone = "UTC";
			let myCanvasFields = {...myDateFields};
			let shiftDate = new Date (myAbsoluteDate.valueOf());
			shiftDate.setUTCFullYear(myDateFields.fullYear, myCanvasFields.month-1, 1); // desired year and month, day set to 1.
			let myDOWPart = new Intl.DateTimeFormat(options.locale, {calendar : options.calendar, weekday : options.weekday, timeZone : "UTC" }).format(myAbsoluteDate);
			myParts = new Intl.DateTimeFormat(options.locale, options).formatToParts(shiftDate); // desired month, day = 1.
			// Now put week day, day, and time zone name for these calendars
			if (myParts.findIndex( (item) => item.type == "weekday") >=0 ) myParts.find( (item) => item.type == "weekday").value = myDOWPart;
			if (myParts.findIndex( (item) => item.type == "day") >=0 ) 
				myParts.find( (item) => item.type == "day").value 
					= options.day == "2-digit" ? this.figure2.format(myDateFields.day) : this.figure1.format(myDateFields.day);
			if (myTZ != null) myParts.find (item => (item.type == "timeZoneName")).value = myTZ;
			//if (myParts.findIndex( (item) => item.type == "year") >=0 ) myParts.find( (item) => item.type == "year").value = ""+(myDateFields.year); // the "original" year
			//if (myParts.findIndex( (item) => item.type == "era") >=0 ) myParts.find( (item) => item.type == "era").value = ""+(myDateFields.era); // the coded era
			
		}
		if (this.calendar != undefined && this.calendar.partsFormat != undefined) {
			// some ICU computations have to be anticipated here
			myParts.forEach( function (item, i) { 
				if (this.calendar.partsFormat[item.type] != undefined ) switch (this.calendar.partsFormat[item.type].mode){
					case "cldr" : break; // already computed
					case "field" : myParts[i].value = myDateFields[item.type] == undefined ? "" : myDateFields[item.type] ; break; // insert field directly, blank if undefined
					case "list" : switch (item.type) {
						case "era" : myParts[i].value = this.calendar.partsFormat[item.type].source[this.calendar.partsFormat[item.type].codes.indexOf(myDateFields[item.type])];
							break;
						case "month": switch (options.month) {
							case "2-digit" : myParts[i].value = this.figure2.format(myDateFields.month); break;
							case "numeric" : myParts[i].value = this.figure1.format(myDateFields.month); break;
							default : myParts[i].value = this.calendar.partsFormat[item.type].source[myDateFields[item.type]-1]
						}; break;
						case "weekday" : myParts[i].value = this.calendar.partsFormat[item.type].source[myDateFields[item.type]-1]; break;
						default : // other fields are numeric, not subject to lists;
					} break;
					case "pldr" : 		// fake ICU computations using pldr. 
						//	myInitialParts = {...myParts}; // Initial code was nested the reverse way.
						// myParts = myInitialParts.map ( ({type, value}) => { // .map may not map to itself
						switch (item.type) {
							case "era": myParts[i].value = this.pldrFetch ("era",options.era,
								this.calendar.eras.indexOf(myDateFields[item.type])); break;
							case "year": switch (options.year) {
								case "2-digit" : // Authorised only if displayed year is strictly positive, and with a quote.
									myParts[i].value = (myDateFields.year > 0) ? ("'" + this.figure2.format(myDateFields.year % 100)) : this.figure1.format(myDateFields.year);
									break;
								case "numeric" : myParts[i].value = this.figure1.format(myDateFields.year); 
								}
								break;
							case "month" : 
								myParts[i].value = this.pldrFetch ("month", options.month, (myDateFields.month)); 
								break;
							case "day": switch (options.day) {
								case "2-digit" : myParts[i].value = this.figure2.format(myDateFields.day); break;
								case "numeric" : myParts[i].value = this.figure1.format(myDateFields.day); break;
								} 
								break;
							case "weekday": 
								myParts[i].value = pldrFetch ("weekday", options.weekday, date.dayOfWeek); break;
							case "hour": switch (options.hour) {
								case "numeric" :	// This option is often tranformed in 2-digit with ":" separators, force to individual printing
									let ftime = new Intl.DateTimeFormat (options.locale, {timeZone : options.timeZone, hour : "numeric", timeZoneName : "short"}),
										tparts = ftime.formatToParts(myAbsoluteDate), tindex = tparts.indexOf ( (item) => item.type == "hour" );
									myParts[i].value = this.figure1.format(tparts[tindex].value); 
									break;
								case "2-digit": break;	// do nothing, formatting already done.
								}
								break;
							case "minute": switch (options.minute) {
								case "numeric" :	// This option is often tranformed in 2-digit with ":" separators, force to individual printing
									let ftime = new Intl.DateTimeFormat (options.locale, {timeZone : options.timeZone, minute : "numeric", timeZoneName : "short"}),
										tparts = ftime.formatToParts(myAbsoluteDate), tindex = tparts.indexOf ( (item) => item.type == "minute" );
									myParts[i].value = this.figure1.format(tparts[tindex].value); 
									break;
								case "2-digit": break;	// do nothing, formatting already done.
								}
								break;
							case "second": switch (options.second) {
								case "numeric" :	// This option is often tranformed in 2-digit with ":" separators, force to individual printing
									let ftime = new Intl.DateTimeFormat (options.locale, {timeZone : options.timeZone, second : "numeric", timeZoneName : "short"}),
										tparts = ftime.formatToParts(myAbsoluteDate), tindex = tparts.indexOf ( (item) => item.type == "second" );
									myParts[i].value = this.figure1.format(tparts[tindex].value);
									break;
								case "2-digit": break;	// do nothing, formatting already done.
								}
								break;
							default : throw new RangeError ("Unknown date field: " + item.type);
							}	// End of switch on item.type
						break;	// End of "pldr" case
						}	// End of switch on (this.calendar.partsFormat[item.type].mode)
			} 		// end of forEach function body
			,this);	// Inside the function, this should be the same as here
		}	// End of if (this.calendar.partsFormat != undefined)
		// Erase 2-digit effects on numeric-asked fields, not including related literals.
		// This operation is only done if language is not right-to-left written.
		if (!["ar","fa","he","ji","ug","ur","yi"].some (item => item == this.options.locale.substring(0,2),this)) {
			myParts.forEach ( function (item, i) {
				if (options[item.type] != undefined && options[item.type] == "numeric")	{	// Intl.DateTimeFormat often converts to 2-digit and inserts literals
					if (!isNaN(myParts[i].value)) myParts[i].value = this.figure1.format(item.value);
					switch (item.type) {
						// case "month" : case "day" : if (i+1 < myParts.length && myParts[i+1].value != ' ') myParts[i+1].value = ' '; break; // pb with month before year
						case "hour" : case "minute" : if (i+1 < myParts.length && [":","."].includes(myParts[i+1].value)) 
															myParts[i+1].value = item.type == "hour" ? " h " : " min "; break;
						case "second" : if (i+1 < myParts.length) { if (myParts[i+1].value == " ") myParts[i+1].value = " s " }
										else myParts.push({ type : "literal", value : " s"} );
					}
				}
			},this)
		}
		// suppress era part if required
		if (!displayEraOfDate) {
			let n = myParts.findIndex((item) => (item.type == "era")), nn = n;
			if (n >= 0) { // there is an undesired era section, check whether there is an unwanted literal connected to it
				nn = nn > 0 ? nn-- : nn++ // nn is index of era part neighbour.
				if (myParts[nn].type == "literal") myParts.splice (Math.min(n,nn),2) // Suppress era part and its neighbour
				else myParts.splice (n,1); 
			}
		}
	return myParts
	}
	/** format, from computed parts.
	 * @param (Object) the date to display
	 * @return (string) the string to display
	*/
	format (date) {
		let parts = this.formatToParts (date); // Compute components
		return parts.map(({type, value}) => {return value;}).reduce((buf, part)=> buf + part, "");
	}
}
