import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css';
import { hsvToRgb, rgbToHsv } from './utils/colorConversion.js';
import { RGBCube } from './components/RGBCube.js';
import { HSVCone } from './components/HSVCone.js';

class ColorVisualizerApp {
  constructor() {
    // RGBキューブ用のプロパティ
    this.rgbScene = new THREE.Scene();
    this.rgbCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.rgbRenderer = new THREE.WebGLRenderer();
    this.rgbControls = null;
    this.rgbCube = new RGBCube();

    // HSVコーン用のプロパティ
    this.hsvScene = new THREE.Scene();
    this.hsvCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.hsvRenderer = new THREE.WebGLRenderer();
    this.hsvControls = null;
    this.hsvCone = new HSVCone();

    this.initialize();
  }

  initialize() {
    // レンダラーの設定
    this.setupRenderers();
    
    // カメラの設定
    this.setupCameras();
    
    // コントロールの設定
    this.setupControls();
    
    // ヘルパーの追加
    this.addHelpers();
    
    // UIの作成
    this.createUI();
    
    // シーンへの追加
    this.rgbScene.add(this.rgbCube.getGroup());
    this.hsvScene.add(this.hsvCone.getGroup());
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // アニメーションの開始
    this.animate();
  }

  setupRenderers() {
    // RGBレンダラーの設定
    this.rgbRenderer.setSize(400, 400);
    this.rgbRenderer.setClearColor(0x242424);

    // HSVレンダラーの設定
    this.hsvRenderer.setSize(400, 400);
    this.hsvRenderer.setClearColor(0x242424);
  }

  setupCameras() {
    // RGBカメラの設定
    this.rgbCamera.position.set(3, 2, 3);
    this.rgbCamera.lookAt(0.5, 0.5, 0.5);

    // HSVカメラの設定
    this.hsvCamera.position.set(3, 2, 3);
    this.hsvCamera.lookAt(0, 0.5, 0);
  }

  setupControls() {
    // RGBコントロールの設定
    this.rgbControls = new OrbitControls(this.rgbCamera, this.rgbRenderer.domElement);
    this.setupControlsCommon(this.rgbControls);

    // HSVコントロールの設定
    this.hsvControls = new OrbitControls(this.hsvCamera, this.hsvRenderer.domElement);
    this.setupControlsCommon(this.hsvControls);
  }

