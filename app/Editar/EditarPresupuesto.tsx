import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router } from 'expo-router';
import { getCategorias, updatePresupuesto } from '../../api';
import api from '../../api';

interface Categoria {
  id: number;
  nombre: string;
}

export default function EditarPresupuesto() {
  const { id } = useLocalSearchParams();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [montoMaximo, setMontoMaximo] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaTermino, setFechaTermino] = useState<Date>(new Date());
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showTerminoPicker, setShowTerminoPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);

      const presupuestoData = await api.get(`/presupuestos/${id}`);
      setCategoriaId(presupuestoData.data.categoria.id);
      setMontoMaximo(String(presupuestoData.data.monto_maximo));
      setFechaInicio(new Date(presupuestoData.data.fecha_de_inicio));
      setFechaTermino(new Date(presupuestoData.data.fecha_de_termino));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del presupuesto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    if (!categoriaId || !montoMaximo || !fechaInicio || !fechaTermino) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (fechaTermino <= fechaInicio) {
      Alert.alert('Error', 'La fecha de término debe ser posterior a la fecha de inicio.');
      return;
    }
    try {
      await updatePresupuesto(Number(id), {
        categoria_id: categoriaId,
        monto_maximo: parseFloat(montoMaximo),
        fecha_de_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_de_termino: fechaTermino.toISOString().split('T')[0]
      });
      Alert.alert('Éxito', 'Presupuesto actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el presupuesto.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Editar Presupuesto</Text>

      <Text style={styles.label}>Categoría</Text>
      <RNPickerSelect
        onValueChange={(value) => setCategoriaId(value)}
        value={categoriaId}
        items={categorias.map(cat => ({
          label: cat.nombre,
          value: cat.id
        }))}
        style={{
          inputIOS: styles.dropdown,
          inputAndroid: styles.dropdown
        }}
        placeholder={{ label: 'Selecciona una categoría', value: null }}
      />

      <Text style={styles.label}>Monto máximo</Text>
      <TouchableOpacity style={styles.input}>
        <Text>{montoMaximo}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Fecha de inicio</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowInicioPicker(true)}
      >
        <Text>{fechaInicio.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showInicioPicker && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            setShowInicioPicker(false);
            if (date) setFechaInicio(date);
          }}
        />
      )}

      <Text style={styles.label}>Fecha de término</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTerminoPicker(true)}
      >
        <Text>{fechaTermino.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showTerminoPicker && (
        <DateTimePicker
          value={fechaTermino}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            setShowTerminoPicker(false);
            if (date) setFechaTermino(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 16, marginTop: 12, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6, padding: 12, marginTop: 6, backgroundColor: '#fff' },
  button: { backgroundColor: '#2ecc71', padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdown: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6, backgroundColor: '#fff', marginTop: 6 }
});
