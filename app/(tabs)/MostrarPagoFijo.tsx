import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getPagosFijos, deletePagoFijo } from '../../api';

type PagoFijo = {
  id: number;
  nombre: string;
  monto: number;
  fecha_pago: string;
  activo: boolean;
  categoria_id: number;
  ultimo_pago_realizado: string | null;
  created_at: string;
  updated_at: string;
};

export default function MostrarPagoFijo() {
  const [pagosFijos, setPagosFijos] = useState<PagoFijo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPagosFijos();
      setPagosFijos(data);
    } catch (error) {
      console.error('Error al cargar pagos fijos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleEliminar = async (id: number, nombre: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Seguro que deseas eliminar el pago fijo "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePagoFijo(id);
              setMenuVisibleId(null);
              await fetchData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: PagoFijo }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.nombre}</Text>
          <Text style={styles.text}>Monto: ${item.monto.toFixed(2)}</Text>
          <Text style={styles.text}>
            Fecha de pago: {new Date(item.fecha_pago).toLocaleDateString()}
          </Text>
          <Text style={styles.text}>Activo: {item.activo ? 'Sí' : 'No'}</Text>
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
              <Pressable
                style={styles.overlay}
                onPress={() => setMenuVisibleId(null)}
              />
              <View style={styles.dropdown}>
                <TouchableOpacity
                  onPress={() => {
                    setMenuVisibleId(null);
                    router.push({ pathname: '/Editar/EditarPagoFijo', params: { id: item.id } });
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEliminar(item.id, item.nombre)}
                  style={[styles.dropdownItem, styles.deleteItem]}
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Cargando pagos fijos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pagos Fijos Registrados</Text>

      <FlatList
        data={pagosFijos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay pagos registrados.</Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/Registros/RegistroPagoFijo')}
      >
        <Text style={styles.buttonText}>Registrar nuevo pago fijo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>
          {refreshing ? 'Actualizando...' : 'Actualizar lista'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#F8F9FA'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
  optionsContainer: {
    position: 'relative',
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  text: { 
    fontSize: 14, 
    marginTop: 4, 
    color: '#555' 
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 15 
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
    fontSize: 14
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
});