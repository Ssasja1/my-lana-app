import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getCategorias, createTransaccion } from '../../api';
import { router } from 'expo-router';

interface Categoria {
  id: number;
  nombre: string;
}

export default function TransactionForm() {
  const [monto, setMonto] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [descripcion, setDescripcion] = useState<string>('');
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('egreso');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data || []);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      }
    };

    fetchCategorias();
  }, []);

  const handleGuardar = async (): Promise<void> => {
    if (!monto || !categoria || !tipo) {
      Alert.alert('Campos requeridos', 'Por favor complete los campos obligatorios');
      return;
    }

    const categoriaSeleccionada = categorias.find((c) => c.nombre === categoria);
    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'La categoría seleccionada no es válida');
      return;
    }

    const transactionData = {
      monto: tipo === 'egreso' ? -Math.abs(parseFloat(monto)) : parseFloat(monto),
      categoria_id: categoriaSeleccionada.id,
      fecha: fecha.toISOString().split('T')[0],
      descripcion,
      tipo,
    };

    try {
      await createTransaccion(transactionData);
      Alert.alert('Éxito', 'Transacción registrada correctamente');
      router.replace('/(tabs)/MostrarTransacciones'); // ✅ Redirige a MostrarTransacciones
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message || 'No se pudo guardar la transacción');
      } else {
        Alert.alert('Error', 'No se pudo guardar la transacción');
      }
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) setFecha(selectedDate);
  };

  const showDatepicker = (): void => {
    setShowDatePicker(true);
  };

  const handleMontoChange = (text: string): void => {
    if (/^\d*\.?\d*$/.test(text)) setMonto(text);
  };

  const handleVolverInicio = (): void => {
    router.replace('/(tabs)/Inicio'); // ✅ Volver al inicio
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Registro de Transacción</Text>

      {/* Monto */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Monto *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 150.00"
          keyboardType="numeric"
          value={monto}
          onChangeText={handleMontoChange}
        />
      </View>

      {/* Tipo */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipo}
            onValueChange={(itemValue: 'ingreso' | 'egreso') => setTipo(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Egreso" value="egreso" />
            <Picker.Item label="Ingreso" value="ingreso" />
          </Picker>
        </View>
      </View>

      {/* Categoría */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoria}
            onValueChange={(itemValue: string) => setCategoria(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione una categoría" value="" />
            {categorias.map((cat) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.nombre} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
          <Text>{fecha.toLocaleDateString()}</Text>
          <Text style={styles.calendarText}>📅</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}
      </View>

      {/* Descripción */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Detalles adicionales..."
          multiline
          value={descripcion}
          onChangeText={(text: string) => setDescripcion(text)}
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleGuardar}>
          <Text style={styles.buttonText}>Guardar Transacción</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleVolverInicio}>
          <Text style={styles.buttonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  calendarText: {
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
