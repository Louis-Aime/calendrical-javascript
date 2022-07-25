/** 
 * @file Example of initialiser for calendrical-javascript usage, to be customised to special needs.
 * Ounce the loadCalendrical promise is settled, 
 * the calendrical global object holds all calendrical-javascript impored objects.
 * @version M2021-08-29
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
 */
// Character set is UTF-8 
/* Version	M2022-08-02	Detailed comments for JSdoc.
	Version log via GitHub
*/
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2022
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
1. The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.
2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non-infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
*/
"use strict";
const 
	/** Prefix for all calendrical-javascript imported objects. 
	* The calendar classes also imported from calendars.js are not described here, as they may change.
	* @property {Object} pldrDOM	- Private Locale Data Repository as a domain.
	* @property {Object} TimeUnits	- The time units in milliseconds.
	* @property {Object} ExtDate	- Extends legacy Date object.
	* @property {Object} ExtDateTimeFormat	- Extends Intl.DateTimeFormat.
	*/
	calendrical = {},
	/** This promise aggregates all calendrical-javascript imports and initialisations.
	*/
	loadCalendrical = Promise.all([
		import ('./fetchdom.js').then (
			(value) => value.default ('./pldr.xml', 1000),
			(error) => { throw 'Error loading standard modules' }		// failure fetching pldr as XML file, fallback in next step
			).then (
				(value) => { calendrical.pldrDOM = value },			// fetching XML file has succeeded.
				(error) => {							// fetching XML has failed, we use the fallback value
					console.log ('Error fetching xml pldr file: ' + error + '\nfetching local pldr.js');
					return import ("./pldr.js").then ( (value) => calendrical.pldrDOM = value.default () ) 
					}
				),
		import ('./time-units.js').then ( (value) => calendrical.TimeUnits = value.default ),
		import ('./extdate.js').then ( (value) => calendrical.ExtDate = value.default ),
		import ('./extdatetimeformat.js').then ( (value) => calendrical.ExtDateTimeFormat = value.default ),
		import ('./calendars.js').then ( (value) => Object.assign (calendrical, value) )
		]);
