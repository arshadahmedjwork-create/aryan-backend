import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Home, Package, MessageSquare, User, ShoppingBag, ClipboardList, Command, Truck, Navigation } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ChatScreen from '../screens/ChatScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboard from '../screens/AdminDashboard';
import DriverDashboard from '../screens/DriverDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const commonTabOptions = {
  tabBarActiveTintColor: '#FFF',
  tabBarInactiveTintColor: '#444',
  tabBarStyle: {
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
    elevation: 10,
    shadowColor: '#FFF',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerShown: false,
};

const CustomerTabs = () => (
  <Tab.Navigator screenOptions={commonTabOptions}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} />
    <Tab.Screen name="Shop" component={ProductsScreen} options={{ tabBarIcon: ({ color }) => <Package color={color} size={24} /> }} />
    <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: ({ color }) => <ShoppingBag color={color} size={24} /> }} />
    <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color }) => <ClipboardList color={color} size={24} /> }} />
    <Tab.Screen name="AI Chat" component={ChatScreen} options={{ tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator screenOptions={commonTabOptions}>
    <Tab.Screen name="Command" component={AdminDashboard} options={{ tabBarIcon: ({ color }) => <Command color={color} size={24} /> }} />
    <Tab.Screen name="Fleet" component={DriverDashboard} options={{ tabBarIcon: ({ color }) => <Truck color={color} size={24} /> }} />
    <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
  </Tab.Navigator>
);

const DriverTabs = () => (
  <Tab.Navigator screenOptions={commonTabOptions}>
    <Tab.Screen name="Missions" component={DriverDashboard} options={{ tabBarIcon: ({ color }) => <Navigation color={color} size={24} /> }} />
    <Tab.Screen name="AI Support" component={ChatScreen} options={{ tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
  </Tab.Navigator>
);

const MainTabs = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminTabs />;
  if (user?.role === 'driver') return <DriverTabs />;
  return <CustomerTabs />;
};

export default function AppNavigator() {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer theme={{ colors: { background: '#000' } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Root" component={MainTabs} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
