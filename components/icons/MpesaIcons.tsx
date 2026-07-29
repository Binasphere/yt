/**
 * Hand-drawn SVG replicas of the M-PESA quick-action / chrome icons.
 * Every icon is a two-tone outline: Safaricom green body + a red accent,
 * which is the pattern the real app uses throughout.
 */
import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

type IconProps = {
  size?: number;
  green?: string;
  red?: string;
};

const S = 24; // shared viewBox
const W = 1.7; // shared stroke width

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: `0 0 ${S} ${S}`,
  fill: 'none' as const,
});

const stroke = {
  strokeWidth: W,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SendMoneyIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M20.8 3.2 3.6 10.4l7.2 2.8 2.8 7.2Z" stroke={green} {...stroke} />
      <Path d="M10.8 13.2 20.8 3.2" stroke={red} {...stroke} />
    </Svg>
  );
}

export function LipaNaMpesaIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M8.6 8.4 11.2 3.4M15.4 8.4 12.8 3.4" stroke={red} {...stroke} />
      <Path
        d="M3.4 8.4h17.2l-1.7 10.3a2.2 2.2 0 0 1-2.2 1.9H7.3a2.2 2.2 0 0 1-2.2-1.9Z"
        stroke={red}
        {...stroke}
      />
      <Path d="M9.4 12.3v4.2M14.6 12.3v4.2" stroke={green} {...stroke} />
    </Svg>
  );
}

export function WithdrawIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={2.6} y={5.4} width={18.8} height={13.2} rx={2.6} stroke={green} {...stroke} />
      <Path d="M2.6 9.6h18.8" stroke={green} {...stroke} />
      <Path d="M15.8 11.6v4.6M13.6 14.2l2.2 2.2 2.2-2.2" stroke={red} {...stroke} />
    </Svg>
  );
}

export function BuyBundlesIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M8.8 3.4v17.2M5.2 17l3.6 3.6L12.4 17" stroke={green} {...stroke} />
      <Path d="M15.2 20.6V3.4M11.6 7 15.2 3.4 18.8 7" stroke={red} {...stroke} />
    </Svg>
  );
}

export function InternationalIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={11.4} cy={11.4} r={8} stroke={green} {...stroke} />
      <Ellipse cx={11.4} cy={11.4} rx={3.6} ry={8} stroke={green} {...stroke} />
      <Path d="M3.6 11.4h15.6" stroke={green} {...stroke} />
      <Path d="M15.8 17.4a5.4 5.4 0 0 0 5 3.2M20.8 20.6l-2.6.4M20.8 20.6l-.6-2.6" stroke={red} {...stroke} />
    </Svg>
  );
}

export function AirtimeIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M6.4 3.6h2.9l1.5 3.9-2 1.5a12.4 12.4 0 0 0 6.2 6.2l1.5-2 3.9 1.5v2.9a1.9 1.9 0 0 1-2 1.9A16.6 16.6 0 0 1 4.5 5.6a1.9 1.9 0 0 1 1.9-2Z"
        stroke={green}
        {...stroke}
      />
      <Path d="M15.8 3.4h4.8v4.8" stroke={red} {...stroke} />
    </Svg>
  );
}

export function TunukiwaIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={4.2} y={9.4} width={15.6} height={10.8} rx={1.8} stroke={green} {...stroke} />
      <Rect x={2.8} y={5.9} width={18.4} height={3.5} rx={1.4} stroke={red} {...stroke} />
      <Path d="M12 5.9v14.3" stroke={green} {...stroke} />
      <Path
        d="M12 5.9c-1-2.4-4.6-3-4.6-.8 0 1.1 1.6.8 4.6.8ZM12 5.9c1-2.4 4.6-3 4.6-.8 0 1.1-1.6.8-4.6.8Z"
        stroke={red}
        {...stroke}
      />
    </Svg>
  );
}

export function HomeInternetIcon({ size = 26, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M3.4 10.4 12 3.4l8.6 7v8.4a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6Z"
        stroke={green}
        {...stroke}
      />
      <Path d="M8.9 14.2a4.6 4.6 0 0 1 6.2 0M10.5 16.5a2.2 2.2 0 0 1 3 0" stroke={green} {...stroke} />
      <Circle cx={12} cy={18.7} r={1} fill={red} />
    </Svg>
  );
}

export function BellIcon({ size = 24, green = colors.green }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 2.8a5.8 5.8 0 0 0-5.8 5.8c0 5.1-2.1 6.6-2.1 6.6h15.8s-2.1-1.5-2.1-6.6A5.8 5.8 0 0 0 12 2.8Z"
        stroke={green}
        {...stroke}
      />
      <Path d="M10.2 18.6a2.1 2.1 0 0 0 3.6 0" stroke={green} {...stroke} />
    </Svg>
  );
}

export function SearchIcon({ size = 24, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={10.4} cy={10.4} r={6.6} stroke={green} {...stroke} />
      <Path d="M15.4 15.4 20.8 20.8" stroke={red} strokeWidth={2.1} strokeLinecap="round" />
    </Svg>
  );
}

export function EyeOffIcon({ size = 22, green = colors.text }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12Z"
        stroke={green}
        {...stroke}
      />
      <Circle cx={12} cy={12} r={3} stroke={green} {...stroke} />
      <Line x1={3.4} y1={20.6} x2={20.6} y2={3.4} stroke={green} {...stroke} />
    </Svg>
  );
}

export function QrIcon({ size = 28, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={3} y={3} width={7} height={7} rx={1.6} stroke={green} {...stroke} />
      <Rect x={14} y={3} width={7} height={7} rx={1.6} stroke={green} {...stroke} />
      <Rect x={3} y={14} width={7} height={7} rx={1.6} stroke={green} {...stroke} />
      <Path d="M17.5 14v7M14 17.5h7" stroke={red} {...stroke} />
    </Svg>
  );
}

/** Placeholder illustration used by the empty "Frequents" state. */
export function EmptyAppsIcon({ size = 44, green = colors.green, red = colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1.6} stroke={green} {...stroke} />
      <Rect x={14} y={3} width={7} height={7} rx={1.6} stroke={green} {...stroke} />
      <Rect x={3} y={14} width={7} height={7} rx={1.6} stroke={green} {...stroke} />
      <Path d="M17.5 14v7M14 17.5h7" stroke={red} {...stroke} />
    </Svg>
  );
}
