# calendrical-javascript
Basic routines in javascript for computations on calendars, including 
 * the Cycle Based Calendar Computation Engine,
 * a week computation engine that emcompasses any architecture of weeks and week numbering, including ISO 8601,
 * a basic conversion tool from iso 8601 date figures to any day counter (Julian Day, Microsoft, Unix-Posix divided by 86400000, etc.) and the reverse,
 * basic constants to convert to or from day counter to milliseconds counter,
 * ExtDate and ExtDateTimeFormat, that extend Date and Intl.DateTimeFormat respectively,
 * a small routine that fetches an XML file and makes a DOM out of it,
 * pldr, a "private locale data register" that extends Unicode's CLDR for display of dates in several calendars (fallback to fetching an external pldr),
 * four classes for custom calendars that are not available from Unicode:
   * the real ISO 8601 calendar i.e. the proleptic Gregorian calendar with years expressed as a signed number without eras and with the suitable week reckoning system,
   * the Milesian calendar, 
   * the Julian calendar, with BC/BCE years counted backwards and displayed following CLDR,
   * the "western calendar", managed any historical calendar used in Western Europe, following the Julian calendar until a customised date of switching to Gregorian,
   * the French Revolution calendar.
The package  anticipate a few features of the Temporal initiative of Ecma TC39.

The datextendedtest* files are for test and demonstrating purposes. The demo is also available from GitHub Pages.

## Module architecture
This module uses ES6 module syntax (export / import).
aggregate.js re-exports all entry points.

Users who prefer scripts to ES 6 module should just erase all `export` statements.

## GitHub Page site for test and demos
https://louis-aime.github.io/calendrical-javascript/

## Basic toolkit
Routines that help developing calendrical computations for new calendars.

### chronos.js
Exported const **Milliseconds**: key numeric constants for converting milliseconds (used in present Javascript environment) into days, hours, minutes, seconds and the reverse. 

