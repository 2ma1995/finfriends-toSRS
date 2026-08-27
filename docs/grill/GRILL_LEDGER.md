# Grill Ledger — 로컬 시각 프로토타입 착수 전 결정

**세션 시작:** 2026-08-26
**참조 범위:** `docs/plan-docs/prototype-local-scope.md` · `prototype-suggestion.md` · `docs/tasks/{INF-001,INF-002,UX-001,UX-002,UX-004,UX-006,MCK-001,GRW-003,GRW-005,PLN-004}.md` · `docs/tech-design-docs/[SRS]FinFriends-SRS-v1_0.md`
**관심 방향:** 로컬 시각 프로토타입의 (1) 합의 확인 (2) 착수 전 미확정 사항 해소
**OUTPUT:** `docs/plan-docs/[Spec]Prototype-Visual-Plan.md` (신규) + 하네스 스킬 401 + 앱 구현

**상태:** ■ **CLOSED** — 세션 3 (2026-08-27) `/goal` 완료 · 12/12 결정
**재개:** 새 질문이 생기면 새 토픽 T13부터 추가한다. RESOLVED 토픽은 다시 묻지 않는다.

```
RESOLVED: 12 / TOTAL: 12
CORE: 7
MINOR: 5
- [x] T1 | CORE  | 확인할 화면 상태 목록 | status:RESOLVED | decision:상태 6종(정상·실천0건·정체14일·첫달·계획넘김·승인대기) · 화면 3종(나무·대조·숲) | applied:[Spec]…§1
- [x] T2 | CORE  | 화면별 정보 구조 — 슬롯 순서와 필수 항목 | depends:T1 | status:RESOLVED | decision:슬롯 순서를 화면 3종 모두 고정 — 나무 5슬롯(①헤더 ②4영역 2×2 ③정체 원인 ④승인 대기 ⑤실천 근거) · 대조 5슬롯 · 숲 4슬롯 | applied:[Spec]…§2 · app/src/components/proto/screens.tsx
- [x] T3 | CORE  | 카피 규약 | status:RESOLVED | decision:기존 아트보드 문구를 정본으로 승계 · D3(콘텐츠 원고) 미결이 프로토타입을 막지 않음 | applied:[Spec]…§3
- [x] T4 | CORE  | 디자인 토큰 실제 값 | status:RESOLVED | decision:아트보드에서 추출 — 크림 #FAF7F1 · 딥그린 #4F7A4A · 테라코타 #B36B3A · 라이트 전용 · 시스템 한글 스택 | applied:[Spec]…§4
- [x] T5 | MINOR | shadcn 컴포넌트 인벤토리 | depends:T1 | status:RESOLVED | decision:7종만 설치 — alert · badge · button · card · progress · select · separator. 목록 밖은 추가 전에 사람에게 묻는다 | applied:[Spec]…§5 · app/src/components/ui/
- [x] T6 | CORE  | 픽스처 데이터의 실체 | status:RESOLVED | decision:아트보드 값 그대로 — 서연·3월·다이소 성수점·문구 5,000원 | applied:[Spec]…§6
- [x] T7 | MINOR | 확인 도구 — 상태 스위처와 뷰포트 | status:RESOLVED | decision:화면 상단 드롭다운 · 모바일 390px 고정 · 데스크톱 가운데 정렬 | applied:[Spec]…§7
- [x] T8 | MINOR | 코드 위치 | status:RESOLVED | decision:같은 저장소 app/ 하위 · node_modules gitignore | applied:.gitignore · app/
- [x] T9 | CORE  | 나무 단계 수 (D6 미결 사양) | status:RESOLVED | decision:3단계 씨앗·새싹·나무로 진행하고 화면에 「예시값」 표시 · D6은 계속 미결로 둔다 | applied:[Spec]…§2 · 화면 고지
- [x] T10| MINOR | 아바타 에셋 부재 (D4 미결 사양) | status:RESOLVED | decision:아동 홈 화면을 범위에서 제외 — 지금 만들면 D4 확정 후 다시 만든다 | applied:prototype-local-scope.md §9
- [x] T11| CORE  | 명세 §4에 없는 색 4종이 코드에 하드코딩됨 | status:RESOLVED | decision:토큰으로 승격 — `--ff-clay-line` `--ff-gold-d` `--ff-gold-bg` `--ff-gold-bg-2`. 명세 §4 표에 추가해 단일 원천을 되돌린다 | applied:[Spec]…§4 · app/src/app/globals.css · screens.tsx
- [x] T12| CORE  | 첫 달(F4)의 나무가 정상(F1)과 같은 슬롯을 씀 | status:RESOLVED | decision:첫 달 전용 슬롯을 만든다 — 벌기 새싹 55% · 잘 쓰기 씨앗 30% · 모으기 씨앗 15%. 숲의 「별 12개 · 첫 달」과 앞뒤가 맞아야 한다 | applied:[Spec]…§6.2.1 · app/src/mocks/fixtures.ts · reports/proto/p1-first.png
```

