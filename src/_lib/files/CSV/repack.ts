import type { FileData } from "./extract";
import Encoding from 'encoding-japanese';

function repack(data: FileData) : ArrayBuffer {
    let string = data.data.map(line => line.join(",")).join("\r\n");
    let returnarr = Encoding.stringToCode(string);
    let returning = Encoding.convert(returnarr, {
        to: 'SJIS', // to_encoding
        from: 'AUTO' // from_encoding
    });
    return Uint8Array.from(returning).buffer;
}

export default repack;