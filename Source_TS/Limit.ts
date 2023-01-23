/* Some JS rules are altered:
    '1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
    '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
    'Infinity / 0' now returns NaN instead of Infinity
    '0 / NaN' now returns 0 instead of NaN
    'NaN ** (-Infinity)' now returns 0 instead of NaN (I allow X ** (-Infinity) to be 0 because floating points)
    'log-A(-X)', 'log-A(X)' can return actual value instead of NaN (because vanila JS doesn't have negative base)
    'log0(X)', 'log1(X)' returns NaN (JS doesn't have that rule)
    Because there is 2 numbers, bigNumber can be at same time NaN and Infinity. Or even -Infinity and Infinity
*/

import { getId } from './Main';
import { player } from './Player';
import { format } from './Update';

/* Planned features:
    TS: Add proper type to an object (probably no, too much pain)
    power: Allow power to be bigger than 2**1024, if there ever will be a need for it
    log: Allow base to be bigger than 2**1024, if someone actually need it
    Infinity: Some of 'Infinity's at really big numbers >1e1e308, are turned into NaN, should be 'easy' to fix if there is a need
    NaN: Option to replace detected NaN of Infinity into any number (I removed it, but can be re added)
    format: Allow digits to be more than 2, when power is more than 6 (will slow down format)
    format: Add padding setting: 1ee2 > 1.00ee2
    convert: Allow sent string '1e1e2' to look like '1ee2'
    NonChainableFunctions: special setting to return array instead of string
*/

