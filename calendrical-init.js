/** 
 * @file Example of initialiser for calendrical-javascript usage.
 * This asynchronous function initialises the user modules of calendrical-javascript for a web page environment.
 * This is to be customised.
 * @version M2021-08-29
 * @license MIT Louis A. de Fouquières 2016-2022
 * Inquiries: https://github.com/Louis-Aime
 */
// Character set is UTF-8 
/* Version	M2022-01-26	Comments for JSdoc
	M2021-08-29	Local XML file
	Version log on GitHub
*/
/* Copyright Miletus 2017-2022 - Louis A. de Fouquières
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

Inquiries: www.calendriermilesien.org
*/
"use strict";
const // Promises of loading user modules, and global object than collects all values. Note: calendrical should be object if access from global object is required
	calendrical = {},	// prefix for the calendrical modules, that may be accessed from the global object.
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
