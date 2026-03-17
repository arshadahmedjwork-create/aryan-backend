import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Send, Bot, User, Sparkles } from 'lucide-react-native';

export default function ChatScreen() {
  const { API_URL, token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  // Initialize role-based persona with role-based welcome
  useEffect(() => {
    const role = user?.role || 'customer';
    const welcome = role === 'admin' 
      ? 'Welcome to Command Intelligence. Tactical metrics and fleet status are available for analysis.' 
      : role === 'driver'
      ? 'Tactical Coordination active. Ready for mission briefing and route optimization.'
      : 'Hello! I am QueryNexis Concierge. How can I assist with your orders today?';
    
    setMessages([{ role: 'assistant', content: welcome }]);
  }, [user]);

  const sendMessage = async (overrideInput = null) => {
    // Explicitly check for string to support direct calls from chips if needed
    // But since chips use setInput, we primarily rely on state
    const messageToSend = (typeof overrideInput === 'string' ? overrideInput : input).trim();
    if (!messageToSend) {
      console.log('[CHAT] Empty message, aborting');
      return;
    }

    const userMsg = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, 
        { message: messageToSend },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the agents. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageWrapper,
      item.role === 'user' ? styles.userWrapper : styles.assistantWrapper
    ]}>
      <View style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.role === 'user' ? styles.userText : styles.assistantText
        ]}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.botIcon}>
          <Bot color="#000" size={24} />
        </View>
        <View>
          <Text style={styles.headerTitle}>QueryNexis Intelligence</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>Active System</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          !loading && messages.length === 1 ? (
            <View style={styles.quickActions}>
              <Text style={styles.quickActionTitle}>QUICK INTEL</Text>
              <View style={styles.chipsContainer}>
                {user?.role === 'admin' ? (
                  <>
                    <TouchableOpacity onPress={() => setInput('Show revenue summary')} style={styles.chip}>
                      <Text style={styles.chipText}>Revenue Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Fleet tactical status')} style={styles.chip}>
                      <Text style={styles.chipText}>Fleet Status</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Highest selling products')} style={styles.chip}>
                      <Text style={styles.chipText}>Top Products</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Check system health')} style={styles.chip}>
                      <Text style={styles.chipText}>System Health</Text>
                    </TouchableOpacity>
                  </>
                ) : user?.role === 'driver' ? (
                  <>
                    <TouchableOpacity onPress={() => setInput('My active missions')} style={styles.chip}>
                      <Text style={styles.chipText}>Active Missions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Sync coordinates')} style={styles.chip}>
                      <Text style={styles.chipText}>Sync GPS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Check traffic status')} style={styles.chip}>
                      <Text style={styles.chipText}>Traffic Intel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Emergency support')} style={styles.chip}>
                      <Text style={styles.chipText}>Emergency</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setInput('Track my order')} style={styles.chip}>
                      <Text style={styles.chipText}>Track Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Cancel my order')} style={styles.chip}>
                      <Text style={styles.chipText}>Cancel Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('New products in store')} style={styles.chip}>
                      <Text style={styles.chipText}>Recent Arrivals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setInput('Refund protocol')} style={styles.chip}>
                      <Text style={styles.chipText}>Refund Request</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : null
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Inquire about orders, metrics..."
              placeholderTextColor="#444"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => sendMessage()}
              disabled={loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Send color="#000" size={18} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  botIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#F0F0F0',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
  },
  statusLabel: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  messageList: {
    padding: 20,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  userWrapper: {
    justifyContent: 'end',
  },
  assistantWrapper: {
    justifyContent: 'start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#FFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#000',
    fontWeight: '500',
  },
  assistantText: {
    color: '#FFF',
  },
  inputArea: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  quickActions: {
    marginTop: 20,
    paddingBottom: 20,
  },
  quickActionTitle: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
    opacity: 0.4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  chipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
