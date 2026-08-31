/**
 * 아바타 3D 장면 — three.js 공통 배선.
 *
 * 🔴 실험 중. 문서(ADR-T05 · X2 · REQ-TEC-007 · STR-003 제약)는 아직 안 고쳤다.
 *   교체 지침은 docs/plan-docs/TODO-avatar-three.md.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * 옷장 장착 지점 — 이름 규약. **에셋이 바뀌어도 이 이름은 바뀌지 않는다.**
 *
 * 규약이 없으면 아이템 벌수가 늘 때마다 붙는 자리가 어긋난다.
 * 캐릭터 GLB 는 이 이름의 노드(뼈 또는 빈 노드)를 반드시 갖는다.
 * 없으면 `resolveSocket` 이 대체 노드를 찾고, 그것도 없으면 루트에 붙인다.
 */
export const SOCKETS = {
  head: ["socket_head", "head", "Head", "mixamorigHead"],
  back: ["socket_back", "torso", "spine", "Spine", "mixamorigSpine1"],
  neck: ["socket_neck", "neck", "Neck", "head", "Head"],
} as const;
export type SocketId = keyof typeof SOCKETS;

export function resolveSocket(root: THREE.Object3D, id: SocketId): THREE.Object3D {
  for (const name of SOCKETS[id]) {
    const hit = root.getObjectByName(name);
    if (hit) return hit;
  }
  return root;
}

/**
 * 소켓에 아이템을 얹는다 — **높이를 손으로 넣지 않는다.**
 *
 * 두 가지를 나눠서 쓴다.
 *   **부모** — 소켓 노드(뼈). 애니메이션을 따라가게 하려면 여기 붙여야 한다
 *   **치수** — 캐릭터 **전체** 바운딩 박스. 뼈와 빈 노드는 메시가 없어 박스가 비어 있다
 *
 * 에셋마다 뼈 원점이 다르다 — Kenney 는 `head` 뼈가 목 근처에 있고 다른 팩은 정수리에 있다.
 * 숫자를 박아 두면 모델을 바꾸는 순간 모자가 머리에 박힌다.
 */
export function attachToSocket(
  root: THREE.Object3D,
  id: SocketId,
  item: THREE.Object3D,
  place: "on-top" | "behind" = "on-top",
  /** 캐릭터 폭 대비 아이템 폭 */
  widthRatio = 0.5,
) {
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const itemBox = new THREE.Box3().setFromObject(item);
  const itemSize = new THREE.Vector3();
  itemBox.getSize(itemSize);
  const fit = (size.x * widthRatio) / (Math.max(itemSize.x, itemSize.z) || 1);
  item.scale.multiplyScalar(fit);

  const target = place === "on-top"
    ? new THREE.Vector3(center.x, box.max.y - size.y * 0.02, center.z)
    : new THREE.Vector3(center.x, center.y + size.y * 0.06, box.min.z + size.z * 0.12);

  const socket = resolveSocket(root, id);
  socket.updateWorldMatrix(true, true);
  socket.add(item);
  item.position.copy(socket.worldToLocal(target.clone()));

  // 소켓이 회전·스케일돼 있으면 아이템까지 뒤틀린다. 월드 기준으로 되돌린다
  const q = new THREE.Quaternion();
  socket.getWorldQuaternion(q);
  item.quaternion.copy(q.invert());
  const ws = new THREE.Vector3();
  socket.getWorldScale(ws);
  item.scale.divide(ws);

  return item;
}

/** 렌더러 — 톤매핑·색공간·그림자를 한 곳에서 정한다 */
export function makeRenderer(size: number): THREE.WebGLRenderer | null {
  let r: THREE.WebGLRenderer;
  try {
    r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.setSize(size, size);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;   // 색이 뜨지 않게
  r.toneMappingExposure = 0.95;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}

/**
 * 장면 — 환경맵이 핵심이다.
 * RoomEnvironment 로 만든 PMREM 을 scene.environment 에 넣으면 재질에 반사가 생겨
 * 단색 도형이 「도형」으로 안 보이기 시작한다. 이미지 에셋은 필요 없다.
 */
export function makeScene(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;   // 너무 올리면 색이 바랜다

  const key = new THREE.DirectionalLight(0xfffaf0, 2.6);
  key.position.set(2.6, 4.4, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.bias = -0.0015;
  const c = key.shadow.camera as THREE.OrthographicCamera;
  c.left = -4; c.right = 4; c.top = 4; c.bottom = -4;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xfff4e4, 0.18));

  return { scene, dispose: () => pmrem.dispose() };
}

/** 접지 그림자 — 캐릭터가 떠 있어 보이지 않게. 바닥 자체는 안 그린다 */
export function addGroundShadow(scene: THREE.Scene, y: number, size = 8) {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.ShadowMaterial({ opacity: 0.22 }),
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = y;
  g.receiveShadow = true;
  scene.add(g);
  return g;
}

/** 캐릭터 GLB — 크기·바닥 맞춤까지 해서 돌려준다. 받은 그대로 쓰면 스케일이 제각각이다 */
export async function loadCharacter(url: string, targetHeight = 3.2) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;

  root.traverse((o) => {
    if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; }
  });

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const s = targetHeight / (size.y || 1);
  root.scale.setScalar(s);

  const box2 = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box2.getCenter(center);
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box2.min.y;   // 발을 y=0 에 붙인다

  return { root, clips: gltf.animations, footY: 0 };
}
