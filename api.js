import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8000'; // Cambia esto por tu URL real
//const API_BASE_URL = 'http://192.168.68.108:8000';


// Instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


// Interceptor para agregar token automáticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Manejo centralizado de errores
function handleApiError(error, defaultMsg = 'Error en la petición') {
  if (error.response) {
    throw new Error(error.response.data.detail || defaultMsg);
  } else if (error.request) {
    throw new Error('No se recibió respuesta del servidor');
  } else {
    throw new Error('Error al configurar la petición: ' + error.message);
  }
}

// === Funciones exportadas individualmente ===

// Autenticación
export const registrar = async (formData) => {
  try {
    const response = await api.post('/registro', formData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error en el registro');
  }
};

export const login = async (email, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Credenciales incorrectas');
  }
};

// Presupuestos
export const getCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener las categorías');
  }
};

export const createPresupuesto = async (presupuestoData) => {
  try {
    const response = await api.post('/presupuestos', presupuestoData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al crear el presupuesto');
  }
};


// Obtener presupuestos con filtros opcionales
// Obtener presupuestos del usuario autenticado
export const getPresupuestos = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.mes) params.append('mes', filters.mes);
    if (filters.año) params.append('año', filters.año);
    
    const response = await api.get('/presupuestos', { params });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener los presupuestos');
  }
};

// Formatear presupuestos para la UI
export const formatPresupuestosForUI = (presupuestos) => {
  return presupuestos.map(p => ({
    id: p.id,
    categoria: p.categoria.nombre,
    montoMaximo: p.monto_maximo,
    fechaInicio: new Date(p.fecha_de_inicio).toLocaleDateString(),
    fechaTermino: new Date(p.fecha_de_termino).toLocaleDateString(),
    creadoEl: new Date(p.created_at).toLocaleString()
  }));
};

export const createPagoFijo = async (pagoData) => {
  try {
    const response = await api.post('/pagos-fijos', pagoData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al crear el pago fijo');
  }
};

export const getPagosFijos = async () => {
  try {
    const response = await api.get('/pagos-fijos');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener los pagos fijos');
  }
};

export const createTransaccion = async (transaccionData) => {
  try {
    const response = await api.post('/transacciones', transaccionData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al crear la transacción');
  }
};

export const getTransacciones = async () => {
  try {
    const response = await api.get('/transacciones');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener las transacciones');
  }
};

export const updatePagoFijo = async (pagoId, updatedData) => {
  try {
    const response = await api.put(`/pagos-fijos/${pagoId}`, updatedData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar el pago fijo');
  }
};

export const deletePagoFijo = async (pagoId) => {
  try {
    await api.delete(`/pagos-fijos/${pagoId}`);
  } catch (error) {
    handleApiError(error, 'Error al eliminar el pago fijo');
  }
};

// Actualizar un presupuesto
export const updatePresupuesto = async (presupuestoId, updatedData) => {
  try {
    const response = await api.put(`/presupuestos/${presupuestoId}`, updatedData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar el presupuesto');
  }
};

// Eliminar un presupuesto
export const deletePresupuesto = async (presupuestoId) => {
  try {
    await api.delete(`/presupuestos/${presupuestoId}`);
  } catch (error) {
    handleApiError(error, 'Error al eliminar el presupuesto');
  }
};

export const updateTransaccion = async (transaccionId, updatedData) => {
  try {
    const response = await api.put(`/transacciones/${transaccionId}`, updatedData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar la transacción');
  }
};

export const deleteTransaccion = async (transaccionId) => {
  try {
    await api.delete(`/transacciones/${transaccionId}`);
  } catch (error) {
    handleApiError(error, 'Error al eliminar la transacción');
  }
};

export const createCategoria = async (categoriaData) => {
  try {
    const response = await api.post('/categorias', categoriaData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al crear la categoría');
  }
};


export const updateCategoria = async (categoriaId, updatedData) => {
  try {
    const response = await api.put(`/categorias/${categoriaId}`, updatedData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar la categoría');
  }
};


// Eliminar una categoría
export const deleteCategoria = async (categoriaId) => {
  try {
    await api.delete(`/categorias/${categoriaId}`);
  } catch (error) {
    handleApiError(error, 'Error al eliminar la categoría');
  }
};
