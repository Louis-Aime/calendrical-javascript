/* chronos.js: Basic functions for calendrical computations
Character set is UTF-8
Contents: 
 * Milliseconds: a const object, with counts in ms of basic time units from second to day.
 * Cbcce (ex Chronos): a class that implements the Cycle-Based Calendrical Computations Engine to convert a timestamp to or from a date.
 * WeekClock: a class that yields week figures for a specified week structure.
 * IsoCounter: a class for converting an ISO 8601 date to or from any integer or decimal day counter, whose zero value is the ISO date specified at instantiation.
*/
/* General note
	All parameters should be integer numbers. In order to increase efficiency, almost no check is done. 
	Any NaN parameter will yield NaN values.
	Non-integer parameter will yield erroneous non-integer values.
	Default parameters assume that computations are done using 1 for the first month of any calendar.
*/
/* Version	M2021-07-23	
		Compute a date stamp from week fields
		Class Chronos changed to Cbcce
		Add control of missing or invalid fields in Cbcce
	M2021-05-13	Errors are defined in-line, not as generic objects; Suppress numeric type error check.
	M2021-05-22	Use built-in operator for div and modulo
	M2021-01-19	fix Reference Error in IsoCounter.toIsoFields
	M2021-01-09, new version with no backward compatibility
		Collect conversion coefficients in a separate Milliseconds object
		Collect week computations in a separate class, fix a bug for non-regular week system
		Design a class for conversion between ISO and day counter since any epoch
		First month of ISO fields is always 1
		Comment line at end of file for module version
	M2020-12-27 no export to facilitate scripting
	M2020-12-08 use export
	M2020-11-24 add two cases of irregular week cycles, add notification of special cycle e.g. leap year etc. in Cycle Base Calendrical Computation Engine
	M2020-11-22 enhance comments
	M2020-11-12 enhance week rules
	M2020-11-09 enhance
	M2020-11-03 first established as a class
	Sources: Miletus CBCCE 2017-2020 (define the main algorithm, still unchanged)
		Suppress shiftYearStart as method, shiftCycle is enough
		Add const JulianDayIso: convert ISO dates from and to integer Julian Day
*/
/* Copyright Miletus 2016-2021 - Louis A. de Fouquières
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
/** Basic units in milliseconds 
*/
export const Milliseconds = {	// Basic durations in milliseconds
	DAY_UNIT : 86400000,
	HOUR_UNIT : 3600000,
	MINUTE_UNIT : 60000,
	SECOND_UNIT : 1000
}
/** Instantiate Cbcce for calendar specific computations. Class parameter is a single object that represent the calendar's cycle structure.
 * @param (Object)	calendRule:  the cycle structure and intercalation rules of the calendar. Example hereunder:
	 * Example = {
	 *	timeepoch : #, // origin date or time stamp in elementary units (days, milliseconds...) to be used for the decomposition, with respect to instant 0
	 *	coeff : [ // Array of coefficients used to decompose a time stamp into time cycles like eras, quadrisaeculae, centuries, ... down to the elementary unit.
	 * 		{cyclelength : #, 	// length of the cycle, in elementary units.
	 *		ceiling : #, 		// Infinity, or the maximum number of cycles of this size minus one in the upper cycle; 
	 *							// the last cycle may hold an intercalation remainder up to the next level,
	 *							// example: this level is year of 365 days, upper level is 1461 days i.e. the last year holds more than 365 days.
	 *		subCycleShift : #, 	// number (-1, 0 or +1) to add to the ceiling of the cycle of the next level when the ceiling is reached at this level;
	 *							// to be used for common/embolismic years in a Meton cycle, or for 128-years cycles of 4 or 5 years elementary cycles.
	 *		multiplier : #, 	// multiplies the number of cycles of this level to convert into target units.
	 *		target : #, 		// the unit (e.g. "year") of the decomposition element at this level. 
	 *		notify : #, 		// optional, the field (e.g. "leapyear") where to indicate that the element's length is "singular" (i.e. not "common"). 
	 *		} ,					// end of cycle description
	 *		{ 		// similar elements at a lower cycle level 
	 *		} 		// end of cycle description
	 *	], // End of this array, but not end of object
	 *	canvas : [ // this last array is the canvas of the decomposition , e.g. "year", "month", "day", with suitable properties at each level.
	 *		{ name : #,	// the name of the property at this level, which must match one target property of the coeff component,
	 *		init : #, 	// value of this component at epoch, which is the lowest value (except for the first component), 
	 *					// e.g. 0 or 1 for month, 1 for date, 0 for hours, minutes, seconds.
	 *		} // End of array element (only two properties)
	 *	] // End of second array
	 * }	// End of object.
 * Non checked constraints: 
 *	1. 	The cycles and the canvas elements shall be defined from the largest to the smallest
 *		e.g. four-century, then century, then four-year, then year, etc.
 *	2. 	The same names shall be used for the "coeff" and the "canvas" properties, otherwise functions shall give erroneous results.
 *	3.	canvas.month.init is defined, it is the number of the first month in the year (0 with Date, 1 with Temporal)
*/
export class Cbcce 	{	// Essential calendrical computations tools, including the Cycle Based Calendrical Computation Engine (CBCCE)
	constructor (calendRule) {
		this.calendRule = calendRule;
	}
	/** modulo function for calendrical computations. It is recommended to use only integer arguments
	 * @param (number) a: dividend, integer.
	 * @param (number) d: divisor, integer. If 0, result shall be NaN
	 * @return (number) modulo of a divided by d, with 0 <= modulo < d or d < modulo <= 0
	*/
	static mod (a, d) {		
		return ( a*Math.sign(d) >= 0 ? a % d : (a % d + +d) % d)
	}
	/** division with modulo for calendrical computations
	 * @param (number) a: dividend; integer recommended.
	 * @param (number) d: divisor; integer recommended.
	 * @return (Array) [quotient, modulo] with 0 <= modulo < d or d < modulo <= 0.
	*/
	static divmod (a, d) {	
		if (d >=0) {
			let quotient = Math.floor (a/d);
			return [ quotient, a - d * quotient ]
		}
		else if (d < 0) { return Cbcce.divmod (-a, -d).map (x => -x) }
		else { return [NaN, NaN] }
	}
	/** Cycle start shifting, keeping phase measure. Example : (20, 1) shifted by 2 in a 12-cycle with base 1 yields (19, 13), but (20, 6) yields (20, 6)
		This operation is used for calendrical computations on Julian-Gregorian calendars (shift year start to March), but also for computations on weeks.
	 * @param (number) cycle: the rank of cycle, which is increased by 1 each time 'phase' reaches (mod (cycleBase, period))
	 * @param (number) phase: indicates the phase within the cycle, e.g. for the month or the day of week. (phase == cycleBase) means the start of a new cycle.
	 * @param (number) period: the cycle's period, typically 12 or 7 for calendrical computations, but may also be the moon's month mean duration in milliseconds.
	 * @param (number) shift: the number of units for shifting. After shifting, cycleBase is cycleBase + shift.
	 * @param (number) cycleBase: which phase is that of a new cycle, in the parameter [cycle, phase] representation. O by default (like month representation with Date objects).
	 * @return (Array) [returnCycle, returnPhase] with: (returnCycle * period + returnPhase == cycle * period + phase) && (shift + cycleBase) <= returnPhase < (shift + cycleBase)+period
	*/
	static shiftCycle (cycle, phase, period, shift, cycleBase=0) {
		// if (Array.from(arguments).some(isNaN)) throw new TypeError ("Non numeric value among arguments: " + Array.from(arguments).toString()); 
		if (phase < cycleBase || phase >= cycleBase + period) throw new RangeError 
			("Phase out of range: " + cycleBase + " <= " + phase + " < " + (cycleBase + period)); //Cbcce.cycleShifting;
		return Cbcce.divmod (cycle * period + phase - cycleBase - shift, period).map
				((value, index) => (index == 1 ? value + cycleBase + shift : value) )
	}
	/** Whether a year is a leap year in the Julian calendar, with the year origin Anno Domini as defined by Dionysius Exiguus in the 6th century. 
	 * @param (number) a signed integer number representing the year. 0 means 1 B.C. and so on. Leap years, either positive or negative, are divisible by 4.
	 * @return (boolean) true if year is a leap year i.e. there is a 29 February in this year.
	 */
	static isJulianLeapYear (year) {
		return Cbcce.mod (year, 4) == 0
	}
	/** Whether a year is a leap year in the Gregorian calendar, with the year origin Anno Domini as defined by Dionysius Exiguus in the 6th century. 
	 * @param (number) a signed integer number representing the year. 0 means 1 B.C. Leap years, are either not divisible by 100 but by 4, or divisible by 400.
	 * @return (boolean) true if year is a leap year i.e. there is a 29 February in this year.
	 */
	static isGregorianLeapYear (year) {
		return Cbcce.mod (year, 4) == 0 && (Cbcce.mod(year, 100) != 0 || Cbcce.mod(year, 400) ==0)
	}
	/** Build a compound object from a time stamp holding the elements as required by a given cycle hierarchy model.
	 * @param {number} askedNumber: a time stamp representing the date to convert.
	 * @returns {Object} the calendar elements in the structure that calendRule prescribes.
	*/
	getObject (askedNumber) {
	  let quantity = askedNumber - this.calendRule.timeepoch; // set at initial value the quantity to decompose into cycles.
	  var result = new Object(); // Construct initial compound result 
	  for (let i = 0; i < this.calendRule.canvas.length; i++) 	// Define property of result object (a date or date-time)
		Object.defineProperty (result, this.calendRule.canvas[i].name, {enumerable : true, writable : true, value : this.calendRule.canvas[i].init}); 
	  let addCycle = 0; 	// flag that upper cycle has one element more or less (i.e. a 5 years franciade or 13 months luni-solar year)
	  for (let i = 0; i < this.calendRule.coeff.length; ++i) {	// Perform decomposition by dividing by the successive cycle length
		if (isNaN(quantity)) 
			result[this.calendRule.coeff[i].target] = NaN	// Case where time stamp is not a number, e.g. out of bounds.
		else {	// Here we make the suitable Euclidian division, with ceiling.
			let ceiling = this.calendRule.coeff[i].ceiling + addCycle,
				[q, m] = Cbcce.divmod (quantity, this.calendRule.coeff[i].cyclelength);
			if (q > ceiling) {
				if ( q > ceiling + 1 ) throw new RangeError 
					("Unsuitable quotient in ceiled division: " + quantity + " by " + this.calendRule.coeff[i].cyclelength + " ceiled with " + ceiling);
				--q;
			}
			quantity -= q * this.calendRule.coeff[i].cyclelength;
			addCycle = (q == ceiling) ? this.calendRule.coeff[i].subCycleShift : 0; // if at last section of this cycle, add or subtract 1 to the ceiling of next cycle
			if (this.calendRule.coeff[i].notify != undefined) result[this.calendRule.coeff[i].notify] = (q == ceiling); // notify special cycle, like leap year etc. 
			result[this.calendRule.coeff[i].target] += q*this.calendRule.coeff[i].multiplier; // add result to suitable part of result array
		}
	  }	
	  return result;
}
	/** Compute the time stamp from the element of a date in a given calendar.
	 * @param {Object} askedObject: the numeric elements of the date, collected in an object containing the elements that calendRule prescribes.
	 * @param {Object} this.calendRule: the representation of the calendar structure and its connection to the time stamp.
	 * @returns {number} the time stamp
	*/
	getNumber (askedObject) { // from an object askedObject structured as calendRule.canvas, compute the chronological number
		var cells = {...askedObject}, quantity = this.calendRule.timeepoch; // initialise Unix quantity to computation epoch
		for (let i = 0; i < this.calendRule.canvas.length; i++) { // cells value shifted as to have all 0 if at epoch
			cells[this.calendRule.canvas[i].name] -= this.calendRule.canvas[i].init;
			if (isNaN (cells[this.calendRule.canvas[i].name])) throw new TypeError ('Missing or invalid expected field ' + this.calendRule.canvas[i].name);
		}
		let currentTarget = this.calendRule.coeff[0].target; 	// Set to uppermost unit used for date (year, most often)
		let currentCounter = cells[this.calendRule.coeff[0].target];	// This counter shall hold the successive remainders
		let addCycle = 0; 	// This flag says whether there is an additional period at end of cycle, e.g. a 5th year in the Franciade or a 13th month
		for (let i = 0; i < this.calendRule.coeff.length; i++) {
			if (currentTarget != this.calendRule.coeff[i].target) {	// If we go to the next level (e.g. year to month), reset variables
				currentTarget = this.calendRule.coeff[i].target;
				currentCounter = cells[currentTarget];
			}
			let ceiling = this.calendRule.coeff[i].ceiling + addCycle;	// Ceiling of this level may be increased 
																// i.e. Franciade is 5 years if at end of upper cycle
			let [f,m] = Cbcce.divmod (currentCounter,this.calendRule.coeff[i].multiplier);
			if (f > ceiling) {
				if ( f > ceiling + 1 || m != 0 ) {
					throw new RangeError 
					("Unsuitable quotient in ceiled division: " + currentCounter + " by " + this.calendRule.coeff[i].multiplier + " ceiled with " + ceiling);
					};
				--f;
			}
			currentCounter -= f * this.calendRule.coeff[i].multiplier;
			addCycle = (f == ceiling) ? this.calendRule.coeff[i].subCycleShift : 0;	// If at end of this cycle, the ceiling of the lower cycle may be increased or decreased.
			quantity += f * this.calendRule.coeff[i].cyclelength;				// contribution to quantity at this level.
		}
		return quantity ;
	}
} // end of Cbcce class
/**Week clock: get week figures using different reckoning sytems for weeks
 * @param (Object)	weekdayRule: set of parameters for the computation of week elements
	 * (number, required) originWeekday: weekday number of day index 0. Value is renormalised to 0..weekLength-1.
	 * (function, required) daysInYear: function (year), number of days in year. year is specified as "fullyear" (unambiguous). 
		With solar calendars, result is 365 or 366.
	 * (function, required) characDayIndex: function (year): the day index of one day of characWeekNumber of year.
		if weekReset is true, this day shall be the first day of the week charcWeekNumber. If not, all weeks are of same length.
	 * (number) startOfWeek: number of the first day of the week for this calendar, e.g. 0 for Sunday, 1 for Monday etc. Default is 1. 
		Value is renormalised to 0..weekLength-1.
	 * (number) characWeekNumber: number of the week of the characDayIndex. Default is 1.
	 * (number) dayBase: number of the first day in any week. May differ from startOfWeek. Used for displaying result. Default is 1.
	 * (number) weekBase: number of the first week in any year. May differ from characWeekNumber. Default is 1.
	 * (number) weekLength: minimum number of days in one week. Default is 7.
	 * (boolean) weekReset: whether weekday is forced to a constant value at beginning of year. Default is false.
	 * (Array) uncappedWeeks: an array of the numbers of the week that have one or more day above weekLength. Possible cases:
		 undefined (and set to null): all weeks have always the same duration, weekLength.
		 .length = 1: last complete week of year is followed by several epagomenal days. These days are attached to the last week and hold numbers above weekLength
		 .length > 1: each week indentified is followed by one (unique) epagomenal day. Any such week has weekLength + 1 days.
		 e.g. for French revolutionary calendar: [36], and the days are indexed indexed 10 to 15 (index of Décadi is 9);
		 whereas for ONU projected calendar: [26, 52], the Mondial day in the middle of year and the Bissextile day at the very end.
		 These days are only considered if weekReset is true, and in this case, uncappedWeeks should at least have one value.
 * Non checked constraints: 
 * 1. characWeekNumber shall be at beginning of year, before any intercalary month or day.
 * 2. weekLength shall be > 0
*/
export class WeekClock {
	constructor (weekdayRule) {
		this.originWeekday = weekdayRule.originWeekday;
		this.daysInYear = weekdayRule.daysInYear;
		this.characDayIndex = weekdayRule.characDayIndex; 
		this.weekLength = weekdayRule.weekLength != undefined ? weekdayRule.weekLength : 7 ;
		this.startOfWeek = weekdayRule.startOfWeek != undefined ? Cbcce.mod (weekdayRule.startOfWeek, this.weekLength) : 1 ;
		this.characWeekNumber = weekdayRule.characWeekNumber != undefined ? weekdayRule.characWeekNumber : 1 ;
		this.dayBase = weekdayRule.dayBase != undefined ? Cbcce.mod (weekdayRule.dayBase, this.weekLength) : 1 ;
		this.weekBase = weekdayRule.weekBase != undefined ? weekdayRule.weekBase : 1; 
		this.weekReset = weekdayRule.weekReset != undefined ? weekdayRule.weekReset : false;
		this.uncappedWeeks = weekdayRule.uncappedWeeks != undefined ? weekdayRule.uncappedWeeks : null;
	}
	/**	Compute week figures in the defined week structure
	 * @param (number) dayIndex : day stamp, in day unit, of the day whose figures are computed
	 * @param (number) characDayIndex : day stamp of the characteristic day, the day that belongs to week number characWeekNumber in same year
	 * @param (number) year : the relative year the dayIndex date belongs to
	 * @return (Array) 
		0 : week number
		1 : week day number, depending on dayBase. Modulo this.weekLength value is always : 0 (or this.weekLength) for Sunday of first day, 1 for Monday etc.
		2 : year offset: -1 if week belongs to last week year, 0 if in same year, 1 if in next year.
		3 : weeks in year: number of weeks for the week year the date belongs to. This is not always the number of the last week (check this.weekBase)!
	*/
	getWeekFigures (dayIndex, year) {	// (dayIndex, characDayIndex, year)
		let cDayIndex = this.characDayIndex (year),
			weekNumberShift = this.weekBase - 1, 	// used to compute last week's number
			[weeksInYear, weekShiftNextYear] = Cbcce.divmod (this.daysInYear(year), this.weekLength),	// Integer division of calendar year in weeks. 
			// this figure characterises the week year, in particular versus number of weeks.
			weekYearPhase = (this.weekReset ? 0 : Cbcce.mod (cDayIndex + this.originWeekday - this.startOfWeek, this.weekLength)); 	
		// Compute basic coordinates: week cycle number (base 0) from referenceDay, day number 0..this.weekLength-1 in week beginning at 0 then shift to this.startOfWeek.
		var result = Cbcce.divmod ( dayIndex - cDayIndex + this.startOfWeek + weekYearPhase, this.weekLength ); // Here, first week is 0 and first day of week is 0.
		if (this.uncappedWeeks != null && this.uncappedWeeks.length > 1) 	// one or several weeks with one epagomenal days within year. One epagomenal day per singular week.
			 this.uncappedWeeks.forEach (item => {if (result[0] > item) {
				result[1]--; result = Cbcce.divmod (result[0] * this.weekLength + result[1], this.weekLength) }})	// shift week counts by one day for each singular week.
		result[0] += this.characWeekNumber;		// set week number with respect to number of week of the reference day
		result = Cbcce.shiftCycle ( result[0], result [1], this.weekLength, this.startOfWeek );	// shift week cycle, first day is this.startOfWeek and last day is this.startOfWeek + this.weekLength-1
		if (this.dayBase != this.startOfWeek) result[1] = Cbcce.mod (result[1]-this.dayBase, this.weekLength) + this.dayBase;		// day number forced to range this.dayBase .. this.dayBase + this.weekLength-1;
		if (this.uncappedWeeks != null && this.uncappedWeeks.length == 1)
			if (result[0] > this.uncappedWeeks[0]) {result[0]-- ; result[1] += this.weekLength } // epagomenal days at end of year have indexes above ordinary weekLength
		// Solve overflow
		let WeeksInDateYear = weeksInYear + ( !this.weekReset && weekYearPhase >= Cbcce.mod (-weekShiftNextYear, this.weekLength) ? 1 : 0); // Number of weeks for present week year
		if (result[0] < this.weekBase) { // the week belongs to the preceding weekyear
			[weeksInYear, weekShiftNextYear] = Cbcce.divmod (this.daysInYear(year-1), this.weekLength);	// recompute week year parameters for preceding year
			result.push(-1,		// reference year for the week number is the year before the date's year
				Cbcce.mod (weekYearPhase - weekShiftNextYear, this.weekLength) >= Cbcce.mod (-weekShiftNextYear, this.weekLength)	// weekYearPhase of preceding year computed after this year's
					? weeksInYear + 1 : weeksInYear );	// Number of weeks in the preceding year
			result[0] = result[3] + weekNumberShift;	// Set to last week of preceding year
		} else if (result[0] > WeeksInDateYear + weekNumberShift) {	// The week belongs to the following year
			let [ weeksInYearPlus, weekShiftNextYearPlus ] = Cbcce.divmod (this.daysInYear(year+1), this.weekLength);	// Integer division of next calendar year in weeks
			result.push (1, 	// reference year for the week number is the year after the date's year
				Cbcce.mod (weekYearPhase + weekShiftNextYear, this.weekLength) >= Cbcce.mod (-weekShiftNextYearPlus, this.weekLength) 	// weekYearPhase cycle of next year computed from this year's
					?  weeksInYearPlus + 1 : weeksInYearPlus);		// Number of weeks in the next wwek year
			result[0] = this.weekBase;				// set to first week
		} else result.push (0, WeeksInDateYear); 	// most cases.
		return result;
	}
	/**	Compute day index from week figures in the defined week structure
	 * @param (number) year : the year (full year, a relative integer) of the week figures. There may be 1 year difference with the year of the calendar's date.
	 * @param (number) weekNumber : the number of the week, that follows the rules.
	 * @param (number) dayOfWeek : the number day of the week, following the weekdayRule parameter set.
	 * @return (number) dayIndex : day stamp, in day unit (not in milliseconds or other), of the day that corresponds to the week figures.
	*/
	getNumberFromWeek (weekYear, weekNumber = this.weekBase, dayOfWeek = this.dayBase, check = false) {
		if (weekNumber < this.weekBase) throw new RangeError ('Week number too low: ' + weekNumber);
		if (dayOfWeek - this.dayBase < 0) throw new RangeError ('Day of week to low: ' + dayOfWeek);
		let	cDayIndex = this.characDayIndex (weekYear);
		cDayIndex -= (this.weekReset ? 0 : Cbcce.mod ( cDayIndex + this.originWeekday - this.dayBase, this.weekLength )) ;
		let	result = cDayIndex + (weekNumber - this.weekBase) * this.weekLength + (dayOfWeek - this.dayBase) ;
		if (this.uncappedWeeks != null)  this.uncappedWeeks.forEach ((value) => ( result += (weekNumber > value ? 1 :0) )) ;
		// Control by doing the reverse computation
		let test = this.getWeekFigures (cDayIndex, weekYear);
		if (check) {
			if (test [3] < weekNumber) throw new RangeError ('Week number too high: ' + weekNumber);
			if (test [0] != weekNumber || test [1] != dayOfWeek) throw new RangeError
				('Recomputed week figures do not match asked ones: '+ weekYear + ', ' + weekNumber + ', ' + dayOfWeek);
		}
		return result;
	}
}
/** Convert number of days since epoch to or from a date expressed after ISO 8601.
* @param (number) the epoch year in ISO, a signed integer, default: 1970 for the Unix epoch.
* @param (number) the epoch month in ISO, a number in range 1..12, default: 1.
* @param (number) the epoch day of the month in ISO, a number in range 1..31, default: 1. If this day does not exist in this month, date is balanced to next month.
*/
export class IsoCounter { 
	constructor (originYear=1970, originMonth=1, originDay=1) {
		const 
			isoCoeff = [ 
			  {cyclelength : 146097, ceiling : Infinity, subCycleShift : 0, multiplier : 400, target : "isoYear"}, // 400 Gregorian years
			  {cyclelength : 36524, ceiling :  3, subCycleShift : 0, multiplier : 100, target : "isoYear"}, // 1 Gregorian short century
			  {cyclelength : 1461, ceiling : Infinity, subCycleShift : 0, multiplier : 4, target : "isoYear"}, // 4 Julian years
			  {cyclelength : 365, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "isoYear"}, // One 365-days year
			  {cyclelength : 153, ceiling : Infinity, subCycleShift : 0, multiplier : 5, target : "isoMonth"}, // Five-months cycle
			  {cyclelength : 61, ceiling : Infinity, subCycleShift : 0, multiplier : 2, target : "isoMonth"}, // 61-days bimester
			  {cyclelength : 31, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "isoMonth"}, // 31-days month
			  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "isoDay"}
			],
			isoCanvas = [ 
			  {name : "isoYear", init : 0},
			  {name : "isoMonth", init : 3}, // this.monthBase + 2
			  {name : "isoDay", init : 1}
			];
		// Compute counter of specified date as if it were since 0000-03-01
		this.clockwork = new Cbcce ({
			timeepoch : 0, // 0 on 0000-03-01.
			coeff : isoCoeff, canvas : isoCanvas
			})
		let shift = this.toCounter ( {isoYear: originYear, isoMonth: originMonth, isoDay: originDay} ); 
		// Then establish new clockwork taking the opposite value for epoch counter
		this.clockwork = new Cbcce ({
			timeepoch : -shift, // re-instatiated to the value that corresponds to the asked date
			coeff : isoCoeff, canvas : isoCanvas
			})
	}
	/** Compute day counter, an integer number for the date specified under ISO 8601.
	 * @param (Object): fields isoYear, isoMonth and isoDay must be specified as integer. isoMonth must lay in range 1..12 
		if day is out of range of valid days for the month, date is balanced to the number of days out of the range.
	 * @return (number): the counter, an integer number representing the date with the day counter.
	*/
	toCounter = function ( isoFields ) {
		let myFields = {...isoFields};
		// for missing fields: getNumber shall throw 
		[myFields.isoYear, myFields.isoMonth] = Cbcce.shiftCycle (isoFields.isoYear, isoFields.isoMonth, 12, 2, 1); // replace last parameter if monthBase 0 is required
		return this.clockwork.getNumber (myFields)
	}
	/** Compute ISO8601 date figures from a number of days since epoch.
	 * @param (number): the day counter, a counter representing a date. If not integer, the floor value is taken.
	 * @return (Object): fields isoYear, isoMonth and isoDay specify the date in ISO8601 calendar.
	*/
	toIsoFields = function ( counter ) {
		let myFields = this.clockwork.getObject (Math.floor (counter));
		[myFields.isoYear, myFields.isoMonth] = Cbcce.shiftCycle (myFields.isoYear, myFields.isoMonth, 12, -2, 3); // replace last parameter if monthBase 0 is required
		return myFields
	}
}
