import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const router = useRouter();

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

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUsers();
    fetchEvents();
  }, [fetchUserProfile, fetchUsers, fetchEvents]);

  // Función para calcular el tiempo restante para el inicio del evento
  const getTimeRemaining = (startTime) => {
    const total = new Date(startTime) - new Date();
    const years = Math.floor(total / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((total % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((total % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    return { years, months, days, hours, minutes, seconds };
  };

  // Función para actualizar la cuenta regresiva
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents();
    }, 1000); // Cada segundo se actualizan los eventos
    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, []);

  const navButtons = [
    { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
    { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/chat' },
    { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
    { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' },
    { icon: "https://images.encantia.lat/events.png", name: "Eventos", url: '/events' },
    { icon: "https://images.encantia.lat/fetugames2.png", name: "Fetu Games 2", url: '/fetugames2' },
  ];

  return (
    <div className="bg-gray-900 min-h-screen relative">

      {/* Sección de eventos con cuenta regresiva */}
      <div className="p-4 text-white">
        <h1 className="text-2xl">Eventos Próximos</h1>
        {events.map((event) => {
          const { years, months, days, hours, minutes, seconds } = getTimeRemaining(event.start_time); // Usar start_time
          return (
            <div key={event.id} className="p-4 my-2">
              <h2 className="text-xl font-bold">{event.name}</h2>
              <p>{event.description}</p>
              <p className="mt-2">
                ⏳ {years} años, {months} meses, {days} días, {hours} horas, {minutes} minutos, {seconds} segundos
              </p>
            </div>
          );
        })}
      </div>

      {/* Navbar en la parte inferior */}
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
        <img
          src="https://images.encantia.lat/encantia-logo-2025.webp"
          alt="Logo"
          className="h-13 w-auto"
        />
        {navButtons.map((button, index) => (
          <div key={index} className="relative group">
            <button 
              onClick={() => router.push(button.url)}
              className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
            >
              <img src={button.icon} alt={button.name} className="w-8 h-8" />
            </button>
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
    </div>
  );
}
