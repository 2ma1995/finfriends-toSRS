"use client";

import { useState } from "react";

/**
 * 아바타 — 🔴 D4 미결(원장 T15). Lottie 2.5D 에셋이 아직 없다.
 *
 * 여기서 확인하려는 것은 **「회전」이 아이에게 의미가 있는가** 하나다.
 * ADR-T05가 3D → 2.5D 전환의 대가로 *"회전이 사라진다"* 를 적어 뒀고, 그 결정은
 * D4와 함께 **아직 승인 전**이다. 승인을 판단하려면 회전이 있는 화면을 먼저 봐야 한다.
 *
 * 그래서 렌더러를 추가하지 않고 **CSS 3D 로만** 세웠다 —
 * REQ-TEC-007(UI 의존성 0건 · Lottie 예외 1건)을 건드리지 않고, 번들도 늘지 않는다.
 * three.js 도입은 이 화면으로 회전의 값어치를 확인한 뒤에 판단한다.
 */
export type AvatarLook = { face: string; hat: string; item: string; back: string };

export function Avatar({ look, spin = true, initialTurned = false }: {
  look: AvatarLook; spin?: boolean; initialTurned?: boolean;
}) {
  const [turned, setTurned] = useState(initialTurned);

  return (
    <div className="grid justify-items-center gap-2">
      <div className="[perspective:640px]">
        <button
          type="button"
          onClick={() => spin && setTurned((v) => !v)}
          aria-label={turned ? "아바타 앞모습 보기" : "아바타 뒷모습 보기"}
          className="ff-avatar-spin relative block h-[104px] w-[104px] [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${turned ? 180 : 0}deg)` }}
        >
          {/* 앞면 */}
          <span className="absolute inset-0 [backface-visibility:hidden]">
            <span className="absolute inset-x-0 top-[18px] text-[3.4rem] leading-none">{look.face}</span>
            <span className="absolute inset-x-0 top-0 text-[1.6rem] leading-none">{look.hat}</span>
            <span className="absolute -right-1 bottom-[8px] text-[1.5rem] leading-none">{look.item}</span>
          </span>

          {/* 뒷면 — 회전이 실제로 무언가를 보여줘야 의미가 있다 */}
          <span
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="absolute inset-x-0 top-[18px] text-[3.4rem] leading-none">{look.back}</span>
            <span className="absolute inset-x-0 top-0 text-[1.6rem] leading-none">{look.hat}</span>
            <span className="absolute -left-1 bottom-[8px] text-[1.5rem] leading-none">{look.item}</span>
          </span>
        </button>
      </div>

      {spin ? (
        <span className="text-[0.72em] text-ink-mute">눌러서 돌려보기</span>
      ) : null}
    </div>
  );
}
