import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [lives, setLives] = useState({ twitch: [], youtube: [], kick: [] });
    const [photos, setPhotos] = useState([]); // Estado para almacenar las fotos
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Estado para el índice de la foto actual
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

    // Obtener los directos desde la base de datos
    const fetchLives = useCallback(async () => {
        const { data, error } = await supabase.from('lives').select('*');
        if (error) {
            console.error('Error fetching lives:', error);
        } else {
            const livesByPlatform = { twitch: [], youtube: [], kick: [] };

            // Organizar los directos por plataforma
            data.forEach((live) => {
                if (live.platform === "twitch") {
                    livesByPlatform.twitch.push(live);
                } else if (live.platform === "youtube") {
                    livesByPlatform.youtube.push(live);
                } else if (live.platform === "kick") {
                    livesByPlatform.kick.push(live);
                }
            });

            setLives(livesByPlatform);
        }
    }, []);

    // Obtener las fotos desde la base de datos
    const fetchPhotos = useCallback(async () => {
        const { data, error } = await supabase.from('photos').select('linkpt');
        if (error) {
            console.error('Error fetching photos:', error);
        } else {
            setPhotos(data); // Guardamos las fotos obtenidas
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchLives(); // Fetch lives when the component mounts
        fetchPhotos(); // Fetch photos when the component mounts
    }, [fetchUserProfile, fetchLives, fetchPhotos]);

    useEffect(() => {
        // Cambiar automáticamente las fotos en el carrusel
        const interval = setInterval(() => {
            setCurrentPhotoIndex(prevIndex => (prevIndex + 1) % photos.length); // Cambiar entre fotos
        }, 3000); // Cambiar cada 3 segundos

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, [photos.length]);

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/chat' },
        { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
        { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' },
        { icon: "https://images.encantia.lat/events.png", name: "Eventos", url: '/events' },
        { icon: "https://images.encantia.lat/fetugames2.png", name: "Fetu Games 2", url: '/fetugames2' },
    ];

    // Función para obtener la miniatura de YouTube
    const getYouTubeThumbnail = (url) => {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    };

    // Función para obtener el enlace embebido de YouTube
    const getYouTubeEmbedLink = (url) => {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Título Fetu Games 2 */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-white font-bold text-4xl">
            </div>

            {/* Carrusel de fotos con resolución original y tamaño ajustado */}
            <div className="mt-0 mx-auto w-full max-w-screen-lg overflow-hidden rounded-xs">
                <div className="relative">
                    {photos.length > 0 && (
                        <img
                            src={photos[currentPhotoIndex]?.linkpt}
                            alt={`Foto ${currentPhotoIndex + 1}`}
                            className="w-full object-contain rounded-lg max-h-64 mx-auto" // Ajuste del tamaño, sin perder la resolución
                        />
                    )}
                </div>
            </div>

            {/* Título Lives */}
            <div className="mt-16 text-white text-3xl text-center font-semibold">
                Lives
            </div>

            {/* Mostrar los directos por plataforma */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                {["twitch", "youtube", "kick"].map((platform) => (
                    <div key={platform} className="space-y-2">
                        <div className="text-white font-bold text-xl text-center">{platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
                        <div className="space-y-2">
                            {lives[platform].map((live, index) => (
                                <div key={index} className="bg-gray-800 p-4 rounded-md shadow-lg">
                                    <div className="flex space-x-4">
                                        {/* Miniatura del directo */}
                                        <img 
                                            src={platform === "youtube" ? getYouTubeThumbnail(live.link) : live.thumbnail || "https://via.placeholder.com/150"} 
                                            alt={`Miniatura de ${live.author}`} 
                                            className="w-32 h-32 object-cover rounded-md cursor-pointer" 
                                            onClick={() => router.push(live.link)} // Al hacer click, vamos al enlace
                                        />
                                        <div className="text-white flex flex-col justify-between">
                                            <p className="font-semibold">{live.author}</p>
                                            <p className="text-sm text-gray-300">{live.title}</p> {/* Título del directo */}
                                            <a href={live.link} target="_blank" className="text-blue-400 hover:text-blue-600">
                                                Ver Directo
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navbar inferior */}
            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
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

            {/* Licencia en la esquina inferior derecha */}
            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
