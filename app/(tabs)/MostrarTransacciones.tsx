import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getTransacciones, deleteTransaccion } from '../../api';

interface Categoria {
  id: number;
  nombre: string;
}

interface Transaccion {
  id: number;
  categoria_id: number;
  monto: number;
  descripcion: string | null;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  categoria: Categoria;
}

export default function MostrarTransacciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);

  const router = useRouter();

  const cargarTransacciones = async () => {
    try {
      setLoading(true);
      const data = await getTransacciones();
      const ordenadas = data.sort(
        (a: Transaccion, b: Transaccion) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setTransacciones(ordenadas || []);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      Alert.alert('Error', 'No se pudieron obtener las transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarTransacciones();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarTransacciones();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Seguro que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaccion(id);
              setMenuVisibleId(null);
              await cargarTransacciones();
              Alert.alert('Éxito', 'Transacción eliminada');
            } catch (error) {
              console.error('Error al eliminar transacción:', error);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (transaccion: Transaccion) => {
    setMenuVisibleId(null);
    router.push({
      pathname: '/Editar/EditarTransaccion',
      params: { transaccion: JSON.stringify(transaccion) },
    });
  };

  const renderItem = ({ item }: { item: Transaccion }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {item.tipo === 'ingreso' ? '🟢 Ingreso' : '🔴 Egreso'} - ${Math.abs(item.monto).toFixed(2)}
          </Text>
          <Text>{new Date(item.fecha).toLocaleDateString()}</Text>
          {item.descripcion && <Text>{item.descripcion}</Text>}
          <Text>Categoría: {item.categoria?.nombre || 'Desconocida'}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => setMenuVisibleId(menuVisibleId === item.id ? null : item.id)}
          >
            <Text style={styles.optionsButtonText}>⋮</Text>
          </TouchableOpacity>

          {menuVisibleId === item.id && (
            <>
              <Pressable style={styles.overlay} onPress={() => setMenuVisibleId(null)} />
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.dropdownText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dropdownItem, styles.deleteItem]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transacciones</Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      ) : transacciones.length === 0 ? (
        <Text style={styles.emptyText}>No hay transacciones registradas</Text>
      ) : (
        <FlatList
          data={transacciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/Registros/RegistroTransacciones')}
      >
        <Text style={styles.buttonText}>Registrar nueva transacción</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Actualizar lista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f9fc',
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  optionsContainer: {
    position: 'relative',
    width: 40,
    alignItems: 'flex-end',
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F3F5',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsButtonText: {
    fontSize: 20,
    color: '#555',
    marginTop: -4,
  },
  overlay: {
    position: 'absolute',
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    zIndex: 999,
    elevation: 50,
    width: 120,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
  deleteText: {
    fontSize: 15,
    color: 'red',
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#6C757D',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
