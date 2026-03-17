import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Lock, CheckCircle, ArrowLeft } from 'lucide-react-native';
import axios from 'axios';

const PaymentScreen = ({ navigation, route }) => {
  const { shippingData } = route.params || {};
  const { cart, subtotal, clearCart } = useCart();
  const { API_URL, token } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    console.log('[PAYMENT] handlePay triggered');
    if (!token) {
      console.log('[PAYMENT] Error: No token');
      Alert.alert('Session Expired', 'Please login again.');
      return;
    }

    setProcessing(true);
    console.log('[PAYMENT] processing set to true');

    try {
      console.log('[PAYMENT] Starting 2.5s simulation delay...');
      await new Promise(resolve => setTimeout(resolve, 2500));
      console.log('[PAYMENT] Delay finished');

      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.qty || 1,
        price: item.price
      }));
      console.log('[PAYMENT] Payload prepared:', items.length, 'items');

      const orderData = { items };

      console.log('[PAYMENT] Sending request to:', `${API_URL}/orders/`);
      
      const response = await axios.post(`${API_URL}/orders/`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[PAYMENT] Response received status:', response.status);
      
      console.log('[PAYMENT] Success! Clearing cart and setting success state');
      setSuccess(true);
      clearCart();
    } catch (e) {
      console.log('[PAYMENT] CATCH block triggered');
      const errorMsg = e.response?.data?.detail || e.message;
      console.error('[PAYMENT] CRITICAL ERROR:', errorMsg);
      Alert.alert('Payment Failure', errorMsg || 'The neural link was interrupted.');
    } finally {
      console.log('[PAYMENT] finally block, setting processing to false');
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle color="#FFF" size={80} strokeWidth={1} />
        <Text style={styles.successTitle}>Intelligence Secured</Text>
        <Text style={styles.successSubtitle}>Your query has been processed and your package is in motion.</Text>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>RETURN TO NEXIS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gateway</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.cardPreview}>
          <View style={styles.cardHeader}>
            <View style={styles.cardChip} />
            <Text style={styles.cardBrand}>NEXIS CARD</Text>
          </View>
          <Text style={styles.cardNumber}>••••  ••••  ••••  4421</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardName}>{shippingData?.name?.toUpperCase() || 'USER'}</Text>
            <Text style={styles.cardExp}>12/28</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Lock color="#666" size={16} />
          <Text style={styles.infoText}>Encrypted End-to-End Intelligence Tunnel</Text>
        </View>

        <View style={styles.billDetails}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Transaction Volume</Text>
            <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Security Protocol</Text>
            <Text style={styles.billValue}>SSL-STARK</Text>
          </View>
        </View>

        {processing ? (
          <View style={styles.processingBox}>
            <ActivityIndicator color="#FFF" size="large" />
            <Text style={styles.processingText}>SYNCHRONIZING SECURE GATEWAY...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.payButton} onPress={handlePay}>
            <CreditCard color="#000" size={20} />
            <Text style={styles.payText}>EXECUTE PAYMENT</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

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
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  cardPreview: {
    backgroundColor: '#FFF',
    height: 200,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    marginBottom: 32,
    shadowColor: '#FFF',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#000',
    borderRadius: 6,
  },
  cardBrand: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  cardNumber: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  cardExp: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  billDetails: {
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    color: '#444',
    fontSize: 14,
    fontWeight: '700',
  },
  billValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  payButton: {
    backgroundColor: '#FFF',
    height: 72,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  payText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  processingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },
  processingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 24,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 48,
    lineHeight: 24,
  },
  homeButton: {
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 24,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default PaymentScreen;
