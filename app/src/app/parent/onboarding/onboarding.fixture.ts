// PROTO-DATA: CON-003 — 백엔드 완료 시 이 파일을 지우고 온보딩 세션 저장 액션으로 대체한다
export type Step = { readonly n: number; readonly title: string; readonly body: string; readonly state: "done" | "current" | "todo" };

/** 5단계. 세션이 끊겨도 입력값을 잃지 않는다 (CON-003) */
export const steps: readonly Step[] = [
  { n: 1, title: "보호자 계정",   body: "이메일과 비밀번호를 등록했습니다",       state: "done" },
  { n: 2, title: "법정대리인 동의", body: "만 14세 미만 아동의 동의 절차를 마쳤습니다", state: "done" },
  { n: 3, title: "아이 프로필",   body: "이름과 생년월을 적어 주세요",           state: "current" },
  { n: 4, title: "첫 계획 카드",   body: "어디서 · 얼마를 쓸지 한 장만 적어 봅니다",  state: "todo" },
  { n: 5, title: "카드 연결",     body: "나중에 해도 됩니다 — 카드 없이도 시작합니다", state: "todo" },
];

/** 진입 저항을 결정 전에 처리한다 — 현금은 5초인데 온보딩은 5단계다 */
export const reassurance = "지금 다 하지 않아도 됩니다. 3단계까지만 하면 아이가 오늘 시작할 수 있어요.";
