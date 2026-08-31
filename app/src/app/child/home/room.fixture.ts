// PROTO-DATA: STR-003 · STR-005 · PRC-004 — 백엔드 완료 시 이 파일을 지우고 보유 아이템 조회로 대체한다

/**
 * 아이 방 카탈로그.
 *
 * 아이템은 두 종류다 — **붙는 것**과 **놓는 것**. 이 구분이 설계의 핵심이다.
 *   착용(`socket`)  아바타 뼈에 붙는다. 모자·가방
 *   배치(`floor`)   방 바닥에 놓는다. 가구·화분·자동차
 *   펫(`beside`)    아바타 옆에 선다
 *
 * 🔴 별은 **앱 안에서만** 쓴다. 현물·현금·제휴처 경로를 만들지 않는다 (P-21).
 */
export type Category = "wear" | "pet" | "furniture" | "nature" | "food" | "vehicle";

export const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "wear",      label: "옷장",     emoji: "🧢" },
  { key: "pet",       label: "펫",       emoji: "🐾" },
  { key: "furniture", label: "가구",     emoji: "🛏" },
  { key: "nature",    label: "화분",     emoji: "🌷" },
  { key: "food",      label: "먹을 것",  emoji: "🍰" },
  { key: "vehicle",   label: "탈것",     emoji: "🚗" },
];

export type Placement =
  | { kind: "socket"; socket: "head" | "back" }
  | { kind: "floor"; x: number; z: number; ry?: number }
  | { kind: "beside" };

export type Item = {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  /** null 이면 도형으로 그린다 (모자·가방) */
  readonly model: string | null;
  /** 월드 기준 최대 변 길이 — kit 마다 원본 스케일이 달라 여기서 통일한다 */
  readonly size: number;
  readonly cost: number;
  readonly owned: boolean;
  readonly placement: Placement;
};

