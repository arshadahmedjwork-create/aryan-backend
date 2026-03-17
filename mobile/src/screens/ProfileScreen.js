import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Shield, Zap, ChevronRight, Settings, Info, Bell } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Terminate Session",
      "Are you sure you want to decouple from the QueryNexis network?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Terminate", onPress: logout, style: "destructive" }
      ]
    );
  };

  const ProfileItem = ({ icon: Icon, label, value, onPress, dangerous }) => (
    <TouchableOpacity 
      style={[styles.item, dangerous && styles.itemDangerous]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, dangerous && styles.iconContainerDangerous]}>
          <Icon color={dangerous ? "#FF4444" : "#FFF"} size={20} />
        </View>
        <View>
          <Text style={[styles.itemLabel, dangerous && styles.itemLabelDangerous]}>{label}</Text>
          {value && <Text style={styles.itemValue}>{value}</Text>}
        </View>
      </View>
      {onPress && <ChevronRight color="#333" size={20} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Identity Section */}
        <View style={styles.identityHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color="#000" size={40} />
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Anonymous Intelligence'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'nexus@querynexis.io'}</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Zap color="#FFF" size={24} />
            <Text style={styles.metricLabel}>LEVEL</Text>
            <Text style={styles.metricValue}>L7 CORE</Text>
          </View>
          <View style={styles.metricCard}>
            <Shield color="#FFF" size={24} />
            <Text style={styles.metricLabel}>SECURITY</Text>
            <Text style={styles.metricValue}>STARK-4</Text>
          </View>
        </View>

        {/* Action List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDENTITY MANAGEMENT</Text>
          <View style={styles.card}>
            <ProfileItem 
              icon={Settings} 
              label="Intelligence Settings" 
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <ProfileItem 
              icon={Bell} 
              label="Neural Notifications" 
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <ProfileItem 
              icon={Shield} 
              label="Privacy Protocols" 
              onPress={() => {}} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM INFO</Text>
          <View style={styles.card}>
            <ProfileItem 
              icon={Info} 
              label="Nexis Protocol v1.4.2" 
            />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.card}>
            <ProfileItem 
              icon={LogOut} 
              label="Terminate Session" 
              dangerous
              onPress={handleLogout} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  identityHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 40,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  metricLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 1,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  itemDangerous: {
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDangerous: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  itemLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  itemLabelDangerous: {
    color: '#FF4444',
  },
  itemValue: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginHorizontal: 20,
  },
});
