#!/bin/zsh
# 프로토타입 상태 스크린샷 촬영 — 명세 §7.3
#
# 쓰는 법:
#   cd app && npm run build && npx next start -p 4312 &
#   tools/shoot_proto.sh
#
# 왜 개발 서버가 아니라 프로덕션 서버인가 —
#   next dev 의 HMR 웹소켓이 열려 있으면 헤드리스 크롬의 --virtual-time-budget 이
#   만료되지 않아 프로세스가 끝나지 않는다. 빌드 후 next start 로 띄운다.
set -e

ROOT="${0:a:h:h}"
OUT="$ROOT/reports/proto"
TMP="${TMPDIR:-/tmp}/ff-shoot.$$"
PORT="${PORT:-4312}"
CH="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

[[ -x "$CH" ]] || { echo "크롬을 찾지 못했다: $CH  (CHROME=... 로 지정)"; exit 1 }
curl -sf -o /dev/null "http://localhost:$PORT/" || { echo "서버가 없다: localhost:$PORT"; exit 1 }

mkdir -p "$OUT" "$TMP"
trap 'rm -rf "$TMP"' EXIT

# shoot <파일명> <screen> <fixture> <폭>
shoot() {
  local png="$OUT/$1.png" url="http://localhost:$PORT/?fixture=$3&shot=$2" prof="$TMP/$1"
  [[ "$2" == "all" ]] && url="http://localhost:$PORT/?fixture=$3"
  rm -f "$png"
  "$CH" --headless --disable-gpu --hide-scrollbars --no-first-run --no-default-browser-check \
        --user-data-dir="$prof" --virtual-time-budget=2500 --force-device-scale-factor=2 \
        --window-size=$4,1500 --screenshot="$png" "$url" >/dev/null 2>&1 &
  local pid=$!
  for i in $(seq 1 30); do sleep 1; [[ -s "$png" ]] && break; done
  sleep 1; kill $pid 2>/dev/null || true; wait $pid 2>/dev/null || true
  printf '  %s\n' "$1.png"
}

echo "화면별 10장"
shoot p1-normal  p1 normal  452
shoot p1-empty   p1 empty   452
shoot p1-stall   p1 stall   452
shoot p1-pending p1 pending 452
shoot p1-first   p1 first   452
shoot p2-normal  p2 normal  452
shoot p2-over    p2 over    452
shoot p2-empty   p2 empty   452
shoot p3-normal  p3 normal  452
shoot p3-first   p3 first   452

echo "전경 3장"
shoot overview-normal all normal 1340
shoot overview-stall  all stall  1340
shoot overview-over   all over   1340

echo "하단 여백 정리"
python3 "$ROOT/tools/trim_shots.py" "$OUT"
