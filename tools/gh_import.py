# -*- coding: utf-8 -*-
"""GitHub 이슈 · 라벨 · 프로젝트 임포트.

  python3 tools/gh_import.py labels            라벨 생성/갱신
  python3 tools/gh_import.py issues --dry      생성될 이슈 미리보기
  python3 tools/gh_import.py issues            이슈 67건 생성 (+ 번호 매핑 저장)
  python3 tools/gh_import.py relink            본문의 #<이슈번호> 를 실제 번호로 치환
  python3 tools/gh_import.py project <번호>    프로젝트에 전건 추가 + 필드 설정
"""
import sys, os, json, subprocess, re, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tasks_data as D
from gen_task_list import build, EPIC_NAME

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = "2ma1995/finfriends-toSRS"
MAPFILE = os.path.join(ROOT, "tools", ".issue_map.json")
TASKDIR = os.path.join(ROOT, "docs", "tasks")

EPIC_COLOR = {"INF": "0E4429", "TEC": "5A1E02", "CTR": "1D3F6E", "DAT": "0B4F6C",
              "CON": "6E1423", "LRN": "3F6212", "STR": "854D0E", "PRC": "1E3A5F",
              "GRW": "14532D", "PLN": "7C2D12", "NTF": "581C87", "PTN": "334155",
              "ANA": "0F766E", "SEC": "7F1D1D", "REL": "3730A3", "TST": "4A044E", "UX": "9D174D"}
CX_COLOR = {"H": "B60205", "M": "FBCA04", "L": "0E8A16"}
TYPE_COLOR = {"contract": "1D76DB", "data": "0052CC", "read": "5319E7", "write": "B60205",
              "ui": "D93F0B", "test": "0E8A16", "infra": "5A1E02", "nfr": "6E1423", "design": "9D174D"}


def sh(args, check=True):
    r = subprocess.run(args, capture_output=True, text=True)
    if check and r.returncode:
        raise SystemExit(f"실패: {' '.join(args[:4])}…\n{r.stderr.strip()}")
    return r


def labels():
    want = [("feature", "0366D6", "SRS에서 도출한 개발 태스크")]
    want += [(f"epic:{e}", EPIC_COLOR[e], name) for e, name in D.EPICS]
    want += [(f"complexity:{k}", v, f"복잡도 {k}") for k, v in CX_COLOR.items()]
    want += [(f"type:{k}", v, f"유형 {k}") for k, v in TYPE_COLOR.items()]
    want += [(f"sprint:S{i}", "C5DEF5", f"스프린트 S{i}") for i in range(6)]
    want += [("part:backend", "1D76DB", "Part A 개발"), ("part:design", "D4C5F9", "Part B 디자인")]
    made = 0
    for name, color, desc in want:
        r = sh(["gh", "label", "create", name, "--repo", REPO, "--color", color,
                "--description", desc, "--force"], check=False)
        if r.returncode == 0: made += 1
        else: print("  ⚠", name, r.stderr.strip()[:60])
    print(f"라벨 {made}/{len(want)} 처리")


def body_of(tid):
    src = open(os.path.join(TASKDIR, tid + ".md"), encoding="utf-8").read()
    # YAML 프론트매터 제거 — 이슈 본문에는 넣지 않는다
    parts = src.split("---\n", 2)
    return parts[2].lstrip() if len(parts) >= 3 else src


def issues(dry=False):
    T = build()
    created = {}
    if os.path.exists(MAPFILE):
        created = json.load(open(MAPFILE, encoding="utf-8"))
    for t in T:
        if t["id"] in created:
            continue
        title = f"[{t['id']}] {t['title']}"
        labs = ["feature", f"epic:{t['epic']}", f"complexity:{t['cx']}",
                f"type:{t['type'].lower()}", f"sprint:{t['sprint']}",
                "part:backend" if t["part"] == "A" else "part:design"]
        if dry:
            print(f"  {t['id']:8} {t['sprint']}  {','.join(labs[1:])}  {t['title'][:44]}")
            continue
        r = sh(["gh", "issue", "create", "--repo", REPO, "--title", title,
                "--body", body_of(t["id"]), "--label", ",".join(labs)])
        num = r.stdout.strip().rsplit("/", 1)[-1]
        created[t["id"]] = int(num)
        print(f"  #{num:>4} {t['id']}")
        json.dump(created, open(MAPFILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        time.sleep(0.4)
    if not dry:
        print(f"이슈 {len(created)}건 · 매핑 저장 {MAPFILE}")


def relink():
    T = build()
    m = json.load(open(MAPFILE, encoding="utf-8"))
    for t in T:
        body = body_of(t["id"])
        def sub(mo):
            tid = mo.group(1)
            return f"#{m[tid]}" if tid in m else mo.group(0)
        new = re.sub(r'#<이슈번호> \(([A-Z]{2,3}-\d{3})\)', sub, body)
        if new == body:
            continue
        sh(["gh", "issue", "edit", str(m[t["id"]]), "--repo", REPO, "--body", new])
        print(f"  #{m[t['id']]:>4} {t['id']} 의존성 링크 연결")
        time.sleep(0.3)
    print("relink 완료")


def project(number):
    T = build()
    m = json.load(open(MAPFILE, encoding="utf-8"))
    owner = REPO.split("/")[0]
    for t in T:
        url = f"https://github.com/{REPO}/issues/{m[t['id']]}"
        sh(["gh", "project", "item-add", str(number), "--owner", owner, "--url", url])
        print(f"  + {t['id']} → 프로젝트")
        time.sleep(0.3)
    print(f"프로젝트 {number} 에 {len(T)}건 추가")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "labels": labels()
    elif cmd == "issues": issues(dry="--dry" in sys.argv)
    elif cmd == "relink": relink()
    elif cmd == "project": project(sys.argv[2])
    else: print(__doc__)
