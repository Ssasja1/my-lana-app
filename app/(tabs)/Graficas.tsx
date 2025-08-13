import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart, PieChart } from "react-native-chart-kit";

type GastoMensual = {
  mes: string;
  gasto: number;
};

type CategoriaGasto = {
  name: string;
  gasto: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

type ResumenIngresosGastos = {
  ingresos: number;
  gastos: number;
};

const colores = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#66FF66",
  "#FF6666",
  "#66CCFF",
  "#FF66CC",
];

const screenWidth = Dimensions.get("window").width;
const API_BASE_URL = 'http://192.168.68.102:8000';

// 🔹 Función para ajustar valores muy pequeños
const ajustarDatosPie = (data: any[], accessor: string) => {
  const total = data.reduce((sum, item) => sum + Math.abs(item[accessor]), 0);
  return data.map((item) => {
    const porcentaje = (Math.abs(item[accessor]) / total) * 100;
    if (porcentaje < 5) {
      // Forzar un mínimo del 5% visualmente
      return { ...item, [accessor]: (5 / 100) * total };
    }
    return item;
  });
};

export default function Graficas() {
  const [gastosMensuales, setGastosMensuales] = useState<GastoMensual[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<CategoriaGasto[]>(
    []
  );
  const [resumenIngresosGastos, setResumenIngresosGastos] =
    useState<ResumenIngresosGastos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);

        const token = await AsyncStorage.getItem("userToken");
        if (!token) throw new Error("No autenticado");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const resMensuales = await fetch(
          `${API_BASE_URL}/graficas/gastos-mensuales/`,
          { headers }
        );
        if (!resMensuales.ok)
          throw new Error("Error al cargar gastos mensuales");
        const dataMensuales: GastoMensual[] = await resMensuales.json();

        const resCategorias = await fetch(
          `${API_BASE_URL}/graficas/gastos-por-categoria/`,
          { headers }
        );
        if (!resCategorias.ok)
          throw new Error("Error al cargar gastos por categoría");
        const dataCategoriasRaw: { categoria: string; total: number }[] =
          await resCategorias.json();

        const dataCategorias: CategoriaGasto[] = dataCategoriasRaw.map(
          (item, index) => ({
            name: item.categoria,
            gasto: Math.abs(item.total), // aseguramos positivo
            color: colores[index % colores.length],
            legendFontColor: "#333",
            legendFontSize: 14,
          })
        );

        const resResumen = await fetch(
          `${API_BASE_URL}/graficas/resumen-ingresos-gastos/`,
          { headers }
        );
        if (!resResumen.ok)
          throw new Error("Error al cargar resumen de ingresos y gastos");
        const resumenData: ResumenIngresosGastos = await resResumen.json();

        setGastosMensuales(dataMensuales);
        setGastosPorCategoria(dataCategorias);
        setResumenIngresosGastos(resumenData);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error desconocido";
        Alert.alert("Error", message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const pieData =
    resumenIngresosGastos && resumenIngresosGastos.ingresos !== undefined
      ? ajustarDatosPie(
          [
            {
              name: "Ingresos",
              gasto: Math.abs(resumenIngresosGastos.ingresos),
              color: "#4CAF50",
              legendFontColor: "#333",
              legendFontSize: 14,
            },
            {
              name: "Gastos",
              gasto: Math.abs(resumenIngresosGastos.gastos),
              color: "#F44336",
              legendFontColor: "#333",
              legendFontSize: 14,
            },
          ],
          "gasto"
        )
      : [];

  const barData = {
    labels: gastosMensuales.map((g) => g.mes),
    datasets: [
      {
        data: gastosMensuales.map((g) => g.gasto),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Resumen Visual</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <>
          <View style={styles.graphCard}>
            <Text style={styles.graphTitle}>Gastos Mensuales</Text>
            {gastosMensuales.length === 0 ? (
              <Text style={styles.placeholderText}>
                No hay datos para mostrar
              </Text>
            ) : (
              <BarChart
                data={barData}
                width={screenWidth - 40}
                height={220}
                yAxisLabel="$"
                yAxisSuffix="" // ← propiedad obligatoria
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 12 },
                }}
                style={{ borderRadius: 12 }}
              />
            )}
          </View>

          <View style={styles.graphCard}>
            <Text style={styles.graphTitle}>Distribución por Categoría</Text>
            {gastosPorCategoria.length === 0 ? (
              <Text style={styles.placeholderText}>
                No hay datos para mostrar
              </Text>
            ) : (
              <PieChart
                data={ajustarDatosPie(gastosPorCategoria, "gasto")}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="gasto"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </View>

          <View style={styles.graphCard}>
            <Text style={styles.graphTitle}>Proporción Ingresos vs Gastos</Text>
            {pieData.length === 0 ? (
              <Text style={styles.placeholderText}>
                No hay datos para mostrar
              </Text>
            ) : (
              <PieChart
                data={pieData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="gasto"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </View>
        </>
      )}

      <Text style={styles.note}>
        Los datos se obtienen en tiempo real desde tu API.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  graphCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  note: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 30,
  },
});
