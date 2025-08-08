import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import api, { deletePresupuesto } from '../../api';

interface Categoria {
  nombre: string;
}

interface Presupuesto {
  id: number;
  monto_maximo: number;
  fecha_de_inicio: string;
  fecha_de_termino: string;
  categoria: Categoria;
}

export default function MostrarPresupuestoMensual() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);

  const cargarPresupuestos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/presupuestos/');
      const ordenados = response.data.sort(
        (a: Presupuesto, b: Presupuesto) =>
          new Date(b.fecha_de_inicio).getTime() - new Date(a.fecha_de_inicio).getTime()
      );
      setPresupuestos(ordenados);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarPresupuestos();
  };

  const handleEliminar = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePresupuesto(id);
              setMenuVisibleId(null);
              await cargarPresupuestos();
            } catch (error) {
              console.error('Error al eliminar presupuesto:', error);
            }
          },
        },
      ]
    );
  };

  const handleModificar = (id: number) => {
    setMenuVisibleId(null);
    router.push(`/Editar/EditarPresupuesto?id=${id}`);
  };

  const renderItem = ({ item }: { item: Presupuesto }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Categoría: {item.categoria?.nombre}</Text>
          <Text>Monto máximo: ${item.monto_maximo}</Text>
          <Text>Desde: {item.fecha_de_inicio}</Text>
          <Text>Hasta: {item.fecha_de_termino}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() =>
              setMenuVisibleId(menuVisibleId === item.id ? null : item.id)
            }
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
                  onPress={() => handleModificar(item.id)}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEliminar(item.id)}
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
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Cargando presupuestos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Presupuestos Mensuales</Text>

      <FlatList
        data={presupuestos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay presupuestos disponibles.
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push('/Registros/RegistroPresupuestoMensual')
        }
      >
        <Text style={styles.buttonText}>+ Registrar nuevo presupuesto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Text style={styles.refreshButtonText}>
          {refreshing ? 'Actualizando...' : 'Actualizar lista'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;

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
    padding: 20, // 🔹 más grande que 16
    borderRadius: 12, // 🔹 un poco más redondeado
    marginBottom: 14, // 🔹 más espacio entre tarjetas
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
