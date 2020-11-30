# General calendrical routines for JavaScript
From this site (https://louis-aime.github.io/calendrical-javascript/) you may test the calendrical routines
and compare their results with those of the standard Intl.DateTimeFormat object.

## Usage
With the first panel, choose a date using either the ISO8601 gregorian calendar or a custom calendar. 
Certain custom calendar ("ethiopic") do not handle date entry, but you may still see the display.
At the bottom of the first panel, you can read the standard "toISOString" result and a special string, 
the date projected to the custom calendar.

Panels 2, 3 and 4 hold the locale and options passed to Intl.DateTimeFormat and ExtDateTimeFormat.
You can see  how the options are resolved, using standard Intl and using our extended version.

Panel 5 is divided into 3 display subpanels
 * formated date unded Intl.DateTimeFormat and ExtDateTimeFormat
 * formated date with the selected custom calendar
 * other result that a custom calendar can deliver, with basic routines of Chronos.

## Links
 * [French version](https://louis-aime.github.io/calendrical-javascript/dateextendtest-fr)
 * [English version](https://louis-aime.github.io/calendrical-javascript/dateextendtest-en)
 
## Comments and proposal
 Use this repository's [issues](https://github.com/Louis-Aime/calendrical-javascript/issues).
