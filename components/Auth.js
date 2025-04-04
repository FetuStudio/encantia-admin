import { useState, useEffect } from 'react'; 
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router'; 

export default function Auth() {
    const router = useRouter(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [isLoadingGifVisible, setIsLoadingGifVisible] = useState(false); // Estado para mostrar el gif de carga
    const [passwordVisible, setPasswordVisible] = useState(false); // Estado para mostrar/ocultar la contraseña

    const dominiosRestringidos = ['gmail.com', 'outlook.com', 'outlook.es', 'hotmail.com'];

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleSignIn = async () => {
        setLoading(true);
        setErrorMessage(null);
        setIsLoadingGifVisible(true); // Mostrar el gif de carga

        const dominioEmail = email.split('@')[1];
        if (dominiosRestringidos.includes(dominioEmail)) {
            setErrorMessage(`El servicio de correo ${dominioEmail} no está disponible para el inicio de sesión.`);
            setLoading(false);
            setIsLoadingGifVisible(false); // Ocultar el gif de carga si hay un error
            return;
        }

        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Mostrar el GIF durante 3 segundos antes de redirigir
            setTimeout(() => {
                // Redirigir a la página principal "/"
                router.push('/');
            }, 3000); // 3 segundos
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setLoading(false);
            setIsLoadingGifVisible(false); // Ocultar el gif de carga cuando se termina
        }
    };

    return (
        <div className="bg-gray-900 h-screen flex items-center justify-center relative">
            {errorMessage && (
                <div 
                    className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-black p-3 rounded shadow-lg transition-transform duration-500 ease-in-out animate-slide-down flex justify-between items-center"
                >
                    <span>{errorMessage}</span>
                    <button 
                        className="ml-4 font-bold hover:bg-gray-300 px-2 rounded"
                        onClick={() => setErrorMessage(null)}
                    >
                        X
                    </button>
                </div>
            )}
            <div className="max-w-sm w-full border border-gray-700 rounded p-6 bg-gray-800">
                {/* Logo encima del texto "Iniciar sesión" */}
                <div className="flex justify-center mb-4">
                    <img 
                        src="https://images.encantia.lat/encantia-logo-2025.webp" 
                        alt="Logo de Encatia" 
                        className="h-25"
                    />
                </div>
                <h1 className="text-center text-white text-2xl">Iniciar sesión</h1>

                {/* Correo electrónico con imagen a la derecha dentro del formulario */}
                <div className="field mt-4">
                    <label htmlFor="email" className="text-white w-full block text-sm">Correo electrónico</label>
                    <div className="flex items-center w-full">
                        <input
                            type="email"
                            name="email"
                            className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="Correo electrónico"
                        />
                        <img 
                            src="https://images.encantia.lat/email.png" 
                            alt="Correo electrónico icono" 
                            className="w-6 h-6 ml-2"
                        />
                    </div>
                </div>

                {/* Contraseña con imagen a la derecha dentro del formulario */}
                <div className="field mt-4">
                    <label htmlFor="password" className="text-white w-full block text-sm">Contraseña</label>
                    <div className="flex items-center w-full">
                        <input
                            type={passwordVisible ? "text" : "password"} // Cambia el tipo dependiendo del estado
                            name="password"
                            id="password"
                            className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Contraseña"
                        />
                        <img 
                            src="https://images.encantia.lat/password.png" 
                            alt="Contraseña icono" 
                            className="w-6 h-6 ml-2"
                        />
                        {/* Icono del ojo para mostrar/ocultar la contraseña */}
                        <button
                            type="button"
                            className="ml-2 text-white"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? (
                                <img 
                                    src="https://images.encantia.lat/upass.png" 
                                    alt="Ocultar contraseña" 
                                    className="w-6 h-6"
                                />
                            ) : (
                                <img 
                                    src="https://images.encantia.lat/vpass.png" 
                                    alt="Mostrar contraseña" 
                                    className="w-6 h-6"
                                />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    className="border p-2 w-full mt-5 rounded bg-blue-600 text-white relative"
                    onClick={handleSignIn}
                    disabled={loading}
                >
                    {/* Mostrar el texto del botón o el gif de carga */}
                    {!loading ? 'Iniciar sesión' : ' '}
                    {/* GIF de carga dentro del botón */}
                    {loading && (
                        <img 
                            src="https://images.encantia.lat/loading.gif" 
                            alt="Cargando..."
                            className="absolute inset-0 w-6 h-6 m-auto"
                        />
                    )}
                </button>

                {/* Texto adicional debajo del botón "Iniciar sesión" */}
                <div className="mt-4 text-center">
                    <p className="text-white text-sm">
                        ¿No eres admin?{" "}
                        <a 
                            href="https://www.encantia.lat/"
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Haz click aquí
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
