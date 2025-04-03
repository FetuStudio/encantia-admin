import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]); // Estado para los usuarios
    const [advertencias, setAdvertencias] = useState([]); // Estado para las advertencias
    const router = useRouter();

    // Obtener el perfil del usuario
    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

        if (profileData) setUserProfile(profileData);
    }, []);

    // Obtener lista de usuarios
    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data); // Establecer los datos de los usuarios
        }
    }, []);

    // Obtener las advertencias del usuario actual
    const fetchAdvertencias = useCallback(async () => {
        if (!userProfile) return; // Asegurarse de que el perfil del usuario esté cargado antes de obtener las advertencias

        const { data, error } = await supabase
            .from('adv')  // Usar la tabla adv
            .select('titulo, mensaje')
            .eq('user_id', userProfile.user_id);  // Buscar las advertencias relacionadas con el user_id del perfil actual

        if (error) {
            console.error('Error fetching advertencias:', error);
        } else {
            setAdvertencias(data);  // Almacenar las advertencias en el estado
        }
    }, [userProfile]); // Ejecutar cuando el perfil del usuario cambie

    useEffect(() => {
        fetchUserProfile();
        fetchUsers(); // Obtener la lista de usuarios cuando el componente se monta
    }, [fetchUserProfile, fetchUsers]);

    useEffect(() => {
        fetchAdvertencias();  // Obtener las advertencias cuando el perfil del usuario esté cargado
    }, [fetchAdvertencias]);

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/chat' },
        { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
        { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' },
        { icon: "https://images.encantia.lat/events.png", name: "Eventos", url: '/events' },
        { icon: "https://images.encantia.lat/fetugames2.png", name: "Fetu Games 2", url: '/fetugames2' },
    ];

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Texto de "Advertencias" encima del navbar */}
            <div className="absolute top-209 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                Advertencias
            </div>

            {/* Contenedor de las advertencias con margen superior */}
            <div className="text-white mt-0 ml-4">
                {/* Mostrar las advertencias obtenidas */}
                {advertencias.length > 0 ? (
                    advertencias.map((adv, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-800 rounded-lg shadow-lg"
                            style={{ marginBottom: '2cm' }} // Añadir un margen de 2cm entre cada advertencia
                        >
                            <h3 className="text-lg font-bold">{adv.titulo}</h3>
                            <p>{adv.mensaje}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-white">No tienes advertencias.</p>
                )}
            </div>

            {/* Navbar de abajo */}
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

            {/* Texto de licencia en la esquina inferior derecha */}
            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
