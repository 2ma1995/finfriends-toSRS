// PROTO-DATA: STR-003 · UX-003 — 백엔드 완료 시 이 파일을 지우고 별 잔액 · 옷장 보유 조회로 대체한다

/**
 * 🔴 아바타 에셋은 D4 미결이다 (원장 T10). Lottie 2.5D 대신 이모지 조합으로 세운다.
 *    확정되면 이 파일과 Avatar 컴포넌트만 갈아끼운다. 화면 구조는 그대로 쓴다.
 */
export type Item = { readonly key: string; readonly emoji: string; readonly name: string; readonly cost: number; readonly owned: boolean };

/**
 * 아바타 모습 — 앞뒤 두 면. 회전이 무언가를 보여줘야 값어치가 있다.
 * 🔴 D4 확정 시 이 값과 Avatar.tsx 를 함께 갈아끼운다.
 */
export const me = {
  name: "서연",
  starBalance: 12,
  avatar: { face: "🐻", hat: "🧢", item: "🎒", back: "🧸" },
};

export const wardrobe: readonly Item[] = [
  { key: "cap",   emoji: "🧢", name: "모자",   cost: 5,  owned: true },
  { key: "bag",   emoji: "🎒", name: "가방",   cost: 8,  owned: true },
  { key: "scarf", emoji: "🧣", name: "목도리", cost: 10, owned: false },
  { key: "crown", emoji: "👑", name: "왕관",   cost: 30, owned: false },
];

/** 오늘 할 일 — 아이는 여기서 출발한다 */
export const todo = [
  { href: "/child/learn",    emoji: "📚", label: "오늘의 학습" },
  { href: "/child/plan/new", emoji: "📝", label: "계획 카드 적기" },
  { href: "/child/wishlist", emoji: "🎯", label: "갖고 싶은 것" },
];
