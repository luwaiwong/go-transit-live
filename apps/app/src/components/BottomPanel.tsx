import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../contexts/ThemeContext';
import { MapMarker } from '../types';

interface BottomPanelProps {
  selectedMarker: MapMarker | null;
  onClose: () => void;
}

export const BottomPanel = ({ selectedMarker, onClose }: BottomPanelProps) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { backgroundColor: theme.colors.card }
        ]}
      >
        {selectedMarker ? (
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {selectedMarker.name}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {selectedMarker.type.toUpperCase()}
            </Text>
            <View style={styles.infoContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Latitude:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {selectedMarker.position.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Longitude:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {selectedMarker.position.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              GO Transit Live
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              Track live GO train and bus positions in real-time.
            </Text>
            <View style={styles.legendContainer}>
              <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
                Legend
              </Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.station }]} />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  Station
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.train }]} />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  Train
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.bus }]} />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  Bus
                </Text>
              </View>
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  legendContainer: {
    marginTop: 24,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 16,
  },
});
