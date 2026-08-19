export const STAT_MAX = 100;

export const clampStat = (value: number) =>
	Math.max(0, Math.min(STAT_MAX, Math.round(value)));
