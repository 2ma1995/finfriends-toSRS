/**
 * 화면 3종 — 명세 §2. 슬롯 순서를 바꾸지 않는다.
 * P1 성장 나무 · P2 계획↔실제 대조 · P3 월간 숲
 */
import type { TreeView, ReviewView, ForestView } from "@/mocks/types";
import { PhoneFrame, EmptyNotice } from "./phone-frame";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

/* ── P1 성장 나무 — 슬롯 ①~⑤ 순서 고정 (명세 §2.1) ────────── */
export function TreeScreen({ v }: { v: TreeView }) {
  return (
    <PhoneFrame role="부모 화면" title="성장 나무" sub={`${v.childName} · ${v.cycleLabel}`}>
      {/* ② 4영역 2×2 */}
      <div className="grid grid-cols-2 gap-[9px]">
        {v.slots.map((s) => (
          <div key={s.topic} className="rounded-[13px] border px-[11px] py-3 text-center"
               style={{ background: s.stalled ? "var(--ff-clay-bg)" : "var(--ff-paper)",
                        borderColor: s.stalled ? "#E5CDB8" : "var(--ff-line)" }}>
            <div className="text-[1.75rem] leading-[1.1]">{s.icon}</div>
            <div className="mt-[5px] text-[0.79rem] font-bold">{s.name}</div>
            <div className="text-[0.68rem]" style={{ color: "var(--ff-ink-3)" }}>{s.stageLabel}</div>
            <div className="mt-2 h-[5px] overflow-hidden rounded-full" style={{ background: "var(--ff-line)" }}>
              <i className="block h-full rounded-full"
                 style={{ width: `${s.percent}%`, background: "var(--ff-green-l)" }} />
            </div>
            <div className="mt-[6px] text-[0.65rem] leading-[1.45]" style={{ color: "var(--ff-ink-2)" }}>
              {s.condition}
            </div>
          </div>
        ))}
      </div>

      {/* ③ 정체 원인 — 조건부. 전부 표시하고 가장 적게 남은 것이 최상단 */}
      {v.stall ? (
        <div className="mt-[9px] rounded-[11px] border px-3 py-[11px]"
             style={{ background: "var(--ff-clay-bg)", borderColor: "#E5CDB8" }}>
          <h4 className="mb-[5px] text-[0.72rem] font-bold" style={{ color: "var(--ff-clay)" }}>
            🛑 {v.stall.topic}
          </h4>
          <ol className="list-decimal pl-4 text-[0.75rem] leading-[1.7]" style={{ color: "var(--ff-ink-2)" }}>
            {v.stall.reasons.map((r, i) => (
              <li key={r} style={i === 0 ? { color: "var(--ff-ink)", fontWeight: 700 } : undefined}>{r}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* ④ 승인 대기 — 조건부 */}
      {v.pendingCount > 0 ? (
        <div className="mt-[9px] flex items-center justify-between rounded-[11px] border px-3 py-[9px] text-[0.75rem]"
             style={{ background: "var(--ff-sand)", borderColor: "var(--ff-line-2)", color: "var(--ff-ink-2)" }}>
          <span>승인을 기다리는 미션</span>
          <b style={{ color: "var(--ff-clay)" }}>{v.pendingCount}건</b>
        </div>
      ) : null}

      {/* ⑤ 실천 근거 — 기본 노출. 접지 않는다 (AC-1.2) */}
      {v.evidence ? (
        <div className="mt-[11px] rounded-[11px] border px-3 py-[11px]"
             style={{ background: "var(--ff-green-bg)", borderColor: "var(--ff-green-p)" }}>
          <h4 className="mb-1 text-[0.72rem] tracking-[0.03em]" style={{ color: "var(--ff-green-d)" }}>
            {v.evidence.title}
          </h4>
          <p className="text-[0.8rem] leading-[1.6]">{v.evidence.lines.map((l) => <span key={l} className="block">{l}</span>)}</p>
        </div>
      ) : null}

      {v.emptyNotice ? (
        <div className="mt-[11px]"><EmptyNotice emoji="🌱" {...v.emptyNotice} /></div>
      ) : null}

      {/* D6 미결 고지 — 확정 사양으로 오해하지 않게 (명세 §2.1) */}
      <p className="mt-3 text-[0.64rem]" style={{ color: "var(--ff-ink-3)" }}>
        나무 단계 수는 예시값입니다 · 미확정 사양
      </p>
    </PhoneFrame>
  );
}

/* ── P2 계획↔실제 대조 (명세 §2.2) ────────────────────────── */
export function ReviewScreen({ v }: { v: ReviewView }) {
  const met = v.match === "MET";
  return (
    <PhoneFrame role="아이 화면" title="계획 ↔ 실제" sub={v.whenLabel}>
      {v.emptyNotice ? <EmptyNotice emoji="📝" {...v.emptyNotice} /> : (
        <>
          {/* ② 2열 대조 */}
          <div className="grid grid-cols-2 gap-[9px]">
            {([["적어둔 것", v.planned], ["실제로 쓴 것", v.actual]] as const).map(([head, lines]) => (
              <div key={head} className="rounded-[13px] border p-3"
                   style={{ background: "var(--ff-paper)", borderColor: "var(--ff-line)" }}>
                <h4 className="mb-2 text-[0.71rem] tracking-[0.04em]" style={{ color: "var(--ff-ink-3)" }}>{head}</h4>
                {(lines ?? []).map((l) => (
                  <div key={l.label} className="flex justify-between py-1 text-[0.79rem] leading-[1.5]"
                       style={l.unplanned ? { color: "var(--ff-clay)", fontWeight: 700 } : undefined}>
                    <span>{l.icon} {l.label}</span><span>{won(l.amount)}</span>
                  </div>
                ))}
                <div className="mt-[7px] flex justify-between border-t pt-[7px] text-[0.83rem] font-bold"
                     style={{ borderColor: "var(--ff-line)",
                              color: head === "실제로 쓴 것" && !met ? "var(--ff-clay)" : undefined }}>
                  <span>합계</span>
                  <span>{won((lines ?? []).reduce((a, b) => a + b.amount, 0))}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ③④ 회고 문장 + ⭐ — 넘김에도 문장은 똑같이 제시한다 */}
          <div className="mt-[11px] rounded-[13px] border p-[14px]"
               style={{ background: met ? "var(--ff-green-bg)" : "var(--ff-clay-bg)",
                        borderColor: met ? "var(--ff-green-p)" : "#E5CDB8" }}>
            <p className="ff-serif mb-[10px] text-[1rem] leading-[1.6]">
              {v.retroLines.map((l) => <span key={l} className="block">{l}</span>)}
            </p>
            <div className="text-[0.78rem] font-bold"
                 style={{ color: met ? "var(--ff-green-d)" : "var(--ff-clay)" }}>{v.starLabel}</div>
          </div>

          {/* ⑤ 아이가 하는 유일한 조작 */}
          <button className="mt-[11px] w-full rounded-[11px] py-[11px] text-[0.87rem] font-bold text-white"
                  style={{ background: "var(--ff-green)" }}>확인했어요</button>
        </>
      )}
    </PhoneFrame>
  );
}

/* ── P3 월간 숲 (명세 §2.3) ───────────────────────────────── */
export function ForestScreen({ v }: { v: ForestView }) {
  return (
    <PhoneFrame role="부모 화면 · 월말 기록" title={v.title} sub="서연">
      {v.emptyNotice ? <EmptyNotice emoji="🌲" {...v.emptyNotice} /> : (
        <>
          {/* ① 한 줄 요약 */}
          <div className="ff-serif rounded-[13px] border p-[14px] text-center text-[1rem] leading-[1.55]"
               style={{ background: "var(--ff-sand)", borderColor: "var(--ff-line-2)" }}>
            <span className="block text-[0.72rem]" style={{ color: "var(--ff-ink-3)" }}>이번 달 한 줄</span>
            <b>{v.oneLine}</b>
          </div>

          {/* ② 획득 별 — 스크롤 없이 (AC-1.4) */}
          <div className="mt-[9px] rounded-[13px] border p-[13px] text-center"
               style={{ background: "linear-gradient(180deg,#FDF6E8,#F7EAD2)", borderColor: "var(--ff-gold)" }}>
            <b className="block text-[1.7rem] tabular-nums" style={{ color: "#B8862F" }}>{v.starsEarned}</b>
            <span className="text-[0.73rem]" style={{ color: "var(--ff-ink-2)" }}>이번 달 획득 별</span>
          </div>

          {/* ③④ 델타 — 첫 달이면 0으로 그리지 않는다 (ACE-1.2) */}
          <div className="mt-[9px]">
            <h4 className="mb-[7px] text-[0.72rem] tracking-[0.04em]" style={{ color: "var(--ff-ink-3)" }}>지난달과 비교</h4>
            {v.noPrevMonth ? (
              <EmptyNotice emoji="📅" title="다음 달부터 비교할 수 있어요" body="이번 달이 첫 기준이 됩니다" />
            ) : v.deltas.map((d) => (
              <div key={d.label} className="mb-[5px] flex items-center justify-between rounded-[9px] border px-[11px] py-[7px] text-[0.79rem]"
                   style={{ background: "var(--ff-paper)", borderColor: "var(--ff-line)" }}>
                <span>{d.label}</span>
                <span className="font-bold tabular-nums" style={{ color: d.improved ? "var(--ff-green-d)" : undefined }}>
                  {d.from} → {d.to}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </PhoneFrame>
  );
}
