import * as THREE from 'three';

export const PROJECTOR_ENTRY_MS = 1650;

const entryDuration = PROJECTOR_ENTRY_MS / 1000;
const brandBlue = 0x1163af;
const blueLight = 0x79b8fa;
const metal = new THREE.MeshStandardMaterial({ color: 0x223957, metalness: .72, roughness: .33 });
const trim = new THREE.MeshStandardMaterial({ color: brandBlue, metalness: .34, roughness: .27, emissive: 0x123967, emissiveIntensity: .42 });

function addRing(group, radius, tube, z, material) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 90), material);
  ring.position.z = z;
  group.add(ring);
}

function addCylinder(group, radius, width, z, material) {
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 64), material);
  cylinder.rotation.x = Math.PI / 2;
  cylinder.position.z = z;
  group.add(cylinder);
}

function reelBody() {
  const reel = new THREE.Group();
  const radius = 1.38;
  const profile = new THREE.Shape();
  profile.absarc(0, 0, radius, 0, Math.PI * 2, false);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5 + Math.PI / 2;
    const hole = new THREE.Path();
    hole.absarc(Math.cos(angle) * .82, Math.sin(angle) * .82, .345, 0, Math.PI * 2, true);
    profile.holes.push(hole);
  }
  const plateGeometry = new THREE.ExtrudeGeometry(profile, {
    depth: .105, bevelEnabled: true, bevelSize: .047, bevelThickness: .05,
    bevelSegments: 3, curveSegments: 40, steps: 1,
  });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xaebcdb, metalness: .68, roughness: .25 });
  for (const z of [-.38, .275]) {
    const plate = new THREE.Mesh(plateGeometry, [metal, rimMaterial]);
    plate.position.z = z;
    reel.add(plate);
  }
  for (const z of [-.39, .39]) addRing(reel, 1.375, .018, z, trim);
  addCylinder(reel, .58, .63, 0, metal);
  addCylinder(reel, .265, .88, 0, rimMaterial);
  for (const z of [-.45, .45]) addRing(reel, .201, .027, z, trim);
  for (let i = 0; i < 12; i++) addRing(reel, .585 + i * .024, .012, -.19 + i * .037, metal);
  return reel;
}

function filmTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#102c4d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const frame = canvas.width / 12;
  for (let i = 0; i < 12; i++) {
    const left = i * frame;
    ctx.fillStyle = i === 8 ? '#fe914c' : i % 3 === 1 ? '#4484cc' : '#225284';
    ctx.fillRect(left + 7, 35, frame - 14, 90);
    ctx.strokeStyle = '#a8caff9c';
    ctx.strokeRect(left + 7, 35, frame - 14, 90);
    ctx.fillStyle = '#edf1ff';
    ctx.fillRect(left + 13, 9, 20, 10);
    ctx.fillRect(left + 76, 9, 20, 10);
    ctx.fillRect(left + 13, 141, 20, 10);
    ctx.fillRect(left + 76, 141, 20, 10);
    ctx.fillStyle = '#ccd8ff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(String(i + 1).padStart(2, '0'), left + 10, 33);
    ctx.beginPath();
    ctx.moveTo(left + 16, 114);
    ctx.lineTo(left + 100, 44);
    ctx.lineTo(left + 119, 44);
    ctx.lineTo(left + 36, 114);
    ctx.fillStyle = '#d7e3ff40';
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function filmStrip() {
  const geometry = new THREE.PlaneGeometry(1, 1, 112, 4);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  position.setUsage(THREE.DynamicDrawUsage);
  geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
  const material = new THREE.MeshStandardMaterial({
    map: filmTexture(), color: 0xffffff, side: THREE.DoubleSide, roughness: .52, metalness: .25,
    emissive: 0x172953, emissiveIntensity: .22,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  let previousUnwind;

  function unwind(amount) {
    if (amount === previousUnwind) return;
    previousUnwind = amount;
    mesh.visible = amount > 0;
    if (!mesh.visible) return;
    for (let i = 0; i < position.count; i++) {
      const t = uv.getX(i);
      const width = (uv.getY(i) - .5) * .39;
      const release = THREE.MathUtils.smoothstep(amount, t * .25, .82 + t * .18);
      const angle = t * Math.PI * 2.24 - .6 - (1 - release) * (.6 + t * 1.2);
      const radius = THREE.MathUtils.lerp(.72 + t * .16, 1.25 + 1.05 * t, release);
      const z = THREE.MathUtils.lerp(-.15 + t * .34, -.9 + t * 1.64 + Math.sin(angle) * .25, release);
      const xDirection = Math.cos(angle);
      const yDirection = Math.sin(angle);
      position.setXYZ(
        i,
        (radius + width) * xDirection,
        (radius * .86 + width) * yDirection,
        z + width * .71,
      );
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  return { mesh, unwind };
}

export function mountProjector(hero, { entryElapsed = 0 } = {}) {
  const host = hero.querySelector('.premiere-canvas');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
  camera.position.set(0, 0, 9.4);
  const group = new THREE.Group();
  const reel = reelBody();
  const film = filmStrip();
  group.add(film.mesh, reel);
  scene.add(group, new THREE.HemisphereLight(0xe4ecff, 0x263257, 2.55));

  const key = new THREE.DirectionalLight(0xf1f5ff, 4);
  key.position.set(3, 3, 6);
  const blueRim = new THREE.DirectionalLight(blueLight, 4.2);
  blueRim.position.set(-4, -1, -2);
  const bounce = new THREE.DirectionalLight(0xffdbc6, 1.45);
  bounce.position.set(-2, 5, 2);
  scene.add(key, blueRim, bounce);

  let paused = false;
  let visible = false;
  let sized = false;
  let lost = false;
  let frame;
  let previous;
  let elapsed = 0;
  let opening = THREE.MathUtils.clamp(Number.isFinite(entryElapsed) ? entryElapsed / 1000 : 0, 0, entryDuration);
  let turnAngle = 0;
  let activeTurn = 0;
  let targetX = 0;
  let targetY = 0;
  let spinX = 0;
  let spinY = 0;
  let drag;

  function render() {
    const settle = THREE.MathUtils.smootherstep(opening, .05, 1.53);
    const bank = 1 - settle;
    const drift = elapsed * settle;
    group.rotation.set(
      -.13 + spinY + Math.sin(drift * .71) * .06 + bank * .58,
      -.30 + spinX + Math.sin(drift * .9) * .26 + activeTurn - bank * 1.24,
      -.14 + bank * .49,
    );
    group.position.set(
      bank * .26,
      Math.sin(drift * 1.45) * .105 - bank * .26,
      -bank * .9,
    );
    reel.rotation.z = drift * .29 - bank * 2.62;
    film.unwind(THREE.MathUtils.smootherstep(opening, .24, entryDuration));
    blueRim.intensity = 3.9 + Math.sin(drift * 1.21) * .6 + Math.sin(settle * Math.PI) * .9;
    renderer.render(scene, camera);
  }

  function canRender() {
    return visible && sized && !paused && !lost && !document.hidden;
  }

  function stop() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    previous = undefined;
  }

  function schedule() {
    if (frame !== undefined || !canRender()) return;
    frame = requestAnimationFrame((time) => {
      frame = undefined;
      if (!canRender()) return;
      const dt = previous === undefined ? 0 : Math.min((time - previous) / 1000, .045);
      previous = time;
      elapsed += dt;
      opening = Math.min(opening + dt, entryDuration);
      activeTurn = THREE.MathUtils.damp(activeTurn, turnAngle, 6, dt);
      spinX = THREE.MathUtils.damp(spinX, targetX, 7, dt);
      spinY = THREE.MathUtils.damp(spinY, targetY, 7, dt);
      render();
      schedule();
    });
  }

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    sized = width > 0 && height > 0;
    if (!sized || lost) {
      stop();
      return;
    }
    camera.aspect = width / height;
    camera.position.z = Math.max(8.8, 8.15 / camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (canRender()) render();
    schedule();
  }

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else stop();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else schedule();
  });
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
    stop();
    hero.classList.remove('has-projector');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    lost = false;
    hero.classList.add('has-projector');
    resize();
  });

  host.addEventListener('pointerdown', (event) => {
    if (!canRender() || !event.isPrimary || event.button !== 0) return;
    drag = { pointerId: event.pointerId, x: event.clientX, angle: turnAngle };
    host.setPointerCapture(event.pointerId);
    host.classList.add('is-grabbing');
  });
  host.addEventListener('lostpointercapture', (event) => {
    if (drag?.pointerId !== event.pointerId) return;
    drag = undefined;
    host.classList.remove('is-grabbing');
  });
  host.addEventListener('pointermove', (event) => {
    if (paused) return;
    if (drag?.pointerId === event.pointerId) {
      turnAngle = drag.angle + (event.clientX - drag.x) * .016;
    } else if (event.pointerType === 'mouse') {
      const bounds = host.getBoundingClientRect();
      targetX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * .48;
      targetY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * .27;
    }
    schedule();
  });
  host.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
    schedule();
  });
  const bounds = host.getBoundingClientRect();
  visible = bounds.top < innerHeight && bounds.bottom > 0 && bounds.left < innerWidth && bounds.right > 0;
  resize();
  return {
    setPaused(value) {
      paused = value;
      if (paused) {
        turnAngle = activeTurn;
        targetX = spinX;
        targetY = spinY;
      }
      if (paused) stop();
      else schedule();
    },
  };
}

