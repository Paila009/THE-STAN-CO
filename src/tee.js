import * as THREE from 'three';

const WIDTH = 3.18;
const HEIGHT = WIDTH * 900 / 780;
const SIDES = ['front', 'back'];

const EDGE_PIXELS = [
  [310, 21], [381, 31], [421, 30], [477, 21], [607, 93], [636, 130], [678, 209],
  [768, 430], [767, 439], [684, 487], [638, 502], [615, 501], [627, 859], [614, 871],
  [551, 880], [266, 881], [191, 875], [174, 871], [160, 861], [166, 627], [175, 505],
  [146, 501], [98, 485], [16, 435], [109, 210], [160, 119], [177, 98], [201, 80],
];

function clothDepth(x, y) {
  const across = Math.abs(x) / (WIDTH / 2);
  const falloff = 1 - across ** 1.65;
  const drape = Math.sin(x * 12 + y * 2) * .013;
  return .045 + falloff * (.215 + drape);
}

function garmentEdge() {
  const positions = [];
  const indices = [];
  EDGE_PIXELS.forEach(([pixelX, pixelY], index) => {
    const x = (pixelX / 780 - .5) * WIDTH;
    const y = (.5 - pixelY / 900) * HEIGHT;
    const depth = clothDepth(x, y);
    positions.push(x, y, depth, x * 1.015, y, 0, x, y, -depth);
    const a = index * 3;
    const b = ((index + 1) % EDGE_PIXELS.length) * 3;
    indices.push(a, b, a + 1, b, b + 1, a + 1, a + 1, b + 1, a + 2, b + 1, b + 2, a + 2);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color: 0x28282a,
    roughness: .94,
    side: THREE.DoubleSide,
  }));
}