  setupControlsCommon(controls) {
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    };

    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.PAN
    };

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.panSpeed = 1.0;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.enableZoom = true;
  }

  addHelpers() {
    // RGBシーンにヘルパーを追加
    const rgbGridHelper = new THREE.GridHelper(1, 10);
    rgbGridHelper.position.set(0.5, 0, 0.5);
    this.rgbScene.add(rgbGridHelper);
    const rgbAxesHelper = new THREE.AxesHelper(1.2);
    this.rgbScene.add(rgbAxesHelper);
    this.addAxisLabels(this.rgbScene);

    // HSVシーンのヘルパーを削除
    // const hsvGridHelper = new THREE.GridHelper(1, 10);
    // this.hsvScene.add(hsvGridHelper);
    // const hsvAxesHelper = new THREE.AxesHelper(1.2);
    // this.hsvScene.add(hsvAxesHelper);
  }

  addAxisLabels(scene) {
    const createLabel = (text, position) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.font = '24px Arial';
      context.fillText(text, 0, 24);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(0.2, 0.1, 1);
      return sprite;
    };

    scene.add(createLabel('X', new THREE.Vector3(1.3, 0, 0)));
    scene.add(createLabel('Y', new THREE.Vector3(0, 1.3, 0)));
    scene.add(createLabel('Z', new THREE.Vector3(0, 0, 1.3)));
  }

  createUI() {
    const appDiv = document.querySelector('#app');
    appDiv.innerHTML = `
      <div class="visualizer-container">
        <div class="canvas-container">
          <div id="rgb-canvas-container"></div>
          <div id="hsv-canvas-container"></div>
        </div>
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
          <div id="current-color"></div>
          <div class="hsv-view">
            <canvas id="hsv-cone" width="200" height="200"></canvas>
            <canvas id="hue-slider" width="200" height="20"></canvas>
          </div>
        </div>
      </div>
    `;

    // レンダラーの追加
    document.getElementById('rgb-canvas-container').appendChild(this.rgbRenderer.domElement);
    document.getElementById('hsv-canvas-container').appendChild(this.hsvRenderer.domElement);
  }

  setupEventListeners() {
    // RGBスライダーのイベントリスナー
    const rSlider = document.getElementById('r-slider');
    const gSlider = document.getElementById('g-slider');
    const bSlider = document.getElementById('b-slider');
    
    const updateRGBValues = () => {
      const r = rSlider.value / 255;
      const g = gSlider.value / 255;
      const b = bSlider.value / 255;
      
      document.getElementById('r-value').textContent = Math.round(r * 255);
      document.getElementById('g-value').textContent = Math.round(g * 255);
      document.getElementById('b-value').textContent = Math.round(b * 255);
      
      // マーカーの位置を更新
      this.rgbCube.updateMarkerPosition(r, g, b);
      
      // HSV値を計算して更新
      const [h, s, v] = rgbToHsv(r * 255, g * 255, b * 255);
      this.updateHSVSliders(h, s, v);
      
      // HSVコーンのマーカーを更新
      const color = new THREE.Color(r, g, b);
      this.hsvCone.updateMarkerPosition(h, s, v, color);
      
      // カラーディスプレイを更新
      this.updateColorDisplay(r, g, b);
    };
    
    rSlider.addEventListener('input', updateRGBValues);
    gSlider.addEventListener('input', updateRGBValues);
    bSlider.addEventListener('input', updateRGBValues);
    
    // HSVスライダーのイベントリスナー
    const hSlider = document.getElementById('h-slider');
    const sSlider = document.getElementById('s-slider');
    const vSlider = document.getElementById('v-slider');
    
    const updateHSVValues = () => {
      const h = parseFloat(hSlider.value);
      const s = parseFloat(sSlider.value);
      const v = parseFloat(vSlider.value);
      
      document.getElementById('h-value').textContent = Math.round(h);
      document.getElementById('s-value').textContent = Math.round(s);
      document.getElementById('v-value').textContent = Math.round(v);
      
      // RGB値を計算
      const [r, g, b] = hsvToRgb(h, s, v);
      
      // RGBスライダーを更新
      this.updateRGBSliders(r, g, b);
      
      // マーカーの位置を更新
      this.rgbCube.updateMarkerPosition(r, g, b);
      
      // HSVコーンのマーカーを更新
      const color = new THREE.Color(r, g, b);
      this.hsvCone.updateMarkerPosition(h, s, v, color);
      
      // カラーディスプレイを更新
      this.updateColorDisplay(r, g, b);
    };
    
    hSlider.addEventListener('input', updateHSVValues);
    sSlider.addEventListener('input', updateHSVValues);
    vSlider.addEventListener('input', updateHSVValues);
  }

  updateRGBSliders(r, g, b) {
    document.getElementById('r-slider').value = r * 255;
    document.getElementById('g-slider').value = g * 255;
    document.getElementById('b-slider').value = b * 255;
    document.getElementById('r-value').textContent = Math.round(r * 255);
    document.getElementById('g-value').textContent = Math.round(g * 255);
    document.getElementById('b-value').textContent = Math.round(b * 255);
  }

  updateHSVSliders(h, s, v) {
    document.getElementById('h-slider').value = h;
    document.getElementById('s-slider').value = s;
    document.getElementById('v-slider').value = v;
    document.getElementById('h-value').textContent = Math.round(h);
    document.getElementById('s-value').textContent = Math.round(s);
    document.getElementById('v-value').textContent = Math.round(v);
  }

  updateColorDisplay(r, g, b) {
    const colorDisplay = document.getElementById('current-color');
    colorDisplay.style.backgroundColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    colorDisplay.style.width = '100px';
    colorDisplay.style.height = '100px';
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.rgbControls.update();
    this.hsvControls.update();
    this.rgbRenderer.render(this.rgbScene, this.rgbCamera);
    this.hsvRenderer.render(this.hsvScene, this.hsvCamera);
  }
}

// アプリケーションの起動
const app = new ColorVisualizerApp();

