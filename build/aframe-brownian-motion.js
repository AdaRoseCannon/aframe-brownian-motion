(function () {
	'use strict';

	/* jshint esversion: 9, varstmt:true */
	/*
	 * A speed-improved perlin and simplex noise algorithms for 2D.
	 *
	 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
	 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
	 * Better rank ordering method by Stefan Gustavson in 2012.
	 * Converted to Javascript by Joseph Gentle.
	 *
	 * Version 2012-03-09
	 * 
	 * Modified by AdaRoseCannon 2022-14-07 for AFrame
	 *
	 * This code was placed in the public domain by its original author,
	 * Stefan Gustavson. You may use it as you see fit, but
	 * attribution is appreciated.
	 *
	 */

	class Grad {
		constructor(x, y, z) {
			this.x = x; this.y = y; this.z = z;
		}
		dot2(x, y) {
			return this.x * x + this.y * y;
		}
		dot3(x, y, z) {
			return this.x * x + this.y * y + this.z * z;
		}
	}

	const grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
	new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
	new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

	const p = new Uint8Array([151, 160, 137, 91, 90, 15,
		131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
		190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
		88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
		77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
		102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
		135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
		5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
		223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
		129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
		251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
		49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
		138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180]);
	// To remove the need for index wrapping, double the permutation table length
	const perm = new Uint16Array(512);
	const gradP = Array(512);

	// This isn't a very good seeding function, but it works ok. It supports 2^16
	// different seed values. Write something better if you need more seeds.
	function seed (seed) {
		if (seed > 0 && seed < 1) {
			// Scale the seed out
			seed *= 65536;
		}

		seed = Math.floor(seed);
		if (seed < 256) {
			seed |= seed << 8;
		}

		for (let i = 0; i < 256; i++) {
			let v;
			if (i & 1) {
				v = p[i] ^ (seed & 255);
			} else {
				v = p[i] ^ ((seed >> 8) & 255);
			}

			perm[i] = perm[i + 256] = v;
			gradP[i] = gradP[i + 256] = grad3[v % 12];
		}
	}

	seed(0);

	// ##### Perlin noise stuff

	function fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(a, b, t) {
		return (1 - t) * a + t * b;
	}

	// 2D Perlin Noise
	function perlin2 (x, y) {
		// Find unit grid cell containing point
		let X = Math.floor(x), Y = Math.floor(y);
		// Get relative xy coordinates of point within that cell
		x = x - X; y = y - Y;
		// Wrap the integer cells at 255 (smaller integer period can be introduced here)
		X = X & 255; Y = Y & 255;

		// Calculate noise contributions from each of the four corners
		const n00 = gradP[X + perm[Y]].dot2(x, y);
		const n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
		const n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
		const n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);

		// Compute the fade curve value for x
		const u = fade(x);

		// Interpolate the four results
		return lerp(
			lerp(n00, n10, u),
			lerp(n01, n11, u),
			fade(y));
	}

	/* jshint esversion: 9, -W028 */

	const schema = {
		spaceVector: {
			type: 'array'
		},
		octaves: {
			default: 2
		},
		positionVariance: {
			type: 'vec3',
			default: new THREE.Vector3(1,1,1)
		},
		rotationVariance: {
			type: 'vec3',
			default: new THREE.Vector3(10,10,10)
		},
		speed: {
			default: 1
		},
		rotationFollowsAxis: {
			oneOf: ['x', 'y', 'z', '-x', '-y', '-z',, 'none'],
			default: 'none'
		}
	};

	const v2 = new THREE.Vector2();
	const np = new THREE.Vector3();
	const temp = new THREE.Vector3();
	const temp2 = new THREE.Vector3();
	const nr = new THREE.Vector3();
	const nre = new THREE.Euler(0,0,0,'ZXY');
	const nrq = new THREE.Quaternion();
	const emptyOffset = [0,0,0,0,0,0];
	const _scale = new THREE.Vector3(1,1,1);
	const _matrix = new THREE.Matrix4();

	const brownianMotion = {
		schema,
		description: `This component animates an object`,
		init() {
			this.initialPosition = new THREE.Vector3().copy(this.el.object3D.position);
			this.initialQuaternion = new THREE.Quaternion().copy(this.el.object3D.quaternion);
			this.positionOffset = new THREE.Vector3();
			this.rotationOffset = new THREE.Vector3();
		},
		update() {
			this.positionOffset.x = (this.data.spaceVector[0] === '' || this.data.spaceVector[0] === undefined) ? Math.random()*2000 - 1000 : Number.parseFloat(this.data.spaceVector[0]);
			this.positionOffset.y = (this.data.spaceVector[1] === '' || this.data.spaceVector[1] === undefined) ? Math.random()*2000 - 1000 : Number.parseFloat(this.data.spaceVector[1]);
			this.positionOffset.z = (this.data.spaceVector[2] === '' || this.data.spaceVector[2] === undefined) ? Math.random()*2000 - 1000 : Number.parseFloat(this.data.spaceVector[2]);
			this.rotationOffset.x = (this.data.spaceVector[3] === '' || this.data.spaceVector[3] === undefined) ? Math.random()*2000 - 1000 : Number.parseFloat(this.data.spaceVector[3]);
			this.rotationOffset.y = (this.data.spaceVector[4] === '' || this.data.spaceVector[4] === undefined) ? Math.random()*2000 - 1000 : Number.parseFloat(this.data.spaceVector[4]);
			this.rotationOffset.z = (this.data.spaceVector[5] === '' || this.data.spaceVector[5] === undefined) ? Math.random()*2000 - 1000 : Number.parseFloat(this.data.spaceVector[5]);
			
			this.rotationFollowsAxis = this.data.rotationFollowsAxis;
			this.rotationFollowsAxisMultiplier = 1;
			if (this.rotationFollowsAxis[0] === '-') {
				this.rotationFollowsAxis = this.rotationFollowsAxis.substr(1);
				this.rotationFollowsAxisMultiplier = -1;
			}
		},
		seed(number) {
			seed(number);
		},
		fbm(x, y, octave) {
			let p = v2.set(x,y);
			let f = 0.0;
			let w = 0.5;
			for (let i = 0; i < octave; i++) {
				f += w * perlin2(p.x, p.y);
				p.multiplyScalar(2.0);
				w *= 0.5;
			}
			return f;
		},
		updateNPNRQ(time, extraOffset, extraOffsetMultiplier, oldTime) {
			np.set(
				this.fbm(this.positionOffset.x + extraOffset[0] * extraOffsetMultiplier, this.data.speed * time/1000, this.data.octaves),
				this.fbm(this.positionOffset.y + extraOffset[1] * extraOffsetMultiplier, this.data.speed * time/1000, this.data.octaves),
				this.fbm(this.positionOffset.z + extraOffset[2] * extraOffsetMultiplier, this.data.speed * time/1000, this.data.octaves)
			);

			if (this.data.rotationFollowsAxis === 'none') {
				nr.set(
					this.fbm(this.rotationOffset.x + extraOffset[3] * extraOffsetMultiplier, this.data.speed * time/1000, this.data.octaves),
					this.fbm(this.rotationOffset.y + extraOffset[4] * extraOffsetMultiplier, this.data.speed * time/1000, this.data.octaves),
					this.fbm(this.rotationOffset.z + extraOffset[5] * extraOffsetMultiplier, this.data.speed * time/1000, this.data.octaves)
				);
				nr.multiply(this.data.rotationVariance).multiplyScalar(1 / 0.75);
				nre.setFromVector3(nr);
				nrq.setFromEuler(nre);
			} else {
				temp2.set(
					this.fbm(this.positionOffset.x + extraOffset[0] * extraOffsetMultiplier, this.data.speed * oldTime/1000, this.data.octaves),
					this.fbm(this.positionOffset.y + extraOffset[1] * extraOffsetMultiplier, this.data.speed * oldTime/1000, this.data.octaves),
					this.fbm(this.positionOffset.z + extraOffset[2] * extraOffsetMultiplier, this.data.speed * oldTime/1000, this.data.octaves)
				);
				temp2.subVectors(np, temp2).normalize();
				temp.set(0,0,0);
				temp[this.rotationFollowsAxis] = 1 * this.rotationFollowsAxisMultiplier;
				nrq.setFromUnitVectors(temp, temp2);
			}
			np.multiply(this.data.positionVariance).multiplyScalar(1 / 0.75);
		},
		tick(time) {
			if (!this.startTime) {
				this.startTime = time;
				this.oldTime = -16;
			}
			
			this.updateNPNRQ(time-this.startTime, emptyOffset, 0, this.oldTime);
			this.oldTime = time-this.startTime;

			const object3D = this.el.object3D;
			object3D.position.copy(this.initialPosition).add(np);
			object3D.quaternion.copy(this.initialQuaternion).multiply(nrq);
		}
	};

	const brownianPath = Object.assign({
		updateInstances() {
			const data = this.data;
			const instances = this.instances;
			const instanceGroup = new THREE.Group();
			if (this.el.getObject3D('instances')) {
				this.el.removeObject3D('instances');
			}
			instances.splice(0);
			if (data.object) {
				data.object.object3D.traverse(function (object) {
					if (object.geometry && object.material) {
						const instance = new THREE.InstancedMesh(object.geometry, object.material, data.count);
						instance.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
						instances.push(instance);
						instanceGroup.add(instance);
					}
				});
			}
			this.el.setObject3D('instances', instanceGroup);
		}
	}, brownianMotion);
	brownianPath.schema = Object.assign({
		object: {
			type: 'selector',
			description: `Which object to instance with brownian-motion`
		},
		showLine: {
			default: false,
			description: `Whether to draw lines`
		},
		lineColor1: {
			type: 'color',
			default: 'orange',
			description: `Color of the first line`
		},
		lineColor2: {
			type: 'color',
			default: 'hotpink',
			description: `Color of the last line`
		},
		lineStart: {
			default: 0,
			description: `Time stamp to start drawing the lines at`
		},
		lineStep: {
			default: 20,
			description: `Steps to take in drawing the path`
		},
		lineEnd: {
			default: 10000,
			description: `Time stamp to stop drawing the lines at`
		},
		spaceVectorOffset: {
			type: 'array',
			description: `Space vector offset for each instance/line`
		},
		count: {
			default: 10,
			description: `Number of lines or instances`
		}
	}, brownianMotion.schema);

	brownianPath.init = function tick() {
		brownianMotion.init.call(this);
		this.instances = [];
		this.updateInstances = this.updateInstances.bind(this);
	};

	brownianPath.update = function update(oldData) {
		const data = this.data;
		brownianMotion.update.call(this);
		this.spaceVectorOffset = [];
		for (let i=0;i<6;i++) {
			this.spaceVectorOffset[i] = data.spaceVectorOffset[i] ? Number(data.spaceVectorOffset[i]) : 0;
		}

		// Redraw the lines
		if (this.el.getObject3D('brownianPathLines')) {
			this.el.removeObject3D('brownianPathLines');
		}
		if (data.showLine) {
			const c1 = new THREE.Color(data.lineColor1);
			const c2 = new THREE.Color(data.lineColor2);
			const lineGroup = new THREE.Group();
			this.el.setObject3D('brownianPathLines', lineGroup);
			const points = [];
			for (let i=0;i<data.count;i++) {
				points[i] = [];
			}
			for (let t=data.lineStart;t<data.lineEnd;t+=data.lineStep) {
				for (let i=0;i<data.count;i++) {
					this.updateNPNRQ(t, this.spaceVectorOffset, i);
					points[i].push( np.clone() );
				}
			}
			for (let i=0;i<data.count;i++) {
				const material = new THREE.LineBasicMaterial( { color: c1.lerpHSL(c2, i/(this.data.count - 1)) } );
				const geometry = new THREE.BufferGeometry().setFromPoints( points[i] );
				const line = new THREE.Line( geometry, material );
				lineGroup.add(line);
			}
		}

		if (oldData.object) {
			oldData.object.removeEventListener('object3dset', this.updateInstances);
		}
		if (data.object) {
			data.object.addEventListener('object3dset', this.updateInstances);
			this.updateInstances();
		}
	};
	brownianPath.tick = function tick(time) {
		if (!this.startTime) {
			this.startTime = time;
			this.oldTime = -16;
		}
		for (let i=0;i<this.data.count;i++) {
			this.updateNPNRQ(time-this.startTime, this.spaceVectorOffset, i, this.oldTime);
			_matrix.compose(np, nrq, _scale);
			for (const ins of this.instances) {
				ins.setMatrixAt( i, _matrix );
			}
		}
		this.oldTime = time-this.startTime;
		for (const ins of this.instances) {
			ins.instanceMatrix.needsUpdate = true;
		}
	};

	AFRAME.registerComponent('brownian-motion', brownianMotion);
	AFRAME.registerComponent('brownian-path', brownianPath);

})();
//# sourceMappingURL=aframe-brownian-motion.js.map
