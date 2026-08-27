/**
 * 목 픽스처 6종 — 명세 §1.2 · §6
 *
 * 값은 기존 아트보드(2차프로젝트/프로토타입/)에서 그대로 가져왔다 — 원장 T6.
 * 🔴 프로토타입 전용. 아래 각 뷰는 백엔드 완료 시 교체한다.
 *    tree   → GRW-002(정체 판정) · GRW-001(나무 상태)
 *    review → PLN-003(두 갈래 회고) · PLN-002(결제 매칭)
 *    forest → GRW-004(숲 스냅샷)
 */
import type { Fixture, FixtureKey, TreeSlot } from "./types";

/** F1 기준 4영역 — 명세 §6.2 */
const SLOTS: TreeSlot[] = [
  { topic: "EARN",  icon: "🌳", name: "벌기",    stage: "TREE",   stageLabel: "나무", percent: 100, condition: "학습 3 · 퀴즈 5 · 실천 4" },
  { topic: "SPEND", icon: "🌿", name: "잘 쓰기", stage: "SPROUT", stageLabel: "새싹", percent: 62,  condition: "학습 2 · 퀴즈 4 · 실천 2" },
  { topic: "SAVE",  icon: "🌱", name: "모으기",  stage: "SEED",   stageLabel: "씨앗", percent: 28,  condition: "학습 1 · 퀴즈 2 · 실천 1" },
  { topic: "GROW",  icon: "🌱", name: "불리기",  stage: "SEED",   stageLabel: "씨앗", percent: 0,   condition: "곧 열려요" },
];

const seedAll = (): TreeSlot[] =>
  SLOTS.map((s) => ({ ...s, stage: "SEED", stageLabel: "씨앗", percent: 0, condition: "아직 기록이 없어요" }));

const PLANNED = [{ icon: "🖊", label: "문구", amount: 5000 }];

