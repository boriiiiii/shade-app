import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface BackIconProps {
  width?: number;
  height?: number;
}

export default function BackIcon({ width = 10, height = 16 }: BackIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 10 16" fill="none">
      <Path
        d="M9.04.96a1.259 1.259 0 00-1.787 0L.96 7.252a1.259 1.259 0 000 1.787l6.293 6.294a1.26 1.26 0 001.788 0 1.26 1.26 0 000-1.787l-5.413-5.4 5.413-5.4a1.259 1.259 0 000-1.788z"
        fill="#fff"
      />
    </Svg>
  );
}
