# calendrical-javascript
Basic routines in javascript for calendrical computations.
## Purpose
### `ExtDate` object
This object extends the built-in `Date` object, making it possible to specify dates in custom-made calendars. 
This foreshadows some functionalities of `Temporal`.
| Purpose | `Date` | `ExtDate` |
|:--- |:---:|:---:|
|Create date from now|+|+|
|Create date from timestamp|+|+|
|Create date from ISO 8601 date expression|+|+|
|Create date from ISO 8601 date fields | Except in 1st century | All dates |
|Specify date from date fields of another calendar |0|+|
|Obtain date fields of another calendar |0|+|
|Handle week figures|0|+|

### Etc

 * basic duration units,
 * the Cycle Based Calendar Computation Engine,
 * a week computation engine that emcompasses any architecture of weeks and week numbering, including ISO 8601,
 * a basic conversion tool from ISO 8601 date figures to any day counter (Julian Day, Microsoft, Unix-Posix divided by 86400000, etc.) and the reverse,
 * basic constants to convert to or from day counter to milliseconds counter,
 * ExtDate and ExtDateTimeFormat, that extend Date and Intl.DateTimeFormat respectively,
 * a small routine that fetches an XML file and makes a DOM out of it,
 * pldr, a "private locale data repository" that extends Unicode's CLDR for display of dates in several calendars (fallback to fetching an external pldr),
 * classes for custom calendars that are not available from Unicode:
   * the real ISO 8601 calendar i.e. the proleptic Gregorian calendar with years expressed as a signed number without eras and with the suitable week reckoning system,
   * the Milesian calendar, 
   * the Julian calendar, with BC/BCE years counted backwards and displayed following CLDR,
   * the "western calendar", manages any historical calendar used in Western Europe: the Julian calendar until a customised date of switching to Gregorian,
   * the French Revolution calendar.

This package  anticipates some features of the Temporal initiative of Ecma TC39.

The calendrical-\*.js and calendrical-demo\*.html files are for test and demonstrating purposes. 
The demo is available from GitHub Pages.
All other \*.html files are JSDoc generated files.

## Module architecture
This module uses ES6 module syntax (export / import).

## GitHub Page site for reference, usage comments, tests and demos
https://louis-aime.github.io/calendrical-javascript/

## Basic toolkit
Routines that help developing calendrical computations for new calendars.

### time-units.js
The default exported const **timeUnits** object holds key numeric constants for duration units conversions. 

### chronos.js
#### Cbcce 
Cbcce (Cycle Based Calendrical Computation Engine) exported class, offers common routines and tools for calendrical computations: 
 * Basic div and mod computations for calendrical purposes.
 * Basic computation of leap years for Julian and Gregorian calendars.
 * A cycle shifting routine, to facilitate shifting beginning of year in March instead of January, and also to facilitate computations on weeks.
 * The Cycle Based Calendar Computation Engine: a general framework that enables you to deal will most calendars defined by an algorithm, including Julian,  Gregorian, Coptic, Ethiopic, Meton-cycle implied with the Hebrew calendar, etc.

#### WeekClock
Exported class that computes week figures: day of week, week number, number of weeks in year, week year that includes a date.

#### IsoCounter
Exported class that enables conversion from any day counter to "iso8601" and the reverse. 
The author specifies the epoch for the counter using a date in "iso8601".

### fetchdom.js
The default exported function **fetchDOM** launches an XMLHttpRequest to an XML file and then transforms it into a DOM object. It returns a Promise.

### pldr.xml
The XML file represents a "Private Locale Data Repository" to be converted as DOM, possible extension of Common Locale Data Repository (CLDR) for custom calendars.
The "live" file is accessed from https://louis-aime.github.io/calendrical-javascript/pldr.xml.
This file is organised in the same way as the Common Locale Data Repository.

### pldr.js
This files contains a reduced version of pldr.xml, stored as a string, with no language-specific names. 
The **getPldrDOM** default exported function transforms the string as DOM. 
This module should be imported as a fallback, in case the remote XML file for pldr is not available.

## Extension of Javascript objects

### extdate.js
This module extends the Date object for operation with custom and a few built-in calendars.
The default exported class **ExtDate** extends Date. An ExtDate object is associated with a custom calendar.
You can specify dates using the custom calendar's reckoning system. 
This foreshadows some of Temporal operations.

