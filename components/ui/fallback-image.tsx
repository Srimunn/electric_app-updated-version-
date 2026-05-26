import { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface FallbackImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  fallback?: ImageSourcePropType;
}

export default function FallbackImage({ uri, fallback, style, ...rest }: FallbackImageProps) {
  const [failed, setFailed] = useState(false);
  const src = !failed && uri ? { uri } : (fallback || require('../../assets/images/image.png'));

  return (
    <Image
      source={src}
      onError={() => setFailed(true)}
      style={style}
      {...rest}
    />
  );
}