function garmentSurface(side) {
  const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 40, 46);
  const positions = geometry.getAttribute('position');
  const sign = side === 'back' ? -1 : 1;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    positions.setXYZ(index, x * sign, y, clothDepth(x, y) * sign);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function mountTee(stage, getSelection, { onReady, onUnavailable, allowReducedMotion = false } = {}) {
  const frame = stage.querySelector('.hero-render');
  const textureLoader = new THREE.TextureLoader();
  const listeners = new AbortController();
  const { signal } = listeners;
  let activeSlug;
  let desiredSlug;
  let loadSequence = 0;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  frame.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, .1, 40);
  camera.position.z = 7;
  const garment = new THREE.Group();
  scene.add(garment, new THREE.HemisphereLight(0xe6e6e7, 0x353537, 2.2));
  const rim = new THREE.DirectionalLight(0xfff9ec, 1.6);
  rim.position.set(-3, 4, 6);
  scene.add(rim);
  const edge = garmentEdge();
  garment.add(edge);

  const materials = SIDES.map((side) => {
    const material = new THREE.MeshBasicMaterial({ alphaTest: .45, side: THREE.FrontSide });
    garment.add(new THREE.Mesh(garmentSurface(side), material));
    return material;
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let angle = getSelection().face === 'back' ? Math.PI : 0;
  let targetAngle = angle;
  let onscreen = false;
  let animationFrame;
  let lastFrame;
  let activeTime = 0;
  let targetPitch = 0;
  let pitch = 0;
  let drag = null;
  let contextLost = false;
  let disposed = false;
  const shouldAnimate = () => !motion.matches || allowReducedMotion;

  stage.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || !stage.classList.contains('is-rendering')) return;
    stage.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: targetAngle, pitch: targetPitch };
    stage.classList.add('is-dragging');
  }, { signal });
  stage.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    targetAngle = drag.angle + (event.clientX - drag.x) * .019;
    targetPitch = THREE.MathUtils.clamp(drag.pitch + (event.clientY - drag.y) * .005, -.45, .45);
    schedule();
  }, { signal });
  stage.addEventListener('lostpointercapture', () => {
    drag = null;
    stage.classList.remove('is-dragging');
  }, { signal });

  function render(time) {
    animationFrame = undefined;
    if (activeSlug !== desiredSlug || !activeSlug || !shouldAnimate() || contextLost) return;
    const step = lastFrame ? Math.min(time - lastFrame, 48) : 16;
    lastFrame = time;
    activeTime += step;
    angle = THREE.MathUtils.damp(angle, targetAngle, 7.5, step / 1000);
    garment.rotation.y = angle + (drag || motion.matches ? 0 : Math.cos(activeTime / 1400) * .18);
    pitch = THREE.MathUtils.damp(pitch, targetPitch, 8, step / 1000);
    garment.rotation.x = pitch + (drag || motion.matches ? 0 : Math.sin(activeTime / 1650) * .045);
    garment.position.y = motion.matches ? 0 : Math.sin(activeTime / 1000) * .05;
    renderer.render(scene, camera);
    if (!stage.classList.contains('is-rendering')) {
      stage.classList.add('is-rendering');
      onReady?.();
    }
    if (!motion.matches || Math.abs(angle - targetAngle) + Math.abs(pitch - targetPitch) > .002) schedule();
  }

  function schedule() {
    if (activeSlug && activeSlug === desiredSlug && !contextLost && onscreen && shouldAnimate() && !document.hidden && animationFrame === undefined) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  function resize() {
    const { width, height } = frame.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const halfHeight = Math.max(1.98, 1.77 / aspect);
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    schedule();
  }

  const resizes = new ResizeObserver(resize);
  resizes.observe(frame);
  const visibility = new IntersectionObserver(([entry]) => {
    onscreen = entry.isIntersecting;
    if (onscreen) schedule();
  }, { rootMargin: '50px' });
  visibility.observe(stage);
  document.addEventListener('visibilitychange', schedule, { signal });
  motion.addEventListener('change', () => {
    if (!shouldAnimate()) stage.classList.remove('is-rendering');
    else schedule();
  }, { signal });
  renderer.domElement.addEventListener('webglcontextlost', () => {
    contextLost = true;
    stage.classList.remove('is-rendering');
    onUnavailable?.();
  }, { signal });
  resize();

  function show(side) {
    targetPitch = 0;
    const next = side === 'back' ? Math.PI : 0;
    targetAngle = next + Math.round((angle - next) / (Math.PI * 2)) * Math.PI * 2;
    schedule();
  }

  function setProduct(product, side) {
    show(side);
    if (product.slug === desiredSlug) return;
    desiredSlug = product.slug;
    stage.classList.remove('is-rendering');
    const sequence = ++loadSequence;
    if (activeSlug === desiredSlug) {
      schedule();
      return;
    }

    const sources = SIDES.map((face) => '/images/' + product.slug + '-' + face + '.webp');
    Promise.allSettled(sources.map((source) => textureLoader.loadAsync(source))).then((results) => {
      if (sequence !== loadSequence || results.some((result) => result.status === 'rejected')) {
        results.forEach((result) => { if (result.status === 'fulfilled') result.value.dispose(); });
        if (sequence === loadSequence) {
          desiredSlug = undefined;
          onUnavailable?.();
        }
        return;
      }
      results.forEach(({ value: texture }, index) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        materials[index].map?.dispose();
        materials[index].map = texture;
        materials[index].needsUpdate = true;
      });
      edge.material.color.set(product.hex);
      activeSlug = product.slug;
      angle = targetAngle;
      schedule();
    });
  }

  const initial = getSelection();
  setProduct(initial.product, initial.face);
  function dispose() {
    if (disposed) return;
    disposed = true;
    loadSequence += 1;
    contextLost = true;
    listeners.abort();
    resizes.disconnect();
    visibility.disconnect();
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    stage.classList.remove('is-rendering', 'is-dragging');
    garment.children.forEach(({ geometry, material }) => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    });
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  return { setProduct, dispose };
}
