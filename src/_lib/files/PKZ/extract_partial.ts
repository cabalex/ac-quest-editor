import { ZstdInit } from '@oneidentity/zstd-js/decompress';
import PlatinumFileReader from "../PlatinumFileReader";
import type { FileData, PartialFile } from "./extract";

let zstdDecompress: any = null;

async function extract_partial(partialFile: PartialFile, fileData: FileData) : Promise<{name: string, data: ArrayBuffer}> {
    // Create a new file reader
    let platinumFileReader = new PlatinumFileReader(fileData.baseFile);

    // Read the file
    let arrayBuffer = await platinumFileReader.read(
        partialFile.offset,
        partialFile.offset + partialFile.compressedSize
    );

    switch(partialFile.compressionType) {
        case 'ZStandard':
            if (!zstdDecompress) {
                let { ZstdStream } = await ZstdInit();
                zstdDecompress = ZstdStream;
            }
            arrayBuffer = zstdDecompress.decompress(new Uint8Array(arrayBuffer)).buffer;
            break;
        case 'None':
            break;
        default:
            console.warn(`Unknown compression type: ${partialFile.compressionType}`);
    }

    // Return name and data as an object
    return {name: partialFile.name, data: arrayBuffer};
}

export default extract_partial;