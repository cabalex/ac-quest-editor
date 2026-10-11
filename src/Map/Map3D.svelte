<script lang="ts">
	/**
	 * 3D view of the quest map. Objects ("Ems") are drawn as placeholder boxes at their real world
	 * position, size (when collision bounds are known) and rotation, so height differences and
	 * footprints are visible. The map's .glb model is drawn translucent, sliced at the selected floor.
	 *
	 * Rendering is done in raw game coordinates; the initial camera is oriented to match the 2D map.
	 */
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { currentArea, currentEm, session, showAreasOnMap } from '../store';
	import { questLookup } from '../_lib/lookupTable';
	import Quest from '../_lib/Quest';
	import type { Em, EmSet } from '../_lib/types/EnemySet';
	import type { AreaGroup } from '../_lib/types/QuestData';
	import getCollision from './collision';
	import { loadMapGeometry } from './mapModel';
	import { updateMap, writableMap } from './Map.svelte';
	import {
		emRotationToThreeY,
		floorClipHeight,
		mapModelUrls,
		placeholderBox,
		rotateAboutY,
		areaPrism,
		threeYToEmRotation,
		yawFromQuaternion,
		type Box
	} from './mapGeometry';

	/** Map id, e.g. "r800" */
	export let map: string;
	/** Selected floor index, or -1 for all floors */
	export let floor: number;
	/** Floor table for this map, if it has several floors */
	export let floors: { name: string; bottom: number; top: number }[] | undefined;

	const dispatch = createEventDispatcher<{ select: Em }>();

	let container: HTMLDivElement;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let controls: OrbitControls;
	let transform: TransformControls;
	// Invisible stand-in the gizmo manipulates; its transform is copied to/from the selected Em.
	const gizmoProxy = new THREE.Object3D();
	let gizmoMode: 'translate' | 'rotate' = 'translate';
	let frameHandle = 0;
	let resizeObserver: ResizeObserver;
	let ready = false;

	// Everything rebuilt on data change lives under this group.
	let content = new THREE.Group();
	let disposables: { dispose(): void }[] = [];

	// Geometry shared by every object; each object scales it to its own size.
	const unitBox = new THREE.BoxGeometry(1, 1, 1);
	const unitEdges = new THREE.EdgesGeometry(unitBox);
	// Secondary ("L") objects are drawn as spheres so they read differently from primary boxes.
	const unitSphere = new THREE.SphereGeometry(0.5, 24, 16);
	const unitSphereRings = new THREE.BufferGeometry().setAttribute(
		'position',
		new THREE.Float32BufferAttribute(sphereOutline({ x: 0, y: 0, z: 0 }, 0.5, 32), 3)
	);
	const edgeMaterials = {
		normal: new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.6 }),
		nearby: new THREE.LineBasicMaterial({ color: 0x4cc9f0 }),
		active: new THREE.LineBasicMaterial({ color: 0xff2222 })
	};
	const fillMaterials = new Map<number, THREE.MeshLambertMaterial>();
	function fillMaterial(hue: number, opacity = 1) {
		const key = hue * 100 + opacity;
		let mat = fillMaterials.get(key);
		if (!mat) {
			mat = new THREE.MeshLambertMaterial({
				color: new THREE.Color(`hsl(${hue % 360}, 50%, 60%)`),
				transparent: opacity < 1,
				opacity
			});
			fillMaterials.set(key, mat);
		}
		return mat;
	}
	const wallMaterial = new THREE.MeshLambertMaterial({
		color: 0xff0000,
		transparent: true,
		opacity: 0.45
	});

	interface EmObject {
		em: Em;
		set: EmSet;
		edges: THREE.LineSegments[];
		center: THREE.Vector3;
		/** Re-reads the Em's position/rotation and moves its meshes to match (used while dragging). */
		place: () => void;
	}
	let emObjects: EmObject[] = [];
	let pickables: THREE.Object3D[] = [];

	onMount(() => {
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x1b1b1f);
		scene.add(content);
		scene.add(new THREE.AmbientLight(0xffffff, 0.8));
		const sun = new THREE.DirectionalLight(0xffffff, 1.2);
		sun.position.set(0.4, 1, 0.3);
		scene.add(sun);

		camera = new THREE.PerspectiveCamera(50, 1, 0.5, 20000);
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.localClippingEnabled = true; // per-material clipping, used for floor slicing
		container.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.screenSpacePanning = true; // pan stays parallel to the screen
		controls.maxDistance = 6000;
		// Left drag pans, right drag rotates (OrbitControls' defaults are the reverse).
		controls.mouseButtons = {
			LEFT: THREE.MOUSE.PAN,
			MIDDLE: THREE.MOUSE.DOLLY,
			RIGHT: THREE.MOUSE.ROTATE
		};

		// Transform gizmo for the selected object (translate, or rotate about the vertical axis).
		transform = new TransformControls(camera, renderer.domElement);
		transform.addEventListener('dragging-changed', (e) => {
			controls.enabled = !e.value; // don't pan the camera while dragging the gizmo
			if (!e.value) updateMap(); // drag finished: refresh the 2D map and everything else
		});
		transform.addEventListener('objectChange', onGizmoChange);
		scene.add(gizmoProxy, transform.getHelper());
		applyGizmoMode();

		resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);
		resize();

		renderer.domElement.addEventListener('pointerdown', onPointerDown);
		renderer.domElement.addEventListener('pointerup', onPointerUp);
		renderer.domElement.addEventListener('pointermove', onPointerMove);

		ready = true;
		const loop = () => {
			frameHandle = requestAnimationFrame(loop);
			if (flyTarget) {
				// Slide the camera and its orbit center together so the view pans (doesn't swing around).
				const step = flyTarget.clone().sub(controls.target).multiplyScalar(0.15);
				controls.target.add(step);
				camera.position.add(step);
				if (controls.target.distanceTo(flyTarget) < 0.05) flyTarget = null;
			}
			updateViewCenter();
			controls.update();
			renderer.render(scene, camera);
		};
		loop();
	});

	onDestroy(() => {
		cancelAnimationFrame(frameHandle);
		resizeObserver?.disconnect();
		clearContent();
		transform?.dispose();
		modelCache.forEach((p) => p.then((g) => g?.dispose()));
		controls?.dispose();
		renderer?.dispose();
		renderer?.forceContextLoss(); // release the GPU context now; browsers cap how many can be live
		renderer?.domElement.remove();
		unitBox.dispose();
		unitEdges.dispose();
		unitSphere.dispose();
		unitSphereRings.dispose();
		Object.values(edgeMaterials).forEach((m) => m.dispose());
		fillMaterials.forEach((m) => m.dispose());
		wallMaterial.dispose();
	});

	function resize() {
		if (!container || !renderer) return;
		const w = container.clientWidth || 1;
		const h = container.clientHeight || 1;
		renderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}

	// Sidebar panels and popups float over the left of the canvas. The canvas keeps its size and
	// rendering; only the projection center (the point the camera orbits) moves to the middle of
	// the part that is still visible.
	const OVERLAY_SELECTORS = 'aside, .tabSidebar, .emPopup, .areaPopup';
	let viewOffsetX = 0; // current (smoothed) shift of the center, in CSS pixels
	let appliedOffsetX = NaN;
	let appliedSize = '';

	/** Width of the canvas, from its left edge, hidden under overlays. */
	function coveredWidth() {
		const canvas = renderer.domElement.getBoundingClientRect();
		let right = canvas.left;
		document.querySelectorAll(OVERLAY_SELECTORS).forEach((el) => {
			right = Math.max(right, el.getBoundingClientRect().right);
		});
		return Math.min(Math.max(right - canvas.left, 0), canvas.width);
	}

	function updateViewCenter() {
		const w = container.clientWidth || 1;
		const h = container.clientHeight || 1;
		// Ease toward the target so opening/closing panels glides instead of jumping.
		const target = coveredWidth() / 2;
		viewOffsetX += (target - viewOffsetX) * 0.2;
		if (Math.abs(target - viewOffsetX) < 0.5) viewOffsetX = target;
		const size = `${w}x${h}`;
		if (viewOffsetX === appliedOffsetX && size === appliedSize) return;
		appliedOffsetX = viewOffsetX;
		appliedSize = size;
		// A sub-window starting left of the frame pushes the frame's center to the right.
		camera.setViewOffset(w, h, -viewOffsetX, 0, w, h);
	}

	function clearContent() {
		content.clear();
		disposables.forEach((d) => d.dispose());
		disposables = [];
		emObjects = [];
		pickables = [];
	}

	function inFloor(y: number) {
		if (floor < 0 || !floors || !floors[floor]) return true;
		return floors[floor].top >= y && floors[floor].bottom <= y;
	}

	/** Builds one placeholder box (fill + outline) for an object at a position. */
	function addBox(
		em: Em,
		set: EmSet,
		pos: { x: number; y: number; z: number },
		box: ReturnType<typeof placeholderBox>,
		opacity: number,
		shape: 'box' | 'sphere' = 'box'
	): EmObject {
		const group = new THREE.Group();
		group.scale.set(...box.size);

		const sphere = shape === 'sphere';
		const mesh = new THREE.Mesh(sphere ? unitSphere : unitBox, fillMaterial(set.number * 10, opacity));
		mesh.userData.em = em;
		const edges = new THREE.LineSegments(
			sphere ? unitSphereRings : unitEdges,
			edgeMaterials.normal
		);
		group.add(mesh, edges);
		content.add(group);
		pickables.push(mesh);

		const obj: EmObject = {
			em,
			set,
			edges: [edges],
			center: new THREE.Vector3(),
			place() {
				const rotY = emRotationToThreeY(em.Rotation);
				const offset = rotateAboutY(box.center, rotY);
				group.position.set(pos.x + offset[0], pos.y + offset[1], pos.z + offset[2]);
				group.rotation.y = rotY;
				obj.center.copy(group.position);
			}
		};
		obj.place();
		return obj;
	}

	/** Adds a "No-Entry Wall" slab. Returns a function that re-places it after the Em moves. */
	function addWall(em: Em, length: number) {
		const wallHeight = 6;
		const wall = new THREE.Mesh(unitBox, wallMaterial);
		wall.scale.set(length, wallHeight, 0.5);
		wall.userData.em = em;
		content.add(wall);
		pickables.push(wall);
		const place = () => {
			wall.position.set(em.Trans.x, em.Trans.y + wallHeight / 2, em.Trans.z);
			wall.rotation.y = emRotationToThreeY(em.Rotation);
		};
		place();
		return place;
	}

	// Materials of each area group, so selecting a group can restyle it without rebuilding.
	let areaStyles: { group: AreaGroup; fill: THREE.MeshBasicMaterial; line: THREE.LineBasicMaterial }[] =
		[];

	/** Three orthogonal great circles, outlining a sphere. Returns line-segment xyz data. */
	function sphereOutline(center: { x: number; y: number; z: number }, r: number, steps = 48) {
		const out: number[] = [];
		for (let i = 0; i < steps; i++) {
			const a = (i / steps) * Math.PI * 2;
			const b = ((i + 1) / steps) * Math.PI * 2;
			const [ca, sa, cb, sb] = [Math.cos(a) * r, Math.sin(a) * r, Math.cos(b) * r, Math.sin(b) * r];
			out.push(center.x + ca, center.y + sa, center.z, center.x + cb, center.y + sb, center.z); // XY
			out.push(center.x + ca, center.y, center.z + sa, center.x + cb, center.y, center.z + sb); // XZ
			out.push(center.x, center.y + ca, center.z + sa, center.x, center.y + cb, center.z + sb); // YZ
		}
		return out;
	}

	/**
	 * Areas are either boxes (type 1: a footprint of 4 corners raised by `height`) or spheres
	 * (type 2: a center and radius).
	 */
	function addAreas(quest: Quest) {
		areaStyles = [];
		for (const group of quest.questData.areas) {
			const color = new THREE.Color(`hsl(${(group.index * 10) % 360}, 50%, 50%)`);
			const fill = new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				side: THREE.DoubleSide,
				depthWrite: false
			});
			const line = new THREE.LineBasicMaterial({ color, transparent: true });
			disposables.push(fill, line);
			areaStyles.push({ group, fill, line });

			for (const area of group.groups) {
				if (!inFloor(area.center.y)) continue;
				const solid = new THREE.BufferGeometry();
				const outline = new THREE.BufferGeometry();
				let mesh: THREE.Mesh;
				if (area.type === 1) {
					const prism = areaPrism(area.points, area.height);
					solid.setAttribute('position', new THREE.Float32BufferAttribute(prism.triangles, 3));
					outline.setAttribute('position', new THREE.Float32BufferAttribute(prism.edges, 3));
					mesh = new THREE.Mesh(solid, fill);
				} else {
					const sphere = new THREE.SphereGeometry(area.radius, 32, 16);
					sphere.translate(area.center.x, area.center.y, area.center.z);
					mesh = new THREE.Mesh(sphere, fill);
					outline.setAttribute(
						'position',
						new THREE.Float32BufferAttribute(sphereOutline(area.center, area.radius), 3)
					);
					disposables.push(sphere);
				}
				disposables.push(solid, outline);
				mesh.renderOrder = 1; // after the opaque objects and map model
				const lines = new THREE.LineSegments(outline, line);
				lines.renderOrder = 1;
				content.add(mesh, lines);
			}
		}
		updateAreaHighlight($currentArea);
	}

	/**
	 * Quests can have dozens of areas, so unselected ones are drawn as thin outlines only. The
	 * selected group gets a translucent fill and white outlines, and the rest fade further.
	 */
	function updateAreaHighlight(selected: AreaGroup | null) {
		for (const { group, fill, line } of areaStyles) {
			const active = group === selected;
			fill.visible = active;
			fill.opacity = 0.35;
			line.opacity = active ? 1 : selected ? 0.15 : 0.45;
			line.color.set(active ? 0xffffff : fill.color);
		}
	}
	$: updateAreaHighlight($currentArea);

	// Pan to the first area of a newly selected group (boxes are centered vertically, spheres sit
	// on their center). Re-announcements of the same selection don't move the camera.
	let lastArea: AreaGroup | null = null;
	function panToArea(selected: AreaGroup | null) {
		const first = selected?.groups[0];
		if (first && selected !== lastArea && controls) {
			const lift = first.type === 1 ? first.height / 2 : 0;
			flyTarget = new THREE.Vector3(first.center.x, first.center.y + lift, first.center.z);
		}
		lastArea = selected;
	}
	$: panToArea($currentArea);

	// Map models are large, so each is loaded and merged once and reused across rebuilds. A null
	// result means the zone has no model (e.g. r240); the scene is then just the objects.
	const modelCache = new Map<string, Promise<THREE.BufferGeometry | null>>();

	function loadMapModel(map: string) {
		let promise = modelCache.get(map);
		if (!promise) {
			promise = (async () => {
				for (const url of mapModelUrls(map)) {
					try {
						return await loadMapGeometry(url);
					} catch {
						// Missing file (the dev server answers with index.html) or invalid glb: try the next name.
					}
				}
				return null;
			})();
			modelCache.set(map, promise);
		}
		return promise;
	}

	/**
	 * Adds the map model. With a single floor selected, everything above that floor is clipped away
	 * so upper floors don't hide the objects (lower floors stay for context). The model is drawn
	 * translucent so objects inside buildings remain visible.
	 */
	// Solid mode hides anything inside the model; the default translucent mode lets it show through.
	let solidMap = false;
	let mapMaterial: THREE.MeshLambertMaterial | null = null;

	function applyMapStyle(solid: boolean) {
		if (!mapMaterial) return;
		mapMaterial.transparent = !solid;
		mapMaterial.opacity = solid ? 1 : 0.35;
		mapMaterial.depthWrite = solid;
		mapMaterial.needsUpdate = true; // transparency changes need a shader refresh
	}
	$: applyMapStyle(solidMap);

	function addMapModel(clipHeight: number | null) {
		const myToken = token;
		loadMapModel(map).then((geometry) => {
			// Ignore if the scene was rebuilt while the model was loading.
			if (!geometry || myToken !== token) return;
			const material = new THREE.MeshLambertMaterial({
				color: 0x9a9aa4,
				flatShading: true, // the merged geometry carries no normals
				side: THREE.DoubleSide,
				clippingPlanes: clipHeight === null ? [] : [new THREE.Plane(new THREE.Vector3(0, -1, 0), clipHeight)]
			});
			mapMaterial = material;
			applyMapStyle(solidMap);
			const mesh = new THREE.Mesh(geometry, material);
			mesh.renderOrder = -1;
			disposables.push(material); // the geometry stays cached
			content.add(mesh);
		});
	}

	let token = 0;
	let fittedKey = '';

	function rebuild() {
		if (!ready) return;
		clearContent();
		token++;
		const quest = get(session);
		if (!(quest instanceof Quest)) return;

		const visible: THREE.Vector3[] = [];
		for (const set of quest.enemySet.sets) {
			for (const em of set.ems) {
				if (!inFloor(em.Trans.y)) continue;
				const name = questLookup(em.Id, true);
				const box = placeholderBox(getCollision(name) as Box | null);
				const obj = addBox(em, set, em.Trans, box, 1);
				emObjects.push(obj);
				visible.push(obj.center);

				if ((questLookup(em.Id) || '').startsWith('No')) {
					const length = em.SetType || em.ExSetTypeA || em.ExSetTypeB;
					if (length) {
						const placeBox = obj.place;
						const placeWall = addWall(em, length);
						obj.place = () => {
							placeBox();
							placeWall();
						};
					}
				}
				if (em.secondaryObjectEnabled) {
					emObjects.push(addBox(em, set, em.TransL, placeholderBox(null), 0.7, 'sphere'));
				}
			}
		}

		addMapModel(floorClipHeight(floor >= 0 ? floors?.[floor] : undefined));

		if ($showAreasOnMap) addAreas(quest);
		updateHighlight($currentEm);
		syncGizmo($currentEm);

		// Frame the objects the first time a given map/floor is shown.
		const key = `${quest.id}/${map}/${floor}`;
		if (key !== fittedKey) {
			fittedKey = key;
			fitCamera(visible);
		}
	}

	/** Points the camera at the objects from above, with screen-up = world -X like the 2D map. */
	function fitCamera(points: THREE.Vector3[]) {
		const bounds = new THREE.Box3().setFromPoints(points.length ? points : [new THREE.Vector3()]);
		const center = bounds.getCenter(new THREE.Vector3());
		const radius = Math.max(bounds.getSize(new THREE.Vector3()).length() / 2, 20);
		const dist = radius * 2.2;
		const tilt = THREE.MathUtils.degToRad(35); // from vertical
		controls.target.copy(center);
		camera.position.set(
			center.x + dist * Math.sin(tilt),
			center.y + dist * Math.cos(tilt),
			center.z
		);
		controls.update();
		flyTarget = null;
	}

	// Rebuild only when something that affects the scene actually changed. Using a string key matters:
	// Svelte re-emits the $session store whenever any part of the quest is touched (for example just
	// switching sidebar tabs), which previously caused a full rebuild each time.
	$: rebuildKey = [
		$writableMap,
		$session instanceof Quest ? $session.id : '',
		floor,
		map,
		$showAreasOnMap,
		ready
	].join('|');
	$: rebuildKey, rebuild();

	// ---- Selection -------------------------------------------------------------------------

	function updateHighlight(selected: Em | null) {
		const selectedSet = selected ? emObjects.find((o) => o.em === selected)?.set : undefined;
		for (const o of emObjects) {
			const material =
				o.em === selected
					? edgeMaterials.active
					: selectedSet && o.set === selectedSet
						? edgeMaterials.nearby
						: edgeMaterials.normal;
			o.edges.forEach((e) => (e.material = material));
		}
	}

	let flyTarget: THREE.Vector3 | null = null;
	let lastSelected: Em | null = null;
	function onSelectionChange(selected: Em | null) {
		updateHighlight(selected);
		syncGizmo(selected);
		const target = selected && emObjects.find((o) => o.em === selected);
		// Pan to newly selected objects (clicked or chosen in the sidebar), but not to mere
		// re-announcements of the same selection (e.g. while dragging the gizmo).
		if (target && selected !== lastSelected && controls) {
			flyTarget = target.center.clone();
		}
		lastSelected = selected;
	}
	$: onSelectionChange($currentEm);

	// ---- Gizmo -----------------------------------------------------------------------------

	function applyGizmoMode() {
		transform.setMode(gizmoMode);
		transform.setSpace('world');
		// An Em only has a yaw, so rotation is limited to the vertical axis.
		transform.showX = transform.showZ = gizmoMode === 'translate';
		transform.showY = true;
	}

	function setGizmoMode(mode: 'translate' | 'rotate') {
		gizmoMode = mode;
		applyGizmoMode();
	}

	/** Attaches the gizmo to the selected object (if it is on screen), or hides it. */
	function syncGizmo(selected: Em | null) {
		if (!transform || transform.dragging) return;
		if (!selected || !emObjects.some((o) => o.em === selected)) {
			transform.detach();
			return;
		}
		gizmoProxy.position.set(selected.Trans.x, selected.Trans.y, selected.Trans.z);
		gizmoProxy.rotation.set(0, emRotationToThreeY(selected.Rotation), 0);
		transform.attach(gizmoProxy);
	}

	/** Copies the gizmo's transform into the Em and moves its boxes live (no scene rebuild). */
	function onGizmoChange() {
		const em = $currentEm;
		if (!em) return;
		em.Trans.x = gizmoProxy.position.x;
		em.Trans.y = gizmoProxy.position.y;
		em.Trans.z = gizmoProxy.position.z;
		const q = gizmoProxy.quaternion;
		em.Rotation = threeYToEmRotation(yawFromQuaternion(q.y, q.w));
		emObjects.filter((o) => o.em === em).forEach((o) => o.place());
		currentEm.set(em); // re-announce so the sidebar's position/rotation inputs update
	}

	function onKeyDown(e: KeyboardEvent) {
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		if (e.key === 'w') setGizmoMode('translate');
		else if (e.key === 'e') setGizmoMode('rotate');
	}

	// ---- Picking ---------------------------------------------------------------------------

	let downAt: { x: number; y: number } | null = null;
	let onGizmo = false;
	function onPointerDown(e: PointerEvent) {
		downAt = { x: e.clientX, y: e.clientY };
		// A press on a gizmo handle must not also select whatever is behind it.
		onGizmo = transform.axis !== null;
	}
	function pick(e: PointerEvent) {
		const rect = renderer.domElement.getBoundingClientRect();
		const ndc = new THREE.Vector2(
			((e.clientX - rect.left) / rect.width) * 2 - 1,
			-((e.clientY - rect.top) / rect.height) * 2 + 1
		);
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(ndc, camera);
		return raycaster.intersectObjects(pickables, false)[0];
	}

	/** Shows a pointer cursor over clickable objects. Skipped mid-drag to avoid needless raycasts. */
	function onPointerMove(e: PointerEvent) {
		if (e.buttons !== 0) return;
		renderer.domElement.style.cursor = transform.axis !== null || pick(e) ? 'pointer' : '';
	}

	function onPointerUp(e: PointerEvent) {
		if (e.button !== 0 || onGizmo) return; // only left click selects, and not through the gizmo
		// Only treat it as a click if the pointer barely moved (otherwise it was an orbit/pan).
		if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 4) return;
		const hit = pick(e);
		if (hit) {
			dispatch('select', hit.object.userData.em as Em);
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />
<div class="map3d" bind:this={container} />
<button class="solidToggle" class:active={solidMap} on:click={() => (solidMap = !solidMap)}>
	{solidMap ? 'Solid map: on' : 'Solid map: off'}
</button>
{#if $currentEm}
	<div class="gizmoModes">
		<button class:active={gizmoMode === 'translate'} on:click={() => setGizmoMode('translate')}>
			Move (W)
		</button>
		<button class:active={gizmoMode === 'rotate'} on:click={() => setGizmoMode('rotate')}>
			Rotate (E)
		</button>
	</div>
{/if}

<style>
	.map3d {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.solidToggle {
		position: absolute;
		right: 5px;
		top: 75px;
		z-index: 10;
		padding: 5px;
	}
	.solidToggle.active {
		outline: 2px solid var(--primary-400);
	}
	.gizmoModes {
		position: absolute;
		right: 5px;
		top: 110px;
		z-index: 10;
		display: flex;
		gap: 4px;
	}
	.gizmoModes button {
		padding: 5px;
	}
	.gizmoModes button.active {
		outline: 2px solid var(--primary-400);
	}
	.map3d :global(canvas) {
		display: block;
	}
</style>
