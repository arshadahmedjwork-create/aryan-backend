import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Brain, AlertTriangle, Info } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function AIAgentPulse() {
  const { user, API_URL, token } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(200)).current; // Slide from right

  useEffect(() => {
    if (!user) return;

    const checkPulse = async () => {
      try {
        const res = await axios.get(`${API_URL}/ai/pulse`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.alert) {
          if (!activeAlert || activeAlert.id !== res.data.alert.id) {
            setActiveAlert(res.data.alert);
            triggerNotification();
          }
        }
      } catch (e) {
        console.error('Mobile Pulse failed', e);
      }
    };

    const interval = setInterval(checkPulse, 30000);
    checkPulse();

    return () => clearInterval(interval);
  }, [user, activeAlert]);

  const triggerNotification = () => {
    setShowNotification(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();

    // Auto hide
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 500,
        useNativeDriver: true
      }).start(() => setShowNotification(false));
    }, 10000);
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  if (!user) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {showNotification && activeAlert && (
        <Animated.View style={[
          styles.notification,
          { transform: [{ translateX: slideAnim }] }
        ]}>
          <View style={styles.alertHeader}>
            {activeAlert.severity === 'critical' ? (
              <AlertTriangle color="#FF4444" size={20} />
            ) : (
              <Info color="#FFF" size={20} />
            )}
            <Text style={styles.intelLabel}>AUTONOMOUS INSIGHT</Text>
          </View>
          <Text style={styles.alertText}>{activeAlert.message}</Text>
        </Animated.View>
      )}

      <TouchableOpacity 
        activeOpacity={0.8}
        style={styles.pulseButton}
      >
        <Animated.View style={[
          styles.glow,
          { transform: [{ scale: pulseAnim }], opacity: showNotification ? 0.8 : 0.2 }
        ]} />
        <View style={[styles.inner, showNotification && styles.innerActive]}>
          <Brain color={showNotification ? "#000" : "#FFF"} size={24} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  notification: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    width: width * 0.8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  intelLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.6,
  },
  alertText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  pulseButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerActive: {
    backgroundColor: '#FFF',
  }
});
