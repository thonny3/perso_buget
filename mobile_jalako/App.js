import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import React, { useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function LoginScreen({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email) {
      setError('Ny mailaka dia ilaina');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Ny mailaka dia tsy marina');
      return;
    }
    if (!password || password.length < 6) {
      setError('Ny teny miafina dia tokony ho 6 na mihoatra');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with your API call, e.g., axios.post('...')
      await new Promise(resolve => setTimeout(resolve, 1200));
      // Navigate to your main app screen if using a navigator
      // For now, just clear the form
      setEmail('');
      setPassword('');
    } catch (e) {
      setError("Nisy olana tamin'ny fidirana");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>MyJalako</Text>
        <Text style={styles.subtitle}>Midira amin'ny kaontinao</Text>

        <View style={styles.socialGroup}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <AntDesign name="google" size={18} color="#DB4437" />
            <Text style={styles.socialText}>Se connecter avec Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <FontAwesome name="facebook-official" size={18} color="#1877F2" />
            <Text style={styles.socialText}>Se connecter avec Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={onSubmit}>
          <Text style={styles.buttonText}>{loading ? 'Miditra...' : 'Hiditra'}</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.linkText}>Hadino ny teny miafina?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Mbola tsy manana kaonty? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToRegister}>
            <Text style={styles.footerLink}>Hisoratra anarana</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

function RegisterScreen({ onSwitchToLogin }) {
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

  const currencyOptions = [
    { value: 'MGA', label: 'Ariary Malagasy (Ar)', flag: '🇲🇬' },
    { value: 'EUR', label: 'Euro (€)', flag: '🇪🇺' },
    { value: 'USD', label: 'Dollar ($)', flag: '🇺🇸' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Ny fanampiny dia ilaina');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Ny anarana dia ilaina');
      return false;
    }
    if (!formData.email) {
      setError('Ny mailaka dia ilaina');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Ny mailaka dia tsy marina');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Ny teny miafina dia tokony ho 6 na mihoatra');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Ny teny miafina dia tsy mitovy');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with your API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      // Navigate to login after successful registration
      onSwitchToLogin();
    } catch (e) {
      setError("Nisy olana tamin'ny fisoratana anarana");
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
        <Text style={styles.title}>MyJalako</Text>
        <Text style={styles.subtitle}>Mamorona ny kaontinao</Text>

        <View style={styles.socialGroup}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <AntDesign name="google" size={18} color="#DB4437" />
            <Text style={styles.socialText}>S'inscrire avec Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <FontAwesome name="facebook-official" size={18} color="#1877F2" />
            <Text style={styles.socialText}>S'inscrire avec Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Rakoto"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Andry"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
            />
          </View>
        </View>

        <View>
          <Text style={styles.label}>Mailaka</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
        </View>

        <View>
          <Text style={styles.label}>Vola</Text>
          <View style={styles.currencyContainer}>
            <Text style={styles.currencyText}>
              {currencyOptions.find(opt => opt.value === formData.currency)?.flag} {formData.currency}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Teny miafina</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
          />
        </View>

        <View>
          <Text style={styles.label}>Hamarino ny teny miafina</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={onSubmit}>
          <Text style={styles.buttonText}>{loading ? 'Miditra...' : 'Hisoratra anarana'}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Efa manana kaonty? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToLogin}>
            <Text style={styles.footerLink}>Hiditra</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </ScrollView>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  return currentScreen === 'login' ? (
    <LoginScreen onSwitchToRegister={() => setCurrentScreen('register')} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setCurrentScreen('login')} />
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
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#065f46',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  logoWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  socialGroup: {
    marginTop: 14,
    marginBottom: 12,
    gap: 8,
  },
  socialButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    marginLeft: 10,
    color: '#374151',
    fontWeight: '600',
  },
  dividerRow: {
    marginVertical: 10,
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
    marginHorizontal: 8,
    color: '#6b7280',
    fontSize: 12,
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  linkRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  linkText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#4b5563',
    fontSize: 13,
  },
  footerLink: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  currencyContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  currencyText: {
    fontSize: 16,
    color: '#374151',
  },
});
