import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { getCategorias, createPresupuesto } from '../../api';

const CustomProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.customProgressBarContainer}>
    <View style={[styles.customProgressBar, { width: `${progress * 100}%` }]} />
  </View>
);

interface Categoria {
  id: number;
  nombre: string;
}

export default function BudgetForm() {
  const [montoMaximo, setMontoMaximo] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaTermino, setFechaTermino] = useState<Date>(new Date());
  const [showPickerInicio, setShowPickerInicio] = useState<boolean>(false);
  const [showPickerTermino, setShowPickerTermino] = useState<boolean>(false);
  const [presupuestoUtilizado, setPresupuestoUtilizado] = useState<number>(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudieron cargar las categorías');
      }
    };
    loadCategorias();
  }, []);

  const formatDateISO = (date: Date) => date.toISOString().split('T')[0];

  const onChangeInicio = (event: any, selectedDate?: Date) => {
    setShowPickerInicio(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaInicio(selectedDate);
      if (selectedDate > fechaTermino) {
        setFechaTermino(selectedDate);
      }
    }
  };

  const onChangeTermino = (event: any, selectedDate?: Date) => {
    setShowPickerTermino(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate >= fechaInicio) {
        setFechaTermino(selectedDate);
      } else {
        Alert.alert('Error', 'La fecha de término no puede ser anterior a la de inicio');
      }
    }
  };

  const handleGuardar = async () => {
    if (!montoMaximo || !categoriaId || !fechaInicio || !fechaTermino) {
      Alert.alert('Campos requeridos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const montoNum = parseFloat(montoMaximo);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Ingrese un monto válido mayor a cero');
      return;
    }

    if (fechaInicio > fechaTermino) {
      Alert.alert('Error', 'La fecha de inicio no puede ser mayor a la de término');
      return;
    }

    setLoading(true);

    try {
      await createPresupuesto({
        categoria_id: parseInt(categoriaId),
        monto_maximo: montoNum,
        fecha_de_inicio: formatDateISO(fechaInicio),
        fecha_de_termino: formatDateISO(fechaTermino),
      });

      Alert.alert('Éxito', 'Presupuesto registrado correctamente');

      // ✅ Redireccionar a MostrarPresupuestoMensual
      router.replace('/(tabs)/MostrarPresupuestoMensual');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Ocurrió un error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // ✅ Redireccionar a MostrarPresupuestoMensual directamente
    router.replace('/(tabs)/MostrarPresupuestoMensual');
  };

  const handleInicio = () => {
    // ✅ Redireccionar a Inicio
    router.replace('/(tabs)/Inicio');
  };

  const handleMontoChange = (text: string) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setMontoMaximo(text);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Registro de Presupuestos</Text>
      <Text style={styles.subheader}>Configurar Presupuesto Mensual</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Monto máximo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 2500.00"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={montoMaximo}
          onChangeText={handleMontoChange}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={(itemValue) => setCategoriaId(itemValue)}
            style={styles.picker}
            dropdownIconColor="#444"
          >
            <Picker.Item label="Selecciona una categoría" value="" color="#999" />
            {categorias.map((cat) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id.toString()} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha de inicio *</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPickerInicio(true)}>
          <Text style={styles.datePickerText}>{formatDateISO(fechaInicio)}</Text>
        </TouchableOpacity>
        {showPickerInicio && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display="default"
            onChange={onChangeInicio}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(2000, 0, 1)}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha de término *</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPickerTermino(true)}>
          <Text style={styles.datePickerText}>{formatDateISO(fechaTermino)}</Text>
        </TouchableOpacity>
        {showPickerTermino && (
          <DateTimePicker
            value={fechaTermino}
            mode="date"
            display="default"
            onChange={onChangeTermino}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={fechaInicio}
          />
        )}
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Presupuesto utilizado:</Text>
        <CustomProgressBar progress={presupuestoUtilizado} />
        <Text style={styles.progressText}>{Math.round(presupuestoUtilizado * 100)}%</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancelar}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.homeButton]}
        onPress={handleInicio}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
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
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
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
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  customProgressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  customProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  homeButton: {
    backgroundColor: '#2196F3',
    marginTop: 10,
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
