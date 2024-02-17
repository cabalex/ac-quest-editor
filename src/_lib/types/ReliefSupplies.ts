import type { FileData } from "../files/CSV/extract";

export default class ReliefSupplies {
    data: string[][];

    constructor(csv: FileData) {
        // BXM file
        this.data = csv.data;
    }

    repack() {
        return {data: this.data};
    }
    
    // TODO: implement
}