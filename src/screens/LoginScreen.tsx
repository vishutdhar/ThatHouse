import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/userSlice';
import { UserType } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/colors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const handleLogin = () => {
    // Mock login for MVP
    dispatch(loginSuccess({
      id: '1',
      email: email,
      firstName: 'John',
      lastName: 'Doe',
      userType: UserType.BUYER,
      savedProperties: [],
      rejectedProperties: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }));
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>That House</Text>
          <Text style={styles.subtitle}>Find your dream home with a swipe</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF6B6B', // Keep brand color as requested
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: '#FF6B6B', // Keep brand color as requested
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FF6B6B', // Keep brand color as requested
    fontSize: 14,
  },
});

export default LoginScreen;