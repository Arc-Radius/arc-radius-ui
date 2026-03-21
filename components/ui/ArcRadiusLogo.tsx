import React from 'react';
import { Image, View } from 'react-native';

type ArcRadiusLogoProps = {
  size?: number;
  className?: string;
};

const LOGO = require('../../assets/arc-radius-logo.png');

const ArcRadiusLogo = ({ size = 36, className = '' }: ArcRadiusLogoProps) => (
  <View className={className} style={{ width: size, height: size }}>
    <Image
      source={LOGO}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="Arc Radius logo"
      accessibilityRole="image"
    />
  </View>
);

export default ArcRadiusLogo;
