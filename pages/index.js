import Head from "next/head";
import Auth from "../components/Auth";
import UserArea from "../components/UserArea";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Establecer la sesión inicial
    const fetchSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession(); // Cambié a `getSession`
      if (sessionData) {
        setSession(sessionData);
      }
    };

    fetchSession(); // Llamamos la función para obtener la sesión

    // Suscripción a cambios de estado de autenticación
    const { data: authListener, error } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session); // Para depuración
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setSession(null);  // Resetear la sesión al cerrar sesión
        router.push('/login');  // Redirigir al login
      } else {
        setSession(session);  // Actualizar el estado de la sesión
      }
    });

    // Comprobamos si el listener fue correctamente asignado
    if (authListener && typeof authListener.unsubscribe === 'function') {
      // Limpiar la suscripción cuando el componente se desmonte
      return () => {
        authListener.unsubscribe();
      };
    } else {
      console.error('Error: El listener de autenticación no tiene unsubscribe.');
    }

  }, [router]);  // Dependencia de `router` para asegurar la actualización en la navegación

  return (
    <div className={styles.container}> {/* Usamos el CSS Module aquí */}
      <Head>
        <title>Encantia</title>
        <meta name="description" content="Web oficial de Encantia" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? <UserArea /> : <Auth />}
    </div>
  );
}
