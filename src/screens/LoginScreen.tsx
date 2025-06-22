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
import { login, register } from '../store/slices/userSlice';
import { UserType } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/colors';
import { Alert } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(login({ email, password }) as any).unwrap();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(register({ email, password, firstName, lastName }) as any).unwrap();
      Alert.alert('Success', 'Account created! You can now login.');
      setIsRegisterMode(false);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.subtitle}>
            {isRegisterMode ? 'Create your account' : 'Find your dream home with a swipe'}
          </Text>
          
          <View style={styles.form}>
            {isRegisterMode && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor={colors.textTertiary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor={colors.textTertiary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </>
            )}
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
            
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={isRegisterMode ? handleRegister : handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Please wait...' : (isRegisterMode ? 'Sign Up' : 'Login')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => {
                setIsRegisterMode(!isRegisterMode);
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
              }}
            >
              <Text style={styles.signupButtonText}>
                {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Sign up"}
              </Text>
            </TouchableOpacity>
            
            {!isRegisterMode && (
              <View style={styles.testCredentialsContainer}>
                <Text style={styles.testCredentialsText}>Demo Account:</Text>
                <Text style={styles.testCredentialsDetail}>Create a new account using Sign up</Text>
                <Text style={styles.testCredentialsDetail}>Or use your existing credentials</Text>
              </View>
            )}
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
  disabledButton: {
    opacity: 0.6,
  },
  testCredentialsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  testCredentialsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  testCredentialsDetail: {
    color: colors.textTertiary,
    fontSize: 13,
    marginBottom: 2,
  },
});

export default LoginScreen;