let collision: {
	[key: string]: [[number, number, number, number], [number, number, number, number]];
} = {};
fetch('./collision.json').then((response) => {
	if (response.ok) {
		response.json().then((data) => {
			collision = data;
			console.log('Collision data loaded successfully.');
		});
	}
});

export default function getCollision(name: string) {
	if (collision[name]) {
		return collision[name];
	} else {
		return null;
	}
}
