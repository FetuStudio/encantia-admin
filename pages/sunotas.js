import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [accessDenied, setAccessDenied] = useState(false);
    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

        if (profileData) {
            setUserProfile(profileData);
            setAccessDenied(profileData.role !== "Owner+");
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchUsers();
    }, [fetchUserProfile, fetchUsers]);

    const handleViewNotes = (userId) => {
        router.push(`/notes/${userId}`);
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/chat' },
        { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
        { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' },
    ];

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            {accessDenied && (
                <div className="text-center text-red-500 text-xl font-bold py-4">
                    No tienes acceso a esta página.
                </div>
            )}

            {/* User list (takes up the remaining space) */}
            <div className="flex-1 overflow-auto p-4">
                {!accessDenied && (
                    <div className="bg-gray-800 text-white rounded-lg shadow-md">
                        <h2 className="text-lg font-bold mb-2">Lista de Usuarios</h2>
                        <ul>
                            {users.map(user => (
                                <li key={user.id} className="flex items-center justify-between p-2 border-b border-gray-700">
                                    <div className="flex items-center space-x-4">
                                        <img src={user.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'} alt={user.name} className="w-10 h-10 rounded-full" />
                                        <span>{user.name}</span>
                                        <button
                                            onClick={() => handleViewNotes(user.id)}
                                            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                                        >
                                            Ver/Editar Notas
                                        </button>
                                    </div>
                                    <span className="text-gray-400">@{user.user}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Navbar (fixed at the bottom) */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex items-center bg-transparent p-2 rounded-full shadow-lg space-x-4 w-full justify-center">
                {/* Logo */}
                <img
                    src="https://images.encantia.lat/encantia-logo-2025.webp"
                    alt="Logo"
                    className="h-13 w-auto"
                />
                {/* Navigation buttons */}
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

                {/* User Profile Button */}
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

            {/* License text */}
            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
