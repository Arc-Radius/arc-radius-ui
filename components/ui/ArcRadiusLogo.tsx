import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type ArcRadiusLogoProps = {
  size?: number;
  className?: string;
};

const ArcRadiusLogo = ({ size = 36, className = '' }: ArcRadiusLogoProps) => (
  <View className={className} style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="#E40303"
        strokeWidth={6}
        strokeDasharray="48 240"
        strokeDashoffset={0}
      />
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="#FF8C00"
        strokeWidth={6}
        strokeDasharray="48 240"
        strokeDashoffset={-48}
      />
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="#FFED00"
        strokeWidth={6}
        strokeDasharray="48 240"
        strokeDashoffset={-96}
      />
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="#008026"
        strokeWidth={6}
        strokeDasharray="48 240"
        strokeDashoffset={-144}
      />
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="#24408E"
        strokeWidth={6}
        strokeDasharray="48 240"
        strokeDashoffset={-192}
      />
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="#732982"
        strokeWidth={6}
        strokeDasharray="48 240"
        strokeDashoffset={-240}
      />
    </Svg>

    <View
      pointerEvents="none"
      style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 10c0 6.5-8 12-8 12S4 16.5 4 10a8 8 0 1 1 16 0Z"
          fill="#1f2937"
          stroke="#1f2937"
          strokeWidth={1.6}
        />
        <Circle cx="12" cy="10" r="2.4" fill="#fff" />
      </Svg>
    </View>
  </View>
);

export default ArcRadiusLogo;