export const FIXTURES: Record<FixtureKey, Fixture> = {
  // ── F1 정상 ───────────────────────────────────────────────
  normal: {
    key: "normal",
    label: "정상 — 실천이 쌓이는 중",
    tree: {
      childName: "서연", cycleLabel: "3월 · 실시간", slots: SLOTS,
      evidence: { title: "이번 달 달라진 것", lines: ["사려다 멈춘 일이 2회 → 5회로 늘었어요.", "「잘 쓰기」가 새싹까지 자랐습니다."] },
      emptyNotice: null, stall: null, pendingCount: 0,
    },
    review: {
      whenLabel: "어제 · 다이소 성수점", planned: PLANNED,
      actual: [{ icon: "🖊", label: "문구", amount: 3000 }],
      match: "MET",
      retroLines: ["적은 대로 잘 썼어요.", "지우개랑 스티커, 계획한 만큼만 샀네요."],
      starLabel: "⭐ 1개를 받았어요", emptyNotice: null,
    },
    forest: {
      title: "2026년 3월 숲", oneLine: "쓰기와 모으기가 함께 자랐습니다", starsEarned: 46,
      deltas: [
        { label: "사려다 멈춤", from: "2회", to: "5회", improved: true },
        { label: "가격 비교",   from: "0회", to: "4회", improved: true },
        { label: "저축률",     from: "12%", to: "32%", improved: true },
        { label: "벌기",       from: "새싹", to: "나무", improved: true },
        { label: "잘 쓰기",    from: "씨앗", to: "새싹", improved: true },
      ],
      noPrevMonth: false, emptyNotice: null,
    },
  },

  // ── F2 실천 0건 ───────────────────────────────────────────
  empty: {
    key: "empty",
    label: "실천 0건 — 빈 화면",
    tree: {
      childName: "서연", cycleLabel: "3월 · 가입 3일차", slots: seedAll(), evidence: null,
      emptyNotice: { title: "아직 기록이 없어요", body: "첫 실천 하나면 나무가 움직입니다", hint: "미션을 하나 만들어 보세요" },
      stall: null, pendingCount: 0,
    },
    review: {
      whenLabel: "기록 없음", planned: null, actual: null, match: "NO_PLAN", retroLines: [], starLabel: "",
      emptyNotice: { title: "아직 적어둔 계획이 없어요", body: "가기 전에 적으면 쓴 뒤에 맞춰볼 수 있어요", hint: "다음엔 가기 전에 적어볼까요?" },
    },
    forest: {
      title: "2026년 3월 숲", oneLine: "", starsEarned: 0, deltas: [], noPrevMonth: false,
      emptyNotice: { title: "이번 달 기록을 모으는 중이에요", body: "월말에 한 화면으로 정리해 드릴게요" },
    },
  },

  // ── F3 정체 14일 ──────────────────────────────────────────
  stall: {
    key: "stall",
    label: "정체 14일 — 원인 표시",
    tree: {
      childName: "서연", cycleLabel: "3월 · 실시간",
      slots: SLOTS.map((s) => (s.topic === "SPEND" ? { ...s, stalled: true, condition: "14일째 그대로" } : s)),
      evidence: { title: "이건 아이 문제가 아니에요", lines: ["조건 하나가 남았을 뿐입니다.", "계획 카드를 한 번 적으면 채워집니다."] },
      emptyNotice: null,
      // 가장 적게 남은 조건이 배열 첫 번째 (ACE-3.1)
      stall: { topic: "「잘 쓰기」가 14일째 그대로예요", reasons: ["실천 1회가 남았어요", "학습·퀴즈는 이미 충족했어요"] },
      pendingCount: 0,
    },
    review: {
      whenLabel: "최근 기록 없음", planned: null, actual: null, match: "NO_PLAN", retroLines: [], starLabel: "",
      emptyNotice: { title: "2주째 적은 계획이 없어요", body: "계획을 적어야 대조할 것이 생깁니다" },
    },
    forest: {
      title: "2026년 3월 숲", oneLine: "「잘 쓰기」가 멈춰 있습니다", starsEarned: 18,
      deltas: [
        { label: "사려다 멈춤", from: "2회", to: "2회", improved: false },
        { label: "가격 비교",   from: "0회", to: "0회", improved: false },
        { label: "저축률",     from: "12%", to: "15%", improved: true },
      ],
      noPrevMonth: false, emptyNotice: null,
    },
  },

  // ── F4 첫 달 ──────────────────────────────────────────────
  first: {
    key: "first",
    label: "첫 달 — 전월 데이터 없음",
    tree: {
      childName: "서연", cycleLabel: "3월 · 가입 첫 달", slots: SLOTS,
      evidence: { title: "이번 달 달라진 것", lines: ["첫 달이라 비교할 지난달이 없어요.", "이번 달 기록이 다음 달의 기준이 됩니다."] },
      emptyNotice: null, stall: null, pendingCount: 0,
    },
    review: {
      whenLabel: "어제 · 편의점",
      planned: [{ icon: "🍬", label: "간식·음료", amount: 3000 }],
      actual: [{ icon: "🍬", label: "간식·음료", amount: 2500 }],
      match: "MET",
      retroLines: ["적은 대로 잘 썼어요.", "처음인데 계획을 지켰네요."],
      starLabel: "⭐ 1개를 받았어요", emptyNotice: null,
    },
    forest: {
      title: "2026년 3월 숲 · 첫 달", oneLine: "첫 달 기록이 쌓이고 있습니다", starsEarned: 12,
      deltas: [], noPrevMonth: true, emptyNotice: null,
    },
  },

  // ── F5 계획 넘김 ──────────────────────────────────────────
  over: {
    key: "over",
    label: "계획 넘김 — 별 미지급",
    tree: {
      childName: "서연", cycleLabel: "3월 · 실시간", slots: SLOTS,
      evidence: { title: "이번 달 달라진 것", lines: ["계획을 넘긴 날이 있었지만", "돌아본 기록은 그대로 남습니다."] },
      emptyNotice: null, stall: null, pendingCount: 0,
    },
    review: {
      whenLabel: "어제 · 다이소 성수점", planned: PLANNED,
      actual: [
        { icon: "🖊", label: "문구", amount: 3000 },
        { icon: "🍬", label: "간식·음료", amount: 3000, unplanned: true },
      ],
      match: "EXCEEDED",
      retroLines: ["계획보다 3,000원 더 썼어요.", "젤리와 음료는 적어두지 않았던 가게예요."],
      starLabel: "⭐ 없음 · 가진 별은 그대로예요", emptyNotice: null,
    },
    forest: {
      title: "2026년 3월 숲", oneLine: "쓰기는 아직 흔들립니다", starsEarned: 31,
      deltas: [
        { label: "사려다 멈춤",   from: "2회", to: "3회", improved: true },
        { label: "계획 지킨 날", from: "5일", to: "4일", improved: false },
        { label: "저축률",       from: "12%", to: "18%", improved: true },
      ],
      noPrevMonth: false, emptyNotice: null,
    },
  },

  // ── F6 승인 대기 ──────────────────────────────────────────
  pending: {
    key: "pending",
    label: "승인 대기 누적",
    tree: {
      childName: "서연", cycleLabel: "3월 · 승인 대기 3건", slots: SLOTS,
      evidence: { title: "아직 반영되지 않았어요", lines: ["아이는 이미 했습니다.", "승인하면 한 날짜 기준으로 소급해서 반영됩니다."] },
      emptyNotice: null, stall: null, pendingCount: 3,
    },
    review: {
      whenLabel: "3일 전 · 문구점",
      planned: [{ icon: "🧸", label: "장난감", amount: 10000 }],
      actual: [{ icon: "🧸", label: "장난감", amount: 9000 }],
      match: "MET",
      retroLines: ["적은 대로 잘 썼어요.", "고민하다 조금 덜 썼네요."],
      starLabel: "⭐ 1개를 받았어요", emptyNotice: null,
    },
    forest: {
      title: "2026년 3월 숲", oneLine: "승인이 밀려 반영이 늦습니다", starsEarned: 28,
      deltas: [
        { label: "사려다 멈춤", from: "2회", to: "4회", improved: true },
        { label: "미션 완료",   from: "5회", to: "8회", improved: true },
        { label: "승인 대기",   from: "0건", to: "3건", improved: false },
      ],
      noPrevMonth: false, emptyNotice: null,
    },
  },
};

export const FIXTURE_ORDER: FixtureKey[] = ["normal", "empty", "stall", "first", "over", "pending"];

export function getFixture(key?: string | null): Fixture {
  const k = (key ?? "normal") as FixtureKey;
  return FIXTURES[k] ?? FIXTURES.normal;
}
