# calendrical-JS
Basic routines in JS for computations on calendars, including the Cycle Based Calendar Computation Engine

## Page for test and demos
https://louis-aime.github.io/calendrical-JS/

## Basic toolkit
Routines that help developing calendrical computations for new calendars

### Chronos.js
The Chronos class offers common routines and tools for calendrical computations: 
 * Basic div and mod computations for calendrical purposes.
 * Basic computation of leap years for julian and gregorian calendars.
 * The Cycle Based Calendar Computation Engine: a general framework that enables you to deal will most calendar defined by algorithm.
 * A procedure for computing week figures: day of week, week number, number of weeks in year, week year that includes a date
 * Key figures for converting milliseconds (used in present Javascript environment) into days, hours, minutes, seconds and the reverse
A second class enable conversion with Julian Day.

### pldr.js
A "Private Locale Data Register", possible extension of Common Locale Data Register for custom calendars.

### dialsandpanels.css
A cascaded style sheet adapted to dials, movable panels, and data commonly used in date display.

## Extension of JS Objects

### DateExtended.js
This module is used to make up enhancement of Intl functions.
* ExtDate object extends the Date object. Project dates in calendars  you define yourself.
* ExtDateTimeFormat extends the Intl.DateTimeFormat objet. You can customize the way dates are displayed with new options.

## Calendars
With Chronos for the calendrical computations, and ExtDate for embedding in ordinary code, define custom calendars in a few lines. Here are some exemples.

Expected data for calendar objects are described in Chronos.js. The calendar.js file gives examples.

### MilesianCalendar
A class specifies the Milesian calendar as defined p, Louis-Aime/Milesian-calendar, a simple variant to `iso8601`.

### JulianCalendar
A class defines the Julian calendar.

### WesternCalendar
A class defines the calendar structure of most European countries: Julian calendar period, then switching to the Gregorian calendar. 
Each instantiation specifies the switching date.

### frenchRevCalendar
The calendar using under the French revolution, with the week replaced by the decade. A special solar intercalation algorithm.

### myEthiopic
The Ethiopic calendar is tested here in order to better display eras.

## Simple testing application
The mini-site https://louis-aime.github.io/calendrical-JS/ enables you to test most facilities of this package. The source of this site is not provided with the package. The contents is given to facilitate debug.

### DateExtendTest.js
Routines for the page.

### DateExtendTest-fr.html
French version of the page. Versions in other languages to be translated from this version.

### DateExtendTest-en.html
English version of the page.
