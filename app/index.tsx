import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        router.replace('/Inicio'); // Usuario autenticado
      } else {
        router.replace('/inicio/LoginScreen'); // No autenticado
      }
    };

    checkAuth();
  }, []);

  return null; // No muestra nada mientras redirige
}
