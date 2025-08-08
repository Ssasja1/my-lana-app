import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { registrar } from '../../api';

// Tipado explícito del formulario
type FormData = {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  email: string;
  password: string;
};

export default function RegistroScreen() {
  const [form, setForm] = useState<FormData>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    email: '',
    password: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Tipado correcto para evitar error TS7006
  const handleChange = (name: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistro = async () => {
    if (form.password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!form.email || !form.password || !form.nombre) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const data = await registrar(form);
      Alert.alert('Registro exitoso', `Bienvenido ${data.nombre}`);
      setForm({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        email: '',
        password: ''
      });
      setConfirmPassword('');
    } catch (err) {
      // Manejo seguro del tipo 'unknown'
      if (err instanceof Error) {
        Alert.alert('Error', err.message || 'Error al registrar');
      } else {
        Alert.alert('Error', 'Error desconocido al registrar');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crear cuenta</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#888"
            value={form.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Apellido paterno"
            placeholderTextColor="#888"
            value={form.apellido_paterno}
            onChangeText={(text) => handleChange('apellido_paterno', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Apellido materno"
            placeholderTextColor="#888"
            value={form.apellido_materno}
            onChangeText={(text) => handleChange('apellido_materno', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="#888"
            value={form.telefono}
            onChangeText={(text) => handleChange('telefono', text)}
            keyboardType="phone-pad"
          />
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Información de acceso</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#888"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegistro}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Tus estilos permanecen igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 25,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  registerButton: {
    backgroundColor: '#228b22',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    marginRight: 5,
  },
  loginLink: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 10,
  },
});