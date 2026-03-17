import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { Search, Filter, Plus } from 'lucide-react-native';
import AIAgentPulse from '../components/AIAgentPulse';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_URL, token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Intelligence Secured', `${product.name} added to your bag.`);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>{item.name[0]}</Text>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
        <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
          <Plus color="#000" size={18} />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <Search color="#666" size={18} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search Intelligence..."
            placeholderTextColor="#444"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>QueryNexis Selects</Text>
        <Text style={styles.subtitle}>Actionable intelligence for your catalog.</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          numColumns={1}
          showsVerticalScrollIndicator={false}
        />
      )}
      <AIAgentPulse />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    height: 50,
    backgroundColor: '#111',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#FFF',
    fontSize: 14,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#111',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.05)',
    fontSize: 100,
    fontWeight: '900',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  productPrice: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
  productDesc: {
    color: '#666',
    fontSize: 12,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
