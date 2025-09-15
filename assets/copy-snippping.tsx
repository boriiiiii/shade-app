import * as React from "react";
import { Svg, G, Path, Defs, Filter, FeFlood, FeBlend, FeGaussianBlur, ClipPath, Rect } from 'react-native-svg';

const CopySnipping = () => (
  <Svg
    width="134"
    height="135"
    viewBox="0 0 134 135"
    fill="none"
  >
    <G clipPath="url(#clip0_321_6190)" filter="url(#filter0_f_321_6190)">
      <Path
        d="M17.5649 69.6645C17.5649 76.0527 18.911 82.3783 21.5263 88.2802C24.1417 94.182 27.9751 99.5446 32.8076 104.062C37.6402 108.579 43.3772 112.162 49.6912 114.607C56.0053 117.051 62.7726 118.31 69.6068 118.31M17.5649 69.6645C17.5649 63.2763 18.911 56.9507 21.5263 51.0489C24.1417 45.147 27.9751 39.7844 32.8076 35.2673C37.6402 30.7502 43.3772 27.167 49.6912 24.7224C56.0053 22.2777 62.7726 21.0195 69.6068 21.0195M17.5649 69.6645H40.6946M17.5649 69.6645H6M69.6068 118.31C76.4411 118.31 83.2084 117.051 89.5224 114.607C95.8365 112.162 101.574 108.579 106.406 104.062C111.239 99.5446 115.072 94.182 117.687 88.2802C120.303 82.3783 121.649 76.0527 121.649 69.6645M69.6068 118.31V102.095M69.6068 118.31V129.12M121.649 69.6645C121.649 63.2763 120.303 56.9507 117.687 51.0489C115.072 45.147 111.239 39.7844 106.406 35.2673C101.574 30.7502 95.8365 27.167 89.5224 24.7224C83.2084 22.2777 76.4411 21.0195 69.6068 21.0195M121.649 69.6645H104.301M121.649 69.6645H133.214M69.6068 21.0195V42.6395M69.6068 21.0195V10.2095M46.4771 93.987L58.042 69.6645L66.7156 80.4745L75.3893 64.2595L86.9542 72.367L98.519 48.0445"
        stroke="#6283FA"
        strokeOpacity="0.5"
        strokeWidth="8.18463"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <Filter
        id="filter0_f_321_6190"
        x="0.853733"
        y="0.853733"
        width="132.293"
        height="133.412"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix" />
        <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <FeGaussianBlur stdDeviation="2.57313" result="effect1_foregroundBlur_321_6190" />
      </Filter>
      <ClipPath id="clip0_321_6190">
        <Rect width="122" height="123.119" fill="white" transform="translate(6 6)" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default CopySnipping;
