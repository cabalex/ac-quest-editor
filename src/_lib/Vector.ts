export default class Vector {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(str: string) {
        [this.x, this.y, this.z, this.w] = str.split(" ").map(parseFloat);
    }

    repack() {
        return `${this.x.toFixed(6)} ${this.y.toFixed(6)} ${this.z.toFixed(6)} ${this.w.toFixed(6)}`;
    }
}