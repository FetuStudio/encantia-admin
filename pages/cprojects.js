import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(""); 
    const [authorName, setAuthorName] = useState(""); // Nuevo estado para el nombre del autor
    const [projectData, setProjectData] = useState({
        titulo: "",
        mensaje: "",
        portada: "",
        iniciopr: "",
        findepr: "",
    });
    const [isOwnerPlus, setIsOwnerPlus] = useState(false); // Nuevo estado para verificar si el usuario es Owner+
    const [projects, setProjects] = useState([]); // Nuevo estado para almacenar los proyectos

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
            setAvatarUrl(profileData.avatar_url || '');
            setAuthorName(profileData.name || 'Autor desconocido'); // Obtener el nombre del autor
            
            // Verificar si el rol del usuario es "Owner+" y establecer el estado
            if (profileData.role === 'Owner+') {
                setIsOwnerPlus(true);
            }
        }
    }, []);

    // Función para cargar los proyectos
    const fetchProjects = async () => {
        const { data, error } = await supabase.from('proyectos').select('*');
        if (error) {
            console.error("Error al cargar los proyectos:", error);
        } else {
            setProjects(data);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        fetchProjects(); // Cargar proyectos al cargar la página
    }, []);

    const handleInputChange = (e) => {
        setProjectData({ ...projectData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userProfile) return;

        const { data, error } = await supabase.from('proyectos').insert([ 
            {
                titulo: projectData.titulo,
                mensaje: projectData.mensaje,
                portada: projectData.portada,
                iniciopr: projectData.iniciopr,
                findepr: projectData.findepr,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: userProfile.user_id,
                fotoperfil: avatarUrl, // Agregar foto de perfil
                autor: authorName,     // Agregar nombre del autor
            }
        ]);

        if (error) {
            console.error("Error al crear el proyecto:", error);
            alert("Error al crear el proyecto: " + error.message);
        } else {
            alert("Proyecto creado exitosamente");
            fetchProjects(); // Recargar los proyectos después de crear uno nuevo
            setProjectData({
                titulo: "",
                mensaje: "",
                portada: "",
                iniciopr: "",
                findepr: "",
            }); // Limpiar formulario después de enviar
        }
    };

    const handleDeleteProject = async (projectId) => {
        const { error } = await supabase.from('proyectos').delete().eq('id', projectId);
        if (error) {
            console.error("Error al eliminar el proyecto:", error);
            alert("Error al eliminar el proyecto: " + error.message);
        } else {
            alert("Proyecto eliminado exitosamente");
            fetchProjects(); // Recargar los proyectos después de eliminar uno
        }
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            <div className="flex justify-between items-center mb-4">
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-16" />
                
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
                        Buzon de mensajes
                    </button> 
                    <button
                        onClick={() => router.push("/advert")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Advertencias
                    </button> 
                    <button
                        onClick={() => router.push("/projects")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Proyectos
                    </button> 
                    <button
                        onClick={() => router.push("/cprojects")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Crear Proyectos
                    </button> 
                </div>

                {userProfile && (
                    <div className="relative">
                        <img
                            src={avatarUrl || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
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
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            router.push("/");
                                        }}
                                    >
                                        Cerrar sesión
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isOwnerPlus && ( // Solo mostrar el formulario si el usuario tiene el rol de "Owner+"
                <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg mb-4">
                    <h2 className="text-xl mb-4">Crea un Proyecto</h2>
                    <input type="text" name="titulo" placeholder="Título" value={projectData.titulo} onChange={handleInputChange} className="w-full p-2 mb-2 rounded" required />
                    <textarea name="mensaje" placeholder="Mensaje" value={projectData.mensaje} onChange={handleInputChange} className="w-full p-2 mb-2 rounded" required></textarea>
                    <input type="text" name="portada" placeholder="URL de la portada" value={projectData.portada} onChange={handleInputChange} className="w-full p-2 mb-2 rounded" required />
                    <input type="date" name="iniciopr" value={projectData.iniciopr} onChange={handleInputChange} className="w-full p-2 mb-2 rounded" required />
                    <input type="date" name="findepr" value={projectData.findepr} onChange={handleInputChange} className="w-full p-2 mb-2 rounded" required />
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Guardar</button>
                </form>
            )}

            {!isOwnerPlus && ( // Si el usuario no tiene el rol Owner+, mostrar mensaje de acceso restringido
                <div className="text-center text-red-500 mt-4">
                    <p>No tienes permisos para crear proyectos. Solo los usuarios con rol Owner+ pueden acceder a esta funcionalidad.</p>
                </div>
            )}

            {/* Mostrar proyectos y permitir eliminarlos solo a los usuarios con rol Owner+ */}
            {isOwnerPlus && (
                <div className="mt-4">
                    <h2 className="text-xl mb-4">Proyectos</h2>
                    <ul>
                        {projects.map((project) => (
                            <li key={project.id} className="bg-gray-800 p-4 mb-2 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">{project.titulo}</h3>
                                        <p>{project.mensaje}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}


