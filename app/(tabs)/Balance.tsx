import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Balance = () => {
  // Aquí podrías luego usar un hook como useEffect para cargar el balance desde tu API

  const saldoTotal = 0; // valor estático temporal

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Mi Saldo</Text>
        <Text style={styles.balance}>${saldoTotal.toFixed(2)}</Text>
      </View>

      {/* Sección de resumen - opcional */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Egresos</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
      </View>

      <Text style={styles.note}>Este es un resumen general. Agrega lógica para mostrar datos reales.</Text>
    </ScrollView>
  );
};

export default Balance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  balance: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  note: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginTop: 30,
  },
});
