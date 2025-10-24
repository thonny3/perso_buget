import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Dashboard from './components/Dashboard';
import { authService } from './services/apiService';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function LoginScreen({ onSwitchToRegister, onSwitchToDashboard }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const onSubmit = async () => {
    console.log('🚀 Début du processus de connexion');
    setError('');
    
    // Validation
    if (!email) {
      console.log('❌ Validation échouée: Email manquant');
      setError(t('login.emailRequired'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log('❌ Validation échouée: Format email invalide');
      setError(t('login.emailInvalid'));
      return;
    }
    if (!password || password.length < 6) {
      console.log('❌ Validation échouée: Mot de passe trop court');
      setError(t('login.passwordTooShort'));
      return;
    }

    console.log('✅ Validation réussie, tentative de connexion...');
    setLoading(true);
    
    try {
      console.log('📡 Appel du service de connexion...');
      const result = await authService.login({ email, password });
      
      console.log('📨 Résultat de connexion reçu:', result);
      
      if (result.success) {
        console.log('✅ Connexion réussie, redirection vers le dashboard');
        onSwitchToDashboard();
      } else {
        console.log('❌ Connexion échouée:', result.error);
        setError(result.error);
      }
    } catch (e) {
      console.log('💥 Erreur inattendue lors de la connexion:', e);
      setError(t('common.error'));
    } finally {
      console.log('🏁 Fin du processus de connexion');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        <View style={styles.socialGroup}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <AntDesign name="google" size={18} color="#DB4437" />
            <Text style={styles.socialText}>{t('login.googleLogin')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <FontAwesome name="facebook-official" size={18} color="#1877F2" />
            <Text style={styles.socialText}>{t('login.facebookLogin')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('login.orDivider')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder={t('login.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder={t('login.passwordPlaceholder')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={onSubmit}>
          <Text style={styles.buttonText}>{loading ? t('login.loginButtonLoading') : t('login.loginButton')}</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.linkText}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('login.noAccount')}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToRegister}>
            <Text style={styles.footerLink}>{t('login.registerLink')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

function RegisterScreen({ onSwitchToLogin, onSwitchToDashboard }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currency: 'MGA',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const currencyOptions = [
    { value: 'MGA', label: t('currencies.MGA'), flag: '🇲🇬' },
    { value: 'EUR', label: t('currencies.EUR'), flag: '🇪🇺' },
    { value: 'USD', label: t('currencies.USD'), flag: '🇺🇸' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError(t('register.firstNameRequired'));
      return false;
    }
    if (!formData.lastName.trim()) {
      setError(t('register.lastNameRequired'));
      return false;
    }
    if (!formData.email) {
      setError(t('register.emailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t('register.emailInvalid'));
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError(t('register.passwordTooShort'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsNotMatch'));
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        nom: formData.firstName,
        prenom: formData.lastName,
        email: formData.email,
        mot_de_passe: formData.password,
        devise: formData.currency,
      };

      const result = await authService.register(userData);
      
      if (result.success) {
        Alert.alert(t('common.success'), 'Compte créé avec succès!', [
          { text: t('common.confirm'), onPress: () => onSwitchToDashboard() }
        ]);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>{t('register.title')}</Text>
        <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

        <View style={styles.socialGroup}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <AntDesign name="google" size={18} color="#DB4437" />
            <Text style={styles.socialText}>{t('register.googleRegister')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <FontAwesome name="facebook-official" size={18} color="#1877F2" />
            <Text style={styles.socialText}>{t('register.facebookRegister')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('register.orDivider')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>{t('register.firstNameLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('register.firstNamePlaceholder')}
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>{t('register.lastNameLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('register.lastNamePlaceholder')}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
            />
          </View>
        </View>

        <View>
          <Text style={styles.label}>{t('register.emailLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
        </View>

        <View>
          <Text style={styles.label}>{t('register.currencyLabel')}</Text>
          <View style={styles.currencyContainer}>
            <Text style={styles.currencyText}>
              {currencyOptions.find(opt => opt.value === formData.currency)?.flag} {formData.currency}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>{t('register.passwordLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.passwordPlaceholder')}
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
          />
        </View>

        <View>
          <Text style={styles.label}>{t('register.confirmPasswordLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.confirmPasswordPlaceholder')}
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={onSubmit}>
          <Text style={styles.buttonText}>{loading ? t('register.registerButtonLoading') : t('register.registerButton')}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('register.hasAccount')}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToLogin}>
            <Text style={styles.footerLink}>{t('register.loginLink')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </ScrollView>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  if (currentScreen === 'dashboard') {
    return (
      <LanguageProvider>
        <Dashboard onLogout={handleLogout} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      {currentScreen === 'login' ? (
        <LoginScreen 
          onSwitchToRegister={() => setCurrentScreen('register')} 
          onSwitchToDashboard={() => setCurrentScreen('dashboard')}
        />
      ) : (
        <RegisterScreen 
          onSwitchToLogin={() => setCurrentScreen('login')} 
          onSwitchToDashboard={() => setCurrentScreen('dashboard')}
        />
      )}
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f5f7f9',
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065f46',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
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
  socialGroup: {
    marginTop: 18,
    marginBottom: 16,
    gap: 12,
  },
  socialButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    marginLeft: 12,
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  dividerRow: {
    marginVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 17,
    marginBottom: 16,
    backgroundColor: '#fff',
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
  linkRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  linkText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#4b5563',
    fontSize: 15,
  },
  footerLink: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  currencyContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  currencyText: {
    fontSize: 17,
    color: '#374151',
  },
});
