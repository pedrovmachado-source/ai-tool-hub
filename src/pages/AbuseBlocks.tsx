import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, UserCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AbuseBlock {
  user_id: string;
  email: string;
  nome: string;
  fingerprint: string;
  ip_address: string;
  blocked_at: string;
}

export default function AbuseBlocks() {
  const [blocks, setBlocks] = useState<AbuseBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('list_abuse_blocks');
      if (error) throw error;
      setBlocks(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar bloqueios:', error);
      toast.error('Erro ao carregar lista de bloqueios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleUnblock = async (userId: string, fingerprint: string) => {
    setProcessingId(userId);
    try {
      const { data, error } = await supabase.rpc('remove_abuse_block', {
        target_user_id: userId,
        target_fingerprint: fingerprint
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      if (result.success) {
        toast.success(result.message);
        setBlocks(prev => prev.filter(b => b.user_id !== userId));
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Erro ao remover bloqueio:', error);
      toast.error('Erro ao processar desbloqueio.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestão de Bloqueios</h1>
              <p className="text-gray-400">Controle de abuso por autoconvite e dispositivos</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchBlocks} 
            disabled={loading}
            className="border-white/10 hover:bg-white/5 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Contas e Dispositivos Bloqueados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhum bloqueio de abuso detectado no momento.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="text-gray-400">Usuário</TableHead>
                    <TableHead className="text-gray-400">Fingerprint</TableHead>
                    <TableHead className="text-gray-400">IP</TableHead>
                    <TableHead className="text-gray-400">Data Bloqueio</TableHead>
                    <TableHead className="text-right text-gray-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow key={block.user_id} className="border-white/10 hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{block.nome}</span>
                          <span className="text-xs text-gray-500 font-mono">{block.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">
                        {block.fingerprint || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {block.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(block.blocked_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnblock(block.user_id, block.fingerprint)}
                          disabled={processingId === block.user_id}
                          className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        >
                          {processingId === block.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Desbloquear
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
