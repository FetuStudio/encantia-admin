import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);  // Estado para almacenar los mensajes
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
            setUsers(data);
        }
    }, []);

    // Obtener los mensajes para el usuario actual
    const fetchMessages = useCallback(async () => {
        if (!userProfile) return; // Asegurarse de que el perfil del usuario está cargado antes de obtener los mensajes

        const { data, error } = await supabase
            .from('buzdvz')
            .select('title, mensaje, created_at')
            .eq('user_id', userProfile.user_id); // Buscar mensajes relacionados con el user_id del perfil actual

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data);  // Almacenar los mensajes en el estado
        }
    }, [userProfile]); // Reejecutar cuando se cargue el perfil del usuario

    useEffect(() => {
        fetchUserProfile();
        fetchUsers(); // Obtener la lista de usuarios cuando el componente se monta
    }, [fetchUserProfile, fetchUsers]);

    useEffect(() => {
        fetchMessages();  // Obtener los mensajes cuando el perfil del usuario esté cargado
    }, [fetchMessages]);

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/bdm' },
        { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
        { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' },
        { icon: "https://images.encantia.lat/events.png", name: "Eventos", url: '/events' },
        { icon: "https://images.encantia.lat/fetugames2.png", name: "Fetu Games 2", url: '/fetugames2' },
    ];

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Texto de "Inicio" encima del navbar */}
            <div className="absolute top-209 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                Mensajes
            </div>

            {/* Contenedor de los mensajes con margen superior */}
            <div className="text-white mt-0 ml-4">
                {/* Mostrar los mensajes obtenidos */}
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-800 rounded-lg shadow-lg"
                            style={{ marginBottom: '2cm' }} // Añadir un margen de 2cm entre cada mensaje
                        >
                            <h3 className="text-lg font-bold">{msg.title}</h3>
                            <p>{msg.mensaje}</p>
                            <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-white">No tienes mensajes.</p>
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
