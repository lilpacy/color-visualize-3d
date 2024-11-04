import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css';

// シーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector('#app').innerHTML = `
  <div class="controls">
    <div class="slider-group">
      <label>R: <span id="r-value">0</span></label>
      <input type="range" id="r-slider" min="0" max="1" step="0.01" value="0">
    </div>
    <div class="slider-group">
      <label>G: <span id="g-value">0</span></label>
      <input type="range" id="g-slider" min="0" max="1" step="0.01" value="0">
    </div>
    <div class="slider-group">
      <label>B: <span id="b-value">0</span></label>
      <input type="range" id="b-slider" min="0" max="1" step="0.01" value="0">
    </div>
    <div id="current-color" style="width: 50px; height: 50px; border: 1px solid white;"></div>
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
      vec3 color = vPosition * 0.5 + 0.5;
      gl_FragColor = vec4(color, 0.5); // 透明度を0.5に設定
    }
  `,
  transparent: true, // 透明度を有効化
  side: THREE.DoubleSide // 両面を表示
});

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0.5, 0.5, 0.5);
scene.add(cube);

// 現在位置を示すマーカーの作成
const markerGeometry = new THREE.SphereGeometry(0.02);
const markerMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x000000,  // 初期色は黒
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
          opacity: 0.8
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

// スライダーの制御
function updateMarkerPosition() {
  const r = parseFloat(document.getElementById('r-slider').value);
  const g = parseFloat(document.getElementById('g-slider').value);
  const b = parseFloat(document.getElementById('b-slider').value);
  
  marker.position.set(r, g, b);
  
  // マーカーの色を更新
  marker.material.color.setRGB(r, g, b);
  
  // 値の表示を更新
  document.getElementById('r-value').textContent = r.toFixed(2);
  document.getElementById('g-value').textContent = g.toFixed(2);
  document.getElementById('b-value').textContent = b.toFixed(2);
  
  // カラープレビューの更新
  document.getElementById('current-color').style.backgroundColor = 
    `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
}

['r-slider', 'g-slider', 'b-slider'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateMarkerPosition);
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
