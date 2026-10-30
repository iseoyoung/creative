// Organ boundaries and attachment points on the supplied mature illustrations.
// Each piece keeps its source coordinates: the plant never changes position or
// proportions when it grows. Source PNGs remain unchanged.
export const GROWTH_DURATION = 16000
export const STAGE_DURATIONS = [3600, 3800, 3200, 5400]

export const growth = {
  lilac: {
    leaves: [
      { points: '1284,762 1370,745 1495,810 1530,985 1390,950 1300,854', origin: [1300,795], delay: 3.6, rotate: -22 },
      { points: '1300,616 1240,570 1130,565 1090,735 1195,795 1315,720', origin: [1309,690], delay: 4.3, rotate: 24 },
      { points: '1320,547 1390,520 1505,555 1530,765 1440,810 1310,675', origin: [1325,615], delay: 5.2, rotate: -18 },
    ],
    budSource: [550,130,175,210],
  },
  carnations: {
    leaves: [
      { points: '1160,660 1260,710 1290,860 1210,955 1125,920 1080,735', origin: [1230,795], delay: 3.6, rotate: 27 },
      { points: '1240,630 1350,645 1460,750 1515,940 1405,895 1300,790', origin: [1245,720], delay: 4.1, rotate: -24 },
      { points: '1240,525 1200,550 1110,535 1070,650 1130,790 1255,700', origin: [1252,625], delay: 4.8, rotate: 25 },
      { points: '1290,550 1370,565 1510,670 1540,830 1405,770 1280,650', origin: [1288,620], delay: 5.3, rotate: -22 },
    ],
    budSource: [250,145,80,125],
    budFrame: 1,
  },
  roses: {
    leaves: [
      { points: '1250,710 1340,690 1450,740 1500,925 1380,865 1270,800', origin: [1250,765], delay: 3.5, rotate: -24 },
      { points: '1265,665 1210,620 1090,630 1080,810 1185,860 1285,755', origin: [1255,730], delay: 4.1, rotate: 24 },
      { points: '1300,620 1380,585 1460,645 1500,765 1380,755 1280,700', origin: [1285,680], delay: 4.8, rotate: -20 },
      { points: '1250,520 1180,520 1060,560 1100,675 1215,655 1270,605', origin: [1260,605], delay: 5.2, rotate: 26 },
      { points: '1240,370 1160,340 1060,375 1070,450 1195,475 1260,435', origin: [1275,425], delay: 5.7, rotate: 20 },
    ],
    budSource: [535,95,100,160],
  },
}
