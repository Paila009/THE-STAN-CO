import * as THREE from 'three';

const width = 3.14;
const height = 1.86;
const clippedCorner = .26;
const eyelet = { x: -1.23, y: .57, radius: .105 };
const palette = {
  cream: 0xfff2d9,
  cobalt: 0x1763ca,
  orange: 0xff934c,
};

function tagOutline() {
  const x = width / 2;
  const y = height / 2;
  const outline = new THREE.Shape();
  outline.moveTo(-x, -y);
  outline.lineTo(x - clippedCorner, -y);
  outline.lineTo(x, -y + clippedCorner);
  outline.lineTo(x, y - clippedCorner);
  outline.lineTo(x - clippedCorner, y);
  outline.lineTo(-x, y);
  outline.closePath();
  const hole = new THREE.Path();
  hole.absarc(eyelet.x, eyelet.y, eyelet.radius, 0, Math.PI * 2, true);
  outline.holes.push(hole);
  return outline;
}

function wovenFace() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 456;
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width: w, height: h } = canvas;
  const x = (eyelet.x / width + .5) * w;
  const y = (.5 - eyelet.y / height) * h;
  const radius = eyelet.radius / width * w;
  const clip = clippedCorner / width * w;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(w - clip, 0);
  context.lineTo(w, clip);
  context.lineTo(w, h - clip);
  context.lineTo(w - clip, h);
  context.lineTo(0, h);
  context.closePath();
  context.moveTo(x + radius, y);
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.clip('evenodd');

  context.fillStyle = '#f6e8cd';
  context.fillRect(0, 0, w, h);
  context.fillStyle = '#fff8e969';
  for (let row = 0; row < h; row += 3) context.fillRect(0, row, w, 1);
  context.fillStyle = '#aa8b5921';
  for (let column = 0; column < w; column += 4) context.fillRect(column, 0, 1, h);

  const border = 27;
  context.setLineDash([9, 8]);
  context.strokeStyle = '#637ca0';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(border, border);
  context.lineTo(w - clip - 12, border);
  context.lineTo(w - border, clip + 9);
  context.lineTo(w - border, h - clip - 9);
  context.lineTo(w - clip - 12, h - border);
  context.lineTo(border, h - border);
  context.closePath();
  context.stroke();
  context.setLineDash([]);

  context.font = '900 147px Impact, Arial Black, sans-serif';
  context.textBaseline = 'middle';
  context.fillStyle = '#102c4d';
  context.fillText('STAN', 123, 160, 490);
  context.fillText('CO.', 123, 299, 432);
  context.fillStyle = '#eb713d';
  context.fillRect(w - 156, 72, 60, 13);
  context.fillRect(w - 156, 94, 39, 5);
  context.strokeStyle = '#1763ca';
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(w - 143, h - 97);
  context.lineTo(w - 123, h - 117);
  context.lineTo(w - 143, h - 137);
  context.lineTo(w - 163, h - 117);
  context.closePath();
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeTags(stack) {
  const body = new THREE.ExtrudeGeometry(tagOutline(), {
    depth: .13, bevelEnabled: true, bevelThickness: .026, bevelSize: .025,
    bevelSegments: 2, curveSegments: 24,
  });
  const eyeletRing = new THREE.TorusGeometry(eyelet.radius + .009, .024, 6, 28);
  const tagFace = wovenFace();
  const tags = [palette.orange, palette.cobalt, palette.cream].map((color, index) => {
    const tag = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color, roughness: .76 });
    const edge = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).multiplyScalar(.77),
      roughness: .65,
    });
    tag.add(new THREE.Mesh(body, [material, edge]));
    if (index === 2) {
      if (tagFace) {
        const ink = new THREE.MeshBasicMaterial({ map: tagFace, alphaTest: .5 });
        const face = new THREE.Mesh(new THREE.PlaneGeometry(width, height), ink);
        face.position.z = .159;
        tag.add(face);
      }
      const ring = new THREE.Mesh(eyeletRing, new THREE.MeshStandardMaterial({
        color: 0x8ea1ad, metalness: .66, roughness: .3,
      }));
      ring.position.set(eyelet.x, eyelet.y, .183);
      tag.add(ring);
    }
    stack.add(tag);
    return tag;
  });
  return { tags, tagFace };
}

function pose(stack, tags, seconds) {
  const time = Math.min(seconds / 1.6, 1);
  const settle = 1 - (1 - time) ** 3;
  const swing = Math.sin(Math.PI * time);
  stack.position.set(0, .045 + Math.sin(seconds * 2.1) * .075, 0);
  stack.rotation.set(.32 - swing * .33, -.21 - (1 - settle) * 1.02, -.29 + (1 - settle) * .19);
  stack.scale.setScalar(.75 + .25 * settle);
  tags[0].position.set(-.46 * settle, -.48 * settle, -.48);
  tags[0].rotation.z = -.34 * settle;
  tags[1].position.set(.37 * settle, -.22 * settle, -.22);
  tags[1].rotation.z = .25 * settle;
  tags[2].position.set(.06, .15 + .15 * settle, .09);
  tags[2].rotation.z = .06;
}

export function mountBrandScene(container) {
  const canvas = document.createElement('canvas');
  let renderer;
  let frame;
  let resize;
  let tagFace;
  let disposed = false;
  const scene = new THREE.Scene();
  const stack = new THREE.Group();
  scene.add(stack);

  const stop = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resize?.disconnect();
    canvas.removeEventListener('webglcontextlost', stop);
    container.classList.remove('is-3d');
    canvas.remove();
    tagFace?.dispose();
    const geometries = new Set();
    const materials = new Set();
    scene.traverse(object => {
      if (!object.isMesh) return;
      geometries.add(object.geometry);
      for (const material of [object.material].flat()) materials.add(material);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    scene.clear();
    renderer?.dispose();
  };

  try {
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!context) return;
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const camera = new THREE.OrthographicCamera(-2.12, 2.12, 2.12, -2.12, .1, 30);
    camera.position.z = 8;

    const ambient = new THREE.HemisphereLight(0xfff9ec, 0x8499c0, 1.55);
    const key = new THREE.DirectionalLight(0xffe4c7, 2.3);
    const fill = new THREE.DirectionalLight(0x83adff, 1);
    key.position.set(-4, 5, 7);
    fill.position.set(4, -2, 2);
    scene.add(ambient, key, fill);
    const artwork = makeTags(stack);
    tagFace = artwork.tagFace;

    canvas.className = 'brand-scene__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.append(canvas);

    function fit() {
      const { width: w, height: h } = container.getBoundingClientRect();
      const aspect = Math.max(w, 1) / Math.max(h, 1);
      const halfHeight = Math.max(1.8, 2.28 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(w, 1), Math.max(h, 1), false);
    }

    fit();
    pose(stack, artwork.tags, 0);
    renderer.render(scene, camera);
    if (context.isContextLost()) {
      stop();
      return;
    }
    container.classList.add('is-3d');
    canvas.addEventListener('webglcontextlost', stop, { once: true });
    resize = new ResizeObserver(fit);
    resize.observe(container);

    const start = performance.now();
    function animate(now) {
      pose(stack, artwork.tags, Math.max(0, now - start) / 1000);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return stop;
  } catch {
    stop();
  }
}
