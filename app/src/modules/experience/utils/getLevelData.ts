import { range } from "@shared/utils/number";

export const RANK_MAX_LEVEL = 99;

export interface ExperienceLevelData {
  exp: number;
  lvl: number;
  min: number;
  max: number;
  percent: number;
}

export const getExperienceForLevel = (lvl: number): number => {
  const factor = 104;
  let a = 0;

  for (let l = 1; l < lvl; l++) {
    a += Math.floor(l + 300 * Math.pow(2, l / 7));
  }

  return Math.floor(a / factor);
};

export const getExperienceLevelData = (exp: number): ExperienceLevelData => {
  const data: ExperienceLevelData = {
    exp,
    lvl: 1,
    min: getExperienceForLevel(1),
    max: getExperienceForLevel(2),
    percent: 0,
  };

  const setExpData = (lvl: number, minExp: number, maxExp: number) => {
    data.lvl = lvl;
    data.min = minExp;
    data.max = maxExp;
    data.percent = Math.floor(range(exp, minExp, maxExp, 0, 100));
  };

  for (let lvl = 1; lvl <= RANK_MAX_LEVEL; lvl++) {
    const lvlExp = getExperienceForLevel(lvl);

    if (lvl === 1 && exp < data.max) {
      break;
    }

    if (exp < lvlExp) {
      setExpData(lvl, getExperienceForLevel(lvl - 1), lvlExp);
      break;
    }

    if (lvl === RANK_MAX_LEVEL && exp >= lvlExp) {
      setExpData(RANK_MAX_LEVEL, lvlExp, lvlExp);
      break;
    }
  }

  return data;
};
