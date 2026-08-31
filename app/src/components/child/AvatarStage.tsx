"use client";

import dynamic from "next/dynamic";
import { Avatar, type AvatarLook } from "./Avatar";
import type { AvatarKind } from "./AvatarThree";

/**
 * 🔴 실험 중 — 아바타 표현 3종을 나란히 놓고 고른다.
 *   css  — 이모지 + CSS 3D 회전 (의존성 0건)
 *   prim — three.js 원시 도형 + 환경맵·톤매핑·접지 그림자
 *   glb  — three.js + Kenney CC0 모델 + idle 애니메이션
 *
 * three 는 `dynamic(ssr:false)` 로 늦게 부른다 — 홈 첫 페인트를 막지 않아야 한다(STR-003 제약).
 */
const AvatarThree = dynamic(
  () => import("./AvatarThree").then((m) => m.AvatarThree),
  { ssr: false, loading: () => <div className="h-[148px] w-[148px]" /> },
);

export type AvatarMode = "css" | AvatarKind;

export function AvatarStage({ look, mode, turn = 0 }: {
  look: AvatarLook; mode: AvatarMode; turn?: number;
}) {
  if (mode === "css") return <Avatar look={look} />;
  return <AvatarThree kind={mode} turn={turn} />;
}
