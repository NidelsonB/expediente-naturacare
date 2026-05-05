
import { useState, type FormEvent } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username === 'selvin' && password === 'Natura0922') {
      onLogin({
        id: '1',
        email: 'selvin',
        name: 'Selvin Lopez'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-200">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl shadow-emerald-100">
            N
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">NaturaCare</h2>
          <p className="mt-2 text-slate-500 font-medium">Bienvenido, ND. Selvin Lopez</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-4 py-3 rounded-2xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-2xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent text-xl font-black rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            Acceder al Sistema
          </button>
        </form>
        
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black">Seguridad Profesional</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
