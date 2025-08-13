import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Importa el picker
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPagosFijos, updatePagoFijo } from '../../api';

type PagoFijo = {
  id: number;
  nombre: string;
  monto: number;
  fecha_pago: string;
  activo: boolean;
  categoria_id: number;
};

export default function EditarPagoFijo() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activo, setActivo] = useState(true);
  const [categoriaId, setCategoriaId] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const pagos = await getPagosFijos();
        const pago = pagos.find((p: PagoFijo) => p.id === parseInt(id));

        if (pago) {
          setNombre(pago.nombre);
          setMonto(pago.monto.toString());
          setFechaPago(new Date(pago.fecha_pago)); // Convierte a Date
          setActivo(pago.activo);
          setCategoriaId(pago.categoria_id.toString());
        } else {
          Alert.alert('Error', 'Pago no encontrado');
          router.back();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        Alert.alert('Error', message);
      }
    };

    if (id) {
      cargarDatos();
    }
  }, [id]);

  const handleActualizar = async () => {
    try {
      const data = {
        nombre,
        monto: parseFloat(monto),
        fecha_pago: fechaPago.toISOString().slice(0, 10), // Formato YYYY-MM-DD
        activo,
        categoria_id: parseInt(categoriaId),
      };

      await updatePagoFijo(id, data);
      Alert.alert('Éxito', 'Pago actualizado correctamente');
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', message);
    }
  };

  // Cuando cambia la fecha en el DatePicker
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // en iOS se queda abierto
    if (selectedDate) {
      setFechaPago(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Editar Pago Fijo</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{fechaPago.toISOString().slice(0, 10)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={fechaPago}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date(2100, 12, 31)}
          minimumDate={new Date(2000, 0, 1)}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="ID Categoría"
        keyboardType="numeric"
        value={categoriaId}
        onChangeText={setCategoriaId}
      />

      <TouchableOpacity style={styles.button} onPress={handleActualizar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
