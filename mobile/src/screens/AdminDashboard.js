import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, Animated, Image, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Command, Truck, Package, BarChart3, ChevronRight, UserCheck, Plus, X } from 'lucide-react-native';
import axios from 'axios';
import AIAgentPulse from '../components/AIAgentPulse';

export default function AdminDashboard() {
  const { API_URL, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showUnitStatsModal, setShowUnitStatsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverMissions, setDriverMissions] = useState([]);
  const [newUnit, setNewUnit] = useState({ name: '', email: '', password: '' });
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchData = async () => {
    try {
      if (!token) return;
      
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const [ordersRes, driversRes] = await Promise.all([
        axios.get(`${API_URL}/orders/`, config),
        axios.get(`${API_URL}/auth/drivers`, config)
      ]);
      
      setOrders(ordersRes.data);
      setDrivers(driversRes.data);

      const activeRes = await axios.get(`${API_URL}/delivery/my`, config); 
      setActiveDeliveries(activeRes.data);

    } catch (e) {
      console.error('[ADMIN] Fetch Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  const assignDriver = async (driverId) => {
    try {
      await axios.post(`${API_URL}/delivery/assign/${selectedOrder.id}?driver_id=${driverId}`, 
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowDriverModal(false);
      fetchData();
    } catch (e) {
      console.error('[ADMIN] Assign Failed', e.message);
    }
  };

  const registerUnit = async () => {
    try {
      await axios.post(`${API_URL}/auth/register/driver`, 
        { full_name: newUnit.name, email: newUnit.email, role: 'driver' },
        { params: { password: newUnit.password }, headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowAddUnitModal(false);
      setNewUnit({ name: '', email: '', password: '' });
      fetchData();
    } catch (e) {
      console.error('[ADMIN] Register Error:', e.response?.data || e.message);
    }
  };

  const fetchUnitHistory = async (driver) => {
    setSelectedDriver(driver);
    try {
      const res = await axios.get(`${API_URL}/auth/drivers/${driver.id}/missions/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDriverMissions(res.data);
      setShowUnitStatsModal(true);
    } catch (e) {
      console.error('[ADMIN] History Error:', e.response?.data || e.message);
    }
  };

  const OrderCard = ({ order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <View>
          <Text style={styles.orderId}>#OR-{order.id.slice(0, 6).toUpperCase()}</Text>
          <Text style={styles.orderUser}>{order.user_id.slice(0, 8)}</Text>
        </View>
        <Text style={styles.orderPrice}>₹{order.total_price.toFixed(2)}</Text>
      </View>
      <View style={styles.orderBottom}>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
        {order.status === 'pending' && (
          <TouchableOpacity 
            style={styles.assignButton}
            onPress={() => {
              setSelectedOrder(order);
              setShowDriverModal(true);
            }}
          >
            <UserCheck color="#000" size={16} />
            <Text style={styles.assignButtonText}>ASSIGN UNIT</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFF" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Command</Text>
            <Text style={styles.headerSubtitle}>System Authorization: Level 7</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <BarChart3 color="#FFF" size={20} />
            <Text style={styles.statValue}>{orders.filter(o => o.status === 'delivered').length}</Text>
            <Text style={styles.statLabel}>SUCCESS</Text>
          </View>
          <View style={styles.statCard}>
            <Truck color="#FFF" size={20} />
            <Text style={styles.statValue}>{orders.filter(o => o.status === 'pending' || o.status === 'shipped').length}</Text>
            <Text style={styles.statLabel}>PENDING</Text>
          </View>
          <View style={styles.statCard}>
            <Package color="#FFF" size={20} />
            <Text style={styles.statValue}>{drivers.length}</Text>
            <Text style={styles.statLabel}>UNITS</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DYNAMIC TACTICAL GRID</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridBackground}>
            {[...Array(8)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, { left: `${(i * 100 / 7)}%`, width: 1, height: '100%' }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, { top: `${(i * 100 / 5)}%`, height: 1, width: '100%' }]} />
            ))}
          </View>
          {activeDeliveries.map((d, index) => (
            <Animated.View 
              key={d.id}
              style={[
                styles.unitMarker,
                {
                  top: `${20 + (index * 15) % 60}%`,
                  left: `${15 + (index * 25) % 70}%`,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={styles.unitDot} />
              <Text style={styles.unitLabel}>{d.driver_id.slice(0, 4).toUpperCase()}</Text>
            </Animated.View>
          ))}
          <Animated.View 
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, 180] 
                  })
                }]
              }
            ]} 
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FLEET TACTICAL</Text>
          <TouchableOpacity onPress={() => setShowAddUnitModal(true)} style={styles.addUnitButton}>
            <Plus color="#FFF" size={14} />
            <Text style={styles.addUnitText}>ADD UNIT</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fleetScroll}>
          {drivers.map(d => (
            <TouchableOpacity key={d.id} style={styles.fleetCard} onPress={() => fetchUnitHistory(d)}>
              <View style={styles.unitAvatar}>
                <Text style={styles.avatarText}>{d.full_name[0]}</Text>
              </View>
              <Text style={styles.unitNameCard}>{d.full_name.split(' ')[0]}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.5 }}>
                <View style={styles.unitDotActive} />
                <Text style={styles.unitStatusText}>ACTIVE</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>MISSION OVERVIEW</Text>
        {orders.map(o => <OrderCard key={o.id} order={o} />)}
      </ScrollView>

      <Modal visible={showAddUnitModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REGISTER TACTICAL UNIT</Text>
              <TouchableOpacity onPress={() => setShowAddUnitModal(false)}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.addUnitForm}>
              <TextInput style={styles.modalInput} placeholder="UNIT NAME" placeholderTextColor="#444" value={newUnit.name} onChangeText={t => setNewUnit(prev => ({ ...prev, name: t }))} />
              <TextInput style={styles.modalInput} placeholder="EMAIL PROTOCOL" placeholderTextColor="#444" value={newUnit.email} onChangeText={t => setNewUnit(prev => ({ ...prev, email: t }))} autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="ENCRYPTION KEY" placeholderTextColor="#444" value={newUnit.password} onChangeText={t => setNewUnit(prev => ({ ...prev, password: t }))} secureTextEntry />
              <TouchableOpacity style={styles.modalButton} onPress={registerUnit}>
                <Text style={styles.modalButtonText}>AUTHORIZE UNIT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showUnitStatsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>UNIT INTELLIGENCE: {selectedDriver?.full_name?.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setShowUnitStatsModal(false)}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.missionHistory}>
              {driverMissions.length === 0 ? (
                <Text style={styles.noDataText}>NO MISSION LOGS DETECTED</Text>
              ) : (
                driverMissions.map(m => (
                  <View key={m.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyId}>#MS-{m.order_id.slice(0,6).toUpperCase()}</Text>
                      <Text style={styles.historyDate}>{new Date(m.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.historyStatus}>{m.status.toUpperCase()}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDriverModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT TACTICAL UNIT</Text>
              <TouchableOpacity onPress={() => setShowDriverModal(false)}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.driverList}>
              {drivers.map(d => (
                <TouchableOpacity key={d.id} style={styles.driverItem} onPress={() => assignDriver(d.id)}>
                  <View>
                    <Text style={styles.driverName}>{d.full_name}</Text>
                    <Text style={styles.driverEmail}>{d.email}</Text>
                  </View>
                  <ChevronRight color="#333" size={20} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AIAgentPulse />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  logo: { width: 64, height: 64 },
  headerText: { flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  headerSubtitle: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  statCard: { flex: 1, backgroundColor: '#111', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#222' },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 12 },
  statLabel: { color: '#444', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: '#333', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  addUnitButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  addUnitText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  fleetScroll: { marginBottom: 40, marginHorizontal: -24, paddingHorizontal: 24 },
  fleetCard: { width: 100, backgroundColor: '#111', borderRadius: 20, padding: 16, alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#222' },
  unitAvatar: { width: 40, height: 40, backgroundColor: '#222', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  unitNameCard: { color: '#FFF', fontSize: 10, fontWeight: '800', marginBottom: 8 },
  unitDotActive: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' },
  unitStatusText: { color: '#444', fontSize: 8, fontWeight: '900' },
  gridContainer: { height: 180, backgroundColor: '#050505', borderRadius: 24, borderWidth: 1, borderColor: '#222', marginBottom: 32, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  gridBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.1 },
  gridLine: { position: 'absolute', backgroundColor: '#FFF' },
  unitMarker: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  unitDot: { width: 8, height: 8, backgroundColor: '#FFF', borderRadius: 4, shadowColor: '#FFF', shadowOpacity: 0.8, shadowRadius: 5 },
  unitLabel: { color: '#FFF', fontSize: 7, fontWeight: '900', marginTop: 4, opacity: 0.5 },
  scanLine: { position: 'absolute', width: '100%', height: 40, backgroundColor: 'rgba(255,255,255,0.02)', zIndex: 5, top: 0 },
  orderCard: { backgroundColor: '#111', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  orderUser: { color: '#444', fontSize: 10, fontWeight: '600', marginTop: 2 },
  orderPrice: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBox: { backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  statusText: { color: '#AAA', fontSize: 10, fontWeight: '900' },
  assignButton: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  assignButtonText: { color: '#000', fontSize: 10, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%', borderWidth: 1, borderColor: '#222' },
  addUnitForm: { gap: 16, marginBottom: 20 },
  modalInput: { backgroundColor: '#000', height: 56, borderRadius: 16, paddingHorizontal: 16, color: '#FFF', fontSize: 14, fontWeight: '600', borderWidth: 1, borderColor: '#222' },
  modalButton: { backgroundColor: '#FFF', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalButtonText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  historyCard: { backgroundColor: '#000', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyId: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  historyDate: { color: '#444', fontSize: 10 },
  historyStatus: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  noDataText: { color: '#444', textAlign: 'center', marginTop: 40, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  missionHistory: { maxHeight: 400 },
  driverList: { gap: 16 },
  driverItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#222', marginBottom: 12 },
  driverName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  driverEmail: { color: '#444', fontSize: 12, fontWeight: '600', marginTop: 2 },
});
