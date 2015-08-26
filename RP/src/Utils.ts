/**
 * Created by huanghaiying on 15/1/31.
 */
module utils {
    export function randomInt(start:number, end:number):number {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }

    export function getRemainder(dividend:number, divisor:number):number {
        if (dividend < 0) {
            var remainder:number = dividend * (-1) % divisor;
            return divisor - remainder;
        }
        else {
            return dividend % divisor;
        }
    }
}