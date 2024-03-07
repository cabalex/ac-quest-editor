import { b_crc32 } from "../DAT/lib/generateDATHash";
import { concatArrayBuffer, setArrayBuffer } from "../arrayBufferTools";
import type { FileData } from "./extract";

// The classic Platinum Hashing Function!!
function hash(text: string) {
    return b_crc32(text.toLowerCase()) & 0x7FFFFFFF;
}

function PTDEncode(text: string) {
    text = text.replace(/\r?\n/g, "\r\n") // account for formatting; game uses \r\n
    const uint8 = new Uint8Array(text.length*2 + 2) // +2 to account for zero padding
    for (let i = 0; i < text.length; i++) {
        uint8[i*2] = text.charCodeAt(i);
        uint8[i*2+1] = text.charCodeAt(i) >> 8;
    }
    return uint8.map((num) => (num + 0x26) % 256).buffer;
}

function PTDcreateOffsets(keys: Entry[], values: Entry[]) {
    let output = new ArrayBuffer(0);
    let headers = new ArrayBuffer(0);
    let x = keys.length * 16;

    // sort both keys and values by key 1
    const sorted = keys.map((x, i) => [x, values[i]]).sort((a, b) => a[0][1] - b[0][1]);
    const sortedKeys = sorted.map(x => x[0]);
    const sortedValues = sorted.map(x => x[1]);

    for (var i = 0; i < sortedKeys.length; i++) {
        // Create key header
        headers = concatArrayBuffer(headers, Uint32Array.from([
            sortedKeys[i][1], x, sortedValues[i][0].byteLength/2, sortedValues[i][0].byteLength
        ]).buffer);
        output = concatArrayBuffer(output, sortedValues[i][0]);
        x += sortedValues[i][0].byteLength - 16; // add length of UTF-16 text; subtract new offset
    }
    return [output, headers]
}

interface OutputSection {
    initHeader: ArrayBuffer;
    hashes: ArrayBuffer;
    valueStringsHeaders: ArrayBuffer;
    valueStringHeaders1: ArrayBuffer;
    strings1: ArrayBuffer;
    valueStringHeaders2: ArrayBuffer;
    strings2: ArrayBuffer;
    totalLength: number;
}

type Entry = [ArrayBuffer, number]

async function repack(data: FileData) : Promise<ArrayBuffer> {
    // These keys are from each section, the key label, and the value labels.
    let keys: Entry[] = [
        ...Object.keys(data.strings).map(x => [PTDEncode(x), hash(x)] as [ArrayBuffer, number]),
        [PTDEncode("groupid"), hash("groupid")],
        [PTDEncode("Text"), hash("Text")],
        [PTDEncode("CharName"), hash("CharName")]
    ];
    const outputSections = Object.values(data.strings).map(section => {
        const map: {key: Entry, values: Entry[]}[] = [];
        section.forEach((value, key) => {
            const keyEntry: Entry = [PTDEncode(key), hash(key)];
            keys.push(keyEntry);
            map.push({
                key: keyEntry,
                values: (value as string[]).map(x => [PTDEncode(x), hash(x)])
            });
        });
        return map;
    })

    const [keyStrings, keyHeaders] = PTDcreateOffsets(keys, keys);
    /* STRING headers */
    // 0 - hash
    // 1 - entries relative offset (from this position)
    // 2 - count of 2-byte chars
    // 3 - length of actual string
    // header
    const secondTableOffset = keyHeaders.byteLength + keyStrings.byteLength + 28
    let outputArrayBuffer: ArrayBuffer = Uint32Array.from([
        4478032, 2, 38, keys.length, 28, outputSections.length, secondTableOffset
    ]).buffer;

    // keys
    outputArrayBuffer = concatArrayBuffer(outputArrayBuffer, keyHeaders);
    outputArrayBuffer = concatArrayBuffer(outputArrayBuffer, keyStrings);
    
    let outputSectionsArrayBuffers: OutputSection[] = [];
    for (let i = 0; i < outputSections.length; i++) {
        if (outputSections[i].length == 0) {
            // blank section; fill everything in
            outputSectionsArrayBuffers.push({
                initHeader: new ArrayBuffer(0), // no header
                hashes: new ArrayBuffer(0),
                strings1: new ArrayBuffer(0),
                valueStringHeaders1: new ArrayBuffer(0),
                strings2: new ArrayBuffer(0),
                valueStringHeaders2: new ArrayBuffer(0),
                valueStringsHeaders: Uint32Array.from([hash("Text"), 0, 24, hash("CharName"), 0, 12]).buffer,
                totalLength: 24
            })
            continue;
        }
        const hashes = Uint32Array.from(outputSections[i].map(x => x.key[1])).buffer;
        const sectionKeys = outputSections[i].map(x => x.key);
        const entries1 = outputSections[i].map(x => x.values[0] || "");
        const entries2 = outputSections[i].map(x => x.values[1] || "");
        const [strings1, valueStringHeaders1] = PTDcreateOffsets(sectionKeys, entries1)
        const [strings2, valueStringHeaders2] = PTDcreateOffsets(sectionKeys, entries2)
        
        let relativeOffset = 12 + 16 * outputSections[i].length + strings1.byteLength // initial header + first section headers + first section strings
        
        const valueStringsHeaders = Uint32Array.from([
            hash("Text"), entries1.length, 24,
            hash("CharName"), entries2.length, relativeOffset
        ]).buffer;
        const totalLength = 12 + hashes.byteLength + 24 +
            valueStringHeaders1.byteLength + strings1.byteLength +
            valueStringHeaders2.byteLength + strings2.byteLength

        outputSectionsArrayBuffers.push({
            initHeader: Uint32Array.from([hash("groupid"), entries1.length, 12]).buffer,
            hashes,
            valueStringsHeaders,
            valueStringHeaders1,
            strings1,
            valueStringHeaders2,
            strings2,
            totalLength
        })
    }
    var x = 20 * outputSectionsArrayBuffers.length // existing headers
    var y = 20 * outputSectionsArrayBuffers.length + 12 + outputSectionsArrayBuffers[0].hashes.byteLength // existing headers + single header + hashes 
    for (var i = 0; i < outputSections.length; i++) {
        if (outputSections[i].length === 0) {
            outputArrayBuffer = concatArrayBuffer(outputArrayBuffer, Uint32Array.from([hash(Object.keys(data.strings)[i]), 0, x, 2, x]).buffer); // both are the same
        } else {
            outputArrayBuffer = concatArrayBuffer(outputArrayBuffer, Uint32Array.from([hash(Object.keys(data.strings)[i]), 1, x, 2, y]).buffer);
        }
        x += outputSectionsArrayBuffers[i].totalLength - 20;
        if (i+1 === outputSections.length) {
            break;
        }
        y = x + 12 + outputSectionsArrayBuffers[i+1].hashes.byteLength;
    }

    console.log(outputSectionsArrayBuffers);
    
    for (var i = 0; i < outputSectionsArrayBuffers.length; i++) {
        outputArrayBuffer = concatArrayBuffer(outputArrayBuffer,
            outputSectionsArrayBuffers[i].initHeader,
            outputSectionsArrayBuffers[i].hashes,
            outputSectionsArrayBuffers[i].valueStringsHeaders,
            outputSectionsArrayBuffers[i].valueStringHeaders1,
            outputSectionsArrayBuffers[i].strings1,
            outputSectionsArrayBuffers[i].valueStringHeaders2,
            outputSectionsArrayBuffers[i].strings2
        )
    }

    return outputArrayBuffer;
}

export default repack;