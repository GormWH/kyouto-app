export interface Spot {
  id: number;
  title: string;
  anime: string;
  imgUrl: string;
  hint: string;
}

export const spots: Spot[] = [
  {
    id: 1,
    title: "鴨川デルタ",
    anime: "有頂天家族 / たまこまーけっと",
    imgUrl: "https://picsum.photos/id/10/800/600",
    hint: "飛び石に立って、背景の橋と一致させてください"
  },
  {
    id: 2,
    title: "南禅寺 水路閣",
    anime: "けいおん！ / 境界の彼方",
    imgUrl: "https://picsum.photos/id/20/800/600",
    hint: "アーチの3番目の柱を基準にします"
  },
  {
    id: 3,
    title: "伏見稲荷 千本鳥居",
    anime: "いなり、こんこん、恋いろは。",
    imgUrl: "https://picsum.photos/id/30/800/600",
    hint: "鳥居の重なりが等間隔に見える位置へ"
  }
];