/* This is version has all settings removed (for better speed) */
export const overlimit = {
    Limit: (number: string | number | [number, number]) => {
        const { technical } = overlimit;
        let result = technical.convert(number);

        return {
            plus: function(...numbers: Array<string | number | [number, number]>) {
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.add(result, array[i]);
                }

                return this;
            },
            minus: function(...numbers: Array<string | number | [number, number]>) {
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.sub(result, array[i]);
                }

                return this;
            },
            multiply: function(...numbers: Array<string | number | [number, number]>) {
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.mult(result, array[i]);
                }

                return this;
            },
            divide: function(...numbers: Array<string | number | [number, number]>) {
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.div(result, array[i]);
                }

                return this;
            },
            power: function(power: number) {
                result = technical.pow(result, power);
                return this;
            },
            log: function(base = 2.718281828459045) {
                result = technical.log(result, base);
                return this;
            },
            abs: function() {
                result[0] = Math.abs(result[0]);
                return this;
            },
            trunc: function() {
                result = technical.trunc(result);
                return this;
            },
            floor: function() {
                result = technical.floor(result);
                return this;
            },
            ceil: function() {
                result = technical.ceil(result);
                return this;
            },
            round: function() {
                result = technical.round(result);
                return this;
            },
            isNaN: (): boolean => isNaN(result[0]) || isNaN(result[1]),
            isFinite: (): boolean => isFinite(result[0]) && isFinite(result[1]),
            less: (compare: string | number | [number, number]): boolean => technical.less(result, technical.convert(compare)),
            lessOrEqual: (compare: string | number | [number, number]): boolean => technical.lessOrEqual(result, technical.convert(compare)),
            more: (compare: string | number | [number, number]): boolean => technical.more(result, technical.convert(compare)),
            moreOrEqual: (compare: string | number | [number, number]): boolean => technical.moreOrEqual(result, technical.convert(compare)),
            notEqual: (compare: string | number | [number, number]): boolean => technical.notEqual(result, technical.convert(compare)),
            equal: (...compare: Array<string | number | [number, number]>): boolean => {
                const array = technical.convertAll(compare);

                let allEqual = technical.equal(result, array[0]);
                for (let i = 1; i < array.length; i++) {
                    allEqual &&= technical.equal(array[i - 1], array[i]);
                }

                return allEqual;
            },
            max: function(...compare: Array<string | number | [number, number]>) {
                const array = technical.convertAll(compare);

                for (let i = 0; i < array.length; i++) {
                    if (technical.less(result, array[i])) { result = array[i]; }
                }

                return this;
            },
            min: function(...compare: Array<string | number | [number, number]>) {
                const array = technical.convertAll(compare);

                for (let i = 0; i < array.length; i++) {
                    if (technical.more(result, array[i])) { result = array[i]; }
                }

                return this;
            },
            format: (digits = null as null | number, type = 'number' as 'number' | 'input'): string => technical.format(result, digits, type),
            get: (): string => technical.convertBack(result),
            noConvert: (): [number, number] => technical.fixFloats(result)
        };
    },
    LimitAlt: {
        plus: (...numbers: Array<string | number | [number, number]>): string => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            //Fastest loop is not doing a loop
            let result = technical.add(array[0], array[1]);
            for (let i = 2; i < array.length; i++) {
                result = technical.add(result, array[i]);
            }

            return technical.convertBack(result);
        },
        minus: (...numbers: Array<string | number | [number, number]>): string => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            let result = technical.sub(array[0], array[1]);
            for (let i = 2; i < array.length; i++) {
                result = technical.sub(result, array[i]);
            }

            return technical.convertBack(result);
        },
        multiply: (...numbers: Array<string | number | [number, number]>): string => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            let result = technical.mult(array[0], array[1]);
            for (let i = 2; i < array.length; i++) {
                result = technical.mult(result, array[i]);
            }

            return technical.convertBack(result);
        },
        divide: (...numbers: Array<string | number | [number, number]>): string => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            let result = technical.div(array[0], array[1]);
            for (let i = 2; i < array.length; i++) {
                result = technical.div(result, array[i]);
            }

            return technical.convertBack(result);
        },
        power: (number: string | number | [number, number], power: number): string => {
            const { technical } = overlimit;
            return technical.convertBack(technical.pow(technical.convert(number), power));
        },
        log: (number: string | number | [number, number], base = 2.718281828459045): string => {
            const { technical } = overlimit;
            return technical.convertBack(technical.log(technical.convert(number), base));
        },
        //Fastest method (?), because no need to convert in both directions
        abs: (number: string): string => number[0] === '-' ? number.substring(1) : number,
        isNaN: (number: string): boolean => number.includes('NaN'),
        isFinite: (number: string): boolean => number.includes('Infinity'),
        less: (first: string | number | [number, number], second: string | number | [number, number]): boolean => {
            const { technical } = overlimit;
            return technical.less(technical.convert(first), technical.convert(second));
        },
        lessOrEqual: (first: string | number | [number, number], second: string | number | [number, number]): boolean => {
            const { technical } = overlimit;
            return technical.lessOrEqual(technical.convert(first), technical.convert(second));
        },
        more: (first: string | number | [number, number], second: string | number | [number, number]): boolean => {
            const { technical } = overlimit;
            return technical.more(technical.convert(first), technical.convert(second));
        },
        moreOrEqual: (first: string | number | [number, number], second: string | number | [number, number]): boolean => {
            const { technical } = overlimit;
            return technical.moreOrEqual(technical.convert(first), technical.convert(second));
        },
        notEqual: (first: string | number | [number, number], second: string | number | [number, number]): boolean => {
            const { technical } = overlimit;
            return technical.notEqual(technical.convert(first), technical.convert(second));
        },
        equal: (...numbers: Array<string | number | [number, number]>): boolean => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            let result = technical.equal(array[0], array[1]);
            for (let i = 2; i < array.length; i++) {
                result &&= technical.equal(array[i - 1], array[i]);
            }

            return result;
        },
        max: (...numbers: Array<string | number | [number, number]>): string => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            let result = technical.more(array[0], array[1]) ? array[0] : array[1];
            for (let i = 2; i < array.length; i++) {
                if (technical.less(result, array[i])) { result = array[i]; }
            }

            return technical.convertBack(result);
        },
        min: (...numbers: Array<string | number | [number, number]>): string => {
            const { technical } = overlimit;
            const array = technical.convertAll(numbers);

            let result = technical.less(array[0], array[1]) ? array[0] : array[1];
            for (let i = 2; i < array.length; i++) {
                if (technical.more(result, array[i])) { result = array[i]; }
            }

            return technical.convertBack(result);
        },
        trunc: (number: string | number | [number, number]): string => {
            const { technical } = overlimit;
            return technical.convertBack(technical.trunc(technical.convert(number)));
        },
        floor: (number: string | number | [number, number]): string => {
            const { technical } = overlimit;
            return technical.convertBack(technical.floor(technical.convert(number)));
        },
        ceil: (number: string | number | [number, number]): string => {
            const { technical } = overlimit;
            return technical.convertBack(technical.ceil(technical.convert(number)));
        },
        round: (number: string | number | [number, number]): string => {
            const { technical } = overlimit;
            return technical.convertBack(technical.round(technical.convert(number)));
        },
        format: (number: string | number | [number, number], digits = null as null | number, type = 'number' as 'number' | 'input'): string => {
            const { technical } = overlimit;
            return technical.format(technical.convert(number), digits, type);
        }
    },
    /* Private functions */
    technical: {
        //Main calculations
        add: (left: [number, number], right: [number, number]): [number, number] => {
            const difference = left[1] - right[1];
            if (Math.abs(difference) >= 12) {
                return difference > 0 ? left : right; //NaN will go into block bellow
            } else {
                if (difference === 0) {
                    left[0] += right[0];
                } else if (difference > 0) {
                    left[0] += right[0] / 10 ** difference;
                } else {
                    right[0] += left[0] / 10 ** (-difference);
                    left = right;
                }

                const after = Math.abs(left[0]);
                if (after === 0) {
                    left[1] = 0;
                } else if (after >= 10) {
                    left[0] /= 10;
                    left[1]++;
                } else if (after < 1) {
                    left[0] *= 10;
                    left[1]--;
                }

                return left;
            }
        },
        sub: (left: [number, number], right: [number, number]): [number, number] => {
            right[0] *= -1; //Easier this way
            return overlimit.technical.add(left, right);
        },
        mult: (left: [number, number], right: [number, number]): [number, number] => {
            if (left[0] === 0 || right[0] === 0) {
                return [0, 0];
            }

            left[1] += right[1];
            left[0] *= right[0];

            if (Math.abs(left[0]) >= 10) {
                left[0] /= 10;
                left[1]++;
            }

            return left;
        },
        div: (left: [number, number], right: [number, number]): [number, number] => {
            if (right[0] === 0) {
                return [NaN, 0];
            } else if (left[0] === 0) {
                return [0, 0];
            }

            left[1] -= right[1];
            left[0] /= right[0];

            if (Math.abs(left[0]) < 1) {
                left[0] *= 10;
                left[1]--;
            }

            return left;
        },
        pow: (left: [number, number], power: number): [number, number] => {
            if (power === 0) {
                return [1, 0];
            } else if (left[0] === 0) {
                return [0, 0];
            } else {
                const negative = left[0] < 0 ? Math.abs(power) % 2 : null;
                if (negative !== null) { //Complex numbers are not supported
                    if (Math.floor(power) !== power) {
                        return [NaN, 0];
                    }
                    left[0] *= -1;
                }

                if (!isFinite(power)) {
                    if (power < 0) { return [0, 0]; }
                    if (isNaN(power)) { return [NaN, 0]; }
                    return [negative === 1 ? -Infinity : Infinity, 0];
                }

                const base10 = power * (Math.log10(left[0]) + left[1]);
                const target = Math.floor(base10);
                left[0] = 10 ** (base10 - target); //Infinity - Infinity === NaN
                left[1] = target;

                /* Safety, but it never happened during testing */
                //const after = Math.abs(left[0]);
                //if (after < 1 || after >= 10) { }
                if (negative === 1) { left[0] *= -1; }
                return left;
            }
        },
        log: (left: [number, number], base: number): [number, number] => {
            const negative = left[0] < 0; //Because it will be positive afterwards
            if (!isFinite(base)) {
                return [isNaN(base) ? NaN : 0, 0];
            } else if (base === 0 || base === 1) {
                return [NaN, 0];
            } else if (left[0] <= 0) { //Complex numbers are not supported
                if (left[0] === 0) { return [-Infinity, 0]; }
                if (base > 0) { return [NaN, 0]; }
                left[0] *= -1;
            } else if (left[0] === 1 && left[1] === 0) {
                return [0, 0];
            }

            //This is bigger version for safety when to close to 1e1e308
            const tooSmall = left[1] < 0; //Minor issue with negative power
            const base10 = Math.log10(Math.abs(Math.log10(left[0]) + left[1]));
            const target = Math.floor(base10);
            left[0] = (10 ** (base10 - target)); //Infinity - Infinity === NaN
            left[1] = target;

            if (tooSmall) { left[0] *= -1; } //Doing it now, because there is more ways than 1 to have it negative
            if (base !== 10) {
                left[0] /= Math.log10(Math.abs(base));

                const after = Math.abs(left[0]);
                if (after < 1 || after >= 10) {
                    const digits = Math.floor(Math.log10(after));
                    left[0] /= 10 ** digits; //Infinity / Infinity === NaN
                    left[1] += digits;

                    /* Safety, but it never happened during testing */
                    //const check = Math.abs(left[0]);
                    //if (check < 1 || check >= 10) { console.log(check) }
                }
            }

            //Special test for negative numbers, if they were sent here
            if (base < 0 || negative) {
                if (left[1] < 0) { return [NaN, 0]; }
                const test = left[1] < 16 ?
                    (Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) % 2 : //First remove error from floats (while keeping floats) then find if even
                    0; //Assuming that big numbers never uneven
                if (base < 0 && !negative) {
                    if (test !== 0) { return [NaN, 0]; } //Answer must be even
                } else { //base < 0 && negative
                    if (test !== 1) { return [NaN, 0]; } //Answer must be uneven
                }
            }
            return left;
        },
        //abs, isNaN, isFinite are not there because used version is way too different
        less: (left: [number, number], right: [number, number]): boolean => {
            if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) { return left[0] < right[0]; }
            if (left[0] >= 0 && right[0] >= 0) { return left[1] < right[1]; }
            if (left[0] < 0 && right[0] >= 0) { return true; }
            if (right[0] < 0 && left[0] >= 0) { return false; }
            return left[1] > right[1];
        },
        lessOrEqual: (left: [number, number], right: [number, number]): boolean => {
            if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) { return left[0] <= right[0]; }
            if (left[0] >= 0 && right[0] >= 0) { return left[1] < right[1]; }
            if (left[0] < 0 && right[0] >= 0) { return true; }
            if (right[0] < 0 && left[0] >= 0) { return false; }
            return left[1] > right[1];
        },
        more: (left: [number, number], right: [number, number]): boolean => {
            if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) { return left[0] > right[0]; }
            if (left[0] >= 0 && right[0] >= 0) { return left[1] > right[1]; }
            if (left[0] < 0 && right[0] >= 0) { return false; }
            if (right[0] < 0 && left[0] >= 0) { return true; }
            return left[1] < right[1];
        },
        moreOrEqual: (left: [number, number], right: [number, number]): boolean => {
            if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) { return left[0] >= right[0]; }
            if (left[0] >= 0 && right[0] >= 0) { return left[1] > right[1]; }
            if (left[0] < 0 && right[0] >= 0) { return false; }
            if (right[0] < 0 && left[0] >= 0) { return true; }
            return left[1] > right[1];
        },
        equal: (left: [number, number], right: [number, number]): boolean => {
            if (!isFinite(left[0]) || !isFinite(right[0])) { return left[0] === right[0]; }
            return left[1] === right[1] ? left[0] === right[0] : false;
        },
        notEqual: (left: [number, number], right: [number, number]): boolean => {
            if (!isFinite(left[0]) || !isFinite(right[0])) { return left[0] !== right[0]; }
            return left[1] !== right[1] ? true : left[0] !== right[0];
        },
        //No max, min instead on spot it will call comparison function (.more())
        trunc: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.trunc(left[0]);
            } else if (left[1] <= 14) {
                //Most of it is just getting rid of floating error
                left[0] = Math.trunc(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
            }

            return left;
        },
        floor: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [left[0] < 0 ? -1 : 0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.floor(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.floor(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
            }

            return left;
        },
        ceil: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [left[0] < 0 ? 0 : 1, 0];
            } else if (left[1] === 0) {
                left[0] = Math.ceil(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.ceil(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
            }

            return left;
        },
        round: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [left[1] === -1 ? Math.round(left[0] / 10) : 0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.round(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.round(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
            }

            return left;
        },
        format: (left: [number, number], digits: number | null, type: 'number' | 'input'): string => {
            const [base, power] = left;
            if (!isFinite(base) || !isFinite(power)) { return overlimit.technical.convertBack(left); }

            //1.23ee123 (-1.23e-e123)
            if ((power >= 1e3 || power < -1e3) && type !== 'input') {
                if (digits === null) { digits = 2; }
                let exponent = Math.floor(Math.log10(Math.abs(power)));
                let result = Math.abs(Math.round(power / 10 ** (exponent - digits)) / 10 ** digits);
                if (result >= 10) {
                    result /= 10;
                    exponent++;
                }
                if (base < 0) { result *= -1; }
                const formated = `${result}`.replace('.', player.separator[1]);

                return `${formated}e${power < 0 ? '-' : ''}e${exponent}`;
            }

            //1.23e123
            if (power >= 6 || power < -3) {
                if (digits === null) { digits = 2; }
                let formated = `${Math.round(base * 10 ** digits) / 10 ** digits}`;
                if (type !== 'input') { formated = formated.replace('.', player.separator[1]); }

                return `${formated}e${power}`;
            }

            //12345
            if (digits === null) { digits = 4; }
            if (power >= 3) {
                digits = 0;
            } else if (power >= 0) {
                digits = 2;
            }

            let formated = `${Math.round(base * 10 ** (digits + power)) / 10 ** digits}`;
            if (type !== 'input') {
                formated = formated.replace('.', player.separator[1]);
                if (power >= 3) { formated = formated.replace(/\B(?=(\d{3})+(?!\d))/, player.separator[0]); }
            }

            return formated;
        },
        //Special functions
        convert: (number: string | number | [number, number]): [number, number] => { //Turns string into usable parts [base, power]
            let result: [number, number];
            if (typeof number !== 'object') { //Not an Array
                if (typeof number !== 'string') { number = `${number}`; } //Using log10 could cause floating point error
                const index = number.indexOf('e'); //About 5+ times quicker than regex
                result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
            } else {
                result = number; //Not instant return, because might need a fix
            }

            if (Math.floor(result[1]) !== result[1]) { //Fix non trunc exponent ([2, 10.1] > [2.5, 10])
                result[0] *= 10 ** (result[1] - Math.floor(result[1]));
                result[1] = Math.floor(result[1]);
            }

            const after = Math.abs(result[0]);
            if (after === 0) {
                result[1] = 0; //Just in case
            } else if (after < 1 || (after >= 10 && isFinite(after))) { //isFinite here to allow Infinity
                const digits = Math.floor(Math.log10(after)); //Can fail, but mostly should be fine (?)
                result[0] /= 10 ** digits;
                result[1] += digits;

                //Safety, since it's really important for functions like trunc(), less() to have a correct exponent
                if (Math.abs(result[0]) < 1) { //Can happen
                    result[0] *= 10;
                    result[1]--;
                }
            }

            return result;
        },
        convertAll: (numbers: Array<string | number | [number, number]>): Array<[number, number]> => { //Quality of life (string instead of ..., for optimization (?))
            const result = [];
            const { convert } = overlimit.technical;
            for (let i = 0; i < numbers.length; i++) {
                result[i] = convert(numbers[i]);
            }
            return result;
        },
        fixFloats: (number: [number, number]): [number, number] => { //Decreases string length (removes extra information), also will try to fix any issues
            if (!isFinite(number[0]) || !isFinite(number[1])) { //NaN is not finite
                if (number[0] === 0 || (number[1] < 0 && !isFinite(number[1]))) { return [0, 0]; }
                return [isNaN(number[0]) || isNaN(number[1]) ? NaN : number[0] < 0 ? -Infinity : Infinity, 0];
            }

            const digits = number[1] >= 0 ?
                (number[1] >= 1e3 ? 0 : 12) :
                (number[1] <= 1e-3 ? 0 : 12);
            number[0] = Math.round(number[0] * 10 ** digits) / 10 ** digits;

            return number; //number[0] can become >= 10, but convert will fix it before being used again
        },
        convertBack: (number: [number, number]): string => {
            number = overlimit.technical.fixFloats(number);
            if (Math.abs(number[1]) < 1e16) { return number[1] === 0 ? `${number[0]}` : `${number[0]}e${number[1]}`; }

            const exponent = Math.floor(Math.log10(number[1]));
            const result = Math.round(number[1] / 10 ** (exponent - 15)) / 1e15;

            return `${number[0]}e${result}e${exponent}`;
        }
    }
};