---

## 세션 2 결정 (2026-08-27)

### T2 — 화면별 정보 구조 <!-- CORE --> · RESOLVED

**왜 필요했나** — 상태 6종은 정했지만 **각 화면에 무엇이 어떤 순서로 있는지**가 비어 있었다.
그대로 착수하면 에이전트가 슬롯 순서를 매번 다르게 만들고, **세 화면이 서로 다른 규칙**을 갖는다.

특히 **성장 나무 카드**가 이 제품의 핵심 화면이다. 걸린 조건 셋:

| 조건 | 근거 | 어떻게 반영했나 |
| --- | --- | --- |
| 실천 근거가 **기본 노출**돼야 한다 (펼치지 않아도) | REQ-FUNC-001 · AC-1.2 | 슬롯 ⑤를 접히지 않는 블록으로 고정 |
| 정체 시 **미충족 조건 전부** 표시 · 가장 적게 남은 것 최상단 | ACE-3.1 | 슬롯 ③에 `<ol>` 로 전부 나열 · 배열 0번을 굵게 |
| 5초 노출로 **변화가 회상**돼야 한다 | AC-1.1 `≥ 6/8` | 4영역을 2×2로 한 화면에 · 스크롤 없이 |

**결정** — 슬롯 순서를 명세 §2에 고정하고, 코드에서도 순서를 바꿀 수 없게 한 컴포넌트에 붙였다.

| 화면 | 슬롯 순서 |
| --- | --- |
| P1 성장 나무 | ① 헤더(아이·주기) → ② 4영역 2×2 → ③ 정체 원인(조건부) → ④ 승인 대기(조건부) → ⑤ 실천 근거 |
| P2 계획↔실제 | ① 헤더(시점·가맹점) → ② 2열 대조 → ③ 회고 문장 → ④ ⭐ 결과 → ⑤ 「확인했어요」 |
| P3 월간 숲 | ① 한 줄 요약 → ② 획득 별 → ③ 「지난달과 비교」 → ④ 델타 목록 |

조건부 슬롯은 **자리를 비워두지 않는다** — 해당 없으면 렌더하지 않고 아래 슬롯이 올라온다.

### T5 — shadcn 컴포넌트 인벤토리 <!-- MINOR --> · RESOLVED

**왜 필요했나** — C-TEC-004가 shadcn/ui를 못 박았고, D-08이 **자체 구현을 금지**한다.
설치 목록이 없으면 에이전트가 없는 컴포넌트를 직접 만든다.

**결정** — 화면 3종이 실제로 쓰는 **7종만** 설치했다. 스타일 프리셋은 `base-nova`.

`alert` · `badge` · `button` · `card` · `progress` · `select` · `separator`

목록 밖 컴포넌트가 필요해지면 **추가하기 전에 사람에게 묻는다.** 직접 만들지 않는다.

> 실제 구현에서 `card` · `progress` · `alert` 는 화면 안에서 쓰이지 않았다.
> 폰 프레임 안의 밀도(390px 폭에 카드 4장)를 맞추려면 패딩을 전부 덮어써야 해서,
> 프레임 내부는 토큰 기반 소형 블록으로 직접 짰다. **설치는 유지**한다 — 본 개발에서 쓸 자리가 있다.

---

## 이해 확인 (세션 1 · 2026-08-26)

착수 전 **오해하기 쉬운 4가지**를 제시하고 이견이 없음을 확인했다.

| # | 확인한 것 | 흔한 오해 |
| :-: | --- | --- |
| ① | 이 작업은 **태스크를 닫지 않는다** — 각 태스크의 *일부*만 떼어 쓴다 | "L1~L6 끝내면 INF-001·UX-001 완료" |
| ② | 목 데이터는 **나중에 지운다** — 화면 코드는 이어지지만 목은 교체 대상 | "이게 그대로 개발로 이어진다" |
| ③ | 화면 3개 중 **일부만 해도 된다** — 나무·대조가 핵심 | "3개를 다 해야 의미가 있다" |
| ④ | 목표는 **실험 4개의 답** — E1이 3/8이면 다시 그리는 게 성과 | "예쁜 화면을 만드는 것" |

