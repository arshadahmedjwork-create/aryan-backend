import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
          <View style={styles.userStatus}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>QueryNexis Intelligence Active</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Where Queries Become{"\n"}
            <Text style={styles.highlight}>Intelligence.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Experience the future of autonomous commerce through our agentic AI ecosystem.
          </Text>
          
          <TouchableOpacity 
            style={styles.cta}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.ctaText}>Explore Catalog</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>

        {/* Stats/Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Zap color="#FFF" size={24} />
            </View>
            <Text style={styles.featureTitle}>Efficient</Text>
            <Text style={styles.featureDesc}>Autonomous fulfillment loops.</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Globe color="#FFF" size={24} />
            </View>
            <Text style={styles.featureTitle}>Global</Text>
            <Text style={styles.featureDesc}>Neural network distribution.</Text>
          </View>
        </View>

        {/* Intelligence Banner */}
        <TouchableOpacity 
          style={styles.aiBanner}
          onPress={() => navigation.navigate('AI Chat')}
        >
          <View style={styles.aiIcon}>
            <Sparkles color="#000" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiBannerTitle}>Connect to Intelligence</Text>
            <Text style={styles.aiBannerDesc}>Natural language order management and tracking.</Text>
          </View>
          <ArrowRight color="#FFF" size={20} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hero: {
    padding: 24,
    marginTop: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 52,
    letterSpacing: -2,
  },
  highlight: {
    color: '#FFF', // Keeping it monochrome
    opacity: 0.4,
  },
  heroSubtitle: {
    color: '#666',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 20,
  },
  cta: {
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  features: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#222',
  },
  featureIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#222',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  featureDesc: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  aiBanner: {
    margin: 24,
    padding: 24,
    backgroundColor: '#111',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  aiIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiBannerDesc: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
  },
});
