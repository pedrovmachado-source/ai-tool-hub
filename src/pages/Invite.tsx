import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Ticket, Users, PlayCircle } from 'lucide-react';
import { getFingerprint, getIpAddress } from '@/utils/security';

export default function Invite() {
  const { logout } = useAuth();
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState<string | null>(null);

  useEffect(() => {
    const initSecurity = async () => {
      try {
        const [fp, ip] = await Promise.all([getFingerprint(), getIpAddress()]);
        setFingerprint(fp);
        setIpAddress(ip);
      } catch (err) {
        console.error('Security check failed:', err);
      }
    };
    initSecurity();
  }, []);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_invite_code', {
        invite_code_text: code.trim().toUpperCase(),
        p_fingerprint: fingerprint || 'unknown',
        p_ip_address: ipAddress || '0.0.0.0'
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast.success(result.message);
        // Reload to update the user state in AuthContext
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Erro ao validar convite:', error);
      toast.error('Erro ao validar convite. Tente novamente.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Convert Club</h1>
          <p className="text-gray-400">O acesso é restrito a convidados.</p>
        </div>

        <Card className="bg-white/5 border-white/10 text-white shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Inserir Código de Convite</CardTitle>
            <CardDescription className="text-gray-400">
              Digite o código de 8 caracteres que você recebeu para liberar seu acesso.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleValidate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="EX: ABCD1234"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-center text-xl font-mono tracking-[0.2em] uppercase h-14"
                  maxLength={8}
                  disabled={isValidating}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg font-semibold"
                disabled={isValidating || code.length < 8}
              >
                {isValidating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Validar Acesso'
                )}
              </Button>
              
              <div className="pt-6 border-t border-white/10 w-full text-center">
                <h3 className="text-white font-semibold mb-2">Ainda não tem um código?</h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Não se preocupe. Você pode garantir seu código de acesso participando agora do nosso grupo aberto de networking.
                </p>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full bg-red-600 border-red-600 text-white hover:bg-red-700 hover:text-white hover:border-red-700 h-12 mb-3 transition-all duration-300"
                >
                  <a 
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 font-bold"
                  >
                    <PlayCircle size={20} />
                    Ver vídeo para receber código
                  </a>
                </Button>

                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20 hover:text-green-300 h-12 transition-all duration-300"
                >
                  <a 
                    href="https://chat.whatsapp.com/H3rDqE4KMrA9fLEiN2Qmuo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 font-bold"
                  >
                    <Users size={20} className="text-green-500" />
                    Pegar Código no WhatsApp
                  </a>
                </Button>
              </div>

              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => logout()}
                className="text-gray-400 hover:text-white hover:bg-white/5 w-full"
              >
                Sair da conta
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500">
          Cada código é único e pode ser usado apenas uma vez.
        </p>
      </div>
    </div>
  );
}
