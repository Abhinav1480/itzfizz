import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { FlightPathData } from '../../animations/flightPathMath';

export interface PaperRocketHandle {
  updateFlightState: (scrollProgress: number, introProgress?: number) => void;
}

interface PaperRocketProps {
  flightPathRef: React.MutableRefObject<FlightPathData | null>;
  containerSize: { width: number; height: number };
  isReducedMotion: boolean;
}

/**
 * Generates a subtle procedural matte cotton paper texture & bump map
 * so the 3D airplane reads as tactile warm ivory paper with micro-fibers.
 */
function createPaperTextures(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    // Base warm ivory paper tone
    cCtx.fillStyle = '#FAF7F0';
    cCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    // Deterministic pseudo-random generator for consistent paper grain
    let seed = 4219;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Subtle paper pulp specks and fibers
    for (let i = 0; i < 3200; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 2 + rand() * 8;
      const angle = rand() * Math.PI * 2;
      const alpha = 0.015 + rand() * 0.025;

      cCtx.strokeStyle =
        rand() > 0.5
          ? `rgba(215, 206, 190, ${alpha})`
          : `rgba(255, 253, 248, ${alpha * 1.2})`;
      cCtx.lineWidth = 0.8;
      cCtx.beginPath();
      cCtx.moveTo(x, y);
      cCtx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      cCtx.stroke();

      const bumpShade = Math.floor(118 + rand() * 22);
      bCtx.strokeStyle = `rgb(${bumpShade}, ${bumpShade}, ${bumpShade})`;
      bCtx.lineWidth = 0.9;
      cCtx.beginPath();
      bCtx.moveTo(x, y);
      bCtx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      bCtx.stroke();
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(3, 3);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);

  return { colorMap, bumpMap };
}

/**
 * Helper to create a thick double-sided paper panel from a quad/triangle strip
 * with explicit top & bottom faces and edge thickness so folds catch studio light.
 */
function buildThickPaperPanel(
  topVertices: THREE.Vector3[],
  indices: number[],
  thickness: number,
  normalDir: THREE.Vector3
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];

  const offset = normalDir.clone().normalize().multiplyScalar(-thickness);

  // Push top surface triangles
  for (let i = 0; i < indices.length; i += 3) {
    const a = topVertices[indices[i]];
    const b = topVertices[indices[i + 1]];
    const c = topVertices[indices[i + 2]];

    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    uvs.push(
      (a.x + 1.2) * 0.4,
      (a.z + 0.8) * 0.6,
      (b.x + 1.2) * 0.4,
      (b.z + 0.8) * 0.6,
      (c.x + 1.2) * 0.4,
      (c.z + 0.8) * 0.6
    );
  }

  // Push bottom surface triangles (reversed winding)
  for (let i = 0; i < indices.length; i += 3) {
    const a = topVertices[indices[i]].clone().add(offset);
    const b = topVertices[indices[i + 1]].clone().add(offset);
    const c = topVertices[indices[i + 2]].clone().add(offset);

    positions.push(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z);
    uvs.push(
      (a.x + 1.2) * 0.4,
      (a.z + 0.8) * 0.6,
      (c.x + 1.2) * 0.4,
      (c.z + 0.8) * 0.6,
      (b.x + 1.2) * 0.4,
      (b.z + 0.8) * 0.6
    );
  }

  // Stitch outer perimeter edges so the sheet has visible paper thickness
  const n = topVertices.length;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const t1 = topVertices[i];
    const t2 = topVertices[next];
    const b1 = t1.clone().add(offset);
    const b2 = t2.clone().add(offset);

    positions.push(
      t1.x,
      t1.y,
      t1.z,
      b1.x,
      b1.y,
      b1.z,
      t2.x,
      t2.y,
      t2.z,
      t2.x,
      t2.y,
      t2.z,
      b1.x,
      b1.y,
      b1.z,
      b2.x,
      b2.y,
      b2.z
    );
    uvs.push(0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1);
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Constructs a multi-layered, realistic 3D folded paper airplane
 * with central spine crease, inner keel, main wings with subtle camber & asymmetry,
 * visible double-folded nose flaps, rear fold layers, and soft shadow plane.
 *
 * Local coordinate system:
 * Nose tip is at +X (x = +1.18), Tail is at -X (x = -1.02).
 * Up is +Y, Wingspan is along Z (-0.76 to +0.76).
 */