### extdatetimeformat.js
This module extends the Intl.DateTimeFormat object for operations with custom or built-in calendars. 
The default exported class **ExtDateTimeFormat** extends the Intl.DateTimeFormat object. 
* A new eraDisplay option gives a stronger control of the display of eras.
* Time options (hour, minute, second) handled "numeric" and "2-digit" in different ways.
* You can use instantiated objects with  built-in or custom calendars.

## Model and examples of extra and custom calendars

### customcalendarmodel.js
This file has no .js code, but holds the JSDoc type definition of custom calendars handled by ExtDate and ExtDateTimeFormat. 
The detailed definition may be read in the *Global* section of the JSDoc generated documentation.

### calendar.js
Examples of calendars that are missing in Unicode's tools.

#### MilesianCalendar
This exported class specifies the Milesian calendar as defined at www.calendriermilesien.org. 
The Milesian calendar organises the Gregorian year in 12 regular month, starting at the nothern Winter solstice.

#### GregorianCalendar
This exported class defines the same calendar as *iso8601*, i.e. the Gregorian proleptic calendar. 
However:
* the years follow the algebraic notation: years are signed numbers, and year 0 means 1 B.C.;
* you can display week data conforming to ISO 8601, and you can specify a date giving the ISO 8601 week coordinates;
* dates are displayed using CLDR's definition, except for eras which are never displayed.

#### JulianCalendar
This exported class defines the Julian calendar, which is not defined by Unicode.

#### WesternCalendar
This exported class defines the calendar structure of most European countries: Julian calendar period, then switching to the Gregorian calendar. 
The author specifies the switching date at class instatiation.

#### FrenchRevCalendar
This exported class defines the calendar used under the French revolution, with the week replaced by the decade. 
This version uses a specific solar intercalation algorithm. 
This calendar conforms to the civil French calendar used from 1793 to 1805.

## Extended objects usage
See JSDoc generated documentation at https://louis-aime.github.io/calendrical-javascript/.
Details given here follow a logical order rather than alphabetical.

### ExtDate: class
Extends the Date object with the flavour of Temporal proposal, using custom calendars. All method of the Date object are also available. **Notice** : with the built-in methods, the figure that represents the month begins with 0, with the extended ones, it begins with 1.
#### constructor (calendar, otherArguments)
 * calendar is either a string that denotes a built-in calendar, or a custom calendar object; if undefined, "iso8601" is assumed
 * otherArguments is a list of arguments that are handled the same way as with Date.
   * if otherArguments is void, the time of call is returned;
   * if otherArguments is a string, it is interpreted as an ISO 8601 date expression;
   * if otherArguments is a sole number, it is interpretred as a timestamp, the number of milliseconds since Unix epoch;
   * if otherArguments is a list of several numeric arguments, they are interpreted as the date coordinates in ISO 8601 calendar.
However, in the last case, 
   * the first number is a *full year*, that is 14 means the year where Tiberius takes the power in Rome after Augustus' death, not the beginning of World War 1;
   * the second number is the month number in the range 1..12, not 0..11;
   * the missing arguments are replaced by 1 for the day and 0 for all other (hour to milliseconds);
   * the date is always evaluated as a local date with respect to the system time zone.
#### static methods
 * numericFields(): return an array of objects that have 2 keys: *name* is a string that holds the name of a numeric field; and *value* is a number, the default value;
 * numericWeekFields(): return a similar array for informations on weeks.
 * fullUTC (fullYear, month, day, hour, minute, second, millisecond): number, all parameters are numbers. Set ExtDate object to the date specified by the parameters, deemed UTC (not local). This is very much like Date.UTC, except:
   * the year element is a full year, no 2-digit year is admitted;
   * the month element is in the range 1..12.
#### methods
* getRealTZmsOffset (TZ:string): number;
  * if TZ is undefined or "", return the real offset from UTC to system local time *in milliseconds*. This function is defined because there are discrepancies among navigators for the ***Date.prototype.getTimezoneOffset()*** function, when used for date before 1847 in UK or even later in most other countries: as there were no time zones, the real offset is computed to the second, but the traditional method may round to minutes.   
  * else, TZ is considered the name of a time zone; the time offset in millisecond for this time zone at this date is returned. 
