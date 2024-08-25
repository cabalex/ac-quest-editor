import { concatArrayBuffer } from "../arrayBufferTools";
import type { FileData, Node } from "./extract";

class BXMStrings {
    encoder = new TextEncoder();

    rawStrings: string[] = [];
    encodedStrings: Uint8Array[] = [];
    
    addString(str: string) {
        let byteOffset = 0;
        for (let i = 0; i < this.rawStrings.length; i++) {
            if (this.rawStrings[i] === str) return byteOffset;
            byteOffset += this.encodedStrings[i].byteLength;
        }
        // if not in the list, add it
        this.rawStrings.push(str);
        this.encodedStrings.push(this.encoder.encode(str + "\x00"));

        return byteOffset;
    }

    offset(str: string) {
        let byteOffset = 0;
        for (let i = 0; i < this.rawStrings.length; i++) {
            byteOffset += this.encodedStrings[i].byteLength;
            if (this.rawStrings[i] === str) return byteOffset;
        }
        return -1;
    }

    includes(str: string) {
        return this.rawStrings.includes(str);
    }

    get byteLength() {
        return this.encodedStrings.reduce((acc, curr) => acc + curr.byteLength, 0);
    }

    arrayBuffer() {
        return concatArrayBuffer(...this.encodedStrings);
    }
}

// BXMs are big endian!!
function swap16(val: number) {
    return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
}

function repack(data: FileData) : ArrayBuffer {
    // This code is HORRIBLY MESSY and needs rewriting.
    // It's basically legacy code from the previous astral-extractor
    // that I never bothered to refactor. Oops!
    const enc = new TextEncoder();

    let nodeInfo: Array<[number, number, number, number]> = [];
    let dataOffsets: Array<number[]> = [];
    let stringsObj = new BXMStrings();

    function applyToDataOffsets(dataoff: number[]) {
        let dataoffcount = 0;
        for (let i = 0; i < dataOffsets.length; i++) {
            if (dataOffsets[i].length == dataoff.length && dataOffsets[i].every((element, index) => element == dataoff[index])) {
                return dataoffcount/2;
            }
            dataoffcount += dataOffsets[i].length;
        }
        dataOffsets.push(dataoff);
        return dataoffcount/2;
    }
    function readTree(input: Node, iter: number) {
        // Create NodeInfo
        nodeInfo[iter] = [input.children.length, nodeInfo.length || 1, Object.keys(input.attributes).length, 0]; // last is filled in later!
        let dataOffset = [];
        // create DataOffsets for name, value, and [potential] attributes
        dataOffset.push(stringsObj.addString(input.name))

        if (input.value?.toString()) {
            dataOffset.push(stringsObj.addString(input.value.toString()))
        } else {
            dataOffset.push(0xFFFF)
        }

        for (const [key, value] of Object.entries(input.attributes)) {
            dataOffset.push(stringsObj.addString(key))
            
            if (value.toString()) {
                dataOffset.push(stringsObj.addString(value.toString()))
            } else {
                dataOffset.push(0xFFFF)
            }
        }
        nodeInfo[iter][3] = applyToDataOffsets(dataOffset)
        const startChildren = nodeInfo.length; 
        nodeInfo = nodeInfo.concat(new Array(input.children.length))
        for (let i = 0; i < input.children.length; i++) {
            readTree(input.children[i], startChildren+i);
        }
    }
    readTree(data.data, 0);
    // Construct the BXM file
    let newNodeInfo: number[] = []
    let newDataOffsets: number[] = []
    nodeInfo.map(function(item) {newNodeInfo.push(...item)})
    newNodeInfo = newNodeInfo.map(item => swap16(item))
    dataOffsets.map(function(item) {newDataOffsets.push(...item)})
    newDataOffsets = newDataOffsets.map(item => swap16(item))
    let stringData = stringsObj.arrayBuffer();
    let header = Uint16Array.from([19800, 76, 0, 0, swap16(nodeInfo.length), swap16(newDataOffsets.length/2)]);
    let stringDataLenBE = ((stringData.byteLength & 0xFF) << 24) | ((stringData.byteLength & 0xFF00) << 8) | ((stringData.byteLength >> 8) & 0xFF00) | ((stringData.byteLength >> 24) & 0xFF);
    return concatArrayBuffer(
        header.buffer,
        Uint32Array.from([stringDataLenBE]).buffer,
        Uint16Array.from(newNodeInfo).buffer,
        Uint16Array.from(newDataOffsets).buffer,
        stringData
    );
}

export default repack;