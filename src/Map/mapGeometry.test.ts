import { describe, expect, it } from 'vitest';
import {
	DEFAULT_CUBE_SIZE,
	emRotationToThreeY,
	areaPrism,
	floorClipHeight,
	mapModelUrls,
	placeholderBox,
	rotateAboutY,
	threeYToEmRotation,
	wrapAngle,
	yawFromQuaternion
} from './mapGeometry';

const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6));

describe('emRotationToThreeY', () => {
	// The 2D map places the object's local x axis at world (X, Z) = (-cos R, sin R).
	it('matches the 2D map orientation of the local x axis', () => {
		for (const r of [0, 0.5, 1.2, -2, Math.PI]) {
			const [x, , z] = rotateAboutY([1, 0, 0], emRotationToThreeY(r));
			close([x, z], [-Math.cos(r), Math.sin(r)]);
		}
	});

	// ...and the local z axis at world (X, Z) = (-sin R, -cos R).
	it('matches the 2D map orientation of the local z axis', () => {
		for (const r of [0, 0.5, 1.2, -2]) {
			const [x, , z] = rotateAboutY([0, 0, 1], emRotationToThreeY(r));
			close([x, z], [-Math.sin(r), -Math.cos(r)]);
		}
	});
});

describe('rotateAboutY', () => {
	it('leaves height untouched', () => {
		expect(rotateAboutY([1, 7, 2], 1.3)[1]).toBe(7);
	});
	it('rotates +x to -z by a quarter turn (three.js convention)', () => {
		close(rotateAboutY([1, 0, 0], Math.PI / 2), [0, 0, -1]);
	});
});

describe('placeholderBox', () => {
	it('uses collision bounds and keeps their offset', () => {
		const box = placeholderBox([
			[-1, -39, -2],
			[3, 5, 2]
		]);
		close(box.size, [4, 44, 4]);
		close(box.center, [1, -17, 0]);
	});
	it('never produces a zero-size box', () => {
		const box = placeholderBox([
			[0, 0, 0],
			[0, 0, 0]
		]);
		expect(box.size.every((s) => s > 0)).toBe(true);
	});
	it('falls back to a cube resting on the origin', () => {
		const box = placeholderBox(null);
		expect(box.size).toEqual([DEFAULT_CUBE_SIZE, DEFAULT_CUBE_SIZE, DEFAULT_CUBE_SIZE]);
		expect(box.center[1]).toBeCloseTo(DEFAULT_CUBE_SIZE / 2);
	});
});

describe('wrapAngle', () => {
	it('wraps into (-PI, PI]', () => {
		expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
		expect(wrapAngle(-3 * Math.PI)).toBeCloseTo(Math.PI);
		expect(wrapAngle(0.5)).toBeCloseTo(0.5);
		expect(wrapAngle(Math.PI + 0.1)).toBeCloseTo(-Math.PI + 0.1);
	});
});

describe('threeYToEmRotation', () => {
	it('round-trips with emRotationToThreeY', () => {
		for (const r of [0, 0.7, -1.9, 3, -3]) {
			expect(threeYToEmRotation(emRotationToThreeY(r))).toBeCloseTo(wrapAngle(r), 6);
		}
	});
});

describe('yawFromQuaternion', () => {
	it('recovers angles past 90 degrees', () => {
		for (const a of [0.3, 1.6, 2.5, -2.9, -0.2]) {
			expect(yawFromQuaternion(Math.sin(a / 2), Math.cos(a / 2))).toBeCloseTo(a, 6);
		}
	});
});

describe('mapModelUrls', () => {
	it('prefers the map id, then the bare number', () => {
		expect(mapModelUrls('r900')).toEqual(['./map3d/r900.glb', './map3d/900.glb']);
	});
});

describe('floorClipHeight', () => {
	it('clips just above a bounded floor', () => {
		expect(floorClipHeight({ bottom: 0, top: 20 })).toBe(23);
	});
	it('does not clip unbounded or missing floors', () => {
		expect(floorClipHeight({ bottom: 40, top: 999 })).toBeNull();
		expect(floorClipHeight(undefined)).toBeNull();
	});
});

describe('areaPrism', () => {
	const square = [
		{ x: 0, y: 5, z: 0 },
		{ x: 2, y: 5, z: 0 },
		{ x: 2, y: 5, z: 2 },
		{ x: 0, y: 5, z: 2 }
	];

	it('has 12 triangles and 12 edges', () => {
		const { triangles, edges } = areaPrism(square, 3);
		expect(triangles.length).toBe(12 * 3 * 3);
		expect(edges.length).toBe(12 * 2 * 3);
	});

	it('spans from the base height up by `height`', () => {
		const { triangles } = areaPrism(square, 3);
		const ys = triangles.filter((_, i) => i % 3 === 1);
		expect(Math.min(...ys)).toBe(5);
		expect(Math.max(...ys)).toBe(8);
	});

	it('keeps the footprint corners', () => {
		const { edges } = areaPrism(square, 1);
		const xs = edges.filter((_, i) => i % 3 === 0);
		expect(Math.min(...xs)).toBe(0);
		expect(Math.max(...xs)).toBe(2);
	});
});
