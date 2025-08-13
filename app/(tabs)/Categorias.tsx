import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
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
    router.push({
      pathname: '/Editar/EditarCategorias',
      params: { id: categoria.id.toString() },
    });
  };

  const renderItem = ({ item }: { item: Categoria }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
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
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
    color: '#1f2937',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
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
