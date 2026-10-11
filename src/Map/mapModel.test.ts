import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { mergeSceneGeometry } from './mapModel';

function triangle(offset = 0) {
	const g = new THREE.BufferGeometry();
	g.setAttribute(
		'position',
		new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0].map((v) => v + offset), 3)
	);
	return g;
}

describe('mergeSceneGeometry', () => {
	it('returns null for an empty scene', () => {
		expect(mergeSceneGeometry(new THREE.Group())).toBeNull();
	});

	it('merges meshes and bakes in their world transforms', () => {
		const root = new THREE.Group();
		const a = new THREE.Mesh(triangle());
		const b = new THREE.Mesh(triangle());
		b.position.set(10, 0, 0);
		// Blender-style Z-up -> Y-up node rotation: +Y local becomes -Z... (rotate +90deg about X)
		b.rotation.x = Math.PI / 2;
		root.add(a, b);

		const merged = mergeSceneGeometry(root)!;
		const pos = merged.getAttribute('position');
		expect(pos.count).toBe(6);
		// b's local (0,1,0) -> rotated about X by 90deg = (0,0,1), then moved by (10,0,0)
		expect([pos.getX(5), pos.getY(5), pos.getZ(5)].map((v) => Math.round(v))).toEqual([10, 0, 1]);
	});

	it('handles a mix of indexed and non-indexed meshes', () => {
		const indexed = triangle();
		indexed.setIndex([0, 1, 2]);
		const root = new THREE.Group();
		root.add(new THREE.Mesh(indexed), new THREE.Mesh(triangle(5)));
		expect(mergeSceneGeometry(root)!.getAttribute('position').count).toBe(6);
	});

	it('does not modify the source geometry', () => {
		const g = triangle();
		const m = new THREE.Mesh(g);
		m.position.set(5, 5, 5);
		const root = new THREE.Group();
		root.add(m);
		mergeSceneGeometry(root);
		expect(g.getAttribute('position').getX(0)).toBe(0);
	});
});
