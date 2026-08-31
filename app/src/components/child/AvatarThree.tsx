"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 🔴 실험 — three.js 아바타. 에셋 없이 원시 도형으로 세운다.
 *
 * 확인하려는 것은 두 가지뿐이다.
 *   ① 회전하는 캐릭터가 아이에게 값어치가 있는가
 *   ② 저사양 기기에서 홈 화면 첫 페인트를 지연시키지 않는가 (STR-003 제약)
 *
 * 아직 문서를 고치지 않았다 — ADR-T05 · X2 · REQ-TEC-007 · STR-003 제약이 그대로다.
 * 되는지 먼저 보고, 유지하기로 하면 그때 고친다.
 */
type Look = { body: number; muzzle: number; hat: number; item: number };

const PALETTE: Look = { body: 0xa9743f, muzzle: 0xe8cfae, hat: 0x3b7dd8, item: 0xd0453c };

export function AvatarThree({ size = 132, spin = true, turn = 0 }: {
  size?: number; spin?: boolean;
  /** 🔴 촬영 통로 — 시작 각도(도). 헤드리스에서 rAF 가 안 돌아 회전을 증거로 못 남긴다 */
  turn?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const t0 = performance.now();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6.2);

    scene.add(new THREE.HemisphereLight(0xfff6e8, 0x9c8e80, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2.5, 4, 3);
    scene.add(key);

    const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
    const bear = new THREE.Group();

    // 머리 · 주둥이 · 코
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat(PALETTE.body));
    head.position.y = 0.75;
    bear.add(head);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 18), mat(PALETTE.muzzle));
    muzzle.position.set(0, 0.52, 0.82);
    muzzle.scale.set(1, 0.78, 0.72);
    bear.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), mat(0x2b2118));
    nose.position.set(0, 0.62, 1.16);
    bear.add(nose);

    // 귀 · 눈 — 앞뒤가 구별돼야 회전이 의미가 있다
    for (const x of [-0.72, 0.72]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 16), mat(PALETTE.body));
      ear.position.set(x, 1.5, -0.05);
      bear.add(ear);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), mat(0x2b2118));
      eye.position.set(x * 0.46, 0.95, 0.83);
      bear.add(eye);
    }

    // 몸 · 팔 · 다리
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 0.5, 8, 24), mat(PALETTE.body));
    body.position.y = -0.95;
    bear.add(body);
    for (const x of [-0.92, 0.92]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 6, 16), mat(PALETTE.body));
      arm.position.set(x, -0.82, 0.1);
      arm.rotation.z = x < 0 ? 0.42 : -0.42;
      bear.add(arm);
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.34, 6, 16), mat(PALETTE.body));
      leg.position.set(x * 0.52, -1.86, 0.06);
      bear.add(leg);
    }

    // 옷장 아이템 — 모자 · 가방. 장착 지점을 고정해 두면 에셋이 와도 자리가 같다
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.34, 28), mat(PALETTE.hat));
    hat.position.y = 1.62;
    bear.add(hat);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24), mat(PALETTE.hat));
    brim.position.set(0, 1.46, 0.78);
    brim.scale.set(1.5, 1, 1.35);
    bear.add(brim);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.94, 1.06, 0.42), mat(PALETTE.item));
    bag.position.set(0, -0.86, -0.82);
    bear.add(bag);

    bear.rotation.x = 0.06;
    bear.rotation.y = (turn * Math.PI) / 180;
    scene.add(bear);

    let raf = 0;
    let drag: number | null = null;
    let painted = false;

    const tick = () => {
      if (spin && drag === null) bear.rotation.y += 0.0075;
      renderer.render(scene, camera);
      if (!painted) {
        painted = true;
        setMs(Math.round(performance.now() - t0));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";
    const down = (e: PointerEvent) => { drag = e.clientX; dom.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (drag === null) return;
      bear.rotation.y += (e.clientX - drag) * 0.012;
      drag = e.clientX;
    };
    const up = () => { drag = null; };
    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
      });
      renderer.dispose();
      dom.remove();
    };
  }, [size, spin, turn]);

  if (failed) {
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
      <span className="text-[0.72em] text-ink-mute">
        끌어서 돌려보기{ms !== null ? ` · 첫 렌더 ${ms}ms` : ""}
      </span>
    </div>
  );
}
