import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { forgotPasswordService } from '../../services/apiService';
import { getTranslation } from '../../utils/translations';

export default function ResetPasswordScreen({ onSwitchToLogin, onSwitchToForgotPassword, email: prefilledEmail = '', token = '' }) {
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(false);

  useEffect(() => {
    // Si on a un email pré-rempli, on utilise le mode OTP
    if (prefilledEmail) {
      setUseOtp(true);
    }
    // Si on a un token, on utilise le mode token
    if (token) {
      setUseOtp(false);
    }
  }, [prefilledEmail, token]);

  const onSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (useOtp) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError(getTranslation('resetPassword.emailInvalid'));
        return;
      }
      if (!otp || otp.length !== 6) {
        setError(getTranslation('resetPassword.otpInvalid'));
        return;
      }
    } else {
      if (!token) {
        setError(getTranslation('resetPassword.tokenRequired'));
        return;
      }
    }

    if (!newPassword || newPassword.length < 6) {
      setError(getTranslation('resetPassword.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(getTranslation('resetPassword.passwordsNotMatch'));
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (useOtp) {
        result = await forgotPasswordService.resetWithOtp(email.trim(), otp.trim(), newPassword);
      } else {
        result = await forgotPasswordService.resetPassword(token, newPassword);
      }

      if (result.success) {
        setSuccess(getTranslation('resetPassword.successMessage'));
        Alert.alert(
          getTranslation('common.success'),
          getTranslation('resetPassword.successMessage'),
          [{ text: 'OK', onPress: () => onSwitchToLogin() }]
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Impossible de réinitialiser le mot de passe");
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
              <AntDesign name="key" size={24} color="#059669" />
            </View>
            <Text style={styles.title}>{getTranslation('resetPassword.title')}</Text>
            <Text style={styles.subtitle}>{getTranslation('resetPassword.subtitle')}</Text>
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

          {useOtp && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{getTranslation('resetPassword.emailLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={getTranslation('resetPassword.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!prefilledEmail} // Si email pré-rempli, on ne peut pas le modifier
              />
            </View>
          )}

          {useOtp && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{getTranslation('resetPassword.otpLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={getTranslation('resetPassword.otpPlaceholder')}
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{getTranslation('resetPassword.passwordLabel')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={getTranslation('resetPassword.passwordPlaceholder')}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                <AntDesign 
                  name={showNewPassword ? "eye" : "eye-slash"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{getTranslation('resetPassword.confirmPasswordLabel')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={getTranslation('resetPassword.confirmPasswordPlaceholder')}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <AntDesign 
                  name={showConfirmPassword ? "eye" : "eye-slash"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            disabled={loading} 
            onPress={onSubmit}
          >
            <Text style={styles.buttonText}>
              {loading ? getTranslation('resetPassword.resetButtonLoading') : getTranslation('resetPassword.resetButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => useOtp ? onSwitchToForgotPassword() : onSwitchToLogin()}
          >
            <AntDesign name="arrowleft" size={16} color="#059669" />
            <Text style={styles.backButtonText}>
              {useOtp ? getTranslation('forgotPassword.backToLogin') : getTranslation('resetPassword.backToLogin')}
            </Text>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 17,
    backgroundColor: '#fff',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  button: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
