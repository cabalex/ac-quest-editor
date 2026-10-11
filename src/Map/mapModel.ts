import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Collapses every mesh under `root` into a single geometry in the root's coordinate space.
 *
 * The map models contain thousands of small meshes; drawing them as one mesh is far cheaper.
 * Only positions are kept (the map is rendered with flat shading, which derives normals itself),
 * which also avoids attribute mismatches between meshes. Returns null if there is nothing to draw.
 */
export function mergeSceneGeometry(root: THREE.Object3D): THREE.BufferGeometry | null {
	root.updateMatrixWorld(true);
	const parts: THREE.BufferGeometry[] = [];
	root.traverse((obj) => {
		const mesh = obj as THREE.Mesh;
		if (!mesh.isMesh || !mesh.geometry.getAttribute('position')) return;
		const geometry = new THREE.BufferGeometry();
		// Positions are copied (cloned) so the source scene is left untouched.
		geometry.setAttribute('position', mesh.geometry.getAttribute('position').clone());
		if (mesh.geometry.index) geometry.setIndex(mesh.geometry.index.clone());
		geometry.applyMatrix4(mesh.matrixWorld);
		parts.push(geometry);
	});
	if (!parts.length) return null;

	// mergeGeometries requires all-indexed or all-non-indexed input.
	const allIndexed = parts.every((g) => g.index);
	const merged = mergeGeometries(allIndexed ? parts : parts.map((g) => g.toNonIndexed()), false);
	parts.forEach((g) => g.dispose());
	return merged;
}

/** Loads a .glb map model and merges it into one geometry. Rejects if the file isn't a valid glTF. */
export async function loadMapGeometry(url: string): Promise<THREE.BufferGeometry> {
	const gltf = await new GLTFLoader().loadAsync(url);
	const geometry = mergeSceneGeometry(gltf.scene);
	if (!geometry) throw new Error(`No meshes in ${url}`);
	return geometry;
}
