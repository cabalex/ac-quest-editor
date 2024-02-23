import type { FileData, Node } from "../files/BXM/extract";

export default class SignboardData {
    node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    static fromNode(bxm: FileData) {
        // BXM file
        return new SignboardData(bxm.data);
    }

    repack() {
        return {data: this.node, encoding: "UTF-8"};
    }

    // TODO: implement
}