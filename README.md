# calendrical-javascript
Basic routines in javascript for computations on calendars, including 
 * the Cycle Based Calendar Computation Engine
 * ExtDate and ExtDateTimeFormat, that extend Date and Intl.DateTimeFormat respectively
 * pldr, a "private locale data register" that extends Unicode's CLDR for display of dates in several calendars.
The software object anticipate the Temporal initiative of Ecma TC39.

## GitHub Page site for test and demos
https://louis-aime.github.io/calendrical-javascript/

## Basic toolkit
Routines that help developing calendrical computations for new calendars

### Chronos.js
The Chronos class offers common routines and tools for calendrical computations: 
 * Basic div and mod computations for calendrical purposes.
 * Basic computation of leap years for julian and gregorian calendars.
 * The Cycle Based Calendar Computation Engine: a general framework that enables you to deal will most calendars defined by an algorithm.
 * A procedure for computing week figures: day of week, week number, number of weeks in year, week year that includes a date
 * Key figures for converting milliseconds (used in present Javascript environment) into days, hours, minutes, seconds and the reverse
A second class enable conversion from Julian Day to iso8601 and the reverse.

The parameters for using these classes are described in details in the source. Examples are given in the file Calendars.js

### pldr.js
A "Private Locale Data Register", possible extension of Common Locale Data Register for custom calendars.

## Extension of Javascript objects

### DateExtended.js
This module enhances calendrical functions in JavaScript
* ExtDate object extends the Date object. You can use date elements with calendars that you define yourself.
* ExtDateTimeFormat extends the Intl.DateTimeFormat object. You can customize the way dates are displayed with new options and custom data.

## Calendars
With Chronos for the calendrical computations, and ExtDate for embedding in ordinary code, you can define custom calendars in a few lines. 
This file proposes examples of calendars that are missing in Unicode's tools.

### MilesianCalendar
A class specifies the Milesian calendar as defined at www.calendriermilesien.org.

### JulianCalendar
A class defines the Julian calendar.

### WesternCalendar
A class defines the calendar structure of most European countries: Julian calendar period, then switching to the Gregorian calendar. 
The author specifies the switching date at instatiation.

### frenchRevCalendar
The calendar used under the French revolution, with the week replaced by the decade. This version uses a specific solar intercalation algorithm.

### myEthiopic
The Unicode built-in Ethiopic calendar is tested here in order to better display eras.

## Using this package

### Chronos : class
#### Constructor (calendRule : object, weekdayRule : object)
The complete description of the parameters is available in Chronos.js. Calendars.js gives usage examples.
 * calendRule is a compound object that describes how to transform a counter into a compound object with date fields, and the reverse. The calendar should follow the integral postfix intercalation rule. The Roman (julian-gregorian) calendar follows this rule if the beginning of the year is shifted to 1 March.
 * weekdayRule is a compoungd object that summerizes the rules regarding weeks. Regular 7-days weeks are handled, as well as systems with epagomenal days: one or two epagomenal days in the year, or several epagomenal days at the end of the year.
#### static values
 * DAY_UNIT, HOUR_UNIT, MINUTE_UNIT, SECOND_UNIT : number of milliseconds in these units.
#### static errors
 * notANumber : error thrown when a non-numeric value is passed for a numeric field.
 * nonInteger : error thrown when a non-integer value is passed where an integer value is expected.
 * nonPositiveDivisor : error thrown by mod or divmod when the divisor is not strictly positive.
 * cycleShifting : error thrown by the shiftCycle static function if the phase parameter is out of range.
#### static functions
 * mod (a: number, b: number): number. The calendar modulo. b is strictly positive. Result is the positive remainder of the integer division a / b. This is not equal to a % b! Example: mod (-2,3) is 1.
 * divmod (a : number, b : number): array of numbers, [0] is integer quotient, [1] is positive remainder. Exmple: divmod (-2, 3) is [-1, 1].
 * shiftCycle (cycle, phase, period, shift, cycleBase=0), all numbers, period > 0, yields [cycle, phase]. Used for intermediate computations e.g. for the julian-gregorian calendar. [20, 1] shifted by 2 in a 12-cycle with base 1 yields [19, 13], but [20, 6] yields [20, 6]. You shift the calendar to March, but you keep the month numbers. On entry, phase shall be in the range cycleBase .. cycleBase + period - 1, else error cycleSHifting is thrown.
 * isJulianLeapYear (year: number): boolean. True if *year* is leap year under the Julian calendar's rule. *year* may be 0 or negative: -1 stands for 2 B.C. In shifting *year*, you may use this function for coptic and ethiopian calendars.
 * isGregorianLeapYear (year: number): boolean. True id *year* is a leap year under the Gregorian calendar's rule. *year* may be negative, as for iso8601. In shifting *year*, you use this function for any calendar that uses the Gregorian intercalation rule (derived from Gregorian, modern Indian, milesian...°.
#### methods
 * getObject (askedNumber): object with date fields obtained from the number with the Cycle Based Calendar Computation Engine. The number may be the Posix time stamp or any other counter that designates an instant, as specified in calendRule.
 * getNumber (askedObject): number. The reverse operation with respect to getObject.
 * geWeekFigures (dayIndex, characDayIndex, year): [week number, week day number, year offset, weeks in year]. *dayIndex* is the stamp of a day. It represents the day whose figures are computed. It is the number of a day, not a timestamp, e.g. divide the Posix timestamp by *Chronos.DAY_UNIT*. *characDayIndex* represents the day that always belongs to a week (generally # 1 week), in the *year*. Result is an array of numbers: [week number, week day number, year offset, number of weeks in this week year]. year offset is -1, 0 or 1; this figure should be added to *year* in order to get the *week-year* the date belongs to, which can be 1 before or after the date's year. The parameters for those computations build up the weekdayRule object.
### JulianDayIso : class
Instantiate Julian Day to Iso8601 date fields converters. 
#### constructor (monthBase)
 * *monthBase* is the number of the first month for the date's numeric fields, 0 (traditional with Date) or 1 (used in Temporal proposal with the remaining of this package).
#### methods
 * toJulianDay ( isoFields: object): number. *isoFields* shall hold the numeric fields *isoYear, isoMonth, isoDay,* the element of the date in ISO 8601, except for *isoMonth* that is in the range 0..11 if *monthBase*, the constructor's parameter is 0. returns the Julian Day, an integer number such as -004713-11-24, or Monday 1 Jan. 4713 B.C., is Julian Day 0.
 * toIsoFields (julianDay: number): object. The Julian Day is the integer number defined above. The returned objects holds the three fields described above.
 * toIsoWeekFields (julianDay: number) : object. The week figures for the date that *julianDay* represents
   * weekYearOffset: -1/0/1, figure to add to the date's year in order to get the weekyear. This figure may be e.g. -1 for a Friday 1 Jan, or +1 for a Wednesday 31 Dec.
   * weekNumber: the number of the week in the year under ISO 8601
   * weekday: 1 to 7 indicating Monday to Sunday
   * weeksInYear: the number of weeks (52 or 53) for this week year.

### Date.prototype.getRealTZmsOffset(): number
By exception, we have added a method to the traditional Date object's prototype.  
The result is the time offset between the system time and UTC, *in milliseconds*, not in minutes. This function is defined because there are discrepancies among navigators for the ***Date.prototype.getTimezoneOffset()*** function, when used for date before 1847 in UK or even later in most other countries.  
Since the time zone system was not yet in place, the offset is any number of seconds, not a simple fraction of hour. 
Chromium rounds up to the nearest integer number of minutes, whereas Firefox gives a fractional number of minutes.
This function computes the real offset in milliseconds in all cases.

### ExtDate: class
Extends the Date object with the flavour of Temporal proposal, using custom calendars. All method of the Date object are available.
#### constructor (calendar, otherArguments)
 * calendar is either a string that denotes a built-in calendar, or a custom calendar object; if undefined, "iso8601" is assumed
 * otherArguments is a list of arguments that are handled the same way as with Date.
  * if otherArguments is void, the time of call is returned;
  * if otherArguments is a string, it is interpreted as an ISO date expression;
  * if otherArguments is a sole number, it is interpretred as a timestamp, the number of milliseconds since Unix epoch;
  * if otherArguments is a list of several numeric arguments, they are interpreted as the date coordinates in ISO 8601 calendar.
However, in the last case, 
  * the first number is a *full year*, that is 14 means the year where Tiberius takes the power in Rome after Augustus' death, not the beginning of World War 1.
  * the second number is the month number in the range 1..12, not 0..11.
  * the missing arguments are replaced by 1 for the day and 0 for all other.
  * the date is always evaluated as a local date.
#### static objects
 * numericFields: an array of objects that have 2 keys: *name* is a string that holds the name of a numeric field; and *value^* is a number, the default value.
#### static errors
 * invalidDateFields: thrown if the value of a date field is not a number.
 * invalidOption: thrown if an option field bears an invalid value.
 * unimplementedOption: thrown if the value of an option cannot be handled in the context of the calendar or of other data.
#### static functions
 * fullUTC (fullYear, month, day, hour, minute, second, millisecond): number, all parameters are numbers. Set ExtDate object to the date specified by the parameters, deemed UTC (not local). This is very much like Date.UTC, except:
   * the year element is a full year, no 2-digit year is admitted;
   * the month element is in the range 1..12.
#### methods
 * getRealTZmsOffset (TZ:string): number;
  * if TZ is undefined or "", same as Date.prototype.getRealTZmsOffset();
  * else, TZ is considered the name of a time zone; the time offset in millisecond for this time zone at this date is returne. 
 * toResolvedLocaleDate (TZ: string): ExtDate object. TZ is the name of a time zone. The method returns a Date object whose UTC field values correspond to the present date at the time zone. If TZ is not identified, the system local date is returned.
In the next functions, the TZ parameter is either undefined or equal to ""; or equal to "UTC". The other parameters or results are evaluated at the system local time zone, or at UTC time zone respectively.
The time stamp is the number of milliseconds since Unix epoch (1 Jan. 1970 00:00 h UTC)
 * getFields (TZ): object. The fields of the date, in the associated custom calendar. The corresponding time stamp is returned.
 * getISOFields (TZ): object. The fields of the date in the ISO 8601 calandar.
 * setFromFields (TZ): number. Set the ExtDate object to the date expressed by the fields in the associated calendar. The corresponding time stamp is returned.
 * inLeapYear (TZ): whether the year of the date in the associated calendar is a leap year.
 * toCalString (TZ): a string that expresses the date in the corresponding calendar. The string begins with [<calendarname>].
  * fullYear (TZ): the full year, an unambiguous signed integer that expresses the year with respect to the first "year 0" for this calendar.
  * era(TZ), year(TZ), month(TZ), day (TZ): the respective field in the associated calendar.
The time elements can be obtained by the standard Date methoe getHours(), getUTCHours(), etc.
  * weekday (TZ): a number that expresses the day of week of this date, for the week associated with the calendar, e.g. for the French revolutionnary calendar, the number is in the range 1..16, i.e. 1..10 for Unedi to Decadi, 11 to 16 for the six sansculottides days. With the 7-days week, the number is in the range 1 (Monday) to 7 (Sunday).
 * weekNumber (TZ): the number of the week following the calendar's rule
 * weeksInYear (TZ): the number of weeks in this year  following the calendar's rule.
 * fullWeekYear (TZ): unambiguous signed number of the year the numbered week for this date belongs to.
 
### ExtDateTimeFormat: class
Extends the Intl.DateTimeFormat object for custom calendars, and offers new functionalities. All method of the Intl.DateTimeFormat object are available, however formatToParts, format, and resolvedOptions are enhanced.
#### constructor (locale, options, calendar)
 * locale: as for Intl.DateTimeFormat, a string that expresses the language, the region and other characteristics (see JS documentation);
 * options: as for Intl.DateTimeFormat, an object whose fields control the way a date should be formatted;
 * calendar: an object representing a custom calendar. If this parameter is passed but is not an object, an error is thrown.
A new field is handled in the options object:
 * eraDisplay, in which condition should the era part be displayed:
  * "auto" (default value): display era part if and only if 1. year is displayed, 2. era of now is not equal to era of formatted date.
  * "never": do not display era, whatever the date and the *era* option may be.
  * "always": display era following *era* option; if this option is undefined, it is deemed "short".
#### static errors
 * invalidOption: invalid value for option in this context.
 * unimplementedOption: function, data case or option value not implemented; it may come from an insufficient description of a custom calendar.
#### static function
 * unicodeValidDateinCalendar: boolean (
  * aDate: Date/extDate, a date to be formatted,
  * myTZ: string, the name of a time zone
  * myCalendar: string, the name of a built-in calendar)
until ICU version 68, certain dates were not properly interpreted; this function returns *false* in those cases. 
This function shall be deprecated as soon as the corrected version is deployed.
#### methods
 * resolvedOptions(): same as for Intl.DateTimeFormat, eraDisplay is added.
 * displayEra (date): boolean (private function).
 * pldrFetch (name, options, value) (private function)
 * formatToParts (aDate): same result as Intl.DateTimeFormat's. Custom calendar may be used. The eraDisplay option is applied. Fields asked as "numeric" are not changed to "2-digit"; if time fields, the ":" is replaced by " h " or " min ", and a " s " or " s" is added.
 * format (date): like format, but using the enhanceements of formatToParts.

## Simple testing application
The mini-site https://louis-aime.github.io/calendrical-javascript/ enables you to test most facilities of this package. The source of this site is not provided with the package. The contents is listed here to facilitate understanding.

### DateExtendTest.js
Routines for the page.

### dialsandpanels.css
A cascaded style sheet adapted to dials, movable panels, and data commonly used in date display.

### DateExtendTest-fr.html
French version of the page. Versions in other languages to be translated from this version.

### DateExtendTest-en.html
English version of the page.
