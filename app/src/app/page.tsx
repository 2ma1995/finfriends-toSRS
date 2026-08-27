/**
 * 프로토타입 단일 페이지 — 화면 3종을 한 화면에 나란히 둔다.
 * 라우팅을 만들지 않는 이유는 명세 §8 "하지 않는 것" 참조.
 *
 * 🔴 프로토타입 전용 파일. 본 개발 시 통째로 교체된다.
 */
import { Suspense } from "react";
import { getFixture } from "@/mocks/fixtures";
import { FixtureSwitcher } from "@/components/proto/fixture-switcher";
import { TreeScreen, ReviewScreen, ForestScreen } from "@/components/proto/screens";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string; shot?: string }>;
}) {
  const sp = await searchParams;
  const f = getFixture(sp.fixture);

  const screens = {
    p1: <TreeScreen v={f.tree} />,
    p2: <ReviewScreen v={f.review} />,
    p3: <ForestScreen v={f.forest} />,
  } as const;

  // 촬영 모드 — 스크린샷 한 장에 화면 하나만 담기 위한 통로다(명세 §7.3). UI가 아니다.
  const shot = sp.shot as keyof typeof screens | undefined;
  if (shot && screens[shot]) {
    return <main className="flex justify-center p-5">{screens[shot]}</main>;
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      {/* 🔴 프로토타입 전용 상단 바. 본 개발 시 이 <header>를 통째로 지운다. */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="ff-serif text-[1.5rem] font-bold tracking-[-0.01em]">핀프렌즈 화면 프로토타입</h1>
          <Badge variant="outline"
                 style={{ borderColor: "var(--ff-clay)", color: "var(--ff-clay)", background: "var(--ff-clay-bg)" }}>
            목 데이터
          </Badge>
          <div className="ml-auto"><Suspense fallback={null}><FixtureSwitcher /></Suspense></div>
        </div>
        <p className="mt-2 text-[0.82rem] leading-[1.6]" style={{ color: "var(--ff-ink-2)" }}>
          기능은 붙어 있지 않습니다. 화면·문구·상태 전환만 확인하는 용도이며, 숫자는 전부 고정된 예시값입니다.
        </p>
        <Separator className="mt-4" style={{ background: "var(--ff-line)" }} />
      </header>

      <div className="flex flex-wrap items-start justify-center gap-7">
        {screens.p1}{screens.p2}{screens.p3}
      </div>

      <footer className="mt-9 text-center text-[0.72rem]" style={{ color: "var(--ff-ink-3)" }}>
        상태 <b>{f.label}</b> · 명세 <code>docs/plan-docs/[Spec]Prototype-Visual-Plan.md</code> · 규칙 스킬 <code>401-prototype-visual-rules</code>
      </footer>
    </main>
  );
}
