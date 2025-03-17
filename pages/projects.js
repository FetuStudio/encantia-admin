import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export default function Navbar() {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [projects, setProjects] = useState([]);

    const router = useRouter();

    const navButtons = [
        { name: 'Inicio', url: '/' },
        { name: 'Notas', url: '/notes' },
        { name: 'Buzón de mensajes', url: '/bdm' },
        { name: 'Advertencias', url: '/advert' },
    ];

    const fetchUserProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

        if (profileData) {
            setUserProfile(profileData);
        }

        const { data: projectData } = await supabase
            .from('proyectos')
            .select('*');

        if (projectData) setProjects(projectData);
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white relative">
            {/* Navbar superior */}
            <div className="flex justify-between items-center p-4 bg-gray-900 relative">
                {/* Logo en la esquina superior izquierda */}
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-16 absolute left-4" />

                {/* Botones de navegación centrados */}
                <div className="flex-1 flex justify-center gap-6">
                    {navButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(button.url)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all"
                        >
                            {button.name}
                        </button>
                    ))}
                </div>

                {/* Perfil del usuario en la esquina superior derecha */}
                {userProfile && (
                    <div className="relative">
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full cursor-pointer"
                            onClick={() => setShowMenu(!showMenu)}
                        />
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                                <ul className="py-2">
                                    <li
                                        className="px-4 py-2 text-white cursor-pointer hover:bg-gray-700"
                                        onClick={() => router.push(`/profile/${userProfile.user_id}`)}
                                    >
                                        Ver perfil
                                    </li>
                                    <li
                                        className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-700"
                                        onClick={() => setShowLogoutModal(true)}
                                    >
                                        Cerrar sesión
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lista de proyectos */}
            {projects.length > 0 ? (
                <div className="mt-4 px-4">
                    {projects.map((proyecto, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4 relative">
                            <div className="flex items-center mb-4">
                                <p className="text-sm text-gray-400">Proyecto de:</p>
                                <img
                                    src={proyecto.fotoperfil || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                                    alt="Foto de perfil"
                                    className="w-8 h-8 rounded-full ml-2"
                                />
                                <p className="ml-2 text-lg">{proyecto.autor}</p>
                            </div>

                            <img
                                src={proyecto.portada}
                                alt="Portada"
                                className="w-full h-64 object-contain rounded-md mb-4"
                            />
                            <h2 className="text-xl font-semibold">{proyecto.titulo}</h2>
                            <p className="text-gray-400">{proyecto.mensaje}</p>

                            <div className="absolute bottom-4 right-4 text-sm text-gray-300">
                                <p><strong>Inicio:</strong> {formatDate(proyecto.iniciopr)}</p>
                                <p><strong>Fin:</strong> {formatDate(proyecto.findepr)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center mt-4">No hay proyectos disponibles.</p>
            )}

            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <p className="mb-4 text-lg font-semibold">¿Seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push("/");
                                }}
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
