"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  makeRenderer, makeScene, addGroundShadow, loadCharacter, attachToSocket, type SocketId,
} from "./avatar-scene";

/**
 * 🔴 실험 — three.js 아바타. 문서는 아직 안 고쳤다(TODO-avatar-three.md).
 *
 * 두 갈래를 나란히 둔다.
 *   `prim` — 원시 도형. 에셋 0건
 *   `glb`  — Kenney CC0 모델(`public/models/avatar-base.glb`) + idle 애니메이션
 *
 * 둘 다 같은 렌더링 설정(환경맵 · 톤매핑 · 접지 그림자)을 쓴다.
 * 모델을 안 바꿔도 렌더링만으로 얼마나 달라지는지 여기서 갈린다.
 */
export type AvatarKind = "prim" | "glb";

/** 옷장 아이템 — 지금은 도형이다. 에셋이 오면 GLB 를 같은 소켓에 붙인다 */
function makeHat() {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x3b7dd8, roughness: 0.45, clearcoat: 0.4 });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.3, 28), mat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 24), mat);
  brim.position.set(0, -0.1, 0.56);
  brim.scale.set(1.5, 1, 1.35);
  g.add(crown, brim);
  g.traverse((o) => { if (o instanceof THREE.Mesh) o.castShadow = true; });
  return g;
}

function makeBag() {
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xd0453c, roughness: 0.55, clearcoat: 0.25 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.3), mat);
  m.castShadow = true;
  return m;
}

/** 원시 도형 곰 — 재질을 physical 로 올리고 환경맵을 받게 한다 */
function makeBear() {
  const bear = new THREE.Group();
  const skin = (c: number, rough = 0.62) =>
    new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.06, sheen: 0.28, sheenColor: 0xffdcae });
  const body = skin(0x8f5a2c);

  const add = (m: THREE.Mesh) => { m.castShadow = true; m.receiveShadow = true; bear.add(m); return m; };

  const head = add(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), body));
  head.position.y = 2.55;
  const muzzle = add(new THREE.Mesh(new THREE.SphereGeometry(0.44, 28, 20), skin(0xdcbe95, 0.6)));
  muzzle.position.set(0, 2.32, 0.82);
  muzzle.scale.set(1, 0.76, 0.7);
  const nose = add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 14), skin(0x2b2118, 0.3)));
  nose.position.set(0, 2.42, 1.16);

  for (const x of [-0.72, 0.72]) {
    const ear = add(new THREE.Mesh(new THREE.SphereGeometry(0.29, 22, 16), body));
    ear.position.set(x, 3.3, -0.04);
    const eye = add(new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 14), skin(0x2b2118, 0.25)));
    eye.position.set(x * 0.45, 2.76, 0.82);
    const glint = add(new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })));
    glint.position.set(x * 0.45 + 0.035, 2.81, 0.9);
  }

  const torso = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.76, 0.52, 10, 28), body));
  torso.position.y = 0.86;
  for (const x of [-0.9, 0.9]) {
    const arm = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.23, 0.5, 8, 18), body));
    arm.position.set(x, 0.98, 0.1);
    arm.rotation.z = x < 0 ? 0.44 : -0.44;
    const leg = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.32, 8, 18), body));
    leg.position.set(x * 0.5, 0.05, 0.06);
  }

  // 소켓 — GLB 와 같은 이름 규약을 쓴다
  const head_ = new THREE.Object3D(); head_.name = "socket_head"; head_.position.set(0, 3.28, 0); bear.add(head_);
  const back_ = new THREE.Object3D(); back_.name = "socket_back"; back_.position.set(0, 1.0, -0.72); bear.add(back_);
  return bear;
}

export function AvatarThree({
  kind = "prim", size = 148, spin = true, turn = 0, wear = ["head", "back"] as SocketId[],
}: {
  kind?: AvatarKind; size?: number; spin?: boolean;
  /** 🔴 촬영 통로 — 시작 각도(도). 헤드리스에서 rAF 가 안 돌아 회전을 증거로 못 남긴다 */
  turn?: number;
  wear?: SocketId[];
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;

    const renderer = makeRenderer(size);
    if (!renderer) { setState("failed"); return; }
    el.appendChild(renderer.domElement);

    const { scene, dispose } = makeScene(renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 1.9, 9.4);
    camera.lookAt(0, 1.7, 0);

    const pivot = new THREE.Group();
    scene.add(pivot);
    addGroundShadow(scene, 0);

    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    const mount = (root: THREE.Object3D, clips: THREE.AnimationClip[]) => {
      if (!alive) return;
      pivot.add(root);

      // ③ 소켓 규약 — 캐릭터가 무엇이든 같은 이름으로 붙인다. 높이는 계산한다
      if (wear.includes("head")) attachToSocket(root, "head", makeHat(), "on-top", 0.62);
      if (wear.includes("back")) attachToSocket(root, "back", makeBag(), "behind", 0.44);

      const idle = clips.find((c) => c.name === "idle") ?? clips[0];
      if (idle) { mixer = new THREE.AnimationMixer(root); mixer.clipAction(idle).play(); }
      setState("ready");
    };

    if (kind === "glb") {
      loadCharacter("/models/avatar-base.glb", 3.4)
        .then(({ root, clips }) => mount(root, clips))
        .catch(() => alive && setState("failed"));
    } else {
      mount(makeBear(), []);
    }

    pivot.rotation.y = (turn * Math.PI) / 180;

    let raf = 0;
    let drag: number | null = null;
    const tick = () => {
      const dt = clock.getDelta();
      mixer?.update(dt);
      if (spin && drag === null) pivot.rotation.y += dt * 0.45;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";
    const down = (e: PointerEvent) => { drag = e.clientX; dom.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (drag === null) return;
      pivot.rotation.y += (e.clientX - drag) * 0.012;
      drag = e.clientX;
    };
    const up = () => { drag = null; };
    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", up);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointercancel", up);
      mixer?.stopAllAction();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      dispose();
      renderer.dispose();
      dom.remove();
    };
  }, [kind, size, spin, turn, wear]);

  if (state === "failed") {
    return (
      <div className="grid justify-items-center gap-1" style={{ height: size }}>
        <span className="text-[3rem] leading-none">🐻</span>
        <span className="text-[0.7em] text-ink-mute">이 기기에서는 3D를 못 그려요</span>
      </div>
    );
  }

  return (
    <div className="grid justify-items-center gap-1">
      <div ref={host} style={{ width: size, height: size }} />
      <span className="text-[0.72em] text-ink-mute">끌어서 돌려보기</span>
    </div>
  );
}
