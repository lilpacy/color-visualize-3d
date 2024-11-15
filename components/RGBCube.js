import * as THREE from 'three';

export function createCube() {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      void main() {
        vec3 color = vPosition;
        if(abs(vPosition.x) == 0.5 || abs(vPosition.y) == 0.5 || abs(vPosition.z) == 0.5) {
          gl_FragColor = vec4(color, 0.0);
        } else {
          gl_FragColor = vec4(color, 0.3);
        }
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0.5, 0.5, 0.5);
  return cube;
}

export function createColorPoints() {
  const pointsGroup = new THREE.Group();
  const sphereGeo = new THREE.SphereGeometry(0.01);
  
  for(let x = 0; x <= 1; x += 0.1) {
    for(let y = 0; y <= 1; y += 0.1) {
      for(let z = 0; z <= 1; z += 0.1) {
        const sphereMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(x, y, z),
          transparent: true,
          opacity: 0.6
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(x, y, z);
        pointsGroup.add(sphere);
      }
    }
  }
  
  return pointsGroup;
} 
