import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react-native';

const OrdersScreen = ({ navigation }) => {
  const { API_URL, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (e) {
      console.error('Order Fetch Error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'pending': return <Clock color="#666" size={18} />;
      case 'shipped': return <Truck color="#FFF" size={18} />;
      case 'out_for_delivery': return <Truck color="#FFF" size={18} />;
      case 'delivered': return <CheckCircle color="#FFF" size={18} />;
      default: return <Package color="#666" size={18} />;
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>ORDER #{item.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[
          styles.statusBadge, 
          (item.status === 'out_for_delivery' || item.status === 'shipped') && styles.statusActive
        ]}>
          <StatusIcon status={item.status} />
          <Text style={[
            styles.statusText, 
            (item.status === 'out_for_delivery' || item.status === 'shipped') && styles.statusTextActive
          ]}>
            {item.status.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.orderBody}>
        <Text style={styles.itemsCount}>{item.order_items?.length || 0} Modules</Text>
        <Text style={styles.orderPrice}>₹{item.total_price.toFixed(2)}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        {(item.status === 'shipped' || item.status === 'out_for_delivery') && (
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('OrderTracking', { orderId: item.id });
            }}
          >
            <Text style={styles.trackButtonText}>TRACK MISSION</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Vault</Text>
        <Text style={styles.headerSubtitle}>History & Sync Status</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package color="#333" size={64} strokeWidth={1} />
            <Text style={styles.emptyText}>No archived queries found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  statusText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextActive: {
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 16,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsCount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  orderPrice: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  orderDate: {
    color: '#444',
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  trackButtonText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  empty: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
  },
});

export default OrdersScreen;
