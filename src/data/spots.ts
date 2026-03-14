export interface Spot {
  id: number;
  title: string;
  anime: string;
  imgUrl: string;
  hint: string;
  lat: number;
  lng: number;
}

export const spots: Spot[] = [
  {
    id: 1,
    title: "鴨川デルタ (出町柳)",
    anime: "四畳半神話大系 / けいおん！",
    imgUrl: "/images/kamogawa_delta.png",
    hint: "飛び石の3つ目あたりから、背景の橋と一致させてください。",
    lat: 35.029837,
    lng: 135.772528
  },
  {
    id: 2,
    title: "京阪 宇治駅",
    anime: "響け！ユーフォニアム",
    imgUrl: "/images/uji_station.png",
    hint: "駅の改札を出てすぐのベンチ前が目印です。アーチの重なりを調整してください。",
    lat: 34.894291,
    lng: 135.808044
  },
  {
    id: 3,
    title: "出町桝形商店街",
    anime: "たまこまーけっと / 有頂天家族",
    imgUrl: "/images/masugata_shotengai.png",
    hint: "アーケード入口から看板中央のサバを入れるように構えます。",
    lat: 35.030438,
    lng: 135.768686
  }
];
