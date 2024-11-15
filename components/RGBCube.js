import * as THREE from 'three';

// RGBキューブのクラスを作成
export class RGBCube {
  constructor() {
    this.group = new THREE.Group();
    this.marker = null;
    this.cube = null;
    this.points = null;
    
    this.initialize();
  }

  initialize() {
    // キューブの作成
    this.createCube();
    // 点群の作成
    this.createColorPoints();
    // マーカーの作成
    this.createMarker();
    
    // グループに追加
    this.group.add(this.cube);
    this.group.add(this.points);
    this.group.add(this.marker);
  }

  createCube() {
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

    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.cube.position.set(0.5, 0.5, 0.5);
  }

  createColorPoints() {
    this.points = new THREE.Group();
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
          this.points.add(sphere);
        }
      }
    }
  }

  createMarker() {
    const markerGeometry = new THREE.SphereGeometry(0.04);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    this.marker = new THREE.Mesh(markerGeometry, markerMaterial);
  }

  updateMarkerPosition(r, g, b) {
    this.marker.position.set(r, g, b);
    this.marker.material.color.setRGB(r, g, b);
  }

  getGroup() {
    return this.group;
  }

  getMarker() {
    return this.marker;
  }
} 
