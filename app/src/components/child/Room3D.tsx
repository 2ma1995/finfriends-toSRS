"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { makeRenderer, makeScene, loadCharacter, loadProp, attachToSocket } from "./avatar-scene";
import type { Item } from "@/app/child/home/room.fixture";

/**
 * 🔴 실험 — 아이 방 3D.
 *
 * 아바타(사람) · 펫(동물) · 방에 놓은 아이템을 한 장면에 그린다.
 * 아이템은 두 갈래로 갈린다 — **소켓에 붙는 것**과 **바닥에 놓는 것**.
 * 카탈로그(`room.fixture.ts`)가 어느 쪽인지 들고 있고, 이 컴포넌트는 그대로 따른다.
 *
 * 에셋은 전부 Kenney CC0 다 — `public/models/LICENSE.md`.
 */
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
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.8, 0.3),
    new THREE.MeshPhysicalMaterial({ color: 0xd0453c, roughness: 0.55, clearcoat: 0.25 }),
  );
  m.castShadow = true;
  return m;
}

export function Room3D({
  items, size = 300, turn = 0, spin = false,
}: { items: readonly Item[]; size?: number; turn?: number; spin?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;

    const renderer = makeRenderer(size);
    if (!renderer) { setState("failed"); return; }
    renderer.setSize(size, Math.round(size * 0.78));
    el.appendChild(renderer.domElement);

    const { scene, dispose } = makeScene(renderer);
    const camera = new THREE.PerspectiveCamera(34, size / (size * 0.78), 0.1, 100);
    camera.position.set(0, 4.4, 9.6);
    camera.lookAt(0, 1.0, 0);

    const room = new THREE.Group();
    scene.add(room);

    // 방 바닥 — 그림자를 받는 실제 면. 벽은 안 세운다(가려서 안 보인다)
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7.4, 56),
      new THREE.MeshStandardMaterial({ color: 0xdcc7a6, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    (async () => {
      // 아바타
      const { root, clips } = await loadCharacter("/models/avatar-base.glb", 2.6);
      if (!alive) return;
      root.position.set(-0.3, 0, 0.4);
      room.add(root);

      for (const it of items) {
        if (it.placement.kind !== "socket") continue;
        attachToSocket(root, it.placement.socket, it.id === "cap" ? makeHat() : makeBag(),
          it.placement.socket === "head" ? "on-top" : "behind",
          it.placement.socket === "head" ? 0.62 : 0.44);
      }

      const idle = clips.find((c) => c.name === "idle") ?? clips[0];
      if (idle) { mixer = new THREE.AnimationMixer(root); mixer.clipAction(idle).play(); }
      setState("ready");

      // 놓는 것 · 펫 — 있는 것부터 순서대로 들어온다
      for (const it of items) {
        if (!it.model || it.placement.kind === "socket") continue;
        try {
          const { holder } = await loadProp(it.model, it.size);
          if (!alive) return;
          if (it.placement.kind === "floor") {
            holder.position.set(it.placement.x, 0, it.placement.z);
            holder.rotation.y = ((it.placement.ry ?? 0) * Math.PI) / 180;
          } else {
            holder.position.set(1.25, 0, 1.35);
            holder.rotation.y = -0.6;
          }
          room.add(holder);
        } catch { /* 한 아이템이 실패해도 방은 그린다 */ }
      }
    })().catch(() => alive && setState("failed"));

    room.rotation.y = (turn * Math.PI) / 180;

    let raf = 0;
    let drag: number | null = null;
    const tick = () => {
      mixer?.update(clock.getDelta());
      if (spin && drag === null) room.rotation.y += 0.0035;
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
      room.rotation.y += (e.clientX - drag) * 0.01;
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
  }, [items, size, turn, spin]);

  if (state === "failed") {
    return (
      <div className="grid h-[220px] place-items-center rounded-card bg-sand text-center">
        <p className="text-[0.82em] text-ink-soft">🐻<br />이 기기에서는 3D를 못 그려요</p>
      </div>
    );
  }

  return (
    <div className="grid justify-items-center gap-1">
      <div ref={host} style={{ width: size, height: Math.round(size * 0.78) }} />
      <span className="text-[0.72em] text-ink-mute">끌어서 방을 돌려보기</span>
    </div>
  );
}
