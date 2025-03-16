import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head"; // Importa el componente Head de Next.js

export default function Navbar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Estado para mostrar el modal de cierre de sesión
  const [showMenu, setShowMenu] = useState(false); // Estado para controlar el menú desplegable
  const [mensaje, setMensaje] = useState([]); // Estado para almacenar los mensajes del usuario
  const [loading, setLoading] = useState(true); // Estado para el estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const [userProfile, setUserProfile] = useState(null); // Estado para el perfil del usuario
  const router = useRouter();

  // Función para manejar el clic en la foto de perfil y abrir/cerrar el menú
  const toggleMenu = () => setShowMenu(!showMenu);

  // Función para obtener los mensajes para el usuario logueado
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser(); // Obtener usuario autenticado

      if (error || !user) {
        setError("No hay usuario autenticado.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (profileError) {
        setError("No se pudo obtener el perfil.");
      } else {
        setUserProfile(profileData);
      }

      // Obtener los mensajes del usuario
      const { data, error: queryError } = await supabase
        .from("buzdvz")
        .select("title, mensaje, created_at") // Asegúrate de obtener el campo created_at (hora de registro)
        .eq("user_id", user.id);

      if (queryError) {
        setError("No se pudieron obtener los mensajes. Intenta nuevamente más tarde.");
      } else {
        setMensaje(data || []); // Establecer los mensajes obtenidos
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => setShowLogoutModal(true); // Muestra el modal de confirmación de cierre de sesión

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirige al inicio después de cerrar sesión
  };

  const cancelLogout = () => setShowLogoutModal(false); // Cierra el modal sin hacer nada

  // Función para formatear la fecha sin librerías externas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
      {/* Agregar el título en la pestaña del navegador */}
      <Head>
        <title>BUZON DE MENSAJES</title>
      </Head>

      <div className="flex justify-between items-center mb-4">
        <div>
          <img
            src="https://images.encantia.lat/encantia-logo-2025.webp"
            alt="Logo"
            className="h-16"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
          >
            Inicio
          </button>
          <button
            onClick={() => router.push('/notes')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
          >
            Notas
          </button>
          <button
            onClick={() => router.push('/bdm')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
          >
            Buzón de mensajes
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
            onClick={() => router.push('/advert')}
          >
            Advertencias
          </button>
        </div>

        {/* Foto de perfil */}
        {userProfile && (
          <div className="relative">
            <img
              src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
              alt="Avatar"
              className="w-12 h-12 rounded-full cursor-pointer"
              onClick={toggleMenu}
            />

            {/* Menú desplegable */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                <ul className="py-2">
                  <li
                    className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Título "MENSAJES" centrado debajo de los botones */}
      <div className="flex justify-center items-center mb-6 text-white font-bold text-3xl">
        BUZON DE MENSAJES
      </div>

      {/* Mostrar mensajes o el estado de carga */}
      {loading && <div className="text-white">Estamos cargando tu buzón de mensajes...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Mostrar los mensajes del usuario */}
      <div className="space-y-4 mt-4">
        {mensaje.length > 0 ? (
          mensaje.map((msg, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-yellow-300">{msg.title}</h3> {/* Título */}
              <p className="text-white mt-2">{msg.mensaje}</p> {/* Mensaje */}
              <p className="text-sm text-gray-400 mt-2">
                {/* Hora de registro */}
                Recibido el: {msg.created_at && formatDate(msg.created_at)}
              </p>
            </div>
          ))
        ) : (
          <div className="text-white">No tienes mensajes en este momento.</div>
        )}
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg mb-4">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
              >
                Sí
              </button>
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página */}
      <div className="mt-8 p-4 bg-gray-900 text-center text-sm text-gray-400 fixed bottom-0 w-full">
        <p>© 2025 Encantia. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
