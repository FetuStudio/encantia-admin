import { useState } from 'react'; 
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router'; 

export default function Auth() {
    const router = useRouter(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null); 
    const [loading, setLoading] = useState(false);

    // Función para manejar el inicio de sesión
    const handleSignIn = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Verificar si el usuario necesita verificar el correo
            if (user && !user.email_confirmed_at) {
                await supabase.auth.api.sendMagicLinkEmail(email);
                setErrorMessage("Te hemos enviado un enlace de verificación a tu correo.");
                return;
            }

            // Redirigir a la URL externa después del inicio de sesión exitoso
            router.push('/');
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sigin max-w-sm m-auto border border-gray-700 rounded p-6 mt-6 bg-gray-800">
            <h1 className="text-center text-white text-2xl">Sign In</h1>

            {/* Mostrar el mensaje de error si existe */}
            {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}

            <div className="field mt-4">
                <label htmlFor="email" className="text-white w-full block text-sm">Email</label>
                <input
                    type="email"
                    name="email"
                    className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="Email"
                />
            </div>

            <div className="field mt-4">
                <label htmlFor="password" className="text-white w-full block text-sm">Password</label>
                <input
                    type="password" 
                    name="password"
                    id="password"
                    className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="Password"
                />
            </div>

            <button
                className={`border p-2 w-full mt-5 rounded ${loading ? 'bg-gray-500' : 'bg-blue-600'} text-white`}
                onClick={handleSignIn}
                disabled={loading}
            >
                {loading ? 'Signing In...' : 'Sign In'}
            </button>
        </div>
    );
}
