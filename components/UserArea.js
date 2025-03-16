import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [username, setUsername] = useState(""); 
    const [avatarUrl, setAvatarUrl] = useState(""); 
    const [userEmail, setUserEmail] = useState(""); 
    const [profileExists, setProfileExists] = useState(true); 
    const [loading, setLoading] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(""); 
    const [profileSaved, setProfileSaved] = useState(false); 
    const [users, setUsers] = useState([]);  

    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

        if (profileData) {
            setUserProfile(profileData);
            setUserEmail(profileData.email);
            setUsername(profileData.name || '');
            setAvatarUrl(profileData.avatar_url || '');
        }

        const { data: allUsers } = await supabase
            .from('profiles')
            .select('name, avatar_url, email, user_id')
            .neq('email', user.email);

        if (allUsers) setUsers(allUsers);
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const navButtons = [
        { name: 'Inicio', url: '/' },
        { name: 'Notas', url: '/notes' },
        { name: 'Buzón de mensajes', url: '/bdm' },
        { name: 'Advertencias', url: '/advert' },
    ];

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            <div className="flex justify-between items-center mb-4">
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-16" />
                
                <div className="flex gap-4">
                    {navButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(button.url)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                        >
                            {button.name}
                        </button>
                    ))}
                </div>

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
                                        onClick={() => router.push(`/perfil/${userProfile.user_id}`)}
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

            {users.length > 0 ? (
                <div className="flex flex-col gap-6 mt-8">
                    {users.map((user, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <img
                                src={user.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <h3 className="text-xl font-semibold">{user.name}</h3>
                                <button
                                    onClick={() => router.push(`/perfil/${user.user_id}`)}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                                >
                                    Ver perfil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 mt-4">No hay usuarios disponibles.</p>
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

            <div className="mt-8 p-4 bg-gray-900 text-center text-sm text-gray-400 fixed bottom-0 w-full">
                <p>© 2025 Encantia. Todos los derechos reservados.</p>
            </div>
        </div>
    );
}
