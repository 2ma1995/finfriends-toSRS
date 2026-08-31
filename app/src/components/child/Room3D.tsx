"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { makeRenderer, makeScene, loadCharacter, loadProp, attachToSocket } from "./avatar-scene";
import type { Item } from "@/app/child/home/room.fixture";

/**
 * 🔴 실험 — 아이 방 3D.
 *
 * 두 가지 모드가 있다.
 *   보기    방을 끌어서 돌린다
 *   꾸미기  아이템을 눌러 고르고 끌어서 옮긴다. 회전·되돌리기
 *
 * 아이템은 두 갈래로 갈린다 — **소켓에 붙는 것**과 **바닥에 놓는 것**.
 * 카탈로그(`room.fixture.ts`)가 어느 쪽인지 들고 있고 이 컴포넌트는 그대로 따른다.
 * 에셋은 전부 Kenney CC0 — `public/models/LICENSE.md`.
 */
export type Layout = Record<string, { x: number; z: number; ry: number }>;

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
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.3),
    new THREE.MeshPhysicalMaterial({ color: 0xd0453c, roughness: 0.55, clearcoat: 0.25 }));
  m.castShadow = true;
  return m;
}

/** 고른 아이템 표시 — 바닥에 링 하나. 아이가 무엇을 잡았는지 알아야 한다 */
function makeRing() {
  const r = new THREE.Mesh(
    new THREE.RingGeometry(0.52, 0.68, 40),
    new THREE.MeshBasicMaterial({ color: 0x4f7a4a, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  r.rotation.x = -Math.PI / 2;
  r.position.y = 0.02;
  r.visible = false;
  return r;
}

const FLOOR_R = 4.4;   // 아이템이 나갈 수 있는 범위

export function Room3D({
  items, size = 300, turn = 0, edit = false, layout, onMove, onSelect, selectedId,
}: {
  items: readonly Item[];
  size?: number;
  turn?: number;
  edit?: boolean;
  layout: Layout;
  onMove?: (id: string, pos: { x: number; z: number; ry: number }) => void;
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  // 콜백이 바뀔 때마다 장면을 다시 만들지 않는다
  const cbs = useRef({ onMove, onSelect });
  cbs.current = { onMove, onSelect };
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const api = useRef<{
    holders: Map<string, THREE.Object3D>;
    ring: THREE.Mesh | null;
    room: THREE.Group | null;
  }>({ holders: new Map(), ring: null, room: null });

  // 바깥에서 고른 것 · 좌표가 바뀌면 장면에 반영한다
  useEffect(() => {
    const { holders, ring } = api.current;
    for (const [id, h] of holders) {
      const p = layout[id];
      if (p) { h.position.set(p.x, 0, p.z); h.rotation.y = (p.ry * Math.PI) / 180; }
      if (ring && selectedId === id) { ring.position.set(h.position.x, 0.02, h.position.z); ring.visible = true; }
    }
    if (ring && !selectedId) ring.visible = false;
  }, [layout, selectedId]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;

    const renderer = makeRenderer(size);
    if (!renderer) { setState("failed"); return; }
    const h = Math.round(size * 0.78);
    renderer.setSize(size, h);
    el.appendChild(renderer.domElement);

    const { scene, dispose } = makeScene(renderer);
    const camera = new THREE.PerspectiveCamera(34, size / h, 0.1, 100);
    camera.position.set(0, 4.4, 9.6);
    camera.lookAt(0, 1.0, 0);

    const room = new THREE.Group();
    room.rotation.y = (turn * Math.PI) / 180;
    scene.add(room);
    api.current.room = room;

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7.4, 56),
      new THREE.MeshStandardMaterial({ color: 0xdcc7a6, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    const ring = makeRing();
    room.add(ring);
    api.current.ring = ring;

    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();
    const holders = api.current.holders;
    holders.clear();

    (async () => {
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

      for (const it of items) {
        if (!it.model || it.placement.kind === "socket") continue;
        try {
          const { holder } = await loadProp(it.model, it.size);
          if (!alive) return;
          holder.userData.itemId = it.id;
          const p = layoutRef.current[it.id];
          if (p) { holder.position.set(p.x, 0, p.z); holder.rotation.y = (p.ry * Math.PI) / 180; }
          holders.set(it.id, holder);
          room.add(holder);
        } catch { /* 하나 실패해도 방은 그린다 */ }
      }
    })().catch(() => alive && setState("failed"));

    let raf = 0;
    const tick = () => { mixer?.update(clock.getDelta()); renderer.render(scene, camera); raf = requestAnimationFrame(tick); };
    tick();

    // ── 조작 ───────────────────────────────────────────────
    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    let mode: "none" | "orbit" | "drag" = "none";
    let lastX = 0;
    let dragId: string | null = null;
    let grabOff = new THREE.Vector3();

    const toNdc = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const pickItem = () => {
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects([...holders.values()], true);
      if (!hits.length) return null;
      let o: THREE.Object3D | null = hits[0].object;
      while (o && !o.userData.itemId) o = o.parent;
      return (o?.userData.itemId as string) ?? null;
    };
    const floorPoint = () => {
      ray.setFromCamera(ndc, camera);
      return ray.ray.intersectPlane(plane, hitPoint) ? hitPoint.clone() : null;
    };

    const down = (e: PointerEvent) => {
      dom.setPointerCapture(e.pointerId);
      toNdc(e);
      lastX = e.clientX;
      if (!edit) { mode = "orbit"; dom.style.cursor = "grabbing"; return; }

      const id = pickItem();
      cbs.current.onSelect?.(id);
      if (id) {
        const holder = holders.get(id)!;
        const p = floorPoint();
        // 방이 회전해 있으면 월드↔로컬을 맞춰야 아이템이 튀지 않는다
        if (p) { room.worldToLocal(p); grabOff.copy(holder.position).sub(p); }
        dragId = id;
        mode = "drag";
      } else {
        mode = "orbit";
        dom.style.cursor = "grabbing";
      }
    };

    const move = (e: PointerEvent) => {
      if (mode === "none") return;
      toNdc(e);
      if (mode === "orbit") {
        room.rotation.y += (e.clientX - lastX) * 0.01;
        lastX = e.clientX;
        return;
      }
      if (mode === "drag" && dragId) {
        const p = floorPoint();
        if (!p) return;
        room.worldToLocal(p);
        p.add(grabOff);
        const r = Math.hypot(p.x, p.z);
        if (r > FLOOR_R) { p.x = (p.x / r) * FLOOR_R; p.z = (p.z / r) * FLOOR_R; }
        const holder = holders.get(dragId)!;
        holder.position.set(p.x, 0, p.z);
        ring.position.set(p.x, 0.02, p.z);
        ring.visible = true;
      }
    };

    const up = () => {
      if (mode === "drag" && dragId) {
        const holder = holders.get(dragId)!;
        cbs.current.onMove?.(dragId, {
          x: +holder.position.x.toFixed(2),
          z: +holder.position.z.toFixed(2),
          ry: Math.round((holder.rotation.y * 180) / Math.PI),
        });
      }
      mode = "none"; dragId = null;
      dom.style.cursor = edit ? "pointer" : "grab";
    };

    dom.style.cursor = edit ? "pointer" : "grab";
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
      dispose(); renderer.dispose(); dom.remove();
      api.current.holders = new Map(); api.current.ring = null; api.current.room = null;
    };
  }, [items, size, turn, edit]);

  if (state === "failed") {
    return (
      <div className="grid h-[220px] place-items-center rounded-card bg-sand text-center">
        <p className="text-[0.82em] text-ink-soft">🐻<br />이 기기에서는 3D를 못 그려요</p>
      </div>
    );
  }

  return <div ref={host} style={{ width: size, height: Math.round(size * 0.78) }} />;
}
