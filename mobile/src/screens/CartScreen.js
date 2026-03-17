import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react-native';

const CartScreen = ({ navigation }) => {
  const { cart, removeFromCart, updateQty, subtotal } = useCart();

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => updateQty(item.id, item.qty - 1)}
            style={styles.qtyButton}
          >
            <Minus size={16} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.qty}</Text>
          <TouchableOpacity 
            onPress={() => updateQty(item.id, item.qty + 1)}
            style={styles.qtyButton}
          >
            <Plus size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
        <Trash2 size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        <Text style={styles.headerSubtitle}>{cart.length} Items</Text>
      </View>

      {cart.length > 0 ? (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalAmount}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>PROCEED TO CHECKOUT</Text>
              <ArrowRight size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color="#333" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySubtitle}>Intelligence awaits. Start adding items.</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopButtonText}>EXPLORE PRODUCTS</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
  },
  qtyButton: {
    padding: 6,
  },
  qtyText: {
    color: '#FFF',
    marginHorizontal: 12,
    fontWeight: '700',
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 24,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  checkoutButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  checkoutText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  shopButton: {
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default CartScreen;
