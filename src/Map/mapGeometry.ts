/**
 * Pure geometry helpers for the 3D map.
 *
 * World space is the game's own space (X, Y-up, Z), left untouched. The 2D map draws a top-down
 * view where screen-right = -Z and screen-down = +X; the 3D camera is set up to match this so the
 * 2D and 3D views agree.
 */

/** Side length (world units) of the placeholder cube used when an object has no known collision box. */
export const DEFAULT_CUBE_SIZE = 1.5;

/** Heights at or beyond this magnitude in the floor table mean "unbounded". */
const UNBOUNDED = 900;

export type Box = [[number, number, number, ...number[]], [number, number, number, ...number[]]];

export interface LocalBox {
	/** Full extents along the object's local x, y, z axes. */
	size: [number, number, number];
	/** Box center relative to the object's origin, in the object's local axes. */
	center: [number, number, number];
}

/**
 * Converts an Em's `Rotation` into a three.js Y-axis rotation.
 * Derived from the 2D map, which rotates objects by `-Rotation - PI/2` in its top-down frame.
 */
export function emRotationToThreeY(rotation: number): number {
	return rotation + Math.PI;
}

/** Rotates a local offset about the Y axis using three.js's right-handed convention. */
export function rotateAboutY(
	v: [number, number, number],
	angle: number
): [number, number, number] {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

/**
 * Returns the placeholder box for an object. Known collision bounds are honored exactly (including
 * their offset from the object origin); otherwise a small cube resting on the object's position.
 */
export function placeholderBox(collision: Box | null): LocalBox {
	if (collision) {
		const [min, max] = collision;
		const size: [number, number, number] = [
			Math.max(max[0] - min[0], 0.05),
			Math.max(max[1] - min[1], 0.05),
			Math.max(max[2] - min[2], 0.05)
		];
		return {
			size,
			center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
		};
	}
	return {
		size: [DEFAULT_CUBE_SIZE, DEFAULT_CUBE_SIZE, DEFAULT_CUBE_SIZE],
		center: [0, DEFAULT_CUBE_SIZE / 2, 0]
	};
}

/** Wraps an angle to the range (-PI, PI]. */
export function wrapAngle(angle: number): number {
	const twoPi = Math.PI * 2;
	let a = angle % twoPi;
	if (a <= -Math.PI) a += twoPi;
	else if (a > Math.PI) a -= twoPi;
	return a;
}

/** Inverse of {@link emRotationToThreeY}: converts a three.js Y rotation back to an Em `Rotation`. */
export function threeYToEmRotation(rotY: number): number {
	return wrapAngle(rotY - Math.PI);
}

/**
 * Y-axis angle of a quaternion that represents a pure rotation about Y (components y and w).
 * Unlike reading Euler angles, this stays correct beyond +-90 degrees.
 */
export function yawFromQuaternion(y: number, w: number): number {
	return wrapAngle(2 * Math.atan2(y, w));
}

/**
 * Candidate URLs for a map's 3D model, in order of preference. Models are normally named after the
 * map id ("r900.glb"), but a bare number ("900.glb") is accepted too.
 */
export function mapModelUrls(map: string): string[] {
	return [`./map3d/${map}.glb`, `./map3d/${map.replace(/^r/, '')}.glb`];
}

/**
 * Height above which the map model is cut away when a single floor is selected (so upper floors
 * don't hide it), or null when the floor has no upper bound. The small margin keeps objects
 * resting on the floor's top boundary inside the visible slice.
 */
export function floorClipHeight(floor: { bottom: number; top: number } | undefined): number | null {
	return floor && floor.top < UNBOUNDED ? floor.top + 3 : null;
}

type Point3 = { x: number; y: number; z: number };

/**
 * Builds a vertical prism from a box area: its 4 footprint corners (in perimeter order) raised by
 * `height`. Returns flat xyz arrays: `triangles` (12 triangles, 3 vertices each) and `edges`
 * (12 line segments, 2 vertices each).
 */
export function areaPrism(corners: Point3[], height: number): { triangles: number[]; edges: number[] } {
	const bottom = corners.map((c) => [c.x, c.y, c.z]);
	const top = corners.map((c) => [c.x, c.y + height, c.z]);
	const n = corners.length;
	const triangles: number[] = [];
	const edges: number[] = [];

	// Fan-triangulate the (convex, quad) top and bottom faces.
	for (let i = 1; i < n - 1; i++) {
		triangles.push(...bottom[0], ...bottom[i], ...bottom[i + 1]);
		triangles.push(...top[0], ...top[i], ...top[i + 1]);
	}
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		// Side wall as two triangles.
		triangles.push(...bottom[i], ...bottom[j], ...top[j]);
		triangles.push(...bottom[i], ...top[j], ...top[i]);
		// Bottom ring, top ring, and vertical edge.
		edges.push(...bottom[i], ...bottom[j]);
		edges.push(...top[i], ...top[j]);
		edges.push(...bottom[i], ...top[i]);
	}
	return { triangles, edges };
}
