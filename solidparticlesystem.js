"use strict";

// Particle system

var SolidParticleSystem = function(nb, size, scene) {
  var positions = [];
  var indices = [];
  var normals = [];
  var uvs = [];
  var particles = [];

  var half = size / 2;
  var quad = [ 
    new BABYLON.Vector3(-half, -half, 0.0),
    new BABYLON.Vector3(half, -half, 0.0),
    new BABYLON.Vector3(half, half, 0.0),
    new BABYLON.Vector3(-half, half, 0.0),
  ];
  // quads : 2 triangles per particle
  for (var p = 0; p < nb; p ++) {
    positions.push(quad[0].x, quad[0].y, quad[0].z);
    positions.push(quad[1].x, quad[1].y, quad[1].z);
    positions.push(quad[2].x, quad[2].y, quad[2].z);
    positions.push(quad[3].x, quad[3].y, quad[3].z);
    indices.push(p * 4, p * 4 + 1, p * 4 + 2);
    indices.push(p * 4, p * 4 + 2, p * 4 + 3);
    uvs.push(0,1, 1,1, 1,0, 0,0);
    particles.push({ 
      idx: p,
      position: new BABYLON.Vector3.Zero(),
      velocity: new BABYLON.Vector3.Zero()
       });
  }
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  var vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  var mesh = new BABYLON.Mesh("mesh", scene);
  vertexData.applyToMesh(mesh, true);

  this.size = size;
  this.nb = nb;
  this.particles = particles;
  this.vel = 0.0;
  this.mesh = mesh;
  this.camAxisZ = BABYLON.Vector3.Zero();
  this.camAxisY = BABYLON.Vector3.Zero();
  this.camAxisX = BABYLON.Vector3.Zero();
  this.axisX = BABYLON.Axis.X;
  this.axisY = BABYLON.Axis.Y;
  this.camera = scene.activeActiveCamera;

  var system = this;
  var quadPositionFunction = function(positions) {
    var idx, pt;
    var nbPt = 4;                         // nb vertex per particle : 3 for triangle, 4 for quad, etc
    var posPart = nbPt * 3;               // nb positions per particle

    // particle loop
    for (var p = 0; p < system.nb; p++) {    
      for (pt = 0; pt < nbPt; pt++) {
        idx = p * posPart + pt * 3;
        system.updateParticle(system.particles[p]);
      }
    }
  };

  var quadRecycle = function(particle) {
    var idx, pt;
    var nbPt = 4;                         // nb vertex per particle : 3 for triangle, 4 for quad, etc
    var posPart = nbPt * 3;               // nb positions per particle
    for (pt = 0; pt < nbPt; pt++) {
      idx = particle.idx * posPart + pt * 3;
      positions[idx] = quad[pt].x;      
      positions[idx + 1] = quad[pt].y;
      positions[idx + 2] = quad[pt].z;
    }
    system.particles[p] = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(system.vel);
  };

  this.positionFunction = quadPositionFunction;
  this.recycleFunction = quadRecycle;
};


SolidParticleSystem.prototype.start = function(vel) {
  var vcts = new Array(this.nb);
  var lifes = new Array(this.nb);
  for (var p = 0; p < this.nb; p++) {
    vcts[p] = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(vel);
  }
  this.vcts = vcts;
  this.vel = vel;
  this.gravity = -0.01;
};



// animate all the particles
SolidParticleSystem.prototype.animate = function() {
  // set two orthogonal vectors to the cam-mesh axis
  (this.camera.position).subtractToRef(this.mesh.position, this.camAxisY);
  BABYLON.Vector3.CrossToRef(this.camAxisZ, this.axisX, this.camAxisY);
  BABYLON.Vector3.CrossToRef(this.camAxisZ, this.camAxisY, this.camAxisX);
  this.camAxisY.normalize();
  this.camAxisX.normalize();

  this.mesh.updateMeshPositions(this.positionFunction);
};


// recycle a particle : can by overwritten by user
SolidParticleSystem.prototype.recycle = function(particle) {
  this.recycleFunction(particle);
};


// update a particle : can be overwritten by user
// will be called on each particle :
// just set a particle position
SolidParticleSystem.prototype.updateParticle = function(particle) {
  if (particle.position.y < 0) {
    this.recycle(particle);
  }
  particle.velocity.y += this.gravity + 1;              // increase y velocity by 1 + gravity
  particle.position.addInplace(particle.velocity);      //set particle new position
};