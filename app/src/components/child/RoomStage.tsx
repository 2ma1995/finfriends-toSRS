"use client";

import dynamic from "next/dynamic";
import type { Item } from "@/app/child/home/room.fixture";

/** three 는 늦게 부른다 — 홈 첫 페인트를 막지 않아야 한다 (STR-003 제약) */
const Room3D = dynamic(() => import("./Room3D").then((m) => m.Room3D), {
  ssr: false,
  loading: () => (
    <div className="h-[234px] w-[300px] animate-pulse rounded-card bg-sand" />
  ),
});

export function RoomStage({ items, turn = 0 }: { items: readonly Item[]; turn?: number }) {
  return <Room3D items={items} turn={turn} />;
}