---

## 해소된 블로커

| 의심했던 블로커 | 실제 |
| --- | --- |
| **회고 문장이 없다** (D3 콘텐츠 원고 미결) | ❌ 블로커 아님 — **기존 아트보드에 한글 문구가 이미 있다**. *"적은 대로 잘 썼어요"* · *"계획보다 N원 더 썼어요"* · *"퀴즈만으로는 자라지 않습니다"* |

문장 풀의 **다양성**(재노출률 ≤ 2/8)은 운영 4주 실측 대상이라 프로토타입 범위 밖이다.

---

## 미결 사양과의 관계

프로토타입은 **미결을 확정하지 않는다.** 회피하거나 예시값으로 진행하고, 그 사실을 화면에 남긴다.

| 미결 | 프로토타입 처리 | 확정 시점 |
| :-: | --- | --- |
| **D4** 아바타 사양 | 아동 홈 **제외**로 회피 | 제작 착수 전 |
| **D6** 나무 단계 수치 | 3단계 **예시값** · 화면에 명시 | 프로토타입 착수 전(본 개발) |
| **D3** 콘텐츠 원고 | 아트보드 문구로 **해소** | LRN-001 착수 전 |
| D1 · D2 · D5 · D-01~03 | 이번 범위와 **무관** | — |

---

## 원장 사용 규칙

| # | 규칙 |
| :-: | --- |
| 1 | **RESOLVED 토픽은 다시 묻지 않는다.** 뒤집으려면 새 토픽으로 올린다 |
| 2 | 명세에 없는 화면 요소가 필요해 보이면 **만들지 말고 토픽으로 올린다** |
| 3 | 결정에는 반드시 `applied:` 를 적는다 — **어디에 반영됐는지** 추적할 수 있어야 한다 |
| 4 | 미결 사양(D1~D6)을 **원장에서 확정하지 않는다.** 프로토타입 처리 방식만 정한다 |

---

## 산출물 (세션 2 종료 시점)

| 무엇 | 어디 |
| --- | --- |
| 명세 | `docs/plan-docs/[Spec]Prototype-Visual-Plan.md` |
| 하네스 규칙 | `.agents/skills/401-prototype-visual-rules/SKILL.md` |
| 앱 | `app/` — Next.js 16 · Tailwind v4 · shadcn `base-nova` |
| 목 픽스처 | `app/src/mocks/{types.ts,fixtures.ts}` — 상태 6종 |
| 화면 | `app/src/components/proto/{phone-frame,fixture-switcher,screens}.tsx` |
| 상태 스크린샷 | `reports/proto/` — 화면별 9장 + 전경 3장 |
| 촬영 스크립트 | `tools/shoot_proto.sh` · `tools/trim_shots.py` |

---

## `/goal` 실행 결과 (2026-08-27 · OPS-FINFRIENDS-GOAL-001 v1.2)

실행 기록: [`docs/ops-docs/goal-runs/2026-08-27T1500-proto-local-visual.md`](../ops-docs/goal-runs/2026-08-27T1500-proto-local-visual.md)

| 라운드 | 걸린 것 | 조치 |
| :-: | --- | --- |
| R1 | 게이트 3 실패 — `.tsx` 에 색상 리터럴 5건 | 토큰 4종으로 승격 (T11) |
| R2 | **게이트는 통과했는데 화면이 깨짐** — `globals.css` 에 토큰 정의 누락 | 정의 추가 · 게이트 3을 `verify_tokens.py` 로 교체(v1.1) |
| R3 | 5축 NO-GO 2건 — ① §3.2 F4·P3 문구가 컴포넌트에 박힘 ② `first` 나무가 `normal` 과 동일 | 문구를 픽스처로 회수 · 첫 달 전용 슬롯 (T12) · 게이트 6 신설 · 13장(v1.2) |
| R4 | — | 게이트 6종 통과 · 5축 전건 GO |

**R2가 이 작업의 교훈이다.** 리터럴 수를 세는 게이트는 리터럴을 지우면 통과한다.
지운 자리가 정의된 토큰인지는 아무도 보지 않았고, 별 카드 그러데이션이 사라진 채로 통과했다.
**세는 게이트는 세는 것만 막는다.**

STOP REASON: EVAL_GO