* toResolvedLocaleDate (TZ: string): ExtDate object. TZ is the name of a time zone. The method returns a Date object whose UTC field values correspond to this date at the specified time zone. If TZ is not identified, the system time zone is assumed.
In the next functions, the TZ parameter my be equal to "UTC", or to anything else including undefined. The other parameters or results are evaluated at the system local time zone, or at UTC time if and only if TZ == "UTC". 
The timestamp is the number of milliseconds since Unix epoch (1 Jan. 1970 00:00 h UTC)
* getFields (TZ): object. The fields of the date, in the associated custom calendar. The corresponding timestamp is returned.
* getISOFields (TZ): object. The fields of the date in the ISO 8601 calandar.
* setFromFields (TZ): number. Set the ExtDate object to the date expressed by the fields in the associated calendar. The corresponding timestamp is returned.
* setFromWeekFields (TZ): number. Set the ExtDate object to the date expressed as week date in the associated calendar.
* inLeapYear (TZ): whether the year of the date in the associated calendar is a leap year.
* toCalString (TZ): a string that expresses the date in the corresponding calendar. The string begins with [<calendarname>].
* era(TZ), year(TZ), fullYear (TZ), month(TZ), day (TZ): the respective field in the associated calendar. fullYear is an unambiguous signed integer that expresses the year with respect to the first "year 0" for this calendar.
* The time elements can be obtained by the standard Date methode getHours(), getUTCHours(), etc.
* weekday (TZ): a number that expresses the day of week of this date, for the week associated with the calendar, e.g. for the French revolutionnary calendar, the number is in the range 1..16, i.e. 1..10 for Unedi to Decadi, 11 to 16 for the six sansculottides days. With the 7-days week, the number is in the range 1 (Monday) to 7 (Sunday).
* weekNumber (TZ): the number of the week following the calendar's rule
* weeksInYear (TZ): the number of weeks in this year  following the calendar's rule. 
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
   
The values "numeric" and "2-digit" for fields "hour" and "minute" yield different effects whereas they resolve to the same value "2-digit" with Intl.DateTimeFormat.

#### methods
 * resolvedOptions(): same as for Intl.DateTimeFormat, eraDisplay is added.
 * displayEra (date): boolean (private function).
 * pldrFetch (name, options, value) (private function)
 * formatToParts (aDate): same result as Intl.DateTimeFormat's. Custom calendar is used. The eraDisplay option is applied. Fields asked as "numeric" are not changed to "2-digit"; if time fields, the ":" is replaced by " h " or " min ", and a " s " or " s" is added. However, this change is not done with right-to-left languages.
 * format (date): like format, but using the enhanceements of formatToParts.

## Simple demonstrating and testing application
The mini-site https://louis-aime.github.io/calendrical-javascript/ enables you to test most facilities of this package. 
The source of this site is not part of the package, but is available at the GitHub repository.

### HTML files
The files calendrical-demo-fr and calendrical-demo-en are written in French and English respectively. They hold the same demonstration. 
Initial values of fields may be set through 'value' of 'selected' attributes.

### calendrical-init.js
An example of modules initialisation. Works with calendrical-demo.js.

### calendrical-demo.js
Event handlers for calendrical-demo-\* HTML files. Initialisation should be done with calendrical-init.js (or some other).	

### Calendars used in the demonstration site.
The above mentionned calendar classes are intantiated as calendar objects with the following id, and can be used with *ExtDate* and *ExtDateTimeFormat*:
 * **milesian**: the Milesian calendar, as defined at www.calendriermilesien.org; if you use ExtDateTimeFormat, pldr.js is required.
 * **iso_8601**: the Gregorian proleptic calendar as specified by ISO 8601, with week computations.
 * **julian**: the julian calendar. You can display date with ExtDateTimeFormat, using CLDR's names for days, months, eras.  
 * **historic** : you instantiate the *WesternCalendar* with a user-defined switching date to Gregorian. The *era* field is used to diffentiate "AS" (Ancient Style, meaning Julian reckoning) from "NS" (New Style, Gregorian reckoning); however, as CLDR does not handle these eras yet, they both appear as "AD"; with the proposed eraDisplay option set to default, the era 'AD' or equivalent following language shall be displayed for AS and BC dates.
 * **frenchRev**: the calendar defined by the French Convention in 1793.
