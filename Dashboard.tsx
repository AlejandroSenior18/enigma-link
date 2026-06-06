import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PublicMessage() {
  const { linkId } = useParams();
  const [targetUsername, setTargetUsername] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user info based on link ID
    const fetchLinkInfo = async () => {
      try {
        const res = await fetch(`/api/links/${linkId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setTargetUsername(data.username);
      } catch (err: any) {
        setError(err.message || 'Enlace no encontrado');
      } finally {
        setLoading(false);
      }
    };

    if (linkId) {
      fetchLinkInfo();
    }
  }, [linkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/messages/${linkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(true);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
        </div>
     );
  }

  if (error && !targetUsername) {
     return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
             <div className="bg-red-500/10 p-4 rounded-full text-red-500 mb-4">
                 <AlertCircle size={32} />
             </div>
             <h1 className="text-xl font-medium text-white mb-2">Enlace Inválido</h1>
             <p className="text-slate-400 max-w-sm mb-6">{error}</p>
             <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-medium">Crear mi propio enlace</Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-4 font-sans relative">
      
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md mt-[10vh] md:mt-[15vh] relative z-10">
        
        <div className="text-center mb-8">
            <div className="inline-flex bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl mb-4 relative">
               <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-1 border-2 border-slate-950 transform rotate-12">
                  <Ghost size={16} />
               </div>
               <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400 uppercase">
                  {targetUsername.substring(0, 2)}
               </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
               Envía un mensaje a <br/><span className="text-emerald-400">@{targetUsername}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-3 font-medium">Tus mensajes son completamente anónimos.</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
           <AnimatePresence mode="wait">
             {success ? (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="flex flex-col items-center text-center py-6"
               >
                  <div className="text-emerald-400 mb-4 bg-emerald-500/10 p-4 rounded-full">
                     <CheckCircle2 size={48} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-medium text-white mb-2 tracking-tight">¡Mensaje Enviado!</h2>
                  <p className="text-slate-400 mb-8">{targetUsername} ya tiene tu mensaje secreto.</p>
                  
                  <button 
                     onClick={() => setSuccess(false)}
                     className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 font-medium transition-colors mb-4"
                  >
                     Enviar otro mensaje
                  </button>

                  <Link to="/" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                     Obtén tus propios mensajes anónimos
                  </Link>
               </motion.div>
             ) : (
               <motion.form 
                 key="form"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 onSubmit={handleSubmit} 
                 className="space-y-4"
               >
                 <div className="relative">
                    <textarea 
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       placeholder="Escribe tu mensaje secreto aquí..."
                       className={cn(
                          "w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 outline-none transition-all placeholder:text-slate-600 resize-none min-h-[160px] text-lg leading-relaxed",
                          "focus:bg-slate-950 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                       )}
                       maxLength={500}
                    />
                    <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-md">
                       {content.length}/500
                    </div>
                 </div>

                 {error && <p className="text-red-400 text-xs font-medium px-1">{error}</p>}

                 <button 
                    type="submit"
                    disabled={!content.trim() || sending}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl py-4 font-medium transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed group"
                 >
                    {sending ? (
                       <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                    ) : (
                       <>
                         <span>Enviar secretamente</span>
                         <Send size={18} className="transition-transform group-hover:translate-x-1" />
                       </>
                    )}
                 </button>
               </motion.form>
             )}
           </AnimatePresence>
        </div>

        {/* Footer brand */}
        <div className="text-center mt-12">
            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium">
               <Ghost size={14} /> Enigma Link
            </Link>
        </div>
      </div>
    </div>
  );
}
