import * as THREE from 'three';
import { hsvToRgb } from '../utils/colorConversion.js';

export function createHSVCone() {
  const coneGroup = new THREE.Group();
  const segments = 32;
  const rings = 10;
  const height = 1;
  const radius = 0.5;
  
  const points = [];
  const colors = [];
  
  points.push(new THREE.Vector3(0, 0, 0));
  colors.push(new THREE.Color(0, 0, 0));
  
  for (let ring = 1; ring <= rings; ring++) {
    const v = ring / rings;
    const currentRadius = (radius * ring) / rings;
    
    for (let segment = 0; segment < segments; segment++) {
      const theta = (segment / segments) * Math.PI * 2;
      const x = currentRadius * Math.cos(theta);
      const z = currentRadius * Math.sin(theta);
      const y = v * height;
      
      const hue = (theta / (Math.PI * 2)) * 360;
      const saturation = (Math.sqrt(x * x + z * z) / radius) * 100;
      const value = v * 100;
      const [r, g, b] = hsvToRgb(hue, saturation, value);
      
      points.push(new THREE.Vector3(x, y, z));
      colors.push(new THREE.Color(r, g, b));
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  
  const colorArray = new Float32Array(colors.length * 3);
  colors.forEach((color, i) => {
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  });
  geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  
  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });
  
  const pointCloud = new THREE.Points(geometry, material);
  coneGroup.add(pointCloud);
  
  coneGroup.position.set(2, 0, 0.5);
  return coneGroup;
} 
