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
  const [imageUrl, setImageUrl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(userError?.message || "No hay usuario");

        const { data: notesData, error: notesError } = await supabase
          .from("ntas")
          .select("evau1, evau2, evau3, evau4, evau5, evau6, evau7, evau8, nm, evaucat, urod, mensaje")
          .eq("user_id", user.id);
        if (notesError) throw new Error(notesError.message);

        setUserNotes(notesData[0] || null);
        setCategories([...new Set(notesData.map(note => note.evaucat))]);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .single();
        if (profileError) throw new Error(profileError.message);

        setUserProfile(profileData);
        setImageUrl(profileData.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png');
        setUserRole(profileData.role);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCategorySelect = (event) => setSelectedCategory(event.target.value);

  const handleMessageClick = () => {
    if (userNotes?.mensaje) setUserMessage(userNotes.mensaje);
    setShowMessage(true);
  };

  const evaluationNames = {
    evau1: "Atención al Cliente",
    evau2: "Comportamiento",
    evau3: "Organización",
    evau4: "Trabajo en Equipo",
    evau5: "Experiencia",
    evau6: "Actividad",
    evau7: "Tiempo conectado",
    evau8: "Cosas hechas",
    nm: "Nota Media",
    urod: "Resultado Final (Ascender o Descender)"
  };

  const navButtons = [
    { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
    { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/bdm' },
    { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
    { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' },
    { icon: "https://images.encantia.lat/events.png", name: "Eventos", url: '/events' },
    { icon: "https://images.encantia.lat/fetugames2.png", name: "Fetu Games 2", url: '/fetugames2' },
  ];

  return (
    <div className="relative">
      {showMessage && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-2xl font-semibold text-white mb-4">Mensaje de los owners</h2>
            <p className="text-white">{userMessage}</p>
            <button onClick={() => setShowMessage(false)} className="absolute top-2 right-2 text-white text-4xl font-bold">×</button>
          </div>
        </div>
      )}

      <Head>
        <title>NOTAS</title>
      </Head>

      <div className="bg-gray-900 min-h-screen">
            {/* Texto de "Inicio" encima del navbar, con margen desde la parte superior */}
            <div className="absolute top-209 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                Notas
            </div>
        {/* Navbar Inferior */}
        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
          {/* Logo a la izquierda en el navbar inferior */}
          <img
            src="https://images.encantia.lat/encantia-logo-2025.webp"
            alt="Logo"
            className="h-13 w-auto"
          />
          {/* Botones de navegación */}
          {navButtons.map((button, index) => (
            <div key={index} className="relative group">
              <button 
                onClick={() => router.push(button.url)}
                className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
              >
                <img src={button.icon} alt={button.name} className="w-8 h-8" />
              </button>
              <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                {button.name}
              </span>
            </div>
          ))}

          {/* Avatar del usuario */}
          {userProfile && (
            <button onClick={() => router.push(`/profile/${userProfile.user_id}`)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110">
              <img
                src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-col p-4">
          {loading && <p className="text-white">Cargando notas...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {!loading && !error && (
            <div className="flex justify-end mb-4">
              <label className="text-white mr-2 text-xl" htmlFor="categorySelect">Categoría:</label>
              <select 
                id="categorySelect" 
                value={selectedCategory} 
                onChange={handleCategorySelect} 
                className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md w-56 text-lg"
              >
                <option value="">-- Elige una categoría --</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}

          {/* Mostrar notas filtradas */}
          {selectedCategory && userNotes?.evaucat === selectedCategory && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-2">Notas para: <span className="text-blue-300">{selectedCategory}</span></h4>
              {Object.entries(evaluationNames).map(([key, label]) => (
                userNotes[key] && (
                  <p key={key} className="text-white"><strong className="text-yellow-400">{label}:</strong> {userNotes[key]}</p>
                )
              ))}
              <button onClick={handleMessageClick} className="mt-4">
                <img src="https://images.encantia.lat/mpend.png" alt="Mensaje" className="w-15 h-15" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
