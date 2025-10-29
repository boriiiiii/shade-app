import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

function Lock() {
  return (
    <Svg width={18} height={22} viewBox="0 0 18 22" fill="none">
      <G clipPath="url(#clip0_137_1571)">
        <Path
          d="M5 10h8V7c0-1.104-.39-2.047-1.172-2.828A3.854 3.854 0 009 3c-1.104 0-2.047.39-2.828 1.172A3.854 3.854 0 005 7v3zm13 1.5v9c0 .417-.146.77-.438 1.063A1.446 1.446 0 0116.5 22h-15c-.417 0-.77-.146-1.063-.438A1.447 1.447 0 010 20.5v-9c0-.417.146-.77.438-1.063A1.446 1.446 0 011.5 10H2V7c0-1.917.688-3.563 2.063-4.938C5.438.688 7.082 0 9 0c1.917 0 3.563.688 4.938 2.063C15.312 3.437 16 5.082 16 7v3h.5c.417 0 .77.146 1.063.438.291.291.437.645.437 1.062z"
          fill="#6283FA"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_137_1571">
          <Path fill="#fff" d="M0 0H18V22H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default Lock;
