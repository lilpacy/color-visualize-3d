import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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

// RGBカラーキューブの作成
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
scene.add(cube);

// 現在位置を示すマーカーの作成
const markerGeometry = new THREE.SphereGeometry(0.04);
const markerMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x000000,
  transparent: true,
  opacity: 0.8
});
const marker = new THREE.Mesh(markerGeometry, markerMaterial);
scene.add(marker);

// 10ポイントごとのカラーポイントを追加
const pointsGroup = new THREE.Group();
scene.add(pointsGroup);

function createColorPoints() {
  // 既存のポイントをクリア
  while(pointsGroup.children.length > 0) {
    pointsGroup.remove(pointsGroup.children[0]);
  }

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
}

createColorPoints();

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

// HSVからRGBへの変換関数を追加
function hsvToRgb(h, s, v) {
  s = s / 100;
  v = v / 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0: [r, g, b] = [v, t, p]; break;
    case 1: [r, g, b] = [q, v, p]; break;
    case 2: [r, g, b] = [p, v, t]; break;
    case 3: [r, g, b] = [p, q, v]; break;
    case 4: [r, g, b] = [t, p, v]; break;
    case 5: [r, g, b] = [v, p, q]; break;
  }
  return [r, g, b];
}

// RGBからHSVへの変換関数を追加
function rgbToHsv(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  let h, s, v;
  v = max;
  s = max === 0 ? 0 : d / max;
  
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  
  return [h, s * 100, v * 100];
}

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
  
  // 明度に応じて半径を調整（明度が下がると半径も比例して小さくなる）
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

// HSV円錐の描画関数を追加
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

function createHSVCone() {
  const coneGroup = new THREE.Group();
  const segments = 32;
  const rings = 10;
  const height = 1;
  const radius = 0.5;
  
  // 円錐の頂点を生成
  const points = [];
  const colors = [];
  
  // 頂点（V=0の点）
  points.push(new THREE.Vector3(0, 0, 0));
  colors.push(new THREE.Color(0, 0, 0));
  
  // 各リングのポイントを生成
  for (let ring = 1; ring <= rings; ring++) {
    const v = ring / rings;
    const currentRadius = (radius * ring) / rings;
    
    for (let segment = 0; segment < segments; segment++) {
      const theta = (segment / segments) * Math.PI * 2;
      const x = currentRadius * Math.cos(theta);
      const z = currentRadius * Math.sin(theta);
      const y = v * height;
      
      // HSVから RGB に変換
      const hue = (theta / (Math.PI * 2)) * 360;
      const saturation = (Math.sqrt(x * x + z * z) / radius) * 100;
      const value = v * 100;
      const [r, g, b] = hsvToRgb(hue, saturation, value);
      
      points.push(new THREE.Vector3(x, y, z));
      colors.push(new THREE.Color(r, g, b));
    }
  }
  
  // ジオメトリの作成
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  
  // 色の設定
  const colorArray = new Float32Array(colors.length * 3);
  colors.forEach((color, i) => {
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  });
  geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  
  // マテリアルの作成
  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });
  
  const pointCloud = new THREE.Points(geometry, material);
  coneGroup.add(pointCloud);
  
  // HSV円錐を右側に配置
  coneGroup.position.set(2, 0, 0.5);
  return coneGroup;
}

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