function buildPaperAirplaneModel(): {
  rootGroup: THREE.Group;
  airplaneMeshGroup: THREE.Group;
  shadowMesh: THREE.Mesh;
  disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture>;
} {
  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const { colorMap, bumpMap } = createPaperTextures();
  disposables.push(colorMap, bumpMap);

  // Primary matte ivory paper material
  const primaryPaperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FAF6EE'),
    map: colorMap,
    bumpMap,
    bumpScale: 0.0045,
    roughness: 0.87,
    metalness: 0.01,
    side: THREE.FrontSide,
  });

  // Slightly warmer inner-fold material to accentuate layered paper depth & crease AO
  const innerFoldPaperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F1ECE0'),
    map: colorMap,
    bumpMap,
    bumpScale: 0.005,
    roughness: 0.91,
    metalness: 0.01,
    side: THREE.FrontSide,
  });

  // Crisp paper crease highlight strip material
  const creaseEdgeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFDF9'),
    roughness: 0.78,
    metalness: 0.02,
  });

  disposables.push(primaryPaperMat, innerFoldPaperMat, creaseEdgeMat);

  const rootGroup = new THREE.Group();
  const airplaneMeshGroup = new THREE.Group();
  rootGroup.add(airplaneMeshGroup);

  const T = 0.013; // Realistic sheet thickness

  // 1. CENTRAL SPINE / V-KEEL (Left & Right inner walls meeting at bottom central fold)
  const leftKeelVerts = [
    new THREE.Vector3(1.18, 0.012, -0.002), // 0: Nose tip
    new THREE.Vector3(0.25, 0.036, -0.028), // 1: Mid spine ridge
    new THREE.Vector3(-0.96, 0.048, -0.044), // 2: Rear spine ridge
    new THREE.Vector3(-0.98, -0.265, -0.002), // 3: Rear bottom keel crease
    new THREE.Vector3(0.18, -0.145, -0.002), // 4: Mid bottom keel crease
  ];
  const keelIndices = [0, 1, 4, 1, 2, 3, 1, 3, 4];
  const leftKeelGeo = buildThickPaperPanel(
    leftKeelVerts,
    keelIndices,
    T,
    new THREE.Vector3(0, 0.2, -1)
  );

  const rightKeelVerts = [
    new THREE.Vector3(1.18, 0.012, 0.002), // 0: Nose tip
    new THREE.Vector3(0.18, -0.145, 0.002), // 1: Mid bottom keel crease
    new THREE.Vector3(-0.98, -0.265, 0.002), // 2: Rear bottom keel crease
    new THREE.Vector3(-0.96, 0.045, 0.045), // 3: Rear spine ridge (tiny asymmetry)
    new THREE.Vector3(0.25, 0.035, 0.029), // 4: Mid spine ridge
  ];
  const rightKeelIndices = [0, 1, 4, 4, 1, 2, 4, 2, 3];
  const rightKeelGeo = buildThickPaperPanel(
    rightKeelVerts,
    rightKeelIndices,
    T,
    new THREE.Vector3(0, 0.2, 1)
  );

  disposables.push(leftKeelGeo, rightKeelGeo);
  const leftKeelMesh = new THREE.Mesh(leftKeelGeo, innerFoldPaperMat);
  const rightKeelMesh = new THREE.Mesh(rightKeelGeo, innerFoldPaperMat);
  leftKeelMesh.castShadow = true;
  leftKeelMesh.receiveShadow = true;
  rightKeelMesh.castShadow = true;
  rightKeelMesh.receiveShadow = true;
  airplaneMeshGroup.add(leftKeelMesh, rightKeelMesh);

  // 2. MAIN WINGS (Left & Right) with subdivided camber & subtle handmade edge variation
  const leftWingVerts = [
    new THREE.Vector3(1.16, 0.016, -0.006), // 0: Nose leading tip
    new THREE.Vector3(0.32, 0.044, -0.03), // 1: Mid inner spine
    new THREE.Vector3(-0.35, 0.052, -0.038), // 2: Aft inner spine
    new THREE.Vector3(-0.96, 0.048, -0.044), // 3: Rear inner corner
    new THREE.Vector3(-1.01, 0.088, -0.38), // 4: Mid trailing edge (slight upward camber)
    new THREE.Vector3(-0.93, 0.118, -0.68), // 5: Outer wingtip rear
    new THREE.Vector3(-0.62, 0.098, -0.52), // 6: Outer leading edge
    new THREE.Vector3(0.18, 0.056, -0.25), // 7: Mid leading edge
  ];
  const leftWingIndices = [
    0, 7, 1,
    1, 7, 6,
    1, 6, 2,
    2, 6, 4,
    2, 4, 3,
    6, 5, 4,
  ];
  const leftWingGeo = buildThickPaperPanel(
    leftWingVerts,
    leftWingIndices,
    T,
    new THREE.Vector3(0, 1, -0.08)
  );

  const rightWingVerts = [
    new THREE.Vector3(1.16, 0.016, 0.006), // 0: Nose leading tip
    new THREE.Vector3(0.18, 0.053, 0.252), // 1: Mid leading edge
    new THREE.Vector3(-0.61, 0.092, 0.525), // 2: Outer leading edge
    new THREE.Vector3(-0.94, 0.109, 0.685), // 3: Outer wingtip rear
    new THREE.Vector3(-1.0, 0.082, 0.382), // 4: Mid trailing edge
    new THREE.Vector3(-0.96, 0.045, 0.045), // 5: Rear inner corner
    new THREE.Vector3(-0.35, 0.049, 0.039), // 6: Aft inner spine
    new THREE.Vector3(0.32, 0.042, 0.031), // 7: Mid inner spine
  ];
  const rightWingIndices = [
    0, 1, 7,
    7, 1, 2,
    7, 2, 6,
    6, 2, 4,
    6, 4, 5,
    2, 3, 4,
  ];
  const rightWingGeo = buildThickPaperPanel(
    rightWingVerts,
    rightWingIndices,
    T,
    new THREE.Vector3(0, 1, 0.08)
  );

  disposables.push(leftWingGeo, rightWingGeo);
  const leftWingMesh = new THREE.Mesh(leftWingGeo, primaryPaperMat);
  const rightWingMesh = new THREE.Mesh(rightWingGeo, primaryPaperMat);
  leftWingMesh.castShadow = true;
  leftWingMesh.receiveShadow = true;
  rightWingMesh.castShadow = true;
  rightWingMesh.receiveShadow = true;
  airplaneMeshGroup.add(leftWingMesh, rightWingMesh);

  // 3. VISIBLE FOLDED NOSE & INNER LAYER OVERLAPS (Top & Underside folded flaps)
  const leftNoseFoldVerts = [
    new THREE.Vector3(1.08, 0.026, -0.008),
    new THREE.Vector3(0.12, 0.064, -0.21),
    new THREE.Vector3(-0.28, 0.066, -0.14),
    new THREE.Vector3(-0.42, 0.061, -0.042),
    new THREE.Vector3(0.28, 0.053, -0.03),
  ];
  const leftNoseFoldIndices = [0, 1, 4, 4, 1, 2, 4, 2, 3];
  const leftNoseFoldGeo = buildThickPaperPanel(
    leftNoseFoldVerts,
    leftNoseFoldIndices,
    T * 0.9,
    new THREE.Vector3(0, 1, -0.05)
  );

  const rightNoseFoldVerts = [
    new THREE.Vector3(1.08, 0.026, 0.008),
    new THREE.Vector3(0.28, 0.051, 0.031),
    new THREE.Vector3(-0.42, 0.059, 0.043),
    new THREE.Vector3(-0.28, 0.063, 0.142),
    new THREE.Vector3(0.12, 0.061, 0.212),
  ];
  const rightNoseFoldIndices = [0, 1, 4, 1, 2, 3, 1, 3, 4];
  const rightNoseFoldGeo = buildThickPaperPanel(
    rightNoseFoldVerts,
    rightNoseFoldIndices,
    T * 0.9,
    new THREE.Vector3(0, 1, 0.05)
  );

  disposables.push(leftNoseFoldGeo, rightNoseFoldGeo);
  const leftNoseFoldMesh = new THREE.Mesh(leftNoseFoldGeo, innerFoldPaperMat);
  const rightNoseFoldMesh = new THREE.Mesh(rightNoseFoldGeo, innerFoldPaperMat);
  leftNoseFoldMesh.castShadow = true;
  leftNoseFoldMesh.receiveShadow = true;
  rightNoseFoldMesh.castShadow = true;
  rightNoseFoldMesh.receiveShadow = true;
  airplaneMeshGroup.add(leftNoseFoldMesh, rightNoseFoldMesh);

  // 4. UNDERSIDE CORNER FOLD LAYERS
  const leftUnderFoldVerts = [
    new THREE.Vector3(0.82, -0.002, -0.015),
    new THREE.Vector3(-0.52, 0.026, -0.042),
    new THREE.Vector3(-0.46, 0.062, -0.36),
    new THREE.Vector3(0.08, 0.036, -0.22),
  ];
  const leftUnderFoldGeo = buildThickPaperPanel(
    leftUnderFoldVerts,
    [0, 1, 2, 0, 2, 3],
    T * 0.85,
    new THREE.Vector3(0, -1, -0.1)
  );

  const rightUnderFoldVerts = [
    new THREE.Vector3(0.82, -0.002, 0.015),
    new THREE.Vector3(0.08, 0.034, 0.22),
    new THREE.Vector3(-0.46, 0.059, 0.36),
    new THREE.Vector3(-0.52, 0.024, 0.042),
  ];
  const rightUnderFoldGeo = buildThickPaperPanel(
    rightUnderFoldVerts,
    [0, 1, 2, 0, 2, 3],
    T * 0.85,
    new THREE.Vector3(0, -1, 0.1)
  );

  disposables.push(leftUnderFoldGeo, rightUnderFoldGeo);
  const leftUnderFoldMesh = new THREE.Mesh(leftUnderFoldGeo, innerFoldPaperMat);
  const rightUnderFoldMesh = new THREE.Mesh(rightUnderFoldGeo, innerFoldPaperMat);
  airplaneMeshGroup.add(leftUnderFoldMesh, rightUnderFoldMesh);

  // 5. OUTER WINGTIP WINGLETS
  const leftWingletVerts = [
    new THREE.Vector3(-0.62, 0.098, -0.52),
    new THREE.Vector3(-0.93, 0.118, -0.68),
    new THREE.Vector3(-0.96, 0.185, -0.755),
    new THREE.Vector3(-0.68, 0.148, -0.575),
  ];
  const leftWingletGeo = buildThickPaperPanel(
    leftWingletVerts,
    [0, 3, 2, 0, 2, 1],
    T * 0.85,
    new THREE.Vector3(0, 0.85, -0.5)
  );

  const rightWingletVerts = [
    new THREE.Vector3(-0.61, 0.092, 0.525),
    new THREE.Vector3(-0.68, 0.142, 0.58),
    new THREE.Vector3(-0.97, 0.178, 0.76),
    new THREE.Vector3(-0.94, 0.109, 0.685),
  ];
  const rightWingletGeo = buildThickPaperPanel(
    rightWingletVerts,
    [0, 1, 2, 0, 2, 3],
    T * 0.85,
    new THREE.Vector3(0, 0.85, 0.5)
  );

  disposables.push(leftWingletGeo, rightWingletGeo);
  const leftWingletMesh = new THREE.Mesh(leftWingletGeo, primaryPaperMat);
  const rightWingletMesh = new THREE.Mesh(rightWingletGeo, primaryPaperMat);
  leftWingletMesh.castShadow = true;
  rightWingletMesh.castShadow = true;
  airplaneMeshGroup.add(leftWingletMesh, rightWingletMesh);

  // 6. SOFT STUDIO DROP SHADOW PLANE
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 58);
    grad.addColorStop(0, 'rgba(20, 20, 19, 0.18)');
    grad.addColorStop(0.55, 'rgba(20, 20, 19, 0.06)');
    grad.addColorStop(1, 'rgba(20, 20, 19, 0.0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  });
  const shadowGeo = new THREE.PlaneGeometry(2.6, 1.7);
  disposables.push(shadowTex, shadowMat, shadowGeo);

  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.set(-0.08, -0.38, -0.45);
  rootGroup.add(shadowMesh);

  return { rootGroup, airplaneMeshGroup, shadowMesh, disposables };
}

