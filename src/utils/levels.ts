export const calculateLevel = (lifetimePoints: number) => {
  if (lifetimePoints < 50) return 1;
  if (lifetimePoints < 150) return 2;
  if (lifetimePoints < 300) return 3;
  if (lifetimePoints < 500) return 4;
  return 5;
};

export const getLevelProgress = (points: number) => {
  if (points < 50) return { min: 0, max: 50, percent: (points / 50) * 100 };
  if (points < 150) return { min: 50, max: 150, percent: ((points - 50) / 100) * 100 };
  if (points < 300) return { min: 150, max: 300, percent: ((points - 150) / 150) * 100 };
  if (points < 500) return { min: 300, max: 500, percent: ((points - 300) / 200) * 100 };
  return { min: 500, max: 1000, percent: 100 };
};
