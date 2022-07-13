# calendrical-javascript
Basic routines in javascript for calendrical computations.
## Module architecture
This module uses ES6 module syntax (export / import).
## GitHub Page site for software documentation, usage comments, tests and demos
https://louis-aime.github.io/calendrical-javascript/

## Purpose

### `ExtDate` object
Extends the built-in `Date` object, making it possible to specify dates in custom-made calendars. 
This foreshadows some features of `Temporal` initiative of Ecma TC39.
| Purpose | `Date` | `ExtDate` |
|:--- |:---:|:---:|
|Number for the first month|0|1|
|Create date from now|+|+|
|Create date from timestamp|+|+|
|Create date from ISO 8601 date expression|+|+|
|Create date from ISO 8601 date fields | Except in 1st century | All dates |
|Specify date from date fields of another calendar |0|+|
|Obtain date fields of another calendar |0|+|
|Handle week figures|0|+|
|Obtain real time zone offset in ms||0|+|
### `ExtDateTimeFormat` object
Extends `Intl.DateTimeFormat`. Enables usage of calendars that are not defined in Unicode, and foreshadows some proposed enhancements. 
`ExtDateTimeFormat` is called with the same parameters as `Intl.DateTimeFormat`, plus a calendar object or calendar name. 
The methods have the same names, but yield more focused results.
An additional option `eraDisplay` is available.
| Purpose | `Intl.DateTimeFormat` | `ExtDateTimeFormat` |
|:--- |:---:|:---:|
|Display or hide era automatically||0|+|
|Use variants to Unicode's CLDR (using a PLDR)|0|+|
|Diffentiate `2-digit` from `numeric` for time representation|0|+|
### Custom calendars
The general structure of a custom calendar is documented in `customcalendarmodel.js`, 
and also in the *Global* section of the JSDoc documentation, as a type.
Some useful examples are given in `calendars.js`.
The calendar of any European country that used the Julian calendar and switched some day to the Gregorian one 
may easily be specified and used.
| Purpose | Unicode | calendrical-javascript |
|:--- |:---:|:---:|
|ISO 8601 with algebraic year|0|+|
|Julian calendar|0|+|
|Historical Julio-gregorian calendars||0|+|
|Historical French revolutionary calendar|0|+|
|Tentative Milesian calendar|0|+|

Tentative new week numbering systems are also possible.
### `timeUnits` object (time-units.js)
Convert simple durations to and from milliseconds, using coefficients defined once for all.
### `Cbcce` class (chronos.js)
Define any algorithmic calendar with a simple object, see `chronos.js` or the JSDoc documentation:
the Cycle Based Calendar Computation Engine (Cbcce) will convert between timestamp and date-time fields.
Basic solid-state integer division and modulo routines are also available.
These tools provide a general framework to deal will most algorithmic calendars, 
including Julian,  Gregorian, Coptic, Ethiopic, Meton-cycle implied with the Hebrew calendar, etc.
See examples in `calendars.js`.
### `WeekClock` class (chronos.js)
Define special week rules, with more or less than 7 days, epagomenal days at end of year, or an intercalation day anywhere in the year.
The WeekClock instantiated object will compute day sequential number to and from week figures. 
The rules for the week are specified in an object, see `chronos.js` or the JSDoc documentation.
See examples in `calendars.js`.
### IsoCounter class (chronos.js)
Convert a set of ISO 8601 date fields to and from a sequential day number relative to a given epoch,
by default 1970-01-01. Useful for computations on Julian Day, Modified JD, Microsoft base, etc.
### `fetchDOM` promise generator function (fetchdom.js)
Open access to an external XML resource and convert it to a DOM. 
This function works like `import()` but establishes a DOM rather than an access to a module.
This function is a general purpose object. It is here used to fetch the Private Locale Data Repository (PLDR) used with calendars.
### pldr.js
A simplified and stringified version of our Private Locale Data Repository, to be used when the access to the XML PLDR is not available.

## Demonstration and documentation files
The calendrical-\*.js and calendrical-demo\*.html files are for test and demonstrating purposes. 
The JSDoc documentation and the demo are available from GitHub Pages.
All other \*.html files are JSDoc generated files.
### calendrical-init.js
An example of initialisation of the complete package. This file may be tailored to specific applications.
### calendrical-demo-en.html, calendrical-demo-fr.html
Demonstration pages in English resp. French.
They use calendrical-demo.js and calendrical-init.js as script files.
### calendrical.demo.js 
Event listeners for the calendrical-demo pages. Most global objects of the demo pages are documented as *Global* by JSDoc.
### Calendars used in the demonstration site.
As defined in calendrical-demo.js, some calendars are instantiated from the classes of calendars.js when the page is loaded. Here are their id:  :
 * **milesian**: the Milesian calendar, as defined at www.calendriermilesien.org; if you use ExtDateTimeFormat, pldr.js is required.
 * **iso_8601**: the Gregorian proleptic calendar as specified by ISO 8601, with week computations and with algebraic year display.
 * **julian**: the julian calendar. You can display date with ExtDateTimeFormat, using CLDR's names for days, months, eras.  
 * **historic** : you instantiate the *WesternCalendar* with a user-defined switching date to Gregorian. The *era* field is used to diffentiate "AS" (Ancient Style, meaning Julian reckoning) from "NS" (New Style, Gregorian reckoning); however, as CLDR does not handle these eras yet, they both appear as "AD"; with the proposed eraDisplay option set to default, the era 'AD' or equivalent following language shall be displayed for AS and BC dates, not for NS.
 * **frenchRev**: the calendar defined by the French Convention in 1793.
