"use client";

/**
 * 상태 스위처 — 명세 §7.1
 * 🔴 프로토타입 전용. 본 개발 시 이 컴포넌트와 상단 바만 지우면 끝난다.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FIXTURES, FIXTURE_ORDER } from "@/mocks/fixtures";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FixtureSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("fixture") ?? "normal";

  return (
    <label className="flex items-center gap-2 text-[0.78rem]" style={{ color: "var(--ff-ink-2)" }}>
      상태
      <Select value={current} onValueChange={(v) => router.push(`${pathname}?fixture=${v}`)}>
        <SelectTrigger className="h-8 w-[230px] text-[0.8rem]"
                       style={{ background: "var(--ff-paper)", borderColor: "var(--ff-line-2)" }}>
          {/* SSR 시점에도 라벨이 보이게 직접 넣는다 — 기본 SelectValue는 하이드레이션 전 원시 값을 그린다 */}
          <SelectValue>{FIXTURES[current as keyof typeof FIXTURES]?.label ?? current}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FIXTURE_ORDER.map((k) => (
            <SelectItem key={k} value={k} className="text-[0.8rem]">{FIXTURES[k].label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
