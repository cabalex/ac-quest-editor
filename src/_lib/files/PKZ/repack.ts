import { ZstdInit, ZstdStream } from '@oneidentity/zstd-js';
import { concatArrayBuffer } from '../arrayBufferTools';
import type { FileData, PartialFile } from './extract';
import PlatinumFileReader from '../PlatinumFileReader';

type CompressionType = 'None' | 'ZStandard';

let zstdCompress: typeof ZstdStream | null = null;
async function compress(data: ArrayBuffer, compressionType: CompressionType) {
	if (compressionType === 'None') return data;
	if (compressionType === 'ZStandard') {
		if (!zstdCompress) {
			let { ZstdStream } = await ZstdInit();
			zstdCompress = ZstdStream;
		}
		return zstdCompress.compress(new Uint8Array(data)).buffer as ArrayBuffer;
	}
	return data;
}

class FileTable {
	items: string[] = [];
	offsets: number[] = [];
	string: ArrayBuffer = new ArrayBuffer(0);
	encoder: TextEncoder = new TextEncoder();
	padding: number;

	constructor(padding: number = 16) {
		this.padding = padding;
	}

	// Adds an item and returns the offset to that item
	add(item: string) {
		console.log(`Adding item: ${item} (${item.length} ${this.encoder.encode(item).byteLength})`);
		if (this.items.includes(item)) {
			return this.offsets[this.items.indexOf(item)];
		} else {
			// add item and offset
			this.offsets.push(this.string.byteLength);
			this.items.push(item);
			this.string = concatArrayBuffer(
				this.string,
				this.encoder.encode(item).buffer,
				new ArrayBuffer(1)
			);
			if (!this.padding || this.string.byteLength % this.padding !== 0) {
				this.string = concatArrayBuffer(
					this.string,
					new ArrayBuffer(16 - (this.string.byteLength % 16))
				);
			}
			return this.offsets[this.offsets.length - 1];
		}
	}

	get(padTo16: boolean = true): ArrayBuffer {
		let string = this.string;
		if (padTo16 && string.byteLength % 16 !== 0) {
			string = concatArrayBuffer(string, new ArrayBuffer(16 - (string.byteLength % 16)));
		}
		return string;
	}

	get byteLength(): number {
		return this.string.byteLength;
	}
}

async function repack(
	files: Array<{ name: string; data: ArrayBuffer } | PartialFile>,
	compressionType: CompressionType,
	baseFile: FileData | null = null,
	onProgress: (progress: number) => void = () => {}
): Promise<ArrayBuffer> {
	let fileArrayBuffers = new ArrayBuffer(0);
	let fileSizes = [];
	let fileSizesCompressed = [];

	let fileOffsets = [];
	let fileCompressionOffsets = [];
	let nameTable = new FileTable(8);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		fileOffsets.push(fileArrayBuffers.byteLength);
		let compressed: ArrayBuffer;
		if ('data' in file) {
			// Full file - use the file
			fileSizes.push(file.data.byteLength);
			fileCompressionOffsets.push(nameTable.add(compressionType));
			compressed = await compress(file.data, compressionType);
		} else {
			// Partial file - need to extract from base file
			if (baseFile === null) {
				throw new Error('Base file is required for repacking partial files');
			}
			fileSizes.push(file.size);
			fileCompressionOffsets.push(nameTable.add(compressionType));
			compressed = await new PlatinumFileReader(baseFile.baseFile).read(
				file.offset,
				file.offset + file.compressedSize
			);
		}
		fileSizesCompressed.push(compressed.byteLength);
		fileArrayBuffers = concatArrayBuffer(
			fileArrayBuffers,
			compressed,
			new ArrayBuffer(16), // ensure 16 bytes of padding
			new ArrayBuffer(32 - (compressed.byteLength % 32)) // ...and align to 0x20
		);
		onProgress((i + 1) / files.length);
	}

	let fileNameOffsets = [];

	for (let file of files) {
		fileNameOffsets.push(nameTable.add(file.name));
	}
	let finalNameTable = concatArrayBuffer(nameTable.get(), new ArrayBuffer(16));

	// name table
	let fileDescriptorTable = new ArrayBuffer(files.length * 32);
	let fileDescriptorTableDataView = new DataView(fileDescriptorTable);

	for (let i = 0; i < files.length; i++) {
		// name offset
		fileDescriptorTableDataView.setUint32(i * 32 + 0, fileNameOffsets[i], true);
		// compression type offset
		fileDescriptorTableDataView.setUint32(i * 32 + 4, fileCompressionOffsets[i], true);
		// size
		fileDescriptorTableDataView.setBigUint64(i * 32 + 8, BigInt(fileSizes[i]), true);
		// offset
		fileDescriptorTableDataView.setBigUint64(
			i * 32 + 16,
			BigInt(32 + fileDescriptorTable.byteLength + finalNameTable.byteLength + fileOffsets[i]),
			true
		);
		// compressed size
		fileDescriptorTableDataView.setBigUint64(i * 32 + 24, BigInt(fileSizesCompressed[i]), true);
	}

	// Construct header
	const header = new ArrayBuffer(32);
	const headerDataView = new DataView(header);
	const totalSize =
		32 + fileDescriptorTable.byteLength + finalNameTable.byteLength + fileArrayBuffers.byteLength;

	// "pkzl"
	headerDataView.setUint32(0, 0x6c7a6b70, true);
	// version
	headerDataView.setUint32(4, 65536, true);
	// size - should be uint64 but whatever
	headerDataView.setUint32(8, totalSize, true);
	// fileCount
	headerDataView.setUint32(16, files.length, true);
	// fileDescriptorsOffset
	headerDataView.setUint32(20, 32, true);
	// fileNameTableLength
	headerDataView.setUint32(24, finalNameTable.byteLength - 16, true);

	return concatArrayBuffer(header, fileDescriptorTable, finalNameTable, fileArrayBuffers);
}

export default repack;
