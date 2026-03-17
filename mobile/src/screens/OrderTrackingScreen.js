import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Animated, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Navigation, MapPin, Shield, Zap, Info } from 'lucide-react-native';
import axios from 'axios';

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { API_URL, token } = useAuth();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Animation for the "Tactical Pulse"
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Animation for the "Driver Marker"
  const driverPos = useRef(new Animated.Value(0)).current;

  const fetchTracking = async () => {
    try {
      const res = await axios.get(`${API_URL}/delivery/track/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDelivery(res.data);
    } catch (e) {
      console.error('Tracking Fetch Error:', e.response?.data || e.message);
      // If no delivery object yet, it might still be in preparation
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFF" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tactical Feed</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        {/* Tactical Grid Background */}
        <View style={styles.gridLayer}>
          {[...Array(15)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLine, { left: `${(i * 100) / 14}%`, width: 1, height: '100%' }]} />
          ))}
          {[...Array(15)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, { top: `${(i * 100) / 14}%`, height: 1, width: '100%' }]} />
          ))}
        </View>

        {/* Tactical Route Line */}
        <View style={styles.routePathContainer}>
          <View style={styles.routeLine} />
          {/* Progress Overlay */}
          <Animated.View 
            style={[
              styles.routeProgressLine, 
              { 
                height: delivery?.status === 'out_for_delivery' ? '60%' : 
                        delivery?.status === 'delivered' ? '100%' : '5%' 
              }
            ]} 
          />
        </View>

        {/* HQ Marker */}
        <View style={[styles.marker, styles.baseMarker]}>
          <View style={styles.markerRadar} />
          <View style={styles.markerCore}>
            <MapPin color="#FFF" size={16} />
          </View>
          <Text style={styles.markerLabel}>HQ-GENESIS</Text>
        </View>

        {/* Destination Marker */}
        <View style={[styles.marker, styles.destMarker]}>
          <View style={styles.markerCoreDest}>
            <View style={styles.destDot} />
          </View>
          <Text style={styles.markerLabel}>OBJECTIVE</Text>
        </View>

        {/* Driver Marker */}
        <Animated.View 
          style={[
            styles.driverUnit,
            {
              top: delivery?.status === 'out_for_delivery' ? '50%' : 
                   delivery?.status === 'delivered' ? '85%' : '15%',
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.unitIcon}>
            <Navigation color="#000" size={18} fill="#000" />
          </View>
          <View style={styles.unitTag}>
            <Text style={styles.unitTagName}>UNIT-{delivery?.driver_id?.slice(0,4).toUpperCase() || 'ALPHA'}</Text>
          </View>
        </Animated.View>

        {/* Scan Line Animation */}
        <Animated.View 
          style={[
            styles.scanLine,
            {
              transform: [{
                translateY: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0, 400] // Assuming map height is ~400
                })
              }]
            }
          ]} 
        />
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <Zap color="#FFF" size={20} />
          </View>
          <View>
            <Text style={styles.statusLabel}>MISSION STATUS</Text>
            <Text style={styles.statusValue}>{delivery?.status?.toUpperCase() || 'PREPARING'}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>COORDINATES</Text>
            <Text style={styles.detailValue}>
              {delivery?.current_lat?.toFixed(4) || '---'}, {delivery?.current_lng?.toFixed(4) || '---'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SYSTEM LINK</Text>
            <Text style={styles.detailValue}>ENCRYPTED</Text>
          </View>
        </View>

        <View style={styles.alertBox}>
          <Shield color="#FFF" size={16} />
          <Text style={styles.alertText}>Autonomous stealth delivery in progress. No user intervention required.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: '#050505',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#FFF',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  baseMarker: {
    top: '15%',
    left: '50%',
    marginLeft: -40,
  },
  destMarker: {
    bottom: '15%',
    left: '50%',
    marginLeft: -40,
  },
  markerRadar: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  markerCore: {
    width: 32,
    height: 32,
    backgroundColor: '#000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCoreDest: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destDot: {
    width: 6,
    height: 6,
    backgroundColor: '#000',
    borderRadius: 3,
  },
  markerLabel: {
    color: '#666',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 1,
  },
  routePathContainer: {
    position: 'absolute',
    width: 2,
    height: '70%',
    left: '50%',
    marginLeft: -1,
    top: '15%',
  },
  routeLine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
  },
  routeProgressLine: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#FFF',
    top: 0,
    shadowColor: '#FFF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  driverUnit: {
    position: 'absolute',
    left: '50%',
    marginLeft: -22,
    zIndex: 20,
    alignItems: 'center',
  },
  unitIcon: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  unitTag: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    marginTop: 8,
  },
  unitTagName: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    zIndex: 5,
    top: 0,
  },
  infoPanel: {
    padding: 24,
    backgroundColor: '#111',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: '#222',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  statusIconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#222',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  detailLabel: {
    color: '#444',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 4,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 16,
  },
  alertText: {
    color: '#999',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
