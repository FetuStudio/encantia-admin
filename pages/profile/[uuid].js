import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";

const Perfil = () => {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [username, setUsername] = useState(""); 
    const [avatarUrl, setAvatarUrl] = useState(""); 
    const [userEmail, setUserEmail] = useState(""); 
    const [profileExists, setProfileExists] = useState(true); 
    const [loading, setLoading] = useState(true); // Se actualiza a 'true' en el segundo código
    const [errorMessage, setErrorMessage] = useState(""); 
    const [profileSaved, setProfileSaved] = useState(false); 
    const [users, setUsers] = useState([]);  // Nuevo estado para almacenar los usuarios
    
    // Agregado desde el segundo bloque
    const [followers, setFollowers] = useState([]); // Estado para almacenar los seguidores
    const [newDescription, setNewDescription] = useState(""); // Estado para manejar la nueva descripción
    const [isEditing, setIsEditing] = useState(false); // Controla si el usuario está editando la descripción
    const [followersCount, setFollowersCount] = useState(0); // Contador de seguidores
    const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false); // Estado para abrir/cerrar el modal
    

    // Usamos useRouter para capturar el parámetro 'uuid' desde la URL
    const router = useRouter();
    const { uuid } = router.query; // Capturamos el parámetro 'uuid' desde la URL

    // Verificamos si el usuario está viendo su propio perfil
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error(authError);
                return;
            }
            setCurrentUser(user);
        };

        fetchUserProfile();
    }, []);

    // useEffect que se ejecuta cuando el componente se monta
    useEffect(() => {
        if (!uuid) return;

        const fetchProfile = async () => {
            try {
                // Obtener el perfil del usuario
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*, role") // Aseguramos que también estamos trayendo la columna 'role'
                    .eq("user_id", uuid)
                    .single();

                if (error) {
                    console.error("Error al obtener perfil:", error.message);
                    throw new Error(error.message);
                }

                setUserProfile(data);
                setNewDescription(data.description || ""); // Cargamos la descripción actual en el estado

                setLoading(false);
            } catch (error) {
                console.error("Error general:", error);
                setErrorMessage("No se pudo cargar el perfil.");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [uuid]);

    // useEffect que obtiene la lista de seguidores
    useEffect(() => {
        if (!uuid || !currentUser) return;

        const fetchFollowers = async () => {
            try {
                // Obtener los seguidores de este usuario
                const { data: followersData, error } = await supabase
                    .from("followers")
                    .select("follower_id")
                    .eq("followed_id", uuid);

                if (error) {
                    console.error("Error al obtener seguidores:", error.message);
                    throw new Error(error.message);
                }

                setFollowersCount(followersData.length);

                // Obtener los detalles de los seguidores (nombre y avatar_url)
                const followersIds = followersData.map((follower) => follower.follower_id);
                const { data: followersDetails, error: followersError } = await supabase
                    .from("profiles")
                    .select("name, avatar_url")
                    .in("user_id", followersIds);

                if (followersError) {
                    console.error("Error al obtener detalles de seguidores:", followersError.message);
                    throw new Error(followersError.message);
                }

                setFollowers(followersDetails);
            } catch (error) {
                console.error("Error al obtener seguidores:", error);
                setErrorMessage("No se pudo cargar los seguidores.");
            }
        };

        fetchFollowers();
    }, [uuid, currentUser]);

    // Función para guardar la nueva descripción
    const handleSaveDescription = async () => {
        if (!currentUser || !newDescription) return;

        try {
            // Actualizamos la descripción en la base de datos
            const { data, error } = await supabase
                .from("profiles")
                .update({ description: newDescription })
                .eq("user_id", currentUser.id);

            if (error) {
                console.error("Error al guardar descripción:", error.message);
                setErrorMessage("Hubo un error al guardar la descripción.");
                return;
            }

            // Actualizamos el estado para reflejar los cambios
            setUserProfile((prevProfile) => ({
                ...prevProfile,
                description: newDescription, // Actualizamos la descripción en el estado
            }));

            setIsEditing(false); // Desactivamos el modo de edición
        } catch (error) {
            console.error("Error al guardar descripción:", error);
            setErrorMessage("Hubo un error al guardar la descripción.");
        }
    };

    // Abrir el modal de seguidores
    const openFollowersModal = () => {
        setIsFollowersModalOpen(true);
    };

    // Cerrar el modal de seguidores
    const closeFollowersModal = () => {
        setIsFollowersModalOpen(false);
    };

    if (loading) return <div>Cargando...</div>;
    if (errorMessage) return <div>{errorMessage}</div>;

    const isOwnProfile = currentUser && currentUser.id === uuid;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Barra de navegación superior */}
            <div className="flex justify-between items-center p-4 bg-gray-900">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>
                    <button
                        onClick={() => router.push("/notes")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Notas
                    </button>
                    <button
                        onClick={() => router.push("/bdm")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Buzón de mensajes
                    </button>
                    <button
                        onClick={() => router.push("/advert")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Advertencias
                    </button>
                </div>
            </div>

            {/* Contenido principal del perfil */}
            <div className="flex flex-col items-center mt-10 p-6 bg-gray-900 rounded-lg">
                <img
                    src={userProfile.avatar_url || "https://i.ibb.co/d0mWy0kP/perfildef.png"}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full mb-4"
                />
                <h1 className="text-3xl font-semibold">{userProfile.name}</h1>

                {/* Mostrar el rol del usuario */}
                <div className="mt-4 text-lg text-gray-300">
                    <p><strong>Rol:</strong> {userProfile.role || "Sin rol asignado"}</p>
                </div>

                {/* Mostrar la descripción */}
                <div className="mt-4 text-lg text-gray-300">
                    {!isEditing ? (
                        <p>{userProfile.description || "Este usuario no ha agregado una descripción."}</p>
                    ) : (
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="w-full p-6 bg-gray-700 rounded-md h-55 resize-none"
                            placeholder="Escribe tu nueva descripción..."
                        />
                    )}
                </div>

                {/* Botón de editar descripción */}
                {isOwnProfile && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400"
                    >
                        Editar Descripción
                    </button>
                )}

                {/* Botón de guardar descripción */}
                {isOwnProfile && isEditing && (
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={handleSaveDescription}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {/* Contador de seguidores */}
                <div className="mt-6">
                    <p className="text-lg font-semibold text-gray-300">
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={openFollowersModal}
                        >
                            {followersCount} {followersCount === 1 ? "seguidor" : "seguidores"}
                        </span>
                    </p>
                </div>

                {/* Modal de seguidores */}
                {isFollowersModalOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
                        onClick={closeFollowersModal}
                    >
                        <div
                            className="bg-gray-900 p-6 rounded-lg w-96"
                            onClick={(e) => e.stopPropagation()} // Evita que se cierre el modal al hacer clic dentro
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Seguidores</h2>
                            <ul className="space-y-4">
                                {followers.map((follower, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <img
                                            src={follower.avatar_url || "https://i.ibb.co/d0mWy0kP/perfildef.png"}
                                            alt={follower.name}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <span className="text-white">{follower.name}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={closeFollowersModal}
                                className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pie de página con el copyright al final */}
            <div className="mt-8 p-4 bg-gray-900 text-center text-sm text-gray-400 fixed bottom-0 w-full">
                <p>© 2025 Encantia. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default Perfil;

