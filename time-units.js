/** Set of general purpose duration units
 * @module
 * @version M2021-08-12
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
 */
/** Duration units in milliseconds
 * @static
 * @type {object}
 * @property {Number} DAY_UNIT - Number of milliseconds in a day.
 * @property {Number} HOUR_UNIT - Number of milliseconds in an hour.
 * @property {Number} MINUTE_UNIT - Number of milliseconds in a minute.
 * @property {Number} SECOND_UNIT - Number of milliseconds in an second.
 * @default
 */
const timeUnits = {
	DAY_UNIT : 86400000,
	HOUR_UNIT : 3600000,
	MINUTE_UNIT : 60000,
	SECOND_UNIT : 1000
};
export default timeUnits;