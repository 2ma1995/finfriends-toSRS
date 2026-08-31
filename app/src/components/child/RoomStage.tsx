"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Item } from "@/app/child/home/room.fixture";
import type { Layout } from "./Room3D";

/** three 는 늦게 부른다 — 홈 첫 페인트를 막지 않아야 한다 (STR-003 제약) */
const Room3D = dynamic(() => import("./Room3D").then((m) => m.Room3D), {
  ssr: false,
  loading: () => <div className="h-[234px] w-[300px] animate-pulse rounded-card bg-sand" />,
});

/** 🔴 프로토타입 전용 저장소. 본 개발에서는 서버가 배치를 갖는다 */
const KEY = "ff-proto-room-layout";

function baseLayout(items: readonly Item[]): Layout {
  const out: Layout = {};
  for (const i of items) {
    if (i.placement.kind === "floor") out[i.id] = { x: i.placement.x, z: i.placement.z, ry: i.placement.ry ?? 0 };
    if (i.placement.kind === "beside") out[i.id] = { x: 1.25, z: 1.35, ry: -34 };
  }
  return out;
}

export function RoomStage({ items, turn = 0, startEdit = false }: {
  items: readonly Item[]; turn?: number; startEdit?: boolean;
}) {
  const base = useMemo(() => baseLayout(items), [items]);
  const [layout, setLayout] = useState<Layout>(base);
  const [edit, setEdit] = useState(startEdit);
  const [sel, setSel] = useState<string | null>(null);

  // 저장된 배치가 있으면 이어서 쓴다. 없거나 못 읽어도 화면은 그대로 뜬다
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLayout({ ...base, ...(JSON.parse(raw) as Layout) });
    } catch { /* 사생활 보호 모드 등 — 무시한다 */ }
  }, [base]);

  const persist = useCallback((next: Layout) => {
    setLayout(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* 무시 */ }
  }, []);

  // 놓을 때 방 전체가 다시 정렬돼서 온다 — 받침을 치우면 위의 것이 내려온다
  const onMove = useCallback((id: string, _p: { x: number; z: number; ry: number; y: number }, all: Layout) => {
    persist({ ...layout, ...all });
  }, [layout, persist]);

  const rotate = (deg: number) => {
    if (!sel) return;
    const cur = layout[sel] ?? { x: 0, z: 0, ry: 0 };
    persist({ ...layout, [sel]: { ...cur, ry: cur.ry + deg } });
  };

  const drop = () => {
    if (!sel) return;
    const cur = layout[sel];
    if (!cur) return;
    persist({ ...layout, [sel]: { ...cur, y: 0 } });   // 바닥으로 내린다
  };

  const reset = () => {
    setSel(null);
    setLayout(base);
    try { localStorage.removeItem(KEY); } catch { /* 무시 */ }
  };

  const selName = sel ? items.find((i) => i.id === sel)?.name : null;

  return (
    <div className="grid justify-items-center gap-2">
      <div className={edit ? "rounded-card ring-2 ring-primary" : undefined}>
        <Room3D items={items} turn={turn} edit={edit} layout={layout}
                onMove={onMove} onSelect={setSel} selectedId={sel} />
      </div>

      {edit ? (
        <>
          <p className="text-[0.74em] text-ink-soft">
            {selName ? (
              <>
                「{selName}」를 골랐어요 · <b>끌어서 옮기기</b>
                {layout[sel!]?.y ? <> · 위에 얹혀 있어요</> : null}
              </>
            ) : "옮기고 싶은 것을 눌러 보세요"}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <button onClick={() => rotate(-45)} disabled={!sel}
                    className="min-h-touch rounded-card border border-line bg-surface px-3 text-[0.8em] disabled:opacity-40">↺ 왼쪽</button>
            <button onClick={() => rotate(45)} disabled={!sel}
                    className="min-h-touch rounded-card border border-line bg-surface px-3 text-[0.8em] disabled:opacity-40">↻ 오른쪽</button>
            <button onClick={drop} disabled={!sel || !(layout[sel]?.y)}
                    className="min-h-touch rounded-card border border-line bg-surface px-3 text-[0.8em] disabled:opacity-40">↓ 바닥에</button>
            <button onClick={reset}
                    className="min-h-touch rounded-card border border-line bg-surface px-3 text-[0.8em]">처음으로</button>
            <button onClick={() => { setEdit(false); setSel(null); }}
                    className="min-h-touch rounded-card bg-primary px-4 text-[0.84em] font-bold text-white">다 꾸몄어요</button>
          </div>
        </>
      ) : (
        <>
          <span className="text-[0.72em] text-ink-mute">끌어서 방을 돌려보기</span>
          <button onClick={() => setEdit(true)}
                  className="min-h-touch w-full rounded-card border-2 border-primary bg-primary-bg text-[0.88em] font-bold text-primary-d">
            🛠 방 꾸미기
          </button>
        </>
      )}
    </div>
  );
}
