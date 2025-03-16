import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Navbar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userNotes, setUserNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);  // Aquí se almacenará la URL de la imagen
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();

  // Función para obtener las notas y perfil del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error al obtener el usuario:", error.message);
          setError("Hubo un problema al obtener la información del usuario.");
          setLoading(false);
          return;
        }

        if (user) {
          // Obtener las notas del usuario
          const { data: notesData, error: notesError } = await supabase
            .from("ntas")
            .select("evau1, evau2, evau3, evau4, evau5, nm, evaucat")
            .eq("user_id", user.id);

          if (notesError) {
            console.error("Error al obtener las notas:", notesError.message);
            setError("No se pudieron obtener tus notas.");
          } else {
            setUserNotes(notesData[0] || null);
            setCategories([...new Set(notesData.map((note) => note.evaucat))]); // Extraer categorías únicas
          }

          // Obtener el perfil del usuario
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", user.email)
            .single();

          if (profileError) {
            console.error("Error al obtener el perfil:", profileError.message);
            setError("No se pudo obtener tu perfil.");
          } else {
            setUserProfile(profileData);
            // Aseguramos que si el campo avatar_url está vacío, se utilice la imagen predeterminada.
            const avatarUrl = profileData.avatar_url ? profileData.avatar_url : 'https://i.ibb.co/d0mWy0kP/perfildef.png';
            setImageUrl(avatarUrl); // Asignamos la URL del avatar del perfil
          }
        } else {
          setError("No hay usuario autenticado.");
        }
      } catch (err) {
        console.error("Error en la solicitud:", err.message);
        setError("Ocurrió un error al cargar la información. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false); // Finaliza el proceso de carga
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirige al inicio después de cerrar sesión
  };
  const cancelLogout = () => setShowLogoutModal(false);

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleCategorySelect = (event) => {
    setSelectedCategory(event.target.value);
  };

  const evaluationNames = {
    evau1: "Atención al Cliente",
    evau2: "Comportamiento",
    evau3: "Organización",
    evau4: "Trabajo en Equipo",
    evau5: "Experiencia",
    nm: "Nota Media",
  };

  const getFilteredNotes = () => {
    if (!userNotes) return null;

    if (!selectedCategory)
      return <div className="text-white">Selecciona una categoría para ver tus notas.</div>;

    if (userNotes.evaucat === selectedCategory) {
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white mb-2">
            Notas para la categoría: <span className="text-blue-300">{selectedCategory}</span>
          </h4>
          <div className="space-y-2">
            {Object.keys(evaluationNames).map((key) => {
              if (userNotes[key]) {
                return (
                  <div key={key} className="text-white">
                    <strong className="text-yellow-400">{evaluationNames[key]}:</strong>
                    <p>{userNotes[key]}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return <div className="text-white">No tienes notas registradas para esta categoría.</div>;
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
      <Head>
        <title>NOTAS</title>
      </Head>

      <div className="flex justify-between items-center mb-4">
        <div>
          <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-16" />
        </div>

        <div className="flex gap-4">
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">
            Inicio
          </button>
          <button onClick={() => router.push('/notes')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">
            Notas
          </button>
          <button onClick={() => router.push('/bdm')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">
            Buzón de Mensajes
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors" onClick={() => router.push('/advert')}>
            Advertencias
          </button>
        </div>

        <div className="relative">
          <img
            src={imageUrl}  // Usamos la URL obtenida del perfil
            alt="Avatar"
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={toggleMenu}
          />
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
              <ul className="py-2">
                <li className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-700" onClick={handleLogout}>
                  Cerrar Sesión
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center mb-6 text-white font-bold text-3xl">NOTAS</div>

      {loading && <div className="text-white">Estamos cargando tus notas, por favor espera...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="flex justify-end mb-4">
          <label className="text-white mr-2 text-xl" htmlFor="categorySelect">
            <strong>Seleccionar Categoría:</strong>
          </label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={handleCategorySelect}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md w-56 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Elige una categoría --</option>
            {categories.map((category, index) => (
              <option key={index} value={category} className="bg-gray-700">
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="text-white mt-4">{getFilteredNotes()}</div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg mb-4">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400">
                Sí
              </button>
              <button onClick={cancelLogout} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-200">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página con el copyright */}
      <div className="mt-8 p-4 bg-gray-900 text-center text-sm text-gray-400 fixed bottom-0 w-full">
        <p>© 2025 Encantia. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}

