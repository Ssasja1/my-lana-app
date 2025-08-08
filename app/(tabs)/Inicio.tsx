import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cerrarSesion = async () => {
  await AsyncStorage.removeItem('userToken');
  router.replace('/inicio/LoginScreen'); // Redirige al login
};

const HomeScreen = () => {
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
          onPress={() => router.push('/(tabs)/Balance')} // 🔧 Ruta a crear
        >
          <Text style={styles.buttonText}>Ver Saldo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(tabs)/Graficas')} // 🔧 Ruta a crear
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

      {/* Sección de últimas transacciones (simulando scroll infinito) */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Últimas transacciones</Text>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionTitle}>Transacción {item}</Text>
              <Text style={styles.transactionSubtitle}>Categoría {item} • Hoy</Text>
            </View>
            <Text style={styles.transactionAmount}>${(item * 100).toLocaleString()}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.seeMoreButton} onPress={() => router.push('/(tabs)/MostrarTransacciones')}>
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
    color: '#4CAF50',
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