export const { Limit, LimitAlt } = overlimit;
export default Limit;

/* Remove once tested */

const created = false;
export const createCalculator = () => {
    if (created) { return; }

    getId('settingsSubtabDebug').innerHTML =
    `<div class="insideTab" style="flex-flow: column;">
        <div style="display: flex; flex-direction: column; align-items: center;">
            <p class="bigWord redText">This is testing area for break infinity calculator</p>
            <span class="greenText">Since I created it myself there might be a lot of bugs</span>
            <span class="greenText">If you have time you can test it, while I'm work on main game</span>
        </div>
        <div style="align-self: center;">
            <div class="darkorchidText" style="display: flex; column-gap: 0.6em;">
                <p>Current Math answer</p>
                <span id="oldMath" style="border: 2px solid; width: 7em; text-align: center;"></span>
            </div>
            <div class="darkvioletText" style="display: flex; column-gap: 0.6em; margin-top: 0.2em;">
                <p>New Math answer</p>
                <span id="newMath" style="border: 2px solid; width: 7em; text-align: center;"></span>
            </div>
        </div>
        <div style="align-self: center;">
            <div>
                <label for="firstNumber" class="cyanText">First Number</label>
                <input type="text" id="firstNumber" style="margin-left: 1em; width: 10em;">
            </div>
            <div>
                <label for="secondNumber" class="cyanText">Second number</label>
                <input type="text" id="secondNumber" style="margin-left: 1em; margin-top: 0.2em; width: 10em;">
            </div>
        </div>
        <div>
            <p class="orchidText">Choose what to do with numbers</p>
            <div style="display: flex; flex-wrap: wrap; column-gap: 0.25em;">
                <button id="plus" style="width: 1.5em;">+</button>
                <button id="minus" style="width: 1.5em;">-</button>
                <button id="mult" style="width: 1.5em;">*</button>
                <button id="div" style="width: 1.5em;">/</button>
                <button id="pow" style="width: 1.5em;" title="Second number must be bellow 2^1024">^</button>
                <button id="log" style="width: 2.5em;" title="Second number is base, also must be bellow 2^1024">log</button>
                <button id="abs" style="width: 2em;" title="Removes minus. First number only">|x|</button>
                <button id="Inf" style="width: 5.5em;" title="Check if number is finite (not Infinity or NaN). First number only">Is Finite</button>
                <button id="NaN" style="width: 4em;" title="Check if number is NaN (Not a Number). First number only">Is NaN</button>
                <button id="more" style="width: 1.5em;">&gt</button>
                <button id="moreEqual" style="width: 2em;">&gt=</button>
                <button id="less" style="width: 1.5em;">&lt</button>
                <button id="lessEqual" style="width: 2em;">&lt=</button>
                <button id="equal" style="width: 2em;">==</button>
                <button id="notEqual" style="width: 2em;">!=</button>
                <button id="trunc" style="width: 3.5em;" title="Remove all digits past point. First number only">Trunc</button>
                <button id="floor" style="width: 3.5em;" title="Bring number to closest smallest integer. First number only">Floor</button>
                <button id="ceil" style="width: 4em;" title="Bring number to biggest smallest integer. First number only">Ceiling</button>
                <button id="round" style="width: 4em;" title="Bring number to closest integer. First number only">Round</button>
            </div>
        </div>
    </div>`;
    getId('plus').addEventListener('click', doPlus);
    getId('minus').addEventListener('click', doMinus);
    getId('mult').addEventListener('click', doMult);
    getId('div').addEventListener('click', doDiv);
    getId('pow').addEventListener('click', doPow);
    getId('log').addEventListener('click', doLog);
    getId('abs').addEventListener('click', doAbs);
    getId('Inf').addEventListener('click', doInf);
    getId('NaN').addEventListener('click', doNaN);
    getId('more').addEventListener('click', doMore);
    getId('moreEqual').addEventListener('click', doMoreEqual);
    getId('less').addEventListener('click', doLess);
    getId('lessEqual').addEventListener('click', doLessEqual);
    getId('equal').addEventListener('click', doEqual);
    getId('notEqual').addEventListener('click', doNotEqual);
    getId('trunc').addEventListener('click', doTrunc);
    getId('floor').addEventListener('click', doFloor);
    getId('ceil').addEventListener('click', doCeil);
    getId('round').addEventListener('click', doRound);
};

