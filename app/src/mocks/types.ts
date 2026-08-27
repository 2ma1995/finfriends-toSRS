/**
 * 목 픽스처 타입 — 명세 §6
 *
 * 형태는 중립판 SRS §6.2 열거형에서 도출했다. 코드 계약(CTR-002)이 나중에 여기 맞춰진다.
 * 프로토타입 전용이며, 백엔드가 완료되면 해당 픽스처를 제거한다.
 */

/** 상태 6종 — 명세 §1.2. 7번째를 만들지 않는다. */
export type FixtureKey =
  | "normal"   // F1 정상
  | "empty"    // F2 실천 0건
  | "stall"    // F3 정체 14일
  | "first"    // F4 첫 달
  | "over"     // F5 계획 넘김
  | "pending"; // F6 승인 대기

/** 4영역 — 학습·나무·실천이 공유하는 고정 분류 (중립판 §6.2.1) */
export type Topic = "EARN" | "SPEND" | "SAVE" | "GROW";

/** 나무 단계 — 🔴 D6 미결. 3단계는 예시값이다. */
export type Stage = "SEED" | "SPROUT" | "TREE";

export interface TreeSlot {
  topic: Topic;
  icon: string;
  name: string;
  stage: Stage;
  stageLabel: string;
  percent: number;
  /** 조건 요약 — 학습·퀴즈·실천 */
  condition: string;
  /** 정체 여부 — 주기 시작 후 14일 경과분에만 적용 */
  stalled?: boolean;
}

/** 정체 원인 — 미충족 조건 전부. 가장 적게 남은 것이 배열 첫 번째 (ACE-3.1) */
export interface StallReason {
  topic: string;
  reasons: string[];
}

export interface TreeView {
  childName: string;
  cycleLabel: string;
  slots: TreeSlot[];
  /** 실천 근거 — 펼치지 않아도 보인다 (AC-1.2) */
  evidence: { title: string; lines: string[] } | null;
  /** 빈 상태 — 실천 0건일 때만 (ACE-1.1) */
  emptyNotice: { title: string; body: string; hint?: string } | null;
  stall: StallReason | null;
  /** 승인 대기 건수 — 1건 이상일 때만 (AC-6.2) */
  pendingCount: number;
}

/** 계획↔실제 판정 — 금액 단독 (ADR-008) */
export type PlanMatch = "MET" | "EXCEEDED" | "NO_PLAN";

export interface SpendLine {
  icon: string;
  label: string;
  amount: number;
  /** 계획에 없던 업종 — 강조 표시 대상 */
  unplanned?: boolean;
}

export interface ReviewView {
  whenLabel: string;
  planned: SpendLine[] | null;
  actual: SpendLine[] | null;
  match: PlanMatch;
  /** 회고 문장 — 갈래별로 다르다. 넘김에도 똑같이 제시한다 */
  retroLines: string[];
  /** ⭐ 결과 — 넘김은 미지급이되 차감하지 않는다 (P-03) */
  starLabel: string;
  emptyNotice: { title: string; body: string; hint?: string } | null;
}

export interface DeltaItem {
  label: string;
  from: string;
  to: string;
  improved: boolean;
}

export interface ForestView {
  title: string;
  /** 이번 달 한 줄 */
  oneLine: string;
  /** 획득 별 — 스크롤 없이 보여야 한다 (AC-1.4) */
  starsEarned: number;
  deltas: DeltaItem[];
  /** 첫 달 — 델타를 0으로 그리지 않는다 (ACE-1.2) */
  noPrevMonth: boolean;
  emptyNotice: { title: string; body: string } | null;
}

export interface Fixture {
  key: FixtureKey;
  label: string;
  tree: TreeView;
  review: ReviewView;
  forest: ForestView;
}
