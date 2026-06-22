const COVER = "/images/music/music-track-cover.png";

const TITLE_POOL = [
  "مترسک",
  "چتر",
  "بارون",
  "دریا",
  "کوچه",
  "شب",
  "ستاره",
  "خواب",
  "سکوت",
  "کافه",
  "رویا",
  "سفر",
  "قلب",
  "پنجره",
  "راه",
  "دستات",
  "آسمون",
  "دل",
  "نور",
  "خاطره",
];

const ARTIST_POOL = [
  "عرفان طهماسبی",
  "محسن یگانه",
  "هوروش بند",
  "همایون شجریان",
  "رضا صادقی",
  "سیروان خسروی",
];

const STATUS_POOL = [
  null,
  "requested",
  "mineRequested",
  null,
  null,
  "requested",
];

function buildTracks({ prefix, count, seed = 0, activeIndex = -1 }) {
  return Array.from({ length: count }, (_, index) => {
    const i = index + seed;
    return {
      id: `${prefix}-${index + 1}`,
      title: `${TITLE_POOL[i % TITLE_POOL.length]}${index % 4 === 0 ? ` ${index + 1}` : ""}`,
      subtitle: ARTIST_POOL[i % ARTIST_POOL.length],
      image: COVER,
      status: STATUS_POOL[i % STATUS_POOL.length],
      active: index === activeIndex,
      requestable: true,
    };
  });
}

export const playlistTracks = buildTracks({
  prefix: "playlist",
  count: 100,
  seed: 0,
  activeIndex: 0,
});

export const requestModalTracks = buildTracks({
  prefix: "modal",
  count: 100,
  seed: 7,
  activeIndex: -1,
});
