import {range} from './range';

export type Point = [x: number, y: number];

export class Grid2D<T> {
    height: number;
    width: number;
    #size: number;
    #offset: number;
    #data: T[];

    constructor(
        height: number,
        width: number,
        fillValue: T = undefined,
    ) {
        this.height = height;
        this.width = width;
        this.#offset = Math.max(height, width);
        this.#size = this.#offset * this.#offset;
        this.#data = new Array(this.#size).fill(fillValue);
    }

    static parse<T>(input: T[][]) {
        const yDim = input.length;
        const xDim = input[0].length;
        const grid = new Grid2D<T>(yDim, xDim);

        for (let y = 0; y < yDim; y++) {
            for (let x = 0; x < xDim; x++) {
                grid.set(x, y, input[y][x]);
            }
        }

        return grid;
    }

    toString() {
        return `${Grid2D.name} [w: ${this.width}, h: ${this.height}]`;
    }

    get(x: number, y: number) {
        if (x < 0 || x > this.width - 1) return;
        if (y < 0 || y > this.height - 1) return;

        return this.#data[x + y * this.#offset];
    }

    set(x: number, y: number, value: T) {
        if (x < 0 || x > this.width - 1) return;
        if (y < 0 || y > this.height - 1) return;

        this.#data[x + y * this.#offset] = value;
    }

    /**
     * only available iff T extends number
     */
    increment(x: number, y: number) {
        (this.#data[x + y * this.#offset] as number)++;
    }

    /**
     * only available iff T extends number
     */
    incrementLine(x1: number, y1: number, x2: number, y2: number) {
        const slope = (start: number, end: number) => start === end ? 0 : (start > end ? -1 : 1);

        const dx = slope(x1, x2);
        const dy = slope(y1, y2);
        const length = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
        for (let i = 0; i <= length; i++) this.increment(x1 + i * dx, y1 + i * dy);
    }

    filter(predicate: (value: T) => boolean): T[] {
        return this.#data.filter(predicate);
    }

    count(predicate: (value: T) => boolean): number {
        return this.filter(predicate).length;
    }

    find(predicate: (value: T) => boolean): Point {
        const idx = this.#data.findIndex(predicate);
        const y = Math.floor(idx / this.#offset);
        const x = idx - y * this.#offset;
        return [x, y];
    }

    findValue(value: T) {
        return this.find(v => v === value);
    }

    findAll(predicate: (value: T) => boolean): Point[] {
        const res: Point[] = [];
        for (let idx = 0; idx < this.#size; idx++) {
            if (predicate(this.#data[idx])) {
                const y = Math.floor(idx / this.#offset);
                const x = idx - y * this.#offset;
                res.push([x, y]);
            }
        }
        return res;
    }

    adjacent(x: number, y: number): Point[] {
        const res: Point[] = [];
        if (x > 0) res.push([x - 1, y]);
        if (x < this.width - 1) res.push([x + 1, y]);
        if (y > 0) res.push([x, y - 1]);
        if (y < this.height - 1) res.push([x, y + 1]);
        return res;
    }

    horizontals() {
        return range(0, this.height - 1).map(y =>
            range(0, this.width - 1).map(x =>
                this.get(x, y)
            )
        );
    }

    verticals() {
        return range(0, this.width - 1).map(x =>
            range(0, this.height - 1).map(y =>
                this.get(x, y)
            )
        );
    }

    diagonals() {
        const numDiags = this.width + this.height - 2;
        const maxDiagLength = Math.min(this.width, this.height);
        return range(0, numDiags).map(diagIdx => {
            const diagLength = Math.min(
                maxDiagLength,
                diagIdx < numDiags / 2
                    ? diagIdx + 1
                    : numDiags - diagIdx + 1
            );
            const startX = diagIdx < this.height ? 0 : diagIdx - this.height + 1;
            const startY = diagIdx < this.height ? this.height - diagIdx - 1 : 0;

            return range(0, diagLength - 1).map(idx =>
                this.get(startX + idx, startY + idx)
            );
        });
    }

    antiDiagonals() {
        const numDiags = this.width + this.height - 2;
        const maxDiagLength = Math.min(this.width, this.height);
        return range(0, numDiags).map(diagIdx => {
            const diagLength = Math.min(
                maxDiagLength,
                diagIdx < numDiags / 2
                    ? diagIdx + 1
                    : numDiags - diagIdx + 1
            );
            const startX = diagIdx < this.width ? diagIdx : this.width - 1;
            const startY = diagIdx < this.width ? 0 : diagIdx - this.height + 1;

            return range(0, diagLength - 1).map(idx =>
                this.get(startX - idx, startY + idx)
            );
        });
    }

    print(delimiter = '', pad = 0) {
        console.log(this.horizontals().map(h => h.map(v => String(v).padStart(pad, ' ')).join(delimiter)).join('\n'));
    };
}

export class Grid3D<T extends number = number> {
    height: number;
    width: number;
    depth: number;
    #size: number;
    #data: T[];
    #yMod: number;
    #zMod: number;

    constructor(
        height: number,
        width: number,
        depth: number,
        fillValue = 0,
    ) {
        this.height = height;
        this.width = width;
        this.depth = depth;
        this.#size = height * width * depth;
        this.#data = new Array(this.#size).fill(fillValue);

        this.#yMod = height;
        this.#zMod = height * width;
    }

    get(x: number, y: number, z: number) {
        return this.#data[x + y * this.#yMod + z * this.#zMod];
    }

    set(x: number, y: number, z: number, value: T) {
        this.#data[x + y * this.#yMod + z * this.#zMod] = value;
    }

    increment(x: number, y: number, z: number) {
        this.#data[x + y * this.#yMod, z * this.#zMod]++;
    }

    setCube(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, value: T) {
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                for (let z = z1; z <= z2; z++) {
                    this.set(x, y, z, value);
                }
            }
        }
    }

    filter(predicate: (value: T) => boolean): T[] {
        return this.#data.filter(predicate);
    }

    count(predicate: (value: T) => boolean): number {
        return this.filter(predicate).length;
    }
}
