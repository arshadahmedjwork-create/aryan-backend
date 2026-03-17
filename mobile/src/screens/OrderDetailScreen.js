import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Package, Clock, Shield, CheckCircle, Truck, Zap } from 'lucide-react-native';
import axios from 'axios';

export default function OrderDetailScreen({ route, navigation }) {
  const { order: initialOrder } = route.params;
  const { API_URL, token } = useAuth();
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${initialOrder.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (e) {
      console.error('Order Detail Fetch Error:', e.response?.data || e.message);
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'pending': return <Clock color="#666" size={24} />;
      case 'shipped': return <Truck color="#FFF" size={24} />;
      case 'out_for_delivery': return <Truck color="#FFF" size={24} />;
      case 'delivered': return <CheckCircle color="#FFF" size={24} />;
      default: return <Package color="#666" size={24} />;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>UNIT: {item.product_id?.slice(0, 8).toUpperCase() || 'CORE-NODE'}</Text>
        <Text style={styles.productQty}>QTY x {item.quantity}</Text>
      </View>
      <Text style={styles.productPrice}>₹{(item.price_at_purchase * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MISSION BRIEF</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <StatusIcon status={order.status} />
            <View>
              <Text style={styles.statusLabel}>CURRENT PHASE</Text>
              <Text style={styles.statusValue}>{order.status.replace(/_/g, ' ').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.statusDesc}>
            Mission timestamp: {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACQUISITION MANIFEST</Text>
          <View style={styles.manifestCard}>
            {order.order_items?.map((item, index) => (
              <View key={index}>
                {renderItem({ item })}
                {index < order.order_items.length - 1 && <View style={styles.itemDivider} />}
              </View>
            ))}
            
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL VOLUME</Text>
              <Text style={styles.totalValue}>₹{order.total_price.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INTELLIGENCE LOGS</Text>
          <View style={styles.logCard}>
            <View style={styles.logItem}>
              <View style={styles.logDot} />
              <Text style={styles.logText}>Identity verification successful.</Text>
            </View>
            <View style={styles.logItem}>
              <View style={styles.logDot} />
              <Text style={styles.logText}>Encrypted gateway tunnel established.</Text>
            </View>
            <View style={styles.logItem}>
              <View style={[styles.logDot, { backgroundColor: '#FFF' }]} />
              <Text style={[styles.logText, { color: '#FFF' }]}>
                Acquisition of {order.order_items?.length || 0} modules confirmed.
              </Text>
            </View>
          </View>
        </View>

        {(order.status === 'shipped' || order.status === 'out_for_delivery') && (
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
          >
            <Zap color="#000" size={20} fill="#000" />
            <Text style={styles.trackButtonText}>LAUNCH TACTICAL FEED</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    padding: 24,
  },
  statusCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 32,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  statusLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  statusDesc: {
    color: '#444',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
  },
  manifestCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  productQty: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  productPrice: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#222',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  logCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  logText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#FFF',
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  trackButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
