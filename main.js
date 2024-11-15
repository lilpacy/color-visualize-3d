import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css';
import { hsvToRgb, rgbToHsv } from './utils/colorConversion.js';
import { createCube, createColorPoints } from './components/RGBCube.js';
import { createHSVCone } from './components/HSVCone.js';

// シーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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
document.querySelector('#app').appendChild(renderer.domElement);

// カメラの位置設定
camera.position.set(2, 2, 2);
camera.lookAt(0.5, 0.5, 0.5);

// コントロールの追加
const controls = new OrbitControls(camera, renderer.domElement);

// マウスボタンの設定を変更
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,    // 左クリック: 回転
  MIDDLE: THREE.MOUSE.PAN,     // 中クリック（ホイール）: パン（水平移動）
  RIGHT: THREE.MOUSE.DOLLY     // 右クリック: ズーム
};

// タッチ操作の設定
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,    // 一本指: 回転
  TWO: THREE.TOUCH.PAN        // 二本指: パン
};

// スムーズな操作のための設定
controls.enableDamping = true;  // 慣性を有効化
controls.dampingFactor = 0.05;  // 慣性の強さ
controls.panSpeed = 1.0;        // パンの速度
controls.rotateSpeed = 0.8;     // 回転の速度
controls.zoomSpeed = 1.2;       // ズームの速度

// ホイールでのズームも有効化
controls.enableZoom = true;

// グリッドヘルパーの追加
const gridHelper = new THREE.GridHelper(1, 10);
gridHelper.position.set(0.5, 0, 0.5);
scene.add(gridHelper);

// 軸ヘルパーの追加
const axesHelper = new THREE.AxesHelper(1.2);
scene.add(axesHelper);

// 軸のラベルを追加
function createLabel(text, position) {
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
}

scene.add(createLabel('R', new THREE.Vector3(1.3, 0, 0)));
scene.add(createLabel('G', new THREE.Vector3(0, 1.3, 0)));
scene.add(createLabel('B', new THREE.Vector3(0, 0, 1.3)));

// スライダーの制御関数を更新
function updateMarkerPosition(source = 'rgb') {
  if (source === 'rgb') {
    // RGBスライダーからの更新
    const r = (parseFloat(document.getElementById('r-slider').value) - 1) / 255;
    const g = (parseFloat(document.getElementById('g-slider').value) - 1) / 255;
    const b = (parseFloat(document.getElementById('b-slider').value) - 1) / 255;
    
    // HSVスライダーを更新
    const [h, s, v] = rgbToHsv(r * 255, g * 255, b * 255);
    document.getElementById('h-slider').value = h;
    document.getElementById('s-slider').value = s;
    document.getElementById('v-slider').value = v;
    document.getElementById('h-value').textContent = Math.round(h);
    document.getElementById('s-value').textContent = Math.round(s);
    document.getElementById('v-value').textContent = Math.round(v);
    
    updateMarkerAndColor(r, g, b);
  } else {
    // HSVライダーからの更新
    const h = parseFloat(document.getElementById('h-slider').value);
    const s = parseFloat(document.getElementById('s-slider').value);
    const v = parseFloat(document.getElementById('v-slider').value);
    
    const [r, g, b] = hsvToRgb(h, s, v);
    
    // RGBスライダーを更新
    document.getElementById('r-slider').value = Math.round(r * 255) + 1;
    document.getElementById('g-slider').value = Math.round(g * 255) + 1;
    document.getElementById('b-slider').value = Math.round(b * 255) + 1;
    document.getElementById('r-value').textContent = Math.round(r * 255) + 1;
    document.getElementById('g-value').textContent = Math.round(g * 255) + 1;
    document.getElementById('b-value').textContent = Math.round(b * 255) + 1;
    
    updateMarkerAndColor(r, g, b);
  }
}

