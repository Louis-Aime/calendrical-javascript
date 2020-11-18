# General calendrical routines for JavaScript
From this site (https://louis-aime.github.io/calendrical-JS/) you may test the calendrical routines
and compare their results with those of the standard Intl.DateTimeFormat object.

## Usage
With the first panel, choose a date using either the ISO8601 gregorian calendar or a custom calendar. 
Certain custom calendar ("ethiopic") do not handle date entry, but you may still see the display.
At the bottom of the first panel, you can read the standard "toISOString" result and a special string, 
the date projected to the custom calendar.

Panel 2 and 3 hold the locale and options passed to Intl.DateTimeFormat and ExtDateTimeFormat.
You can see  how the options are resolved, using standard Intl and using our extended version.

Panel 4 displays the results of Intl.DateTimeFormat.format and ExtDateTimeFormat.format respectively.

Panel 5 displays more results obtained with ExtDate and ExtDateTimeFormat with custom calendars, 
provided that the computations are implemented for the specified custom calendar.

## Links
 * [French version](https://louis-aime.github.io/calendrical-JS/DateExtendTest-fr)
 * [English version](https://louis-aime.github.io/calendrical-JS/DateExtendTest-en)
 
 ## Comments and proposal
 Use this repository's [issues](https://github.com/Louis-Aime/calendrical-JS/issues).