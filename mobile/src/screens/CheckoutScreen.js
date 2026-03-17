import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, MapPin, User, Phone, CheckCircle2 } from 'lucide-react-native';

const CheckoutScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { subtotal } = useCart();
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    address: '',
    phone: '',
    city: '',
  });

  const handleNext = () => {
    if (!formData.address || !formData.phone || !formData.city) {
      alert('Please fill in all shipping details');
      return;
    }
    navigation.navigate('Payment', { shippingData: formData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shipping</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.stepIndicator}>
            <View style={styles.step}>
              <CheckCircle2 color="#FFF" size={20} />
              <Text style={styles.stepTextActive}>Details</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.step}>
              <View style={styles.dot} />
              <Text style={styles.stepTextInactive}>Payment</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
            
            <View style={styles.inputGroup}>
              <User color="#666" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#444"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <MapPin color="#666" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                placeholderTextColor="#444"
                value={formData.address}
                multiline
                onChangeText={(text) => setFormData({...formData, address: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <MapPin color="#666" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#444"
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Phone color="#666" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#444"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>CONTINUE TO PAYMENT</Text>
            <ArrowLeft color="#000" size={20} style={{ transform: [{ rotate: '180deg'}] }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  step: {
    alignItems: 'center',
  },
  stepTextActive: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  stepTextInactive: {
    color: '#333',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  line: {
    width: 60,
    height: 1,
    backgroundColor: '#222',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#FFF',
    fontSize: 15,
  },
  summaryCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  summaryTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#AAA',
    fontSize: 15,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 16,
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  footer: {
    padding: 24,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  nextButton: {
    backgroundColor: '#FFF',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default CheckoutScreen;
