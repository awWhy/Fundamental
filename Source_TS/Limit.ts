import { player } from './Player';
/* Some JS rules are altered:
    '-+1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
    '0 ** 0', 'Infinity ** 0', 'NaN ** 0' now retuns NaN instead of 1
    '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
    'Infinity / 0' now returns NaN instead of Infinity
    '0 / NaN' now returns 0 instead of NaN
    'NaN ** (-Infinity)' now returns 0 instead of NaN (I allow X ** (-Infinity) to be 0 because floating points)
*/

/* This is version has all settings (and other stuff) removed (for better speed) */
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
            lessThan: (compare: string | number | [number, number]): boolean => technical.less(result, technical.convert(compare)),
            lessOrEqual: (compare: string | number | [number, number]): boolean => technical.lessOrEqual(result, technical.convert(compare)),
            moreThan: (compare: string | number | [number, number]): boolean => technical.more(result, technical.convert(compare)),
            moreOrEqual: (compare: string | number | [number, number]): boolean => technical.moreOrEqual(result, technical.convert(compare)),
            notEqual: (compare: string | number | [number, number]): boolean => technical.notEqual(result, technical.convert(compare)),
            equal: (...compare: Array<string | number | [number, number]>): boolean => {
                const array = technical.convertAll(compare);

                let allEqual = technical.equal(result, array[0]);
                for (let i = 1; i < array.length; i++) {
                    //&&= will not call equal function if itself is false
                    allEqual &&= technical.equal(array[i - 1], array[i]);
                }

                return allEqual;
            },
            max: function(...compare: Array<string | number | [number, number]>) {
                const array = technical.convertAll(compare);

                for (let i = 0; i < array.length; i++) {
                    if (isNaN(array[i][0])) {
                        result = [NaN, NaN];
                        break;
                    }

                    if (technical.less(result, array[i])) { result = array[i]; }
                }

                return this;
            },
            min: function(...compare: Array<string | number | [number, number]>) {
                const array = technical.convertAll(compare);

                for (let i = 0; i < array.length; i++) {
                    if (isNaN(array[i][0])) {
                        result = [NaN, NaN];
                        break;
                    }

                    if (technical.more(result, array[i])) { result = array[i]; }
                }

                return this;
            },
            format: (settings = {} as { digits?: number, type?: 'number' | 'input', padding?: boolean }): string => technical.format(result, settings),
            toNumber: (): number => Number(technical.convertBack(result)),
            toString: (): string => technical.convertBack(result),
            toArray: (): [number, number] => technical.prepare(result)
        };
    },
    LimitAlt: {
        //Faster methods (?), because no need to convert in both directions
        abs: (number: string): string => number[0] === '-' ? number.substring(1) : number,
        isNaN: (number: string): boolean => number.includes('NaN'),
        isFinite: (number: string): boolean => !number.includes('Infinity') && !number.includes('NaN'),
        clone: (number: [number, number]): [number, number] => [number[0], number[1]]
    },
    technical: {
        add: (left: [number, number], right: [number, number]): [number, number] => {
            if (right[0] === 0) { return left; }
            if (left[0] === 0) { return right; }
            if (!isFinite(left[0]) || !isFinite(right[0])) {
                const check = left[0] + right[0]; //Infinity + -Infinity === NaN
                return isNaN(left[0]) || isNaN(right[0]) || isNaN(check) ? [NaN, NaN] : [check, Infinity];
            }

            const difference = left[1] - right[1];
            if (Math.abs(difference) >= 14) { return difference > 0 ? left : right; }

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
                const digits = -Math.floor(Math.log10(after));
                left[0] *= 10 ** digits;
                left[1] -= digits;
            }

            return left;
        },
        sub: (left: [number, number], right: [number, number]): [number, number] => {
            right[0] *= -1; //Easier this way
            return overlimit.technical.add(left, right);
        },
        mult: (left: [number, number], right: [number, number]): [number, number] => {
            if (left[0] === 0 || right[0] === 0) { return [0, 0]; }

            left[1] += right[1];
            left[0] *= right[0];

            if (Math.abs(left[0]) >= 10) {
                left[0] /= 10;
                left[1]++;
            }

            return left;
        },
        div: (left: [number, number], right: [number, number]): [number, number] => {
            if (right[0] === 0) { return [NaN, NaN]; }
            if (left[0] === 0) { return [0, 0]; }

            left[1] -= right[1];
            left[0] /= right[0];

            if (Math.abs(left[0]) < 1) {
                left[0] *= 10;
                left[1]--;
            }

            return left;
        },
        pow: (left: [number, number], power: number): [number, number] => {
            if (power === 0) { return left[0] === 0 || !isFinite(left[0]) ? [NaN, NaN] : [1, 0]; }
            if (left[0] === 0) { return power < 0 ? [NaN, NaN] : [0, 0]; }
            if (!isFinite(power)) {
                if (left[1] === 0 && (left[0] === 1 || (left[0] === -1 && !isNaN(power)))) { return [1, 0]; }
                if ((power === -Infinity && left[1] >= 0) || (power === Infinity && left[1] < 0)) { return [0, 0]; }
                return isNaN(power) || isNaN(left[0]) ? [NaN, NaN] : [Infinity, Infinity];
            }

            const negative = left[0] < 0 ? Math.abs(power) % 2 : null;
            if (negative !== null) { //Complex numbers are not supported
                if (Math.floor(power) !== power) { return [NaN, NaN]; }
                left[0] *= -1;
            }

            const base10 = power * (Math.log10(left[0]) + left[1]);
            if (!isFinite(base10)) {
                if (isNaN(left[0])) { return [NaN, NaN]; }
                if (base10 === -Infinity) { return [0, 0]; }
                return [negative === 1 ? -Infinity : Infinity, Infinity];
            }

            const target = Math.floor(base10);
            left[0] = 10 ** (base10 - target);
            left[1] = target;

            if (negative === 1) { left[0] *= -1; }
            return left;
        },
        log: (left: [number, number], base: number): [number, number] => {
            if (Math.abs(base) === 1 || (left[0] === -1 && left[1] === 0)) { return [NaN, NaN]; }
            if (left[0] === 1 && left[1] === 0) { return [0, 0]; }
            if (base === 0) { return [NaN, NaN]; } //Order matters (0 ** 0 === 1)
            if (left[0] === 0) { return isNaN(base) ? [NaN, NaN] : [Math.abs(base) > 1 ? -Infinity : Infinity, Infinity]; }
            if (!isFinite(base)) { return [NaN, NaN]; } //Order matters (Infinity ** 0 === 1 || Infinity ** -Infinity === 0)
            if (!isFinite(left[0])) {
                if (isNaN(left[0]) || left[0] === -Infinity) { return [NaN, NaN]; }
                return [Math.abs(base) < 1 ? -Infinity : Infinity, Infinity];
            }

            const negative = left[0] < 0;
            if (negative) { //Complex numbers are not supported
                if (base > 0) { return [NaN, NaN]; }
                left[0] *= -1;
            }

            const tooSmall = left[1] < 0; //Minor issue with negative power
            const base10 = Math.log10(Math.abs(Math.log10(left[0]) + left[1]));
            const target = Math.floor(base10);
            left[0] = (10 ** (base10 - target));
            left[1] = target;

            if (tooSmall) { left[0] *= -1; } //Already can be negative
            if (base !== 10) {
                left[0] /= Math.log10(Math.abs(base));

                const after = Math.abs(left[0]);
                if (after < 1 || after >= 10) {
                    const digits = Math.floor(Math.log10(after));
                    left[0] /= 10 ** digits;
                    left[1] += digits;
                }
            }

            if (base < 0 || negative) { //Special test for negative numbers
                if (left[1] < 0) { return [NaN, NaN]; }
                const test = left[1] < 16 ?
                    Math.abs(Math.round(left[0] * 1e14) / 10 ** (14 - left[1])) % 2 : //Fix floats and find if even
                    0; //Assuming that big numbers never uneven
                if (base < 0 && !negative) {
                    if (test !== 0) { return [NaN, NaN]; } //Result must be even
                } else { //base < 0 && negative
                    if (test !== 1) { return [NaN, NaN]; } //Result must be uneven
                }
            }
            return left;
        },
        less: (left: [number, number], right: [number, number]): boolean => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            right[0] = Math.round(right[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }
            if (Math.abs(right[0]) === 10) {
                right[0] = 1;
                right[1]++;
            }

            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] < right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] < right[1]; }
            if (left[0] < 0 && right[0] > 0) { return true; }
            if (right[0] < 0 && left[0] > 0) { return false; }
            return left[1] > right[1];
        },
        lessOrEqual: (left: [number, number], right: [number, number]): boolean => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            right[0] = Math.round(right[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }
            if (Math.abs(right[0]) === 10) {
                right[0] = 1;
                right[1]++;
            }

            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] <= right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] < right[1]; }
            if (left[0] < 0 && right[0] > 0) { return true; }
            if (right[0] < 0 && left[0] > 0) { return false; }
            return left[1] > right[1];
        },
        more: (left: [number, number], right: [number, number]): boolean => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            right[0] = Math.round(right[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }
            if (Math.abs(right[0]) === 10) {
                right[0] = 1;
                right[1]++;
            }

            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] > right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] > right[1]; }
            if (left[0] < 0 && right[0] > 0) { return false; }
            if (right[0] < 0 && left[0] > 0) { return true; }
            return left[1] < right[1];
        },
        moreOrEqual: (left: [number, number], right: [number, number]): boolean => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            right[0] = Math.round(right[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }
            if (Math.abs(right[0]) === 10) {
                right[0] = 1;
                right[1]++;
            }

            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] >= right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] > right[1]; }
            if (left[0] < 0 && right[0] > 0) { return false; }
            if (right[0] < 0 && left[0] > 0) { return true; }
            return left[1] < right[1];
        },
        equal: (left: [number, number], right: [number, number]): boolean => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            right[0] = Math.round(right[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }
            if (Math.abs(right[0]) === 10) {
                right[0] = 1;
                right[1]++;
            }

            return left[1] === right[1] ? left[0] === right[0] : false;
        },
        notEqual: (left: [number, number], right: [number, number]): boolean => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            right[0] = Math.round(right[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }
            if (Math.abs(right[0]) === 10) {
                right[0] = 1;
                right[1]++;
            }

            return left[1] !== right[1] ? true : left[0] !== right[0];
        },
        trunc: (left: [number, number]): [number, number] => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            if (left[1] < 0) {
                return [0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.trunc(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.trunc(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        floor: (left: [number, number]): [number, number] => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            if (left[1] < 0) {
                return [left[0] < 0 ? -1 : 0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.floor(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.floor(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        ceil: (left: [number, number]): [number, number] => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            if (left[1] < 0) {
                return [left[0] < 0 ? 0 : 1, 0];
            } else if (left[1] === 0) {
                left[0] = Math.ceil(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.ceil(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        round: (left: [number, number]): [number, number] => {
            left[0] = Math.round(left[0] * 1e14) / 1e14; //Fix floats
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            if (left[1] < 0) {
                return [left[1] === -1 ? Math.round(left[0] / 10) : 0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.round(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.round(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        format: (left: [number, number], settings: { digits?: number, type?: 'number' | 'input', padding?: boolean }): string => {
            const [base, power] = left;
            if (!isFinite(base) || !isFinite(power)) { return overlimit.technical.convertBack(left); }
            //Minimal optimization possible (changing ?? to === undefined), but very minor

            //Self added part
            if (!player.inflation.vacuum && power >= 300) { return 'Infinity'; }

            //1.23ee123 (-1.23e-e123)
            if ((power >= 1e3 || power <= -1e3) && settings.type !== 'input') {
                const digits = settings.digits ?? 2;
                let exponent = Math.floor(Math.log10(Math.abs(power)));
                let result = Math.abs(Math.round(power / 10 ** (exponent - digits)) / 10 ** digits);
                if (result === 10) {
                    result = 1;
                    exponent++;
                }
                if (base < 0) { result *= -1; }

                const formated = settings.padding === true ?
                    result.toFixed(digits).replace('.', player.separator[1]) :
                    `${result}`.replace('.', player.separator[1]);
                return `${formated}e${power < 0 ? '-' : ''}e${exponent}`;
            }

            //1.23e123
            if (power >= 6 || power < -3) {
                const digits = settings.digits ?? 2;
                let exponent = power;
                let result: number | string = Math.round(base * 10 ** digits) / 10 ** digits;
                if (Math.abs(result) === 10) {
                    result = 1;
                    exponent++;
                }

                if (settings.padding === true) { result = result.toFixed(digits); }
                return settings.type !== 'input' ? `${`${result}`.replace('.', player.separator[1])}e${exponent}` : `${result}e${exponent}`;
            }

            //12345
            const digits = power >= 3 ? 0 : settings.digits ?? (power < 0 ? 4 : 2);
            let formated: number | string = Math.round(base * 10 ** (digits + power)) / 10 ** digits;
            formated = digits > 0 && settings.padding === true ? formated.toFixed(digits) : `${formated}`;
            if (settings.type !== 'input') {
                formated = power >= 3 ?
                    formated.replace(/\B(?=(\d{3})+(?!\d))/, player.separator[0]) :
                    formated.replace('.', player.separator[1]);
            }

            return formated;
        },
        convert: (number: string | number | [number, number]): [number, number] => {
            let result: [number, number];
            if (typeof number !== 'object' || number === null) { //Not an Array
                if (typeof number !== 'string') { number = `${number}`; } //Using log10 could cause floating point error
                const index = number.indexOf('e'); //About 5+ times quicker than regex
                result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
            } else {
                result = [number[0], number[1]]; //Not instant return, because might need a fix
            }

            if (!isFinite(result[0])) { return isNaN(result[0]) ? [NaN, NaN] : [result[0], Infinity]; }

            if (Math.floor(result[1]) !== result[1]) { //Fix non trunc exponent ([2, 10.1] > [2.5, 10])
                result[0] *= 10 ** (result[1] - Math.floor(result[1]));
                result[1] = Math.floor(result[1]);
            }

            const after = Math.abs(result[0]);
            if (after === 0) {
                return [0, 0];
            } else if (after < 1 || after >= 10) {
                const digits = Math.floor(Math.log10(after));
                result[0] /= 10 ** digits;
                result[1] += digits;

                //Safety for functions like 'trunc', 'less'
                if (Math.abs(result[0]) < 1) { //Happens more often than you would think
                    result[0] *= 10;
                    result[1]--;
                }
            }

            return result;
        },
        convertAll: (numbers: Array<string | number | [number, number]>): Array<[number, number]> => {
            const result = [];
            const { convert } = overlimit.technical;
            for (let i = 0; i < numbers.length; i++) {
                result[i] = convert(numbers[i]);
            }
            return result;
        },
        prepare: (number: [number, number]): [number, number] => {
            if (!isFinite(number[0]) || !isFinite(number[1])) {
                if (number[0] === 0 || number[1] === -Infinity) { return [0, 0]; }
                if (isNaN(number[0]) || isNaN(number[1])) { return [NaN, NaN]; }
                return [number[0] < 0 ? -Infinity : Infinity, Infinity]; //Base can be non Infinity
            }

            if (number[1] >= 1e3 || number[1] <= -1e3) {
                number[0] = Math.round(number[0]);
            } else {
                number[0] = Math.round(number[0] * 1e14) / 1e14;

                if (Math.abs(number[0]) === 10) { //Just in case
                    number[0] = 1;
                    number[1]++;
                }
            }

            return number;
        },
        convertBack: (number: [number, number]): string => {
            number = overlimit.technical.prepare(number);
            if (!isFinite(number[0])) { return `${number[0]}`; }

            if (Math.abs(number[1]) < 1e16) { return number[1] === 0 ? `${number[0]}` : `${number[0]}e${number[1]}`; }

            const exponent = Math.floor(Math.log10(number[1]));
            const result = Math.round(number[1] / 10 ** (exponent - 14)) / 1e14;

            return `${number[0]}e${result}e${exponent}`;
        }
    }
};

export const { Limit, LimitAlt } = overlimit;
export default Limit;
