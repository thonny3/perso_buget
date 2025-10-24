import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { forgotPasswordService } from '../../services/apiService';
import { getTranslation } from '../../utils/translations';

export default function ForgotPasswordScreen({ onSwitchToLogin, onSwitchToResetPassword }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!email.trim()) {
      setError(getTranslation('forgotPassword.emailRequired'));
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(getTranslation('forgotPassword.emailInvalid'));
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordService.forgotPassword(email.trim());
      
      if (result.success) {
        setSuccess(getTranslation('forgotPassword.successMessage'));
        Alert.alert(
          getTranslation('common.success'),
          getTranslation('forgotPassword.successMessage'),
          [{ text: 'OK', onPress: () => onSwitchToLogin() }]
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onSendOtp = async () => {
    setError('');
    setSuccess('');
    
    if (!email.trim()) {
      setError(getTranslation('forgotPassword.emailRequired'));
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(getTranslation('forgotPassword.emailInvalid'));
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordService.requestOtp(email.trim());
      
      if (result.success) {
        setSuccess(getTranslation('forgotPassword.otpSuccessMessage'));
        // Rediriger vers l'écran de réinitialisation avec l'email pré-rempli
        onSwitchToResetPassword(email.trim());
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Impossible d'envoyer le code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome name="envelope" size={24} color="#059669" />
            </View>
            <Text style={styles.title}>{getTranslation('forgotPassword.title')}</Text>
            <Text style={styles.subtitle}>{getTranslation('forgotPassword.subtitle')}</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <AntDesign name="exclamationcircle" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <AntDesign name="checkcircle" size={16} color="#059669" />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{getTranslation('forgotPassword.emailLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={getTranslation('forgotPassword.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, loading && { opacity: 0.6 }]} 
            disabled={loading} 
            onPress={onSubmit}
          >
            <Text style={styles.buttonText}>
              {loading ? getTranslation('forgotPassword.sendButtonLoading') : getTranslation('forgotPassword.sendButton')}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{getTranslation('login.orDivider')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, loading && { opacity: 0.6 }]} 
            disabled={loading} 
            onPress={onSendOtp}
          >
            <AntDesign name="key" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {loading ? getTranslation('forgotPassword.sendOtpButtonLoading') : getTranslation('forgotPassword.sendOtpButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={onSwitchToLogin}
          >
            <AntDesign name="arrowleft" size={16} color="#059669" />
            <Text style={styles.backButtonText}>{getTranslation('forgotPassword.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f5f7f9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  logoWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 88,
    height: 88,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 17,
    backgroundColor: '#fff',
  },
  button: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#059669',
  },
  secondaryButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
