import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router'; // 👈 usamos router
import { getCategorias, createPagoFijo } from '../../api';

export default function RegistroPagoFijo() {
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [diaPago, setDiaPago] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activo, setActivo] = useState(true);

  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const router = useRouter(); // 👈 para navegar

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        if (data && Array.isArray(data)) {
          setCategorias(data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleGuardar = async () => {
    if (!nombre || !monto || !categoriaId) {
      Alert.alert('Campos requeridos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const pagoData = {
      nombre,
      monto: parseFloat(monto),
      fecha_pago: diaPago.toISOString().split('T')[0],
      categoria_id: categoriaId,
      activo,
    };

    try {
      const response = await createPagoFijo(pagoData);
      console.log('Pago fijo creado:', response);
      Alert.alert('Éxito', 'Pago fijo registrado correctamente');

      router.replace('/(tabs)/MostrarPagoFijo'); // 👈 redirigir a la vista de pagos fijos
    } catch (error) {
      console.error('Error al crear pago fijo:', error);
      Alert.alert('Error', 'No se pudo crear el pago fijo');
    }
  };

  const handleCancelar = () => {
    setNombre('');
    setMonto('');
    setDiaPago(new Date());
    setCategoriaId(null);
    setActivo(true);
    router.replace('/(tabs)/MostrarPagoFijo'); // 👈 o podrías navegar a inicio si prefieres
  };

  const handleMontoChange = (text: string) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setMonto(text);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Registro de Pago Fijo</Text>

      {/* Nombre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre del pago fijo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Renta mensual"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      {/* Monto */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Monto (mensual) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 1200.00"
          keyboardType="numeric"
          value={monto}
          onChangeText={handleMontoChange}
        />
      </View>

      {/* Día de pago */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Día de pago *</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {diaPago.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={diaPago}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDiaPago(selectedDate);
            }}
          />
        )}
      </View>

      {/* Categoría */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={(itemValue) => setCategoriaId(itemValue)}
            style={styles.picker}
            enabled={!loadingCategorias}
          >
            <Picker.Item
              label={loadingCategorias ? 'Cargando...' : 'Selecciona categoría'}
              value={null}
            />
            {categorias.map((cat) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Activo */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Activo</Text>
        <Switch
          value={activo}
          onValueChange={setActivo}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={activo ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleGuardar}
        >
          <Text style={styles.buttonText}>Guardar pago fijo</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  picker: { height: 50, width: '100%' },
  switchContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  buttonContainer: { marginTop: 20 },
  secondaryButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: {
    flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4,
  },
  saveButton: { backgroundColor: '#2196F3' },
  cancelButton: { backgroundColor: '#f44336' },
  homeButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  datePickerButton: { padding: 12, borderColor: '#ccc', borderWidth: 1, borderRadius: 8 },
  datePickerText: { fontSize: 16 },
});