The **Cbcce** (Cycle Based Calendrical Computation Engine exported class offers common routines and tools for calendrical computations: 
 * Basic div and mod computations for calendrical purposes.
 * Basic computation of leap years for Julian and Gregorian calendars.
 * The Cycle Based Calendar Computation Engine: a general framework that enables you to deal will most calendars defined by an algorithm, including
    * the Julian and Gregorian calendars,
    * the Milesian calendar,
    * solar calendars with Julian intercalation rule, like coptic, ethiopic...,
    * the Meton cycle implied with the Hebrew calendar,
    * other calendars with "regular" intercalation rules.

The **WeekClock** exported class computes week figures: day of week, week number, number of weeks in year, week year that includes a date.

The **IsoCounter** exported class enables conversion from any day counter to iso8601 and the reverse. The author specifies the epoch for the counter using a date in Iso 8601.

The parameters for using these classes are described in details in the source. Examples are given in the file calendars.js.

## fetchdom.js
The fetchDOM default exported function launches a request to an XML file and transforms it into a DOM object. It returns a Promise.

### pldr.xml
The XML file represents a "Private Locale Data Register" in DOM, possible extension of Common Locale Data Register (CLDR) for custom calendars. 
This is used only for the milesian calendar, but can be extended on the same principle to other custom of even Unicode built-in calendars.

### pldr.js
This files contains a reduced version of pldr.xml, stored as a string, with no language-specific names. 
The getPldrDOM default exported function transforms the string as DOM. 
This module should be imported as a fallback, in case the remote XML file for pldr is not available.

## Extension of Javascript objects

### extdate.js
This module enhances calendrical functions in JavaScript. 
* default **ExtDate** class extends the Date object. You can use date elements with calendars that you define yourself. However Temporal will offer better opportunities.

### extdatetimeformat.js
* default **ExtDateTimeFormat** extends the Intl.DateTimeFormat object. You can customize the way dates are displayed with new options and custom calendars. A new eraDisplay option gives a stronger control of the display of eras.

## calendars.js
With Chronos.Cbcce for the calendrical computations, ExtDate for embedding in ordinary code, and ExtDateTimeFormat for a better control of display options, 
you can define custom calendars in a few lines. 
This file proposes examples of calendars that are missing in Unicode's tools. 

### MilesianCalendar
The **MilesianCalendar** exported class specifies the Milesian calendar as defined at www.calendriermilesien.org.

### GregorianCalendar
This exported class defines the same calendar as *iso8601*, i.e. the Gregorian proleptic calendar. 
However:
* the years follow the algebraic notation: years are signed numbers, and year 0 means 1 B.C. (or B.C.E.);
* you can display week data conforming to iso8601, and you can specify a date giving the ISO 8601 week coordinates;
* dates are displayed using CLDR's definition, except for eras.

### JulianCalendar
The **JulianCalendar** exported class defines the Julian calendar.

### WesternCalendar
The **WesternCalendar** exported class defines the calendar structure of most European countries: Julian calendar period, then switching to the Gregorian calendar. 
The author specifies the switching date at instatiation.

### FrenchRevCalendar
The **FrenchRevCalendar** exported class defines the calendar used under the French revolution, with the week replaced by the decade. This version uses a specific solar intercalation algorithm. This calendar conforms to the civil French calendar used from 1793 to 1805.

## Usage

### Milliseconds : static object
 * DAY_UNIT, HOUR_UNIT, MINUTE_UNIT, SECOND_UNIT : number of milliseconds in these units.

### Cbcce : class
#### Constructor (calendRule : object)
The complete description of the parameters is available in Chronos.js. Calendars.js gives usage examples.
 * calendRule is a compound object that describes how to transform a counter into a compound object with date fields, and the reverse. The calendar should follow the integral postfix intercalation rule. The Roman (julian-gregorian) calendar follows this rule if the beginning of the year is shifted to 1 March.

#### static functions
 * mod (a: number, b: number): number. The calendar modulo. b is strictly positive. Result is the positive remainder of the integer division a / b. This is not equal to a % b! Example: mod (-2,3) is 1.
 * divmod (a : number, b : number): array of numbers, \[0\] is integer quotient, \[1\] is positive remainder. Exmple: divmod (-2, 3) is \[-1, 1\].
 * shiftCycle (cycle, phase, period, shift, cycleBase=0), all numbers, period > 0, yields \[cycle, phase\]. Used for intermediate computations e.g. for the julian-gregorian calendar. \[20, 1\] shifted by 2 in a 12-cycle with base 1 yields \[19, 13\], but \[20, 6\] yields \[20, 6\]. You shift the calendar to March, but you keep the month numbers. On entry, phase shall be in the range cycleBase .. cycleBase + period - 1, else error cycleSHifting is thrown.
 * isJulianLeapYear (year: number): boolean. True if *year* is leap year under the Julian calendar's rule. *year* may be 0 or negative: -1 stands for 2 B.C. In shifting *year*, you may use this function for coptic and ethiopian calendars.
 * isGregorianLeapYear (year: number): boolean. True id *year* is a leap year under the Gregorian calendar's rule. *year* may be negative, as for iso8601. In shifting *year*, you use this function for any calendar that uses the Gregorian intercalation rule (derived from Gregorian, modern Indian, milesian...°.
#### methods
 * getObject (askedNumber): object with date fields obtained from the number with the Cycle Based Calendar Computation Engine. The number may be the Posix time stamp or any other counter that designates an instant, as specified in calendRule.
 * getNumber (askedObject): number. The reverse operation with respect to getObject.

### WeekClock : class
#### Constructor (weekdayRule : object)
The complete description of the parameters is available in Chronos.js. Calendars.js gives usage examples.
 * weekdayRule is a compound object that summerizes the rules regarding weeks. Regular 7-days weeks are handled, as well as systems with epagomenal days: one or two epagomenal days each at different places in the year, or several epagomenal days at the end of the year.
#### methods
  * getWeekFigures (dayIndex, year): \[week number, week day number, year offset, weeks in year\]. *dayIndex* is the stamp of a day. It represents the day whose figures are computed. It is the number of a day, not a timestamp, e.g. divide the Posix timestamp by *Chronos.DAY_UNIT*. *characDayIndex* represents the day that always belongs to a week (generally # 1 week), in the *year*. Result is an array of numbers: \[week number, week day number, year offset, number of weeks in this week year\]. Year offset is -1, 0 or 1; this figure should be added to *year* in order to get the *week-year* the date belongs to, which can be 1 before or after the date's year. The parameters for those computations build up the weekdayRule object.
  * getNumberFromWeek (weekYear, weekNumber, weekday) builds the number of the day from the week indications.

### IsoCounter : class

#### constructor (originYear, originMonth, originDay)
 * The iso coordinates of the epoch for this counter. Note that originMonth is in the range 1 to 12, not 0 to 11. By default the Unix epoch (1970, 1, 1) is assumed.
#### methods
 * toCounter ( isoFields: object): number since epoch specified in contructor. 
 *isoFields* shall hold the numeric fields *isoYear, isoMonth, isoDay,* the element of the date in ISO 8601, *isoMonth* is in the range 1..12.
 * toIsoFields (counter: number): object. The counter is the number of days since specifed epoch. The decimal number is converted to integer floor before conversion. The returned objects holds the date as year, month (1 to 12) and day follwing iso 8601.

### ExtDate: class
Extends the Date object with the flavour of Temporal proposal, using custom calendars. All method of the Date object are also available. **Notice** : with the built-in methods, the figure that represents the month begins with 0, with the extended ones, it begins with 1.
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
   * the missing arguments are replaced by 1 for the day and 0 for all other (hour to milliseconds)
   * the date is always evaluated as a local date with respect to the system time zone.
#### static objects
 * numericFields: an array of objects that have 2 keys: *name* is a string that holds the name of a numeric field; and *value* is a number, the default value.
 * numericWeekFields: a similar array for informations on weeks.
#### static functions
 * fullUTC (fullYear, month, day, hour, minute, second, millisecond): number, all parameters are numbers. Set ExtDate object to the date specified by the parameters, deemed UTC (not local). This is very much like Date.UTC, except:
   * the year element is a full year, no 2-digit year is admitted;
   * the month element is in the range 1..12.
#### methods
 * getRealTZmsOffset (TZ:string): number;
   * if TZ is undefined or "", return the real offset from UTC to system local time *in milliseconds*. This function is defined because there are discrepancies among navigators for the ***Date.prototype.getTimezoneOffset()*** function, when used for date before 1847 in UK or even later in most other countries: as there were no time zones, the real offset is computed to the second, but the traditional method may round to minutes.   
   * else, TZ is considered the name of a time zone; the time offset in millisecond for this time zone at this date is returned. 
 * toResolvedLocaleDate (TZ: string): ExtDate object. TZ is the name of a time zone. The method returns a Date object whose UTC field values correspond to this date at the specified time zone. If TZ is not identified, the system time zone is assumed.
In the next functions, the TZ parameter my be equal to "UTC", or to anything else including undefined. The other parameters or results are evaluated at the system local time zone, or at UTC time if and only if TZ == "UTC". 
The time stamp is the number of milliseconds since Unix epoch (1 Jan. 1970 00:00 h UTC)
 * getFields (TZ): object. The fields of the date, in the associated custom calendar. The corresponding time stamp is returned.
 * getISOFields (TZ): object. The fields of the date in the ISO 8601 calandar.
 * setFromFields (TZ): number. Set the ExtDate object to the date expressed by the fields in the associated calendar. The corresponding time stamp is returned.
 * setFromWeekFields (TZ): number. Set the ExtDate object to the date expressed as week date in the associated calendar.
 * inLeapYear (TZ): whether the year of the date in the associated calendar is a leap year.
 * toCalString (TZ): a string that expresses the date in the corresponding calendar. The string begins with [<calendarname>].
 * era(TZ), year(TZ), fullYear (TZ), month(TZ), day (TZ): the respective field in the associated calendar. fullYear is an unambiguous signed integer that expresses the year with respect to the first "year 0" for this calendar.
 * The time elements can be obtained by the standard Date methode getHours(), getUTCHours(), etc.
 * weekday (TZ): a number that expresses the day of week of this date, for the week associated with the calendar, e.g. for the French revolutionnary calendar, the number is in the range 1..16, i.e. 1..10 for Unedi to Decadi, 11 to 16 for the six sansculottides days. With the 7-days week, the number is in the range 1 (Monday) to 7 (Sunday).
 * weekNumber (TZ): the number of the week following the calendar's rule
 * weeksInYear (TZ): the number fullYear (TZ),of weeks in this year  following the calendar's rule.
 * weekYear (TZ): unambiguous signed number of the year the numbered week for this date belongs to.
  
### ExtDateTimeFormat: class
Extends the Intl.DateTimeFormat object for custom calendars, and offers new functionalities. All method of the Intl.DateTimeFormat object are available, however formatToParts, format, and resolvedOptions are enhanced.
#### constructor (locale, options, calendar)
 * locale: as for Intl.DateTimeFormat, a string that expresses the language, the region and other characteristics (see JS documentation);
 * options: as for Intl.DateTimeFormat, an object whose fields control the way a date should be formatted;
 * calendar: an object representing a custom calendar or a built-in calendar. If this parameter is not an object, it supersedes the .calendar field of options.

A new field is handled in the options object:
 * eraDisplay, in which condition should the era part be displayed:
   * "auto" (default value): display era part if and only if 1. year is displayed, 2. era of now is not equal to era of formatted date.
   * "never": do not display era, whatever the date and the *era* option may be.
   * "always": display era following *era* option; if this option is undefined, it is deemed "short".
#### methods
 * resolvedOptions(): same as for Intl.DateTimeFormat, eraDisplay is added.
 * displayEra (date): boolean (private function).
 * pldrFetch (name, options, value) (private function)
 * formatToParts (aDate): same result as Intl.DateTimeFormat's. Custom calendar is used. The eraDisplay option is applied. Fields asked as "numeric" are not changed to "2-digit"; if time fields, the ":" is replaced by " h " or " min ", and a " s " or " s" is added. However, this change is not done with right-to-left languages.
 * format (date): like format, but using the enhanceements of formatToParts.

## Simple demonstrating and testing application
The mini-site https://louis-aime.github.io/calendrical-javascript/ enables you to test most facilities of this package. 
The source of this site is not part of the package, but is available at the GitHub repository.

### Calendars used in the demonstration site.

The above mentionned calendar classes are intantiated in the following calendar objects that can be used with *ExtDate* and *ExtDateTimeFormat*:
 * **milesian**: the Milesian calendar, as defined at www.calendriermilesien.org; if you use ExtDateTimeFormat, pldr.js is required.
 * **iso_8601**: the Gregorian proleptic calendar as specified by ISO 8601, with week computations.
 * **julian**: the julian calendar. You can display date with ExtDateTimeFormat, using CLDR's names for days, months, eras.  
 * **historic** : you instantiate the *WesternCalendar* with a user-defined switching dates to Gregorian. The *era* display is used to diffentiate "Ancient Style" (Julian reckoning) from "New Style" (Gregorian).
 * **frenchRev**: the calendar defined by the French Convention in 1793.
