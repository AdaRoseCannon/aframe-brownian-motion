/* jshint esversion: 9, -W028 */
/* For dealing with covering one object in another curves */
/* global THREE, AFRAME */

import {perlin2, seed} from './noise.js';

const schema = {
	seed: {
		default: 0
	},
	octaves: {
		default: 2
	},
	positionVariance: {
		default: 1
	},
	rotationVariance: {
		default: 10
	}
};

documentation:
(function () {
	schema.object.seed = `Random seed `;
	schema.object.octaves = `How fine grained the motion is`;
	schema.object.positionVariance = `How much it should be moved by`;
	schema.object.rotationVariance = `How much it should rotate by`;
}());

const v2 = new THREE.Vector2();
const np = new THREE.Vector3();
const nr = new THREE.Vector3();
const nre = new THREE.Euler(0,0,0,'ZXY');
const nrq = new THREE.Quaternion();
AFRAME.registerComponent('brownian-motion', {
	schema,
	description: `This component animates an object`,
	init() {
		this.initialPosition = new THREE.Vector3().copy(this.el.object3D.position);
		this.initialQuaternion = new THREE.Quaternion().copy(this.el.object3D.quaternion);
		this.positionOffset = new THREE.Vector3(
			Math.random()*2000 - 1000,
			Math.random()*2000 - 1000,
			Math.random()*2000 - 1000,
		);
		this.rotationOffset = new THREE.Vector3(
			Math.random()*2000 - 1000,
			Math.random()*2000 - 1000,
			Math.random()*2000 - 1000,
		);
	},
	update() {
		seed(this.data.seed);
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
	tick(time) {

		const object3D = this.el.object3D;

		np.set(
			this.fbm(this.positionOffset.x, time/1000, this.data.octaves),
			this.fbm(this.positionOffset.y, time/1000, this.data.octaves),
			this.fbm(this.positionOffset.z, time/1000, this.data.octaves)
		);

		nr.set(
			this.fbm(this.rotationOffset.x, time/1000, this.data.octaves),
			this.fbm(this.rotationOffset.y, time/1000, this.data.octaves),
			this.fbm(this.rotationOffset.z, time/1000, this.data.octaves)
		);

		np.multiplyScalar(this.data.positionVariance / 0.75);
		nr.multiplyScalar(this.data.rotationVariance / 0.75);

		// transform.localPosition = _initialPosition + np;
		object3D.position.copy(this.initialPosition).add(np);
		// var nrq = quaternion.EulerZXY(math.radians(nr));
		// transform.localRotation = math.mul(nrq, _initialRotation);
		nre.setFromVector3(nr);
		nrq.setFromEuler(nre);
		object3D.quaternion.copy(this.initialQuaternion).multiply(nrq);
	},
	remove() {
	}
});