export const CATALOG: readonly Item[] = [
  // 착용 — 소켓에 붙는다. 도형으로 그린다
  { id: "cap", name: "모자", category: "wear", model: null, size: 0, cost: 5, owned: true, placement: { kind: "socket", socket: "head" } },
  { id: "bag", name: "가방", category: "wear", model: null, size: 0, cost: 8, owned: true, placement: { kind: "socket", socket: "back" } },

  // pet
  { id: "cat", name: "고양이", category: "pet", model: "/models/pets/animal-cat.glb", size: 1.5, cost: 20, owned: true, placement: { kind: "beside" } },
  { id: "dog", name: "강아지", category: "pet", model: "/models/pets/animal-dog.glb", size: 1.5, cost: 20, owned: false, placement: { kind: "beside" } },
  { id: "bunny", name: "토끼", category: "pet", model: "/models/pets/animal-bunny.glb", size: 1.3, cost: 25, owned: false, placement: { kind: "beside" } },
  { id: "fox", name: "여우", category: "pet", model: "/models/pets/animal-fox.glb", size: 1.5, cost: 30, owned: false, placement: { kind: "beside" } },
  { id: "penguin", name: "펭귄", category: "pet", model: "/models/pets/animal-penguin.glb", size: 1.4, cost: 35, owned: false, placement: { kind: "beside" } },
  { id: "panda", name: "판다", category: "pet", model: "/models/pets/animal-panda.glb", size: 1.6, cost: 45, owned: false, placement: { kind: "beside" } },
  { id: "koala", name: "코알라", category: "pet", model: "/models/pets/animal-koala.glb", size: 1.4, cost: 40, owned: false, placement: { kind: "beside" } },
  { id: "parrot", name: "앵무새", category: "pet", model: "/models/pets/animal-parrot.glb", size: 1.2, cost: 28, owned: false, placement: { kind: "beside" } },
  { id: "deer", name: "사슴", category: "pet", model: "/models/pets/animal-deer.glb", size: 1.7, cost: 50, owned: false, placement: { kind: "beside" } },
  { id: "tiger", name: "호랑이", category: "pet", model: "/models/pets/animal-tiger.glb", size: 1.7, cost: 60, owned: false, placement: { kind: "beside" } },
  { id: "hog", name: "멧돼지", category: "pet", model: "/models/pets/animal-hog.glb", size: 1.5, cost: 38, owned: false, placement: { kind: "beside" } },

  // furniture
  { id: "bed", name: "침대", category: "furniture", model: "/models/furniture/bedSingle.glb", size: 3.4, cost: 12, owned: true, placement: { kind: "floor", x: -2.9, z: -1.4, ry: 90 } },
  { id: "desk", name: "책상", category: "furniture", model: "/models/furniture/desk.glb", size: 2.6, cost: 10, owned: true, placement: { kind: "floor", x: 2.7, z: -1.7, ry: 0 } },
  { id: "chair", name: "의자", category: "furniture", model: "/models/furniture/chairDesk.glb", size: 1.5, cost: 6, owned: true, placement: { kind: "floor", x: 2.5, z: -0.5, ry: 180 } },
  { id: "rug", name: "러그", category: "furniture", model: "/models/furniture/rugRounded.glb", size: 3.2, cost: 9, owned: false, placement: { kind: "floor", x: 0, z: 0.9, ry: 0 } },
  { id: "bookcase", name: "책장", category: "furniture", model: "/models/furniture/bookcaseOpen.glb", size: 2.4, cost: 14, owned: false, placement: { kind: "floor", x: 0.2, z: -2.8, ry: 0 } },
  { id: "sofa", name: "소파", category: "furniture", model: "/models/furniture/loungeSofa.glb", size: 2.6, cost: 20, owned: false, placement: { kind: "floor", x: -3.2, z: 0.9, ry: 60 } },
  { id: "tv", name: "티비장", category: "furniture", model: "/models/furniture/cabinetTelevision.glb", size: 2.2, cost: 18, owned: false, placement: { kind: "floor", x: -0.6, z: -2.9, ry: 0 } },
  { id: "lamp", name: "스탠드", category: "furniture", model: "/models/furniture/lampRoundTable.glb", size: 1.0, cost: 7, owned: false, placement: { kind: "floor", x: 3.4, z: -2.5, ry: 0 } },
  { id: "floorlamp", name: "플로어램프", category: "furniture", model: "/models/furniture/lampSquareFloor.glb", size: 2.0, cost: 11, owned: false, placement: { kind: "floor", x: -3.6, z: -2.0, ry: 0 } },
  { id: "fridge", name: "냉장고", category: "furniture", model: "/models/furniture/kitchenFridgeSmall.glb", size: 1.8, cost: 16, owned: false, placement: { kind: "floor", x: 3.7, z: -3.0, ry: 0 } },
  { id: "bench", name: "벤치", category: "furniture", model: "/models/furniture/bench.glb", size: 2.0, cost: 8, owned: false, placement: { kind: "floor", x: 3.4, z: 1.4, ry: -40 } },
  { id: "pillow", name: "쿠션", category: "furniture", model: "/models/furniture/pillowBlue.glb", size: 0.8, cost: 3, owned: false, placement: { kind: "floor", x: -2.6, z: -0.3, ry: 0 } },
  { id: "books", name: "책", category: "furniture", model: "/models/furniture/books.glb", size: 0.7, cost: 3, owned: false, placement: { kind: "floor", x: 2.6, z: -1.4, ry: 0 } },
  { id: "laptop", name: "노트북", category: "furniture", model: "/models/furniture/laptop.glb", size: 0.7, cost: 13, owned: false, placement: { kind: "floor", x: 2.9, z: -1.5, ry: 0 } },
  { id: "plant", name: "화분", category: "furniture", model: "/models/furniture/plantSmall1.glb", size: 0.9, cost: 5, owned: false, placement: { kind: "floor", x: -3.8, z: -0.8, ry: 0 } },
  { id: "rug2", name: "네모 러그", category: "furniture", model: "/models/furniture/rugRectangle.glb", size: 3.0, cost: 9, owned: false, placement: { kind: "floor", x: 0, z: 1.1, ry: 0 } },

  // nature
  { id: "flower-red", name: "빨간 꽃", category: "nature", model: "/models/nature/flower_redA.glb", size: 0.9, cost: 4, owned: true, placement: { kind: "floor", x: -1.7, z: 1.3, ry: 0 } },
  { id: "flower-yellow", name: "노란 꽃", category: "nature", model: "/models/nature/flower_yellowB.glb", size: 0.9, cost: 4, owned: false, placement: { kind: "floor", x: 1.7, z: 1.3, ry: 0 } },
  { id: "flower-purple", name: "보라 꽃", category: "nature", model: "/models/nature/flower_purpleA.glb", size: 0.9, cost: 4, owned: false, placement: { kind: "floor", x: -1.2, z: 1.7, ry: 0 } },
  { id: "cactus", name: "선인장", category: "nature", model: "/models/nature/cactus_short.glb", size: 1.0, cost: 6, owned: false, placement: { kind: "floor", x: 3.5, z: 0.5, ry: 0 } },
  { id: "cactus-tall", name: "키큰 선인장", category: "nature", model: "/models/nature/cactus_tall.glb", size: 1.5, cost: 9, owned: false, placement: { kind: "floor", x: 3.9, z: -0.4, ry: 0 } },
  { id: "grass", name: "풀", category: "nature", model: "/models/nature/grass_large.glb", size: 0.8, cost: 2, owned: false, placement: { kind: "floor", x: -3.5, z: 1.0, ry: 0 } },
  { id: "tree", name: "작은 나무", category: "nature", model: "/models/nature/tree_small.glb", size: 2.4, cost: 15, owned: false, placement: { kind: "floor", x: -4.0, z: 1.9, ry: 0 } },
  { id: "mushroom", name: "버섯", category: "nature", model: "/models/nature/mushroom_red.glb", size: 0.6, cost: 3, owned: false, placement: { kind: "floor", x: 1.2, z: 1.9, ry: 0 } },
  { id: "stone", name: "돌", category: "nature", model: "/models/nature/stone_smallA.glb", size: 0.7, cost: 2, owned: false, placement: { kind: "floor", x: -0.8, z: 2.0, ry: 0 } },
  { id: "log", name: "통나무", category: "nature", model: "/models/nature/log.glb", size: 1.4, cost: 5, owned: false, placement: { kind: "floor", x: 4.0, z: 1.9, ry: 20 } },

  // food
  { id: "cake", name: "케이크", category: "food", model: "/models/food/cake.glb", size: 0.9, cost: 10, owned: false, placement: { kind: "floor", x: 2.7, z: -1.1, ry: 0 } },
  { id: "donut", name: "도넛", category: "food", model: "/models/food/donut-sprinkles.glb", size: 0.6, cost: 5, owned: false, placement: { kind: "floor", x: 2.1, z: -1.0, ry: 0 } },
  { id: "icecream", name: "아이스크림", category: "food", model: "/models/food/ice-cream.glb", size: 0.7, cost: 6, owned: false, placement: { kind: "floor", x: 3.2, z: -1.0, ry: 0 } },
  { id: "cookie", name: "쿠키", category: "food", model: "/models/food/cookie-chocolate.glb", size: 0.5, cost: 3, owned: false, placement: { kind: "floor", x: 2.3, z: -1.35, ry: 0 } },
  { id: "pizza", name: "피자", category: "food", model: "/models/food/pizza.glb", size: 0.9, cost: 9, owned: false, placement: { kind: "floor", x: 1.6, z: -1.2, ry: 0 } },
  { id: "hotdog", name: "핫도그", category: "food", model: "/models/food/hot-dog.glb", size: 0.7, cost: 6, owned: false, placement: { kind: "floor", x: 1.9, z: -1.5, ry: 0 } },
  { id: "pancakes", name: "팬케이크", category: "food", model: "/models/food/pancakes.glb", size: 0.7, cost: 7, owned: false, placement: { kind: "floor", x: 3.4, z: -1.4, ry: 0 } },
  { id: "strawberry", name: "딸기", category: "food", model: "/models/food/strawberry.glb", size: 0.4, cost: 2, owned: false, placement: { kind: "floor", x: 2.4, z: -0.9, ry: 0 } },
  { id: "watermelon", name: "수박", category: "food", model: "/models/food/watermelon.glb", size: 0.9, cost: 8, owned: false, placement: { kind: "floor", x: 3.6, z: -0.7, ry: 0 } },
  { id: "popsicle", name: "아이스바", category: "food", model: "/models/food/popsicle.glb", size: 0.6, cost: 4, owned: false, placement: { kind: "floor", x: 1.4, z: -0.9, ry: 0 } },

  // vehicle
  { id: "racer", name: "경주차", category: "vehicle", model: "/models/vehicle/vehicle-racer.glb", size: 1.8, cost: 22, owned: false, placement: { kind: "floor", x: -3.2, z: 1.9, ry: 30 } },
  { id: "suv", name: "승합차", category: "vehicle", model: "/models/vehicle/vehicle-suv.glb", size: 1.9, cost: 18, owned: false, placement: { kind: "floor", x: -2.2, z: 2.2, ry: 20 } },
  { id: "monster", name: "몬스터트럭", category: "vehicle", model: "/models/vehicle/vehicle-monster-truck.glb", size: 2.0, cost: 40, owned: false, placement: { kind: "floor", x: -1.2, z: 2.4, ry: 10 } },
  { id: "truck", name: "트럭", category: "vehicle", model: "/models/vehicle/vehicle-truck.glb", size: 2.1, cost: 30, owned: false, placement: { kind: "floor", x: -4.0, z: 1.2, ry: 45 } },
  { id: "speedster", name: "스피드스터", category: "vehicle", model: "/models/vehicle/vehicle-speedster.glb", size: 1.8, cost: 26, owned: false, placement: { kind: "floor", x: -0.2, z: 2.5, ry: 0 } },
  { id: "vintage", name: "클래식카", category: "vehicle", model: "/models/vehicle/vehicle-vintage-racer.glb", size: 1.8, cost: 34, owned: false, placement: { kind: "floor", x: 0.8, z: 2.4, ry: -15 } },
];

export const me = { name: "서연", starBalance: 12 };

/** 오늘 할 일 — 아이는 여기서 출발한다 */
export const todo = [
  { href: "/child/learn",    emoji: "📚", label: "오늘의 학습" },
  { href: "/child/plan/new", emoji: "📝", label: "계획 카드 적기" },
  { href: "/child/wishlist", emoji: "🎯", label: "갖고 싶은 것" },
];

/** 지금 방에 놓여 있는 것 = 가진 것 */
export const placed = CATALOG.filter((i) => i.owned);
export const equippedPet = CATALOG.find((i) => i.category === "pet" && i.owned) ?? null;

export const byCategory = (c: Category) => CATALOG.filter((i) => i.category === c);
