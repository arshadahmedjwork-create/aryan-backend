import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [cart]);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.id === productId ? { ...item, qty } : item));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
