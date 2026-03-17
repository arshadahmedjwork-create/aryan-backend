import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, Package, Navigation, Command, BarChart3, ChevronRight, Zap } from 'lucide-react-native';
import axios from 'axios';
import AIAgentPulse from '../components/AIAgentPulse';

export default function DriverDashboard({ navigation }) {
  const { user, API_URL, token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveries = async () => {
    console.log('[DRIVER] Synchronizing tactical data...');
    try {
      if (!token) {
        console.error('[DRIVER] Authorization token missing');
        return;
      }
      
      const res = await axios.get(`${API_URL}/delivery/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('[DRIVER] Missions retrieved:', res.data.length);
      setDeliveries(res.data);
    } catch (e) {
      console.error('[DRIVER] Sync Failed');
      if (e.response) {
        console.error('[DRIVER] Status:', e.response.status);
        console.error('[DRIVER] Error:', JSON.stringify(e.response.data));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const updateStatus = async (deliveryId, status) => {
    try {
      await axios.put(`${API_URL}/delivery/update/${deliveryId}/`, 
        { lat: 40.7128, lng: -74.0060, status: status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchDeliveries();
    } catch (e) {
      console.error('[DRIVER] Update Error:', e.response?.data || e.message);
    }
  };

  const MissionCard = ({ delivery }) => {
    const isActive = delivery.status !== 'delivered';
    return (
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View>
            <Text style={styles.missionId}>MISSION #{delivery.order_id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.missionStatus}>PROTOCOL: {delivery.status.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusIndicator, isActive ? styles.statusActive : styles.statusComplete]} />
        </View>

        <View style={styles.divider} />

        <View style={styles.missionDetails}>
          <View style={styles.detailItem}>
            <MapPin color="#666" size={16} />
            <Text style={styles.detailText}>Sector 7-G, Neural District</Text>
          </View>
          <View style={styles.detailItem}>
            <Package color="#666" size={16} />
            <Text style={styles.detailText}>Encrypted AI Core (Unit-1)</Text>
          </View>
        </View>

        {isActive ? (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => updateStatus(delivery.id, delivery.status === 'preparing' ? 'out_for_delivery' : 'delivered')}
          >
            <Text style={styles.actionButtonText}>
              {delivery.status === 'preparing' ? 'COMMENCE DEPLOYMENT' : 'MARK SUCCESSFUL'}
            </Text>
            <Zap color="#000" size={18} fill="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.completedTag}>
            <Text style={styles.completedTagText}>MISSION COMPLETE</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFF" size="large" />
      </View>
    );
  }

  const activeMissions = deliveries.filter(d => d.status !== 'delivered');
  const pastMissions = deliveries.filter(d => d.status === 'delivered');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDeliveries} tintColor="#FFF" />}
      >
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Tactical Grid</Text>
            <Text style={styles.headerSubtitle}>Unit ID: {user?.id?.slice(0, 8).toUpperCase() || 'ALPHA'}</Text>
          </View>
          <View style={styles.badge}>
            <View style={styles.badgePulse} />
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>SUCCESSES</Text>
            <Text style={styles.metricValue}>{pastMissions.length}</Text>
          </View>
          <View style={[styles.metricItem, { borderColor: '#FFF' }]}>
            <Text style={[styles.metricLabel, { color: '#FFF' }]}>PENDING</Text>
            <Text style={styles.metricValue}>{activeMissions.length}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>RANK</Text>
            <Text style={styles.metricValue}>S</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Navigation color="#FFF" size={20} />
          <Text style={styles.sectionTitle}>CURRENT OBJECTIVES</Text>
        </View>

        {activeMissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Truck color="#222" size={48} />
            <Text style={styles.emptyText}>GRID CLEAR. STAND BY.</Text>
          </View>
        ) : (
          activeMissions.map(d => <MissionCard key={d.id} delivery={d} />)
        )}

        {pastMissions.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 40 }]}>
              <BarChart3 color="#333" size={20} />
              <Text style={[styles.sectionTitle, { color: '#333' }]}>COMPLETED PROTOCOLS</Text>
            </View>
            {pastMissions.map(d => <MissionCard key={d.id} delivery={d} />)}
          </>
        )}
      </ScrollView>
      <AIAgentPulse />
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
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  logo: {
    width: 64,
    height: 64,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  badgePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#050505',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  metricLabel: {
    color: '#444',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  missionCard: {
    backgroundColor: '#111',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  missionId: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  missionStatus: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusActive: {
    backgroundColor: '#FFF',
  },
  statusComplete: {
    backgroundColor: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20,
  },
  missionDetails: {
    gap: 12,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  completedTag: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
  },
  completedTagText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  emptyCard: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#111',
    borderStyle: 'dashed',
    borderRadius: 28,
  },
  emptyText: {
    color: '#222',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: 2,
  },
});
