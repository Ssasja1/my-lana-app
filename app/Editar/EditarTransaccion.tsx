import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { updateTransaccion, getCategorias } from '../../api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function EditarTransaccion() {
  const { transaccion } = useLocalSearchParams();
  const transaccionData = JSON.parse(transaccion as string);

  const [monto, setMonto] = useState(transaccionData.monto.toString());
  const [descripcion, setDescripcion] = useState(transaccionData.descripcion || '');
  const [fecha, setFecha] = useState(new Date(transaccionData.fecha));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>(transaccionData.tipo);
  const [categoriaId, setCategoriaId] = useState(transaccionData.categoria_id);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const cats = await getCategorias();
        setCategorias(cats);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      }
    }
    fetchCategorias();
  }, []);

  const handleSave = async () => {
    if (!categoriaId || !monto || !fecha || !tipo) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    try {
      await updateTransaccion(transaccionData.id, {
        categoria_id: categoriaId,
        monto: parseFloat(monto),
        descripcion,
        fecha: fecha.toISOString().split('T')[0], // YYYY-MM-DD
        tipo,
      });
      Alert.alert('Éxito', 'Transacción actualizada');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setFecha(selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Editar Transacción</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={(itemValue) => setCategoriaId(itemValue)}
            style={styles.picker}
            dropdownIconColor="#444"
          >
            {categorias.map((cat) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Monto</Text>
        <TextInput
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Ej. 1500.00"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={[styles.input, { height: 80 }]}
          multiline
          placeholder="Descripción opcional"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerText}>{fecha.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipo}
            onValueChange={(itemValue) => setTipo(itemValue)}
            style={styles.picker}
            dropdownIconColor="#444"
          >
            <Picker.Item label="Ingreso" value="ingreso" />
            <Picker.Item label="Egreso" value="egreso" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
    color: '#000',
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
