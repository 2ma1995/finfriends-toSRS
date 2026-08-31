"use client";

import dynamic from "next/dynamic";
import { Avatar, type AvatarLook } from "./Avatar";

/**
 * 🔴 실험 중 — 3D(three.js) 와 CSS 3D 를 나란히 놓고 고른다.
 *
 * three.js 는 `dynamic(ssr:false)` 로 늦게 불러온다 — 홈 화면 첫 페인트를 막지 않아야 한다
 * (STR-003 제약). 로딩 동안에는 CSS 3D 아바타가 자리를 지킨다.
 */
const AvatarThree = dynamic(
  () => import("./AvatarThree").then((m) => m.AvatarThree),
  { ssr: false, loading: () => <div className="h-[132px] w-[132px]" /> },
);

export function AvatarStage({ look, mode, turn = 0 }: {
  look: AvatarLook; mode: "css" | "three"; turn?: number;
}) {
  return mode === "three" ? <AvatarThree turn={turn} /> : <Avatar look={look} />;
}
