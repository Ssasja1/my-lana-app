import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createCategoria } from '../../api';

export default function RegistroCategorias() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const router = useRouter();

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el nombre de la categoría');
      return;
    }

    const categoriaData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    };

    try {
      const response = await createCategoria(categoriaData);
      console.log('Categoría creada:', response);
      Alert.alert('Éxito', 'Categoría registrada correctamente');
      router.replace('/(tabs)/Categorias');
    } catch (error) {
      console.error('Error al crear categoría:', error);
      Alert.alert('Error', 'No se pudo crear la categoría');
    }
  };

  const handleCancelar = () => {
    setNombre('');
    setDescripcion('');
    router.replace('/(tabs)/Categorias');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Registro de Categoría</Text>

      {/* Nombre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de la categoría *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Alimentación"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      {/* Descripción */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Descripción opcional"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleGuardar}
        >
          <Text style={styles.buttonText}>Guardar categoría</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelar}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => router.replace('/(tabs)/Inicio')}
          >
            <Text style={styles.buttonText}>Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, color: '#000', backgroundColor: '#fafafa' },
  buttonContainer: { marginTop: 20 },
  secondaryButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveButton: { backgroundColor: '#2196F3' },
  cancelButton: { backgroundColor: '#f44336' },
  homeButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
