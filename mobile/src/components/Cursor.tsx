import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { MONO, colors } from '../theme';

/** Curseur bloc clignotant façon terminal. */
export function Cursor({ color = colors.green }: { color?: string }) {
  const [on, setOn] = useState(true);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const id = setInterval(() => mounted.current && setOn((v) => !v), 530);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);
  return (
    <Text style={{ fontFamily: MONO, color, opacity: on ? 1 : 0, fontSize: 14 }}>█</Text>
  );
}
