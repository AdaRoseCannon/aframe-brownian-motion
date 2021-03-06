/* jshint esversion: 9, -W028 */
/* For dealing with covering one object in another curves */
/* global THREE, AFRAME */

import {perlin2, seed} from './noise.js';

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

documentation:
(function () {
	schema.spaceVector.description = `Where in the phase space the starts, this should be an array of 6 values where empty spaces become a random number between -1000 and 1000`;
	schema.octaves.description = `How fine grained the motion is`;
	schema.positionVariance.description = `How much it should be moved by`;
	schema.rotationVariance.description = `How much it should rotate by`;
	schema.speed.description = `Speed multiplier`;
	schema.rotationFollowsAxis.description = `If the object should follow the path along certain axis, set it here`;
}());

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


