import type { FileData, Node } from "../files/BXM/extract";

export default class SignboardData {
    node: Node;

    constructor(bxm: FileData) {
        // BXM file
        this.node = bxm.data;
    }

    repack() {
        return {data: this.node, encoding: "UTF-8"};
    }

    // TODO: implement
}