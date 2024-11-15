import * as THREE from 'three';
import { hsvToRgb } from '../utils/colorConversion.js';

export class HSVCone {
  constructor() {
    this.group = new THREE.Group();
    this.marker = null;
    this.cone = null;
    this.segments = 32;
    this.rings = 10;
    this.height = 1;
    this.radius = 0.5;
    
    this.initialize();
  }

  initialize() {
    // コーンの作成
    this.createCone();
    // マーカーの作成
    this.createMarker();
    
    // グループに追加
    this.group.add(this.cone);
    this.group.add(this.marker);
    
    // 位置の設定
    this.group.position.set(0, -0.5, 0);
  }

  createCone() {
    const points = [];
    const colors = [];
    
    // 頂点（先端）を追加
    points.push(new THREE.Vector3(0, 0, 0));
    colors.push(new THREE.Color(0, 0, 0));
    
    // リング状に点を配置
    for (let ring = 1; ring <= this.rings; ring++) {
      const v = ring / this.rings;
      const currentRadius = (this.radius * ring) / this.rings;
      
      for (let segment = 0; segment < this.segments; segment++) {
        const theta = (segment / this.segments) * Math.PI * 2;
        const x = currentRadius * Math.cos(theta);
        const z = currentRadius * Math.sin(theta);
        const y = v * this.height;
        
        const hue = (theta / (Math.PI * 2)) * 360;
        const saturation = (Math.sqrt(x * x + z * z) / this.radius) * 100;
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
    
    this.cone = new THREE.Points(geometry, material);
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

  updateMarkerPosition(h, s, v, color) {
    const theta = (h / 360) * Math.PI * 2;
    const maxRadius = this.radius * (s / 100);
    const currentRadius = maxRadius * (v / 100);
    
    const x = currentRadius * Math.cos(theta);
    const y = v / 100;
    const z = currentRadius * Math.sin(theta);
    
    this.marker.position.set(x, y, z);
    this.marker.material.color.copy(color);
  }

  getGroup() {
    return this.group;
  }

  getMarker() {
    return this.marker;
  }
} 
