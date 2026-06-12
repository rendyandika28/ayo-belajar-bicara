export type MissionType =
  | "play-games"
  | "learn-words"
  | "answer-correct"
  | "speak-words"
  | "complete-sentence";

export interface DailyMission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  emoji: string;
  target: number;
  reward: number;
}

const MISSION_POOL: DailyMission[] = [
  {
    id: "play-2-games",
    type: "play-games",
    title: "Bermain 2 game",
    description: "Buka 2 game berbeda hari ini",
    emoji: "\ud83c\udfae",
    target: 2,
    reward: 3,
  },
  {
    id: "learn-3-words",
    type: "learn-words",
    title: "Pelajari 3 kata baru",
    description: "Tandai 3 kata baru di Kartu Kata",
    emoji: "\ud83d\udcda",
    target: 3,
    reward: 3,
  },
  {
    id: "answer-5-correct",
    type: "answer-correct",
    title: "Jawab 5 soal benar",
    description: "Jawab 5 soal dengan benar di game apapun",
    emoji: "\u2705",
    target: 5,
    reward: 3,
  },
  {
    id: "speak-3-words",
    type: "speak-words",
    title: "Ucapkan 3 kata",
    description: "Latih pengucapan di Ayo Ngomong",
    emoji: "\ud83c\udfa4",
    target: 3,
    reward: 3,
  },
  {
    id: "build-1-sentence",
    type: "complete-sentence",
    title: "Susun 1 kalimat",
    description: "Selesaikan 1 kalimat di Susun Kalimat",
    emoji: "\ud83e\udde9",
    target: 1,
    reward: 2,
  },
];

export function getDailyMission(date: string): DailyMission {
  const today = new Date(date);
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MISSION_POOL[dayOfYear % MISSION_POOL.length];
}