function updateMarkerAndColor(r, g, b) {
  // RGBマーカーの更新
  marker.position.set(r, g, b);
  marker.material.color.setRGB(r, g, b);
  
  // HSVマーカーの更新
  const [h, s, v] = rgbToHsv(r * 255, g * 255, b * 255);
  const theta = (h / 360) * Math.PI * 2;
  
  // 明度に応じて半径を調整（明度が下が��と半径も比例して小さくなる）
  const maxRadius = 0.5 * (s / 100);
  const currentRadius = maxRadius * (v / 100);
  
  const x = currentRadius * Math.cos(theta) + 2; // +2 は円錐の位置オフセット
  const y = v / 100;
  const z = currentRadius * Math.sin(theta) + 0.5; // +0.5 は円錐の位置オフセット
  
  hsvMarker.position.set(x, y, z);
  hsvMarker.material.color.setRGB(r, g, b);
  
  // カラーパネルの更新
  document.getElementById('current-color').style.backgroundColor = 
    `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
}

// イベントリスナーを更新
['r-slider', 'g-slider', 'b-slider'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => updateMarkerPosition('rgb'));
});

['h-slider', 's-slider', 'v-slider'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => updateMarkerPosition('hsv'));
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
// HSV円錐の描���関数を追加
function drawHSVCone() {
  const canvas = document.getElementById('hsv-cone');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  
  // 現在のHue値を取得
  const currentHue = parseFloat(document.getElementById('h-slider').value);
  
  // キャンバスをクリア
  ctx.clearRect(0, 0, width, height);
  
  // 円を描画
  for(let r = radius; r > 0; r--) {
    for(let angle = 0; angle < 360; angle += 1) {
      const x = centerX + r * Math.cos(angle * Math.PI / 180);
      const y = centerY + r * Math.sin(angle * Math.PI / 180);
      
      // 彩度は半径に基づいて計算
      const saturation = r / radius * 100;
      // 明度は100%
      const value = 100;
      
      const [red, green, blue] = hsvToRgb(currentHue, saturation, value);
      ctx.fillStyle = `rgb(${red * 255}, ${green * 255}, ${blue * 255})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  // 現在の選択位置を表示
  const currentS = parseFloat(document.getElementById('s-slider').value);
  const currentV = parseFloat(document.getElementById('v-slider').value);
  const angle = currentHue * Math.PI / 180;
  const distance = (currentS / 100) * radius;
  const x = centerX + distance * Math.cos(angle);
  const y = centerY + distance * Math.sin(angle);
  
  // 選択位置のマーカーを描画
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Hueスライダーの描画関数
function drawHueSlider() {
  const canvas = document.getElementById('hue-slider');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // グラデーションを作成
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  for(let i = 0; i <= 360; i += 60) {
    const [r, g, b] = hsvToRgb(i, 100, 100);
    gradient.addColorStop(i / 360, `rgb(${r * 255}, ${g * 255}, ${b * 255})`);
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 現在のHue位置を表示
  const currentHue = parseFloat(document.getElementById('h-slider').value);
  const x = (currentHue / 360) * width;
  
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// HSVビューの更新関数
function updateHSVView() {
  drawHSVCone();
  drawHueSlider();
}

// イベントリスナーを更新
['h-slider', 's-slider', 'v-slider'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    updateMarkerPosition('hsv');
    updateHSVView();
  });
});

['r-slider', 'g-slider', 'b-slider'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    updateMarkerPosition('rgb');
    updateHSVView();
  });
});

// 初期描画
updateHSVView();

// 現在位置を示すマーカーの作成
const markerGeometry = new THREE.SphereGeometry(0.04);
const markerMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x000000,
  transparent: true,
  opacity: 0.8
});
const marker = new THREE.Mesh(markerGeometry, markerMaterial);
scene.add(marker);

// シーンに追加
const cube = createCube();
scene.add(cube);

// 点群の追加
const pointsGroup = createColorPoints();
scene.add(pointsGroup);

const hsvCone = createHSVCone();
scene.add(hsvCone);

// カメラの位置を調整
camera.position.set(3, 2, 3);

// マーカーの作成部分の後に追加（scene.add(marker);の後）
const hsvMarkerGeometry = new THREE.SphereGeometry(0.04);
const hsvMarkerMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x000000,
  transparent: true,
  opacity: 0.8
});
const hsvMarker = new THREE.Mesh(hsvMarkerGeometry, hsvMarkerMaterial);
scene.add(hsvMarker);

