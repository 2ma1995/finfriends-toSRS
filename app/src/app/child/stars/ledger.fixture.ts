// PROTO-DATA: STR-001 — 백엔드 완료 시 이 파일을 지우고 별 원장 조회로 대체한다
export type Entry = {
  readonly id: string; readonly when: string; readonly reason: string;
  readonly delta: number; readonly kind: "지킴" | "미션" | "저축" | "옷장";
};

/**
 * 🔴 별은 「확인」이 아니라 「지킴」에 붙는다. 넘겨도 차감하지 않는다 (P-03).
 * 🔴 별↔저금통 전환 경로가 존재하면 안 된다 (허용 오차 0 · 스킬 304).
 */
export const balance = 12;
export const entries: readonly Entry[] = [
  { id: "e-9", when: "어제",   reason: "계획을 지켰어요",        delta: +1, kind: "지킴" },
  { id: "e-8", when: "2일 전", reason: "빈 병 분리배출 돕기",     delta: +1, kind: "미션" },
  { id: "e-7", when: "3일 전", reason: "모자를 샀어요",           delta: -5, kind: "옷장" },
  { id: "e-6", when: "4일 전", reason: "용돈 1,000원 저금통에",   delta: +1, kind: "저축" },
  { id: "e-5", when: "5일 전", reason: "가격 두 개 비교하기",     delta: +2, kind: "미션" },
];

export const notice = "별은 옷장에서만 쓸 수 있어요. 돈으로 바꾸지는 않아요.";
