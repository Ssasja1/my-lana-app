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
import { getCategorias, deleteCategoria } from '../../api';

interface Categoria {
  id: number;
  nombre: string;
}

export default function MostrarCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);

  const router = useRouter();

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      Alert.alert('Error', 'No se pudieron obtener las categorías');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarCategorias();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Seguro que quieres eliminar esta categoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategoria(id);
              setMenuVisibleId(null);
              await cargarCategorias();
              Alert.alert('Éxito', 'Categoría eliminada');
            } catch (error) {
              console.error('Error al eliminar categoría:', error);
              Alert.alert('Error', 'No se pudo eliminar la categoría');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (categoria: Categoria) => {
    setMenuVisibleId(null);
    router.push({
      pathname: '/Editar/EditarCategorias',
      params: { id: categoria.id.toString() },
    });
  };

  const renderItem = ({ item }: { item: Categoria }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.nombre}</Text>

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
      <Text style={styles.header}>Categorías</Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      ) : categorias.length === 0 ? (
        <Text style={styles.emptyText}>No hay categorías registradas</Text>
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/Registros/RegistroCategorias')}
      >
        <Text style={styles.buttonText}>Registrar nueva categoría</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Actualizar lista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    color: '#344055',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 18,
    marginTop: 30,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 30,          // aumentado para card más grande
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
    overflow: 'visible',
    zIndex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  title: {
    fontWeight: '700',
    fontSize: 22,         // texto más grande para título
    flex: 1,
    color: '#1f2937',
  },
  optionsContainer: {
    position: 'relative',
    width: 40,
    alignItems: 'flex-end',
  },
  optionsButton: {
    padding: 14,          // botón más grande y cómodo
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsButtonText: {
    fontSize: 28,         // símbolo más grande
    color: '#6b7280',
    marginTop: -4,
  },
  overlay: {
    position: 'absolute',
    top: -600,
    left: -600,
    right: -600,
    bottom: -600,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdown: {
    position: 'absolute',
    top: 56,              // ajustado al botón más grande
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    zIndex: 999,
    elevation: 10,
    width: 160,           // ancho mayor para mejor visibilidad
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    overflow: 'visible',
  },
  dropdownItem: {
    paddingVertical: 16,  // padding aumentado para items más grandes
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 18,         // texto más grande para lectura clara
    color: '#374151',
  },
  deleteText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#ecfdf5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  refreshButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#374151',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 7,
    elevation: 6,
  },
  refreshButtonText: {
    color: '#f3f4f6',
    fontWeight: '600',
    fontSize: 15,
  },
});
