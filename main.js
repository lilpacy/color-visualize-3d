import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css';
import { hsvToRgb, rgbToHsv } from './utils/colorConversion.js';
import { RGBCube } from './components/RGBCube.js';
import { HSVCone } from './components/HSVCone.js';

class ColorVisualizerApp {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.controls = null;
    this.rgbCube = new RGBCube();
    this.hsvCone = new HSVCone();

    this.initialize();
  }

  initialize() {
    // レンダラーの設定
    this.setupRenderer();
    
    // カメラの設定
    this.setupCamera();
    
    // コントロールの設定
    this.setupControls();
    
    // ヘルパーの追加
    this.addHelpers();
    
    // UIの作成
    this.createUI();
    
    // シーンへの追加
    this.scene.add(this.rgbCube.getGroup());
    this.scene.add(this.hsvCone.getGroup());
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // アニメーションの開始
    this.animate();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('#app').appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera.position.set(3, 2, 3);
    this.camera.lookAt(0.5, 0.5, 0.5);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    };

    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.PAN
    };

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.panSpeed = 1.0;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 1.2;
    this.controls.enableZoom = true;
  }

  addHelpers() {
    const gridHelper = new THREE.GridHelper(1, 10);
    gridHelper.position.set(0.5, 0, 0.5);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1.2);
    this.scene.add(axesHelper);

    this.addAxisLabels();
  }

  addAxisLabels() {
    const createLabel = (text, position) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 32;
      
      context.fillStyle = '#ffffff';
      context.font = '24px Arial';
      context.fillText(text, 0, 24);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(0.5, 0.25, 1);
      return sprite;
    };

    this.scene.add(createLabel('R', new THREE.Vector3(1.3, 0, 0)));
    this.scene.add(createLabel('G', new THREE.Vector3(0, 1.3, 0)));
    this.scene.add(createLabel('B', new THREE.Vector3(0, 0, 1.3)));
  }

  createUI() {
    document.querySelector('#app').innerHTML = `
      <div class="controls">
        <div class="control-section">
          <h3>RGB</h3>
          <div class="slider-group">
            <label>R: <span id="r-value">0</span></label>
            <input type="range" id="r-slider" min="1" max="256" step="1" value="1">
          </div>
          <div class="slider-group">
            <label>G: <span id="g-value">0</span></label>
            <input type="range" id="g-slider" min="1" max="256" step="1" value="1">
          </div>
          <div class="slider-group">
            <label>B: <span id="b-value">0</span></label>
            <input type="range" id="b-slider" min="1" max="256" step="1" value="1">
          </div>
        </div>
        <div class="control-section">
          <h3>HSV</h3>
          <div class="slider-group">
            <label>H: <span id="h-value">0</span>°</label>
            <input type="range" id="h-slider" min="0" max="360" step="1" value="0">
          </div>
          <div class="slider-group">
            <label>S: <span id="s-value">0</span>%</label>
            <input type="range" id="s-slider" min="0" max="100" step="1" value="0">
          </div>
          <div class="slider-group">
            <label>V: <span id="v-value">0</span>%</label>
            <input type="range" id="v-slider" min="0" max="100" step="1" value="0">
          </div>
        </div>
        <div id="current-color" style="width: 50px; height: 50px; border: 1px solid white;"></div>
        <div class="hsv-view">
          <canvas id="hsv-cone" width="200" height="200"></canvas>
          <canvas id="hue-slider" width="200" height="20"></canvas>
        </div>
      </div>
    `;
    document.querySelector('#app').appendChild(this.renderer.domElement);
  }

  updateMarkerPosition(source = 'rgb') {
    let r, g, b, h, s, v;

    if (source === 'rgb') {
      r = (parseFloat(document.getElementById('r-slider').value) - 1) / 255;
      g = (parseFloat(document.getElementById('g-slider').value) - 1) / 255;
      b = (parseFloat(document.getElementById('b-slider').value) - 1) / 255;
      
      [h, s, v] = rgbToHsv(r * 255, g * 255, b * 255);
      
      // HSVスライダーを更新
      document.getElementById('h-slider').value = h;
      document.getElementById('s-slider').value = s;
      document.getElementById('v-slider').value = v;
      document.getElementById('h-value').textContent = Math.round(h);
      document.getElementById('s-value').textContent = Math.round(s);
      document.getElementById('v-value').textContent = Math.round(v);
    } else {
      h = parseFloat(document.getElementById('h-slider').value);
      s = parseFloat(document.getElementById('s-slider').value);
      v = parseFloat(document.getElementById('v-slider').value);
      
      [r, g, b] = hsvToRgb(h, s, v);
      
      // RGBスライダーを更新
      document.getElementById('r-slider').value = Math.round(r * 255) + 1;
      document.getElementById('g-slider').value = Math.round(g * 255) + 1;
      document.getElementById('b-slider').value = Math.round(b * 255) + 1;
      document.getElementById('r-value').textContent = Math.round(r * 255) + 1;
      document.getElementById('g-value').textContent = Math.round(g * 255) + 1;
      document.getElementById('b-value').textContent = Math.round(b * 255) + 1;
    }

    const color = new THREE.Color(r, g, b);
    
    // マーカーの更新
    this.rgbCube.updateMarkerPosition(r, g, b);
    this.hsvCone.updateMarkerPosition(h, s, v, color);
    
    // カラーパネルの更新
    document.getElementById('current-color').style.backgroundColor = 
      `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
    
    // HSVビューの更新
    this.updateHSVView();
  }

  setupEventListeners() {
    ['r-slider', 'g-slider', 'b-slider'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.updateMarkerPosition('rgb'));
    });

    ['h-slider', 's-slider', 'v-slider'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.updateMarkerPosition('hsv'));
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  updateHSVView() {
    this.drawHSVCone();
    this.drawHueSlider();
  }

  drawHSVCone() {
    const canvas = document.getElementById('hsv-cone');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    
    const currentHue = parseFloat(document.getElementById('h-slider').value);
    
    ctx.clearRect(0, 0, width, height);
    
    for(let r = radius; r > 0; r--) {
      for(let angle = 0; angle < 360; angle += 1) {
        const x = centerX + r * Math.cos(angle * Math.PI / 180);
        const y = centerY + r * Math.sin(angle * Math.PI / 180);
        
        const saturation = r / radius * 100;
        const value = 100;
        
        const [red, green, blue] = hsvToRgb(currentHue, saturation, value);
        ctx.fillStyle = `rgb(${red * 255}, ${green * 255}, ${blue * 255})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    
    const currentS = parseFloat(document.getElementById('s-slider').value);
    const currentV = parseFloat(document.getElementById('v-slider').value);
    const angle = currentHue * Math.PI / 180;
    const distance = (currentS / 100) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawHueSlider() {
    const canvas = document.getElementById('hue-slider');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for(let i = 0; i <= 360; i += 60) {
      const [r, g, b] = hsvToRgb(i, 100, 100);
      gradient.addColorStop(i / 360, `rgb(${r * 255}, ${g * 255}, ${b * 255})`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const currentHue = parseFloat(document.getElementById('h-slider').value);
    const x = (currentHue / 360) * width;
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// アプリケーションの起動
const app = new ColorVisualizerApp();

