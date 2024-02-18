export default class Vector {
    x = 0;
    y = 0;
    z = 0;
    w = 0;

    constructor(str?: string) {
        if (str) {
            [this.x, this.y, this.z, this.w] = str.split(" ").map(parseFloat);
        }
    }

    repack() {
        return `${this.x.toFixed(6)} ${this.y.toFixed(6)} ${this.z.toFixed(6)} ${this.w.toFixed(6)}`;
    }
}