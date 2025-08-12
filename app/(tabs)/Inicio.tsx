import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transaccion = {
  id: number;
  descripcion?: string;
  categoria: { nombre: string };
  fecha: string;
  monto: number;
  tipo: string; // 'ingreso' | 'egreso'
};

const cerrarSesion = async () => {
  await AsyncStorage.removeItem('userToken');
  router.replace('/inicio/LoginScreen'); // Redirige al login
};

const HomeScreen = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);

  useEffect(() => {
    const fetchUltimasTransacciones = async () => {
      try {
        setLoadingTransacciones(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('No autenticado');

        const res = await fetch('http://localhost:8000/transacciones/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Error al cargar transacciones');

        const data: Transaccion[] = await res.json();
        setTransacciones(data.slice(0, 5)); // Mostrar solo las últimas 5
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoadingTransacciones(false);
      }
    };

    fetchUltimasTransacciones();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Bienvenido a FinanzasApp</Text>
        <Text style={styles.subheader}>Gestiona tus finanzas fácilmente</Text>
      </View>

      {/* Botones principales */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/(tabs)/Balance')}
        >
          <Text style={styles.buttonText}>Ver Saldo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(tabs)/Graficas')}
        >
          <Text style={styles.buttonText}>Ver Gráficas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={() => router.push('/(tabs)/MostrarTransacciones')}
        >
          <Text style={styles.buttonText}>Ver Transacciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.quaternaryButton]}
          onPress={() => router.push('/(tabs)/MostrarPagoFijo')}
        >
          <Text style={styles.buttonText}>Ver Pagos Fijos</Text>
        </TouchableOpacity>
        
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Sección de últimas transacciones */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Últimas transacciones</Text>

        {loadingTransacciones ? (
          <ActivityIndicator size="large" color="#2ecc71" />
        ) : transacciones.length === 0 ? (
          <Text style={styles.placeholderText}>No hay transacciones para mostrar</Text>
        ) : (
          transacciones.map(({ id, descripcion, categoria, fecha, monto, tipo }) => (
            <View key={id} style={styles.transactionItem}>
              <View>
                <Text style={styles.transactionTitle}>{descripcion || `Transacción ${id}`}</Text>
                <Text style={styles.transactionSubtitle}>
                  {categoria.nombre} • {new Date(fecha).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: tipo === 'ingreso' ? '#4CAF50' : '#F44336' },
                ]}
              >
                {tipo === 'egreso' ? '-' : '+'}${monto.toLocaleString()}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => router.push('/(tabs)/MostrarTransacciones')}
        >
          <Text style={styles.seeMoreText}>Ver más transacciones</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
  },
  headerContainer: {
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginBottom: 25,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  tertiaryButton: {
    backgroundColor: '#FF9800',
  },
  quaternaryButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  transactionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  seeMoreButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  seeMoreText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#c0392b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
