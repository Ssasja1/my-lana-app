import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Graficas = () => {
  // Aquí podrías cargar datos desde tu API y renderizar gráficas
  // usando librerías como 'react-native-chart-kit' o 'victory-native'

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Resumen Visual</Text>

      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Gastos Mensuales</Text>
        <Text style={styles.placeholderText}>[Aquí irá una gráfica de barras]</Text>
      </View>

      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Distribución por Categoría</Text>
        <Text style={styles.placeholderText}>[Aquí irá una gráfica circular]</Text>
      </View>

      <Text style={styles.note}>Integra tus datos reales y muestra gráficos con una librería externa.</Text>
    </ScrollView>
  );
};

export default Graficas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  graphCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  note: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
  },
});
