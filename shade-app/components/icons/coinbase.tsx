import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface CoinbaseProps {
  width?: number;
  height?: number;
}

export default function Coinbase({ width = 20, height = 20 }: CoinbaseProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10.029 1.444a8.581 8.581 0 018.39 6.741h-3.244a5.454 5.454 0 00-5.146-3.63c-3.014 0-5.459 2.436-5.46 5.445v.002a5.451 5.451 0 005.459 5.441v.001a5.455 5.455 0 005.147-3.629h3.242a8.58 8.58 0 01-8.388 6.74c-4.744 0-8.585-3.833-8.585-8.555 0-4.722 3.842-8.556 8.585-8.556z"
        fill="#0052FF"
        stroke="#0052FF"
        strokeWidth={1.55556}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
