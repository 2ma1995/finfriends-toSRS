/**
 * 아바타 — 🔴 D4 미결(원장 T10). Lottie 2.5D 에셋이 없어 이모지 조합으로 세운다.
 * 에셋이 확정되면 이 컴포넌트만 갈아끼운다. 부르는 쪽은 손대지 않는다.
 */
export function Avatar({ face, hat, item }: { face: string; hat: string; item: string }) {
  return (
    <div className="relative mx-auto h-[86px] w-[86px]" aria-label="아바타">
      <span className="absolute inset-x-0 top-[14px] text-[3.2rem] leading-none">{face}</span>
      <span className="absolute inset-x-0 top-0 text-[1.5rem] leading-none">{hat}</span>
      <span className="absolute -right-1 bottom-[6px] text-[1.5rem] leading-none">{item}</span>
    </div>
  );
}