export const PaperRocket = forwardRef<PaperRocketHandle, PaperRocketProps>(
  ({ flightPathRef, containerSize, isReducedMotion }, ref) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [webglSupported, setWebglSupported] = useState(true);
    const fallbackSvgRef = useRef<SVGGElement | null>(null);

    const sceneStateRef = useRef<{
      renderer: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      rootGroup: THREE.Group;
      airplaneMeshGroup: THREE.Group;
      shadowMesh: THREE.Mesh;
      renderScene: () => void;
    } | null>(null);

    const lastProgressRef = useRef<{ scroll: number; intro: number }>({
      scroll: 0,
      intro: 1,
    });

    const applyTransformAtProgress = (scrollProgress: number, introProgress = 1) => {
      lastProgressRef.current = { scroll: scrollProgress, intro: introProgress };

      const flightData = flightPathRef.current;
      if (!flightData) return;

      const pose = flightData.samplePoseAt(scrollProgress);
      const w = Math.max(containerSize.width, 320);
      const h = Math.max(containerSize.height, 480);
      const isMobile = w < 768;

      if (!webglSupported && fallbackSvgRef.current) {
        const deg = (pose.angleRad * 180) / Math.PI;
        const scale = isMobile ? 0.72 : 1;
        fallbackSvgRef.current.setAttribute(
          'transform',
          `translate(${pose.x.toFixed(1)}, ${pose.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${scale})`
        );
        return;
      }

      const state = sceneStateRef.current;
      if (!state) return;

      const { camera, rootGroup, airplaneMeshGroup, shadowMesh, renderScene } = state;

      const cameraZ = camera.position.z;
      const worldZ = pose.z;
      const vFovRad = (camera.fov * Math.PI) / 180;
      const visibleHeightAtZ = 2 * Math.tan(vFovRad / 2) * (cameraZ - worldZ);
      const visibleWidthAtZ = visibleHeightAtZ * camera.aspect;

      const introEase = 1 - introProgress;
      const introOffsetX = isReducedMotion ? 0 : introEase * 1.1;
      const introOffsetY = isReducedMotion ? 0 : introEase * 0.35;
      const introOffsetZ = isReducedMotion ? 0 : -introEase * 1.2;

      const worldX = (pose.x / w - 0.5) * visibleWidthAtZ + introOffsetX;
      const worldY = (0.5 - pose.y / h) * visibleHeightAtZ + introOffsetY;

      rootGroup.position.set(worldX, worldY, worldZ + introOffsetZ);

      const baseScale = isMobile
        ? visibleWidthAtZ * 0.088
        : w < 1024
          ? visibleWidthAtZ * 0.078
          : visibleWidthAtZ * 0.068;

      const midFlightBoost = isReducedMotion
        ? 1.0
        : 1.0 + Math.sin(scrollProgress * Math.PI) * 0.16;

      const finalScale = baseScale * midFlightBoost * (0.85 + 0.15 * introProgress);
      rootGroup.scale.setScalar(finalScale);

      const screenHeadingRad = Math.atan2(-pose.tangentY, pose.tangentX);
      const viewerRevealTilt = isReducedMotion ? 0.38 : 0.44;

      airplaneMeshGroup.rotation.order = 'ZXY';
      airplaneMeshGroup.rotation.z = screenHeadingRad - introEase * 0.22;
      airplaneMeshGroup.rotation.x = viewerRevealTilt + pose.bankRad * 0.85;
      airplaneMeshGroup.rotation.y = pose.pitchRad * 0.65 - 0.14;

      shadowMesh.position.set(0.06, -0.34 - pose.z * 0.25, -0.45);
      shadowMesh.rotation.z = screenHeadingRad;

      renderScene();
    };

    useImperativeHandle(ref, () => ({
      updateFlightState: (scrollProgress: number, introProgress = 1) => {
        applyTransformAtProgress(scrollProgress, introProgress);
      },
    }));

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        setWebglSupported(false);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(
        container.clientWidth || window.innerWidth,
        container.clientHeight || window.innerHeight
      );
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.pointerEvents = 'none';
      container.innerHTML = '';
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        35,
        (container.clientWidth || window.innerWidth) /
          Math.max(1, container.clientHeight || window.innerHeight),
        0.1,
        100
      );
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      const ambientLight = new THREE.AmbientLight('#F6F2E9', 1.45);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight('#FFFDF9', 1.85);
      keyLight.position.set(4.5, 7.5, 6.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      const d = 6;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0008;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight('#E8E4DA', 0.75);
      fillLight.position.set(-6, -3.5, 4);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight('#F5DEC9', 0.85);
      rimLight.position.set(0, 5, -5);
      scene.add(rimLight);

      const { rootGroup, airplaneMeshGroup, shadowMesh, disposables } =
        buildPaperAirplaneModel();
      scene.add(rootGroup);

      const renderScene = () => {
        renderer.render(scene, camera);
      };

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglSupported(false);
      };
      const handleContextRestored = () => {
        setWebglSupported(true);
        renderScene();
      };

      canvas.addEventListener('webglcontextlost', handleContextLost, false);
      canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

      sceneStateRef.current = {
        renderer,
        scene,
        camera,
        rootGroup,
        airplaneMeshGroup,
        shadowMesh,
        renderScene,
      };

      applyTransformAtProgress(
        lastProgressRef.current.scroll,
        lastProgressRef.current.intro
      );

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        sceneStateRef.current = null;
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      };
    }, []);

    useEffect(() => {
      const state = sceneStateRef.current;
      if (!state) return;

      const w = Math.max(containerSize.width, 320);
      const h = Math.max(containerSize.height, 480);

      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(w, h, false);

      applyTransformAtProgress(
        lastProgressRef.current.scroll,
        lastProgressRef.current.intro
      );
    }, [containerSize.width, containerSize.height, isReducedMotion]);

    return (
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        aria-hidden="true"
      >
        <div ref={mountRef} className="h-full w-full" />

        {!webglSupported && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${Math.max(containerSize.width, 320)} ${Math.max(containerSize.height, 480)}`}
          >
            <g ref={fallbackSvgRef}>
              <polygon
                points="46,0 -34,-26 -18,-4"
                fill="#FAF6EE"
                stroke="#D6D0C4"
                strokeWidth="1"
              />
              <polygon
                points="46,0 -18,-4 -26,12"
                fill="#E8E2D5"
                stroke="#D6D0C4"
                strokeWidth="1"
              />
              <polygon
                points="46,0 -14,3 -34,26"
                fill="#F5F0E6"
                stroke="#D6D0C4"
                strokeWidth="1"
              />
            </g>
          </svg>
        )}
      </div>
    );
  }
);

PaperRocket.displayName = 'PaperRocket';
