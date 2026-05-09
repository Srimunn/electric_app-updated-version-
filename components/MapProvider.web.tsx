import React, { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface MapViewType {
  animateToRegion: (region: any, duration?: number) => void;
}

type RegionLike = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const MapRegionContext = createContext<RegionLike | null>(null);

interface MarkerProps {
  children?: React.ReactNode;
  title?: string;
  coordinate?: { latitude: number; longitude: number };
  onPress?: () => void;
}

export const Marker = ({ children, title, onPress, coordinate }: MarkerProps) => {
  const region = useContext(MapRegionContext);
  const [isHovering, setIsHovering] = useState(false);

  const { top, left } = useMemo(() => {
    if (!coordinate) return { top: '50%', left: '50%' };
    if (!region) {
      return {
        top: `${((coordinate.latitude - 11) * 100) % 100}%`,
        left: `${((coordinate.longitude - 77) * 100) % 100}%`,
      };
    }

    const north = region.latitude + region.latitudeDelta / 2;
    const west = region.longitude - region.longitudeDelta / 2;

    const rawTop = ((north - coordinate.latitude) / region.latitudeDelta) * 100;
    const rawLeft = ((coordinate.longitude - west) / region.longitudeDelta) * 100;

    const clampedTop = Math.max(0, Math.min(100, rawTop));
    const clampedLeft = Math.max(0, Math.min(100, rawLeft));
    return { top: `${clampedTop}%`, left: `${clampedLeft}%` };
  }, [coordinate, region]);

  const hoverHandlers =
    Platform.OS === 'web'
      ? ({
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        } as any)
      : {};

  return (
    <TouchableOpacity 
      style={[styles.marker, { position: 'absolute', top, left, transform: [{ translateX: -20 }, { translateY: -20 }] }]} 
      onPress={onPress} 
      activeOpacity={0.7}
      {...hoverHandlers}
    >
      {children}
      {title && (Platform.OS !== 'web' || isHovering) && (
        <View pointerEvents="none" style={styles.markerLabel}>
          <Text style={styles.markerTitle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MapView = forwardRef<MapViewType, any>((props, ref) => {
  const [region, setRegion] = useState<RegionLike | null>(props.initialRegion ?? null);

  useEffect(() => {
    if (props.initialRegion) setRegion(props.initialRegion);
  }, [props.initialRegion]);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: any, _duration?: number) => {
      setRegion(region);
    },
  }));

  return (
    <View style={[styles.container, props.style]}>
      <MapRegionContext.Provider value={region}>
        <View style={styles.content}>
          {props.children}
        </View>
      </MapRegionContext.Provider>
      <View style={styles.placeholderContainer} pointerEvents="none">
        <Text style={styles.text}>Map View (Web Placeholder)</Text>
        <Text style={styles.subtext}>Interactive maps are available on native devices.</Text>
      </View>
    </View>
  );
});

MapView.displayName = 'MapView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    padding: 20,
    backgroundColor: 'rgba(241, 245, 249, 0.4)',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  text: {
    color: '#0D7FF2',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 8,
  },
  subtext: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#0D7FF2',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    position: 'absolute',
    right: 44,
    top: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 170,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  }
});

export default MapView;
