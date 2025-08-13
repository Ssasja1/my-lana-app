import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getTransacciones, getPresupuestos } from '../../api';
import { useRouter } from 'expo-router';

type Transaccion = {
  id: number;
  descripcion?: string;
  categoria: { id?: number; nombre: string };
  fecha: string;
  monto: number;
  tipo: 'ingreso' | 'egreso' | string;
};

type Presupuesto = {
  id: number;
  categoria: { id?: number; nombre: string };
  monto_maximo: number;
};

export default function Balance() {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);

  const [ingresos, setIngresos] = useState<number>(0);
  const [egresos, setEgresos] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);

  const router = useRouter();

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      const txs: Transaccion[] = await getTransacciones();
      setTransacciones(txs || []);

      const pres: Presupuesto[] = await getPresupuestos();
      setPresupuestos(pres || []);

      let totalIngresos = 0;
      let totalEgresos = 0;

      (txs || []).forEach((t) => {
        const monto = Number(t.monto) || 0;
        if ((t.tipo || '').toLowerCase() === 'ingreso') {
          totalIngresos += monto;
        } else {
          // Sumamos el valor absoluto para egresos para evitar negativos en la suma
          totalEgresos += Math.abs(monto);
        }
      });

      setIngresos(totalIngresos);
      setEgresos(totalEgresos);
      setSaldo(totalIngresos - totalEgresos);
    } catch (error) {
      console.error('Error cargando balance:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const getAlertPresupuestos = () => {
    const gastosPorCategoria: Record<string, number> = {};

    transacciones.forEach((t) => {
      const categoria = t.categoria?.nombre || 'Sin categoría';
      const monto = Number(t.monto) || 0;
      if ((t.tipo || '').toLowerCase() !== 'ingreso') {
        gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + Math.abs(monto);
      }
    });

    const alerts: { categoria: string; usado: number; max: number; ratio: number }[] = [];
    (presupuestos || []).forEach((p) => {
      const catName = p.categoria?.nombre || 'Sin categoría';
      const usado = gastosPorCategoria[catName] || 0;
      const max = Number(p.monto_maximo) || 0;
      const ratio = max > 0 ? usado / max : 0;
      if (ratio >= 1) {
        alerts.push({ categoria: catName, usado, max, ratio }); // excedido
      } else if (ratio >= 0.8) {
        alerts.push({ categoria: catName, usado, max, ratio }); // cercano al 80%
      }
    });

    return alerts;
  };

  const alertas = getAlertPresupuestos();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Mi Saldo</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.balance}>${saldo.toFixed(2)}</Text>
        )}
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          {loading ? <ActivityIndicator /> : <Text style={styles.summaryValue}>${ingresos.toFixed(2)}</Text>}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Egresos</Text>
          {loading ? <ActivityIndicator /> : <Text style={styles.summaryValue}>${egresos.toFixed(2)}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Presupuestos</Text>
        {presupuestos.length === 0 ? (
          <Text style={styles.placeholderText}>No hay presupuestos definidos</Text>
        ) : (
          presupuestos.map((p) => {
            const catName = p.categoria?.nombre || 'Sin categoría';
            const usado = transacciones
              .filter(
                (t) =>
                  t.categoria?.nombre === catName &&
                  (t.tipo || '').toLowerCase() !== 'ingreso'
              )
              .reduce((sum, t) => sum + Math.abs(Number(t.monto) || 0), 0);
            const max = Number(p.monto_maximo) || 0;
            const ratio = max > 0 ? usado / max : 0;

            return (
              <View key={p.id} style={styles.presupuestoCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.presupuestoCat}>{catName}</Text>
                  <Text style={styles.presupuestoText}>
                    Usado: ${usado.toFixed(2)} / ${max.toFixed(2)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.badge,
                      ratio >= 1
                        ? styles.badgeDanger
                        : ratio >= 0.8
                        ? styles.badgeWarn
                        : styles.badgeOk,
                    ]}
                  >
                    {ratio >= 1 ? 'Excedido' : ratio >= 0.8 ? 'Casi' : 'OK'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertas</Text>
        {alertas.length === 0 ? (
          <Text style={styles.placeholderText}>No hay alertas</Text>
        ) : (
          alertas.map((a, idx) => (
            <View key={idx} style={styles.alertItem}>
              <Text style={styles.alertText}>
                {a.ratio >= 1 ? 'Excedido' : 'Cercano'}: {a.categoria} — ${a.usado.toFixed(2)} / ${a.max.toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/MostrarTransacciones')}>
          <Text style={styles.actionText}>Ver transacciones</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryAction]}
          onPress={() => router.push('/(tabs)/MostrarPagoFijo')}
        >
          <Text style={styles.actionText}>Pagos fijos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>Actualiza para obtener datos recientes</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  headerContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  header: { color: '#fff', fontSize: 20, fontWeight: '700' },
  balance: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 8 },

  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryBox: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 6,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 6 },

  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  placeholderText: { color: '#888' },

  presupuestoCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  presupuestoCat: { fontSize: 15, fontWeight: '700', color: '#222' },
  presupuestoText: { fontSize: 13, color: '#666', marginTop: 4 },

  badge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 20, color: '#fff', fontWeight: '700' },
  badgeDanger: { backgroundColor: '#ef4444' },
  badgeWarn: { backgroundColor: '#f59e0b' },
  badgeOk: { backgroundColor: '#10b981' },

  alertItem: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 6 },
  alertText: { color: '#333' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3498db',
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryAction: { backgroundColor: '#9b59b6', marginRight: 0, marginLeft: 8 },
  actionText: { color: '#fff', fontWeight: '700' },

  note: { textAlign: 'center', color: '#888', marginTop: 20 },
});
