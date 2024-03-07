import { ZstdInit, ZstdStream } from '@oneidentity/zstd-js';
import { concatArrayBuffer } from "../arrayBufferTools";

type CompressionType = "None" | "ZStandard";

let zstdCompress: (typeof ZstdStream)|null = null;
async function compress(data: ArrayBuffer, compressionType: CompressionType) {
    if (compressionType === "None") return data;
    if (compressionType === "ZStandard") {
        if (!zstdCompress) {
            let { ZstdStream } = await ZstdInit();
            zstdCompress = ZstdStream;
        }
        return zstdCompress.compress(new Uint8Array(data)).buffer;
    }
    return data;
}


async function repack(files: {name: string, data: ArrayBuffer}[], compressionType:CompressionType): Promise<ArrayBuffer> {
    let fileArrayBuffers = new ArrayBuffer(0);
    let fileSizes = [];
    let fileSizesCompressed = [];

    let fileOffsets = [];
    for (let file of files) {
        fileOffsets.push(fileArrayBuffers.byteLength);
        fileSizes.push(file.data.byteLength);
        const compressed = await compress(file.data, compressionType);
        fileSizesCompressed.push(compressed.byteLength);
        fileArrayBuffers = concatArrayBuffer(
            fileArrayBuffers,
            compressed,
            new ArrayBuffer(16), // ensure 16 bytes of padding
            new ArrayBuffer(32 - (compressed.byteLength % 32)) // ...and align to 0x20
        );
    }
    
    
    const encoder = new TextEncoder();

    // actual name table
    // None zero padded
    let nameTable = encoder.encode(compressionType.padEnd(16, '\0')).buffer;

    let fileNameOffsets = [];

    for (let file of files) {
        fileNameOffsets.push(nameTable.byteLength);
        nameTable = concatArrayBuffer(nameTable, encoder.encode(file.name).buffer);
        // padded to 8 byte intervals
        if (nameTable.byteLength % 8 !== 0) {
            nameTable = concatArrayBuffer(nameTable, new ArrayBuffer(8 - (nameTable.byteLength % 8)));
        }
    }
    nameTable = concatArrayBuffer(nameTable, new ArrayBuffer(16));

    // name table
    let fileDescriptorTable = new ArrayBuffer(files.length * 32);
    let fileDescriptorTableDataView = new DataView(fileDescriptorTable);

    for (let i = 0; i < files.length; i++) {
        // name offset
        fileDescriptorTableDataView.setUint32(i * 32 + 0, fileNameOffsets[i], true);
        // compression type offset
        fileDescriptorTableDataView.setUint32(i * 32 + 4, 0, true);
        // size
        fileDescriptorTableDataView.setBigUint64(i * 32 + 8, BigInt(fileSizes[i]), true);
        // offset
        fileDescriptorTableDataView.setBigUint64(i * 32 + 16, BigInt(32 + fileDescriptorTable.byteLength + nameTable.byteLength + fileOffsets[i]), true);
        // compressed size
        fileDescriptorTableDataView.setBigUint64(i * 32 + 24, BigInt(fileSizesCompressed[i]), true);
    }


    // Construct header
    const header = new ArrayBuffer(32);
    const headerDataView = new DataView(header);
    const totalSize = 32 + fileDescriptorTable.byteLength + nameTable.byteLength + fileArrayBuffers.byteLength;

    // "pkzl"
    headerDataView.setUint32(0, 0x6C7A6B70, true);
    // version
    headerDataView.setUint32(4, 65536, true);
    // size - should be uint64 but whatever
    headerDataView.setUint32(8, totalSize, true);
    // fileCount
    headerDataView.setUint32(16, files.length, true);
    // fileDescriptorsOffset
    headerDataView.setUint32(20, 32, true);
    // fileNameTableLength
    headerDataView.setUint32(24, nameTable.byteLength - 16, true);

    return concatArrayBuffer(header, fileDescriptorTable, nameTable, fileArrayBuffers);
}

export default repack;