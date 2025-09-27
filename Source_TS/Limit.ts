import { globalSave } from './Special';

/* Overlimit - awWhy's version of break infinity (or Decimal):
    Uses 2 numbers ([mantissa, exponent]) to allow for numbers that are bigger than 1.8e308 (up to like ~9e1.8e308)
    Exponent above maxSafeInteger (~9e15) will start losing some precision (functions like multiply by 10 won't work and etc)

    Altered JS math rules:
    '1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
    '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
    '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
    'Infinity / 0', '-x ** Infinity' now returns NaN instead of Infinity

    Logic behind is to help against bugs (0 ** 0 is a good example)
    In these calculation I assume that Infinity is number Much bigger than its possible to represent
    And NaN being any number and simutanionsly non-number as long as no complex Math is required
*/

type allowedTypes = string | number | bigint | [number, number] | Overlimit;
/** To test number for being Overlimit can use: typeof number === 'object'; Array.isArray(number); number instanceof Overlimit;\
 * Allowed types are string, number, bigint, Overlimit and [number, number];\
 * Provided value exponent must be floored, can call .floorExponent() to floor it: `-2e${Math.log10(0.2)}` === -0.3;\
 * Providing an array will force extra restrictions:\
 * Number must be provided in scientific format ([123, 0] > [1.23, 2]);\
 * If mantissa is 0, then exponent must be 0, same if exponent is -Infinity;\
 * if any part is NaN or Infinity, then both must be NaN or Infinity
 */
export default class Overlimit extends Array<number> { //This is version is sligthly modified
    constructor(number: allowedTypes) {
        const after = technical.convert(number);
        super(after[0], after[1]);
    }
    get mantissa(): number { return this[0]; }
    get exponent(): number { return this[1]; }

    /** Can be used inside native sorting function, equal to a - b. First variable must be Overlimit, doesn't require cloning, example: [1, '2', new Overlimit(3)].sort((a, b) => Overlimit.compareFunc(new Overlimit(b), a)) */
    static compareFunc(left: Overlimit, right: allowedTypes): 1 | 0 | -1 { return left.moreThan(right) ? 1 : left.notEqual(right) ? -1 : 0; }

    /** Creates new Overlimit */
    clone(): Overlimit { return new Overlimit(this); }
    setValue(newValue: allowedTypes): this {
        const after = technical.convert(newValue);
        this[0] = after[0];
        this[1] = after[1];
        return this;
    }
    /** Fixes exponent not being floored, old mantissa will be added into new one */
    floorExponent(): this { return technical.fixExpo(this) as this; }

    plus(number: allowedTypes): this { return technical.add(this, technical.convert(number)) as this; }
    minus(number: allowedTypes): this {
        const after = technical.convert(number);
        return technical.add(this, [-after[0], after[1]]) as this;
    }
    multiply(number: allowedTypes): this { return technical.mult(this, technical.convert(number)) as this; }
    divide(number: allowedTypes): this { return technical.div(this, technical.convert(number)) as this; }
    /** Power must be a number */
    power(power: number): this { return technical.pow(this, power) as this; }
    /** Root must be a number, default value is 2 */
    root(root = 2): this { return technical.pow(this, 1 / root) as this; }
    /** Default value is Math.E */
    log(base?: allowedTypes): this { return technical.log(this, base === undefined ? [Math.E, 0] : technical.convert(base)) as this; }
    /** Experemental version of .log that allows negative numbers as long as complex numbers are not required */
    logExp(base?: allowedTypes): this { return technical.log2(this, base === undefined ? [Math.E, 0] : technical.convert(base)) as this; }

    abs(): this {
        this[0] = Math.abs(this[0]);
        return this;
    }

    trunc(): this { return technical.trunc(this) as this; }
    floor(): this { return technical.floor(this) as this; }
    ceil(): this { return technical.ceil(this) as this; }
    round(): this { return technical.round(this) as this; }

    /** Doesn't check exponent, since exponent being NaN while mantissa isn't would be a bug */
    isNaN(): boolean { return isNaN(this[0])/* || isNaN(this[1])*/; }
    /** Will set new value to the provided one, but only if current one is NaN */
    replaceNaN(replaceWith: allowedTypes): this {
        if (isNaN(this[0])) {
            const after = technical.convert(replaceWith);
            this[0] = after[0];
            this[1] = after[1];
        }
        return this;
    }
    /** Doesn't check exponent, since exponent being Infinity while mantissa isn't would be a bug */
    isFinite(): boolean { return isFinite(this[0])/* && isFinite(this[1])*/; }

    lessThan(compare: allowedTypes): boolean { return technical.less(this, technical.convert(compare)); }
    lessOrEqual(compare: allowedTypes): boolean { return technical.lessOrEqual(this, technical.convert(compare)); }
    moreThan(compare: allowedTypes): boolean { return technical.more(this, technical.convert(compare)); }
    moreOrEqual(compare: allowedTypes): boolean { return technical.moreOrEqual(this, technical.convert(compare)); }
    notEqual(compare: allowedTypes): boolean { return technical.notEqual(this, technical.convert(compare)); }
    equal(compare: allowedTypes): boolean { return technical.equal(this, technical.convert(compare)); }

    max(compare: allowedTypes): this {
        const after = technical.convert(compare);
        if (isNaN(after[0])) {
            this[0] = NaN;
            this[1] = NaN;
        } else if (technical.less(this, after)) {
            this[0] = after[0];
            this[1] = after[1];
        }
        return this;
    }
    min(compare: allowedTypes): this {
        const after = technical.convert(compare);
        if (isNaN(after[0])) {
            this[0] = NaN;
            this[1] = NaN;
        } else if (technical.more(this, after)) {
            this[0] = after[0];
            this[1] = after[1];
        }
        return this;
    }

    /** Returns formatted string, takes object as arqument
     * @param type "number" is default, "input" will make formatted number to be usable in Overlimit
     * @param padding should zeros be added past point, if below max digits. 'exponent' value will behave as true, but only after number turns to power version or above
     */
    format(settings = {} as { type?: 'number' | 'input', padding?: boolean | 'exponent' }): string { return technical.format(this, settings); }
    /** Returns value as Number, doesn't change original number */
    toNumber(): number { return Number(technical.turnString(this)); }
    /** Same as .toNumber, but replaces Infinity and NaN with Number.MAX_VALUE */
    toSafeNumber(): number {
        const result = Number(technical.turnString(this));
        if (isFinite(result)) { return result; }
        return Number.MAX_VALUE * (result < 0 ? -1 : 1);
    }
    /** Returns value as String, doesn't change original number */
    toString(): string { return technical.turnString(this); }
    /** Returns value as Array, doesn't change original number */
    toArray(): [number, number] { return [this[0], this[1]]; }
    /** Automatically called with JSON.stringify. It will call toString to preserve NaN and Infinity */
    toJSON(): string { return technical.turnString(this); }

    allPlus(...numbers: allowedTypes[]): this {
        for (let i = 0; i < numbers.length; i++) {
            technical.add(this, technical.convert(numbers[i]));
        }

        return this;
    }
    allMinus(...numbers: allowedTypes[]): this {
        for (let i = 0; i < numbers.length; i++) {
            const after = technical.convert(numbers[i]);
            technical.add(this, [-after[0], after[1]]);
        }

        return this;
    }
    allMultiply(...numbers: allowedTypes[]): this {
        for (let i = 0; i < numbers.length; i++) {
            technical.mult(this, technical.convert(numbers[i]));
        }

        return this;
    }
    allDivide(...numbers: allowedTypes[]): this {
        for (let i = 0; i < numbers.length; i++) {
            technical.div(this, technical.convert(numbers[i]));
        }

        return this;
    }
    allEqual(...compare: allowedTypes[]): boolean {
        for (let i = 0; i < compare.length; i++) {
            if (technical.notEqual(this, technical.convert(compare[i]))) { return false; }
        }

        return true;
    }
    /** Set original number to the biggest of provided arguments */
    allMax(...compare: allowedTypes[]): this {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < compare.length; i++) {
            const after = technical.convert(compare[i]);
            if (isNaN(after[0])) {
                this[0] = NaN;
                this[1] = NaN;
                return this;
            }

            if (technical.less(result, after)) { result = after; }
        }

        if (result !== this) {
            this[0] = result[0];
            this[1] = result[1];
        }
        return this;
    }
    /** Set original number to the smallest of provided arguments */
    allMin(...compare: allowedTypes[]): this {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < compare.length; i++) {
            const after = technical.convert(compare[i]);
            if (isNaN(after[0])) {
                this[0] = NaN;
                this[1] = NaN;
                return this;
            }

            if (technical.more(result, after)) { result = after; }
        }

        if (result !== this) {
            this[0] = result[0];
            this[1] = result[1];
        }
        return this;
    }
}

/** Private Overlimit functions */
const technical = {
    convert: (number: allowedTypes): [number, number] | Overlimit => {
        if (typeof number === 'object' && number !== null) { return number; } //Readonly Array
        const index = typeof number === 'string' ? number.indexOf('e') : -1; //Non-string is less accurate, but float fix does help
        const result: [number, number] = index === -1 ? [Number(number), 0] : [Number((number as string).slice(0, index)), Number((number as string).slice(index + 1))]; //Array.split is 3 times slower

        if (!isFinite(result[0]) || !isFinite(result[1])) {
            if (result[0] === 0 || result[1] === -Infinity) { return [0, 0]; }
            if (isNaN(result[0]) || isNaN(result[1])) { return [NaN, NaN]; }
            return [result[0] < 0 ? -Infinity : Infinity, Infinity];
        }

        const after = Math.abs(result[0]);
        if (after === 0) {
            return [0, 0];
        } else if (after < 1 || after >= 10) {
            const digits = Math.floor(Math.log10(after));
            result[0] /= 10 ** digits;
            result[1] += digits;

            if (Math.abs(result[0]) < 1) { //Important
                result[0] *= 10;
                result[1]--;
            }
        }

        //Float fix always done after exponent, because (11.1 / 10 !== 1.11)
        result[0] = Math.round(result[0] * 1e14) / 1e14;
        if (Math.abs(result[0]) === 10) {
            result[0] /= 10;
            result[1]++;
        }

        return result;
    },
    fixExpo: (number: Overlimit): Overlimit => {
        const target = Math.floor(number[1]);
        if (target !== number[1]) {
            const negative = number[0] < 0;
            number[0] = Math.round((10 ** (number[1] - target) - 1 + Math.abs(number[0])) * 1e14) / 1e14;
            number[1] = target;

            if (number[0] >= 10) {
                number[0] /= 10;
                number[1]++;
            }
            if (negative) { number[0] *= -1; }
        }
        return number;
    },
    /* Number is readonly */
    turnString: (number: Overlimit): string => number[1] === 0 || !isFinite(number[0]) ? `${number[0]}` : `${number[0]}e${number[1]}`,
    /* Right is readonly */
    add: (left: Overlimit, right: [number, number] | Overlimit): Overlimit => {
        if (right[0] === 0) { return left; }
        if (left[0] === 0) {
            left[0] = right[0];
            left[1] = right[1];
            return left;
        } else if (!isFinite(left[0]) || !isFinite(right[0])) {
            left[0] += right[0]; //Infinity + -Infinity === NaN
            left[1] = isNaN(left[0]) ? NaN : Infinity;
            return left;
        }

        const difference = left[1] - right[1];
        if (Math.abs(difference) >= 16) {
            if (difference < 0) {
                left[0] = right[0];
                left[1] = right[1];
            }
            return left;
        }

        if (difference >= 0) {
            left[0] += right[0] / 10 ** difference;
        } else {
            left[0] = right[0] + (left[0] * 10 ** difference);
            left[1] = right[1];
        }

        const after = Math.abs(left[0]);
        if (after === 0) {
            left[1] = 0;
            return left;
        } else if (after >= 10) {
            left[0] /= 10;
            left[1]++;
        } else if (after < 1) {
            const digits = -Math.floor(Math.log10(after));
            left[0] *= 10 ** digits;
            left[1] -= digits;
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }
        return left;
    },
    /* Right is readonly */
    mult: (left: Overlimit, right: [number, number] | Overlimit): Overlimit => {
        if (left[0] === 0) { return left; }
        if (right[0] === 0) {
            left[0] = 0;
            left[1] = 0;
            return left;
        }

        left[1] += right[1];
        left[0] *= right[0];

        if (!isFinite(left[1])) {
            if (left[1] === -Infinity) {
                left[0] = 0;
                left[1] = 0;
            } else {
                left[0] = left[1] === Infinity ? Infinity : NaN;
            }
            return left;
        }

        if (Math.abs(left[0]) >= 10) {
            left[0] /= 10;
            left[1]++;
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }
        return left;
    },
    /* Right is readonly */
    div: (left: Overlimit, right: [number, number] | Overlimit): Overlimit => {
        if (right[0] === 0) {
            left[0] = NaN;
            left[1] = NaN;
            return left;
        }

        left[1] -= right[1];
        left[0] /= right[0];

        if (!isFinite(left[1])) {
            if (left[1] === -Infinity) {
                left[0] = 0;
                left[1] = 0;
            } else {
                left[0] = left[1] === Infinity ? Infinity : NaN;
            }
            return left;
        }

        if (Math.abs(left[0]) < 1) {
            left[0] *= 10;
            left[1]--;
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }
        return left;
    },
    pow: (left: Overlimit, power: number): Overlimit => {
        if (left[0] === 0) {
            if (power <= 0 || isNaN(power)) {
                left[0] = NaN;
                left[1] = NaN;
            }
            return left;
        } else if (power === 0) { //left !== 0
            if (!isNaN(left[0])) {
                left[0] = 1;
                left[1] = 0;
            }
            return left;
        } else if (!isFinite(power)) {
            if (left[1] === 0 && left[0] === 1) { return left; }
            if (left[0] < 0 || isNaN(left[0]) || isNaN(power)) {
                left[0] = NaN;
                left[1] = NaN;
            } else if ((power === -Infinity && left[1] >= 0) || (power === Infinity && left[1] < 0)) {
                left[0] = 0;
                left[1] = 0;
            } else {
                left[0] = Infinity;
                left[1] = Infinity;
            }
            return left;
        }

        const negative = left[0] < 0 ? Math.abs(power) % 2 : null;
        if (negative !== null) { //Complex numbers are not supported
            if (Math.floor(power) !== power) {
                left[0] = NaN;
                left[1] = NaN;
                return left;
            }
            left[0] *= -1;
        }

        const base10 = power * (Math.log10(left[0]) + left[1]);
        if (!isFinite(base10)) {
            if (isNaN(left[0])) { return left; }
            if (base10 === -Infinity) {
                left[0] = 0;
                left[1] = 0;
            } else {
                left[0] = negative === 1 ? -Infinity : Infinity;
                left[1] = Infinity;
            }
            return left;
        }

        const target = Math.floor(base10);
        left[0] = Math.round(10 ** (base10 - target) * 1e14) / 1e14;
        left[1] = target;

        if (left[0] === 10) {
            left[0] = 1;
            left[1]++;
        }

        if (negative === 1) { left[0] *= -1; }
        return left;
    },
    /* Base is readonly */
    log: (left: Overlimit, base: [number, number] | Overlimit): Overlimit => {
        if (base[0] <= 0 || (base[1] === 0 && base[0] === 1)) {
            left[0] = NaN;
            left[1] = NaN;
            return left;
        } else if (left[1] === 0 && left[0] === 1) { //base !== 0
            if (isNaN(base[0])) {
                left[0] = NaN;
                left[1] = NaN;
            } else { left[0] = 0; }
            return left;
        } else if (left[0] <= 0) { //base !== 0
            if (isNaN(base[0]) || left[0] !== 0) {
                left[0] = NaN;
                left[1] = NaN;
            } else { //Base being Infinity only allowed for consistency
                left[0] = base[1] < 0 ? Infinity : -Infinity;
                left[1] = Infinity;
            }
            return left;
        } else if (!isFinite(left[0]) || !isFinite(base[0])) {
            if (left[0] !== Infinity || isNaN(base[0])) { //base === -Infinity
                left[0] = NaN;
                left[1] = NaN;
            } else { //Base being Infinity only allowed for consistency
                left[0] = base[1] < 0 ? -Infinity : Infinity;
                left[1] = Infinity;
            }
            return left;
        }

        const tooSmall = left[1] < 0; //Minor issue with negative power
        const base10 = Math.log10(Math.abs(Math.log10(left[0]) + left[1]));
        const target = Math.floor(base10);
        left[0] = 10 ** (base10 - target);
        left[1] = target;

        if (tooSmall) { left[0] *= -1; } //Already can be negative
        if (base[1] !== 1 || base[0] !== 1) {
            left[0] /= Math.log10(base[0]) + base[1];

            const after = Math.abs(left[0]);
            if (after < 1 || after >= 10) {
                const digits = Math.floor(Math.log10(after));
                left[0] /= 10 ** digits;
                left[1] += digits;
            }
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }
        return left;
    },
    /* Base is readonly */
    log2: (left: Overlimit, base: [number, number] | Overlimit): Overlimit => {
        const baseNeg = base[0] < 0;
        if (baseNeg) {
            if (base[0] === -Infinity && left[0] !== 0 && (left[0] !== 1 || left[1] !== 0)) {
                left[0] = NaN;
                left[1] = NaN;
                return left;
            }
            base = [-base[0], base[1]];
        }
        const leftNeg = left[0] < 0;
        if (leftNeg) {
            if (!baseNeg || left[0] === -Infinity || (left[0] === -1 && left[1] === 0)) {
                left[0] = NaN;
                left[1] = NaN;
                return left;
            }
            left[0] *= -1;
        }
        if (!isFinite(technical.log(left, base)[0])) { return left; }

        if ((baseNeg || leftNeg) && (left[1] < 0 || //Result below must be (leftNeg ? odd : even), big numbers are always even
            (left[1] < 16 ? Math.abs(Math.round(left[0] * 1e14) / 10 ** (14 - left[1])) % 2 : 0) !== (leftNeg ? 1 : 0))) {
            left[0] = NaN;
            left[1] = NaN;
        }
        return left;
    },
    /* Left and right are readonly */
    less: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] < right[0]; }
        if (right[0] > 0) { return left[0] < 0 ? true : right[1] > left[1]; } //NaN safety
        return left[0] < 0 && right[1] < left[1];
    },
    /* Left and right are readonly */
    lessOrEqual: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] <= right[0]; }
        if (right[0] > 0) { return left[0] < 0 ? true : right[1] > left[1]; } //NaN safety
        return left[0] < 0 && right[1] < left[1];
    },
    /* Left and right are readonly */
    more: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] > right[0]; }
        if (left[0] > 0) { return right[0] < 0 ? true : left[1] > right[1]; } //NaN safety
        return right[0] < 0 && left[1] < right[1];
    },
    /* Left and right are readonly */
    moreOrEqual: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] >= right[0]; }
        if (left[0] > 0) { return right[0] < 0 ? true : left[1] > right[1]; } //NaN safety
        return right[0] < 0 && left[1] < right[1];
    },
    /* Left and right are readonly */
    equal: (left: Overlimit, right: [number, number] | Overlimit): boolean => {
        return left[1] === right[1] && left[0] === right[0];
    },
    /* Left and right are readonly */
    notEqual: (left: Overlimit, right: [number, number] | Overlimit): boolean => {
        return left[1] !== right[1] || left[0] !== right[0];
    },
    trunc: (left: Overlimit): Overlimit => {
        if (left[1] < 14) {
            if (left[1] < 0) {
                left[0] = 0;
                left[1] = 0;
            } else {
                left[0] = Math.trunc(left[0] * 10 ** left[1]) / 10 ** left[1];
            }
        }
        return left;
    },
    floor: (left: Overlimit): Overlimit => {
        if (left[1] < 14) {
            if (left[1] < 0) {
                left[0] = left[0] < 0 ? -1 : 0;
                left[1] = 0;
            } else {
                left[0] = Math.floor(left[0] * 10 ** left[1]) / 10 ** left[1];

                if (left[0] === -10) {
                    left[0] = -1;
                    left[1]++;
                }
            }
        }
        return left;
    },
    ceil: (left: Overlimit): Overlimit => {
        if (left[1] < 14) {
            if (left[1] < 0) {
                left[0] = left[0] < 0 ? 0 : 1;
                left[1] = 0;
            } else {
                left[0] = Math.ceil(left[0] * 10 ** left[1]) / 10 ** left[1];

                if (left[0] === 10) {
                    left[0] = 1;
                    left[1]++;
                }
            }
        }
        return left;
    },
    round: (left: Overlimit): Overlimit => {
        if (left[1] < 14) {
            if (left[1] < 0) {
                left[0] = left[1] === -1 ? Math.round(left[0] / 10) : 0;
                left[1] = 0;
            } else {
                left[0] = Math.round(left[0] * 10 ** left[1]) / 10 ** left[1];

                if (Math.abs(left[0]) === 10) {
                    left[0] /= 10;
                    left[1]++;
                }
            }
        }
        return left;
    },
    /* Left is readonly. String.replace can be replaced with .slice for 4x speed up if required, but I am just going to hope that it will be optimized by browsers eventually */
    format: (left: [number, number] | Overlimit, settings: { type?: 'number' | 'input', padding?: boolean | 'exponent' }): string => {
        const [base, power] = left;
        if (!isFinite(base)) { return `${base}`; }
        const type = settings.type ?? 'number';
        let padding = settings.padding;

        if (power >= 1e4 || power <= -1e4) { //e1.23e123 (-e-1.23e123)
            if (padding === 'exponent') { padding = true; }
            let exponent = power;
            let inputBase = base;
            if (Math.abs(Math.round(inputBase)) === 10) { //Probably not required, but just in case
                inputBase /= 10;
                exponent++;
                if (exponent < 0 && exponent > -1e4) { return technical.format([inputBase, exponent], settings); }
            }

            exponent = Math.floor(Math.log10(Math.abs(exponent)));
            let digits = 2 - Math.floor(Math.log10(exponent));
            let mantissa = Math.round(power / 10 ** (exponent - digits)) / 10 ** digits;
            if (Math.abs(mantissa) === 10) { //To remove rare bugs
                mantissa /= 10;
                exponent++;
                if (padding) { digits = 2 - Math.floor(Math.log10(exponent)); }
            }

            if (type !== 'input') { mantissa = Math.abs(mantissa); }
            const formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
            return type === 'input' ? `${inputBase}e${formated}e${exponent}` :
                `${base < 0 ? '-' : ''}${formated.replace('.', globalSave.format[0])}e${power < 0 ? '-' : ''}e${exponent}`; //1.23ee123 (-1.23e-e123)
        }

        if (power >= 6 || power < -4) { //1.23e123 (-1.23e-123)
            if (padding === 'exponent') { padding = true; }

            let digits = 3 - Math.floor(Math.log10(Math.abs(power)));
            let mantissa = Math.round(base * 10 ** digits) / 10 ** digits;
            let exponent = power;
            if (Math.abs(mantissa) === 10) { //To remove rare bugs
                mantissa /= 10;
                exponent++;
                if (exponent === -4 || exponent === 1e4) { return technical.format([mantissa, exponent], settings); }
                if (padding) { digits = 3 - Math.floor(Math.log10(Math.abs(exponent))); }
            }

            const formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
            return type === 'input' ? `${formated}e${exponent}` : `${formated.replace('.', globalSave.format[0])}e${exponent}`;
        }

        //12345 (-12345)
        let digits = power < 1 ? 5 : (5 - power);
        const mantissa = Math.round(base * 10 ** (digits + power)) / 10 ** digits;

        const powerCheck = Math.floor(Math.log10(Math.abs(mantissa))); //To remove rare bugs
        if (powerCheck === 6) { return technical.format([base < 0 ? -1 : 1, powerCheck], settings); }
        if (padding === 'exponent') {
            padding = false;
        } else if (padding && powerCheck !== power) { digits = powerCheck < 1 ? 5 : (5 - powerCheck); }

        let formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
        if (type !== 'input') {
            let index = formated.indexOf('.');
            if (index !== -1) {
                formated = `${formated.slice(0, index)}${globalSave.format[0]}${formated.slice(index + 1)}`;
            } else { index = formated.length; }
            if (index > 3) {
                index -= 3;
                formated = `${formated.slice(0, index)}${globalSave.format[1]}${formated.slice(index)}`;
            }
        }
        return formated;
    }
};

export const { compareFunc } = Overlimit;
