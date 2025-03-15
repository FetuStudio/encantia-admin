import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [username, setUsername] = useState(""); // Variable para el nombre de usuario
    const [avatarUrl, setAvatarUrl] = useState(""); // Variable para la URL del avatar
    const [userEmail, setUserEmail] = useState(""); // Variable para el correo electrónico
    const [profileExists, setProfileExists] = useState(true); // Variable para saber si el perfil existe
    const [loading, setLoading] = useState(false); // Variable para el estado de carga
    const [errorMessage, setErrorMessage] = useState(""); // Variable para mensajes de error
    const [profileSaved, setProfileSaved] = useState(false); // Variable para saber si el perfil se guardó correctamente

    const router = useRouter();

    useEffect(() => {
        // Obtener perfil del usuario
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!error) {
                setRole(data?.role);
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', user.email)
                .single();

            if (!profileError && profileData) {
                setUserProfile(profileData);
                setUserEmail(profileData.email);
                setUsername(profileData.name || '');
                setAvatarUrl(profileData.avatar_url || '');
                
                if (!profileData.avatar_url || !profileData.name) {
                    setProfileExists(false);
                } else {
                    setProfileExists(true);
                }
            } else {
                setProfileExists(false);
                setUserEmail(user.email);
            }
        };

        fetchUserProfile();
    }, []); // Dependencia vacía para que se ejecute solo una vez al cargar el componente

    const handleSaveProfile = async () => {
        if (!username || !avatarUrl) {
            setErrorMessage("El nombre de usuario y la foto de perfil son obligatorios.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            setErrorMessage("No se pudo obtener el usuario.");
            setLoading(false);
            return;
        }

        if (!userEmail) {
            setErrorMessage("No se pudo obtener el correo electrónico del usuario.");
            setLoading(false);
            return;
        }

        let updateOrCreateError = null;

        if (profileExists) {
            // Si el perfil existe, actualizamos los datos
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    name: username,
                    avatar_url: avatarUrl
                })
                .eq("email", userEmail);

            updateOrCreateError = updateError;
        } else {
            // Si no existe el perfil, lo creamos
            const { error: insertError } = await supabase
                .from("profiles")
                .insert([{
                    email: userEmail,
                    name: username,
                    avatar_url: avatarUrl,
                }]);

            updateOrCreateError = insertError;
        }

        setLoading(false);

        if (updateOrCreateError) {
            setErrorMessage(updateOrCreateError.message);
            return;
        }

        setProfileSaved(true);
        setErrorMessage("");
        window.location.reload();
    };

    const toggleMenu = () => setShowMenu(!showMenu);

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const navButtons = [
        { name: 'Inicio', url: '/' },
        { name: 'Notas', url: '/notes' },
        { name: 'Buzon de mensajes', url: '/bdm' },
        { name: 'Advertencias', url: '/advert' },
    ];

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            {/* Barra de navegación superior */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    {navButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => window.open(button.url, button.target || "_self")}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                        >
                            {button.name}
                        </button>
                    ))}
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

            {/* Texto INICIO en negrita */}
            <div className="flex justify-center items-center mb-6 text-white font-bold text-3xl">
                INICIO
            </div>

            {/* Imagen centrada debajo del texto "INICIO" */}
            <div className="flex justify-center items-center">
                <a href="https://www.pornhub.com/" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://images.encantia.lat/fet5km.png" // URL de la imagen
                        alt="Imagen Fet5km"
                        className="max-w-full h-auto" // Asegura que la imagen sea escalable
                    />
                </a>
            </div>

            {/* Modal de Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <p className="mb-4 text-lg font-semibold">¿Seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-all"
                            >
                                Sí
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
