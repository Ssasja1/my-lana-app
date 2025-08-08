import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPagosFijos, updatePagoFijo } from '../../api';

// Define el tipo de datos
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
  const [fechaPago, setFechaPago] = useState('');
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
          setFechaPago(pago.fecha_pago);
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
        fecha_pago: fechaPago,
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
      <TextInput
        style={styles.input}
        placeholder="Fecha de Pago (YYYY-MM-DD)"
        value={fechaPago}
        onChangeText={setFechaPago}
      />
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