const doPlus = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Number(inputFirst) + Number(inputSecond));
    newMath.textContent = Limit(inputFirst).plus(inputSecond).format();
};
const doMinus = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Number(inputFirst) - Number(inputSecond));
    newMath.textContent = Limit(inputFirst).minus(inputSecond).format();
};
const doMult = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Number(inputFirst) * Number(inputSecond));
    newMath.textContent = Limit(inputFirst).multiply(inputSecond).format();
};
const doDiv = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Number(inputFirst) / Number(inputSecond));
    newMath.textContent = Limit(inputFirst).divide(inputSecond).format();
};
const doPow = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Number(inputFirst) ** Number(inputSecond));
    newMath.textContent = Limit(inputFirst).power(Number(inputSecond)).format();
};
const doLog = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    const logAny = (number: number, base: number) => Math.log(number) / Math.log(base);
    oldMath.textContent = format(logAny(Number(inputFirst), Number(inputSecond)));
    newMath.textContent = Limit(inputFirst).log(Number(inputSecond)).format();
};
const doAbs = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Math.abs(Number(inputFirst)));
    newMath.textContent = Limit(inputFirst).abs().format();
};
const doInf = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${isFinite(Number(inputFirst))}`;
    newMath.textContent = `${Limit(inputFirst).isFinite()}`;
};
const doNaN = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${isNaN(Number(inputFirst))}`;
    newMath.textContent = `${Limit(inputFirst).isNaN()}`;
};
const doMore = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${Number(inputFirst) > Number(inputSecond)}`;
    newMath.textContent = `${Limit(inputFirst).more(inputSecond)}`;
};
const doMoreEqual = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${Number(inputFirst) >= Number(inputSecond)}`;
    newMath.textContent = `${Limit(inputFirst).moreOrEqual(inputSecond)}`;
};
const doLess = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${Number(inputFirst) < Number(inputSecond)}`;
    newMath.textContent = `${Limit(inputFirst).less(inputSecond)}`;
};
const doLessEqual = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${Number(inputFirst) <= Number(inputSecond)}`;
    newMath.textContent = `${Limit(inputFirst).lessOrEqual(inputSecond)}`;
};
const doEqual = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${Number(inputFirst) === Number(inputSecond)}`;
    newMath.textContent = `${Limit(inputFirst).equal(inputSecond)}`;
};
const doNotEqual = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const inputSecond = (getId('secondNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = `${Number(inputFirst) !== Number(inputSecond)}`;
    newMath.textContent = `${Limit(inputFirst).notEqual(inputSecond)}`;
};
const doTrunc = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Math.trunc(Number(inputFirst)));
    newMath.textContent = Limit(inputFirst).trunc().format();
};
const doFloor = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Math.floor(Number(inputFirst)));
    newMath.textContent = Limit(inputFirst).floor().format();
};
const doCeil = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Math.ceil(Number(inputFirst)));
    newMath.textContent = Limit(inputFirst).ceil().format();
};
const doRound = () => {
    const inputFirst = (getId('firstNumber') as HTMLInputElement).value;
    const oldMath = getId('oldMath');
    const newMath = getId('newMath');
    oldMath.textContent = format(Math.round(Number(inputFirst)));
    newMath.textContent = Limit(inputFirst).round().format();
};
