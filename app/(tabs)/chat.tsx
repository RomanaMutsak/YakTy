import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView, Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { getAIResponse } from '../../services/aiService';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  inputBackground: 'rgba(121, 85, 72, 0.08)',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
  userBubble: '#8D6E63',
  aiBubble: 'rgba(121, 85, 72, 0.08)',
};
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}
const DISCLAIMER_MESSAGE: Message = {
  id: 'disclaimer',
  sender: 'ai',
  text: "Привіт! Я твій помічник. Я тут, щоб вислуховувати тебе, але пам'ятай: я не замінюю професійного психолога чи лікаря. Вся наша розмова конфіденційна і залишається лише тут."
};


export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([DISCLAIMER_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const text = inputText.trim();
    if (text.length === 0 || isTyping) return;
    const userMessage: Message = {
      id: String(Date.now()),
      text: text,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    try {
      const aiText = await getAIResponse(text); 
      const aiMessage: Message = {
        id: String(Date.now() + 1),
        text: aiText,
        sender: 'ai',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        text: "Вибач, сталася помилка. Спробуй ще раз.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={100} 
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          
          keyboardDismissMode="interactive" 
          onScrollBeginDrag={Keyboard.dismiss} 
          keyboardShouldPersistTaps="handled" 
          
          renderItem={({ item }) => (
            <View style={[
              styles.bubbleContainer,
              item.sender === 'user' ? styles.userBubbleContainer : styles.aiBubbleContainer
            ]}>
              <View style={[
                styles.bubble,
                item.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}>
                <Text style={item.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
            <Text style={styles.typingText}>Помічник друкує...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isTyping ? "Зачекай..." : "Напиши щось..."}
            placeholderTextColor={COLORS.textSecondary}
            editable={!isTyping} 
            multiline
          />
          <Pressable 
            style={[styles.sendButton, isTyping && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={isTyping} 
          >
            <Ionicons name="send-outline" size={24} color={COLORS.buttonText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  bubbleContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  aiBubbleContainer: {
    alignSelf: 'flex-start',
  },
  userBubbleContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubbleText: {
    color: COLORS.textPrimary,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  userBubbleText: {
    color: COLORS.buttonText,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', 
    paddingHorizontal: 10,
    paddingVertical: 8, 
    borderTopWidth: 1,
    borderTopColor: 'rgba(121, 85, 72, 0.1)',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120, 
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10, 
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.buttonBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2, 
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
});