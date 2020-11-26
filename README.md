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
