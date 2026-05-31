import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Coins, CreditCard, QrCode, Check, Star, X, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CashPackage {
  id: string;
  name: string;
  base_cash: number;
  price_brl_cents: number;
  is_popular: boolean;
  sort_order: number;
}

const CashIconLarge = ({ className = "w-12 h-12", variant = "coin" }: { className?: string; variant?: string }) => {
  const getIconUrl = (v: string) => {
    switch (v) {
      case 'coin': return "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Coin/3D/coin_3d.png";
      case 'bag': return "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Money%20bag/3D/money_bag_3d.png";
      case 'wings': return "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Money%20with%20wings/3D/money_with_wings_3d.png";
      case 'gem': return "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Gem%20stone/3D/gem_stone_3d.png";
      case 'trophy': return "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Trophy/3D/trophy_3d.png";
      default: return "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Coin/3D/coin_3d.png";
    }
  };

  return (
    <div className={`${className} flex items-center justify-center relative`}>
      <img 
        src={getIconUrl(variant)}
        alt="Cash"
        className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
        loading="eager"
      />
      <div className="absolute inset-0 bg-brand-amber/20 blur-2xl rounded-full scale-50 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default function ComprarCash() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState<CashPackage[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(user?.cashBalance || 0);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('cash_packages')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (data) setPackages(data);

      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('cash_balance')
          .eq('id', user.id)
          .single();
        if (profile) setCurrentBalance(Number(profile.cash_balance));
      }
    }
    fetchData();
  }, [user?.id]);

  const handleDeposit = async () => {
    if (!selectedPackage) {
      toast.error("Selecione um pacote primeiro");
      return;
    }

    if (paymentMethod === 'pix') {
      setShowPixModal(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          packageId: selectedPackage,
          paymentMethod: paymentMethod 
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao iniciar pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden">
      <Navbar onNavigate={(p) => navigate(p === 'home' ? '/' : `/${p}`)} />

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 uppercase text-[10px] font-bold tracking-[0.2em]"
        >
          <ArrowLeft size={14} /> Voltar ao menu
        </button>

        <header className="mb-16">
          <div className="text-[10px] font-bold text-brand-blue tracking-[0.2em] uppercase mb-4">Carteira</div>
          <h1 className="text-5xl md:text-7xl font-serif-display tracking-tight text-white mb-6">
            Comprar <em className="italic font-normal">Cash</em>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl font-light">
            Recarregue sua carteira e use seu Cash em tudo dentro do Convert Club.
          </p>

          <div className="mt-8 inline-flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl glass-smooth">
            <div className="text-sm font-medium text-white/50">Saldo atual:</div>
            <div className="flex items-center gap-2">
              <CashIconLarge className="w-6 h-6 text-brand-amber" />
              <span className="text-2xl font-serif-display text-white">{currentBalance.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </header>

        {/* Payment Method Toggle */}
        <div className="mb-16">
          <div className="bg-white/5 p-1 rounded-xl w-fit flex items-center border border-white/10">
            <button 
              onClick={() => setPaymentMethod('pix')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${paymentMethod === 'pix' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              <QrCode size={16} />
              PIX
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${paymentMethod === 'pix' ? 'bg-brand-purple text-white' : 'bg-white/10 text-white/40'}`}>+10% BÔNUS</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${paymentMethod === 'card' ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              <CreditCard size={16} />
              CARTÃO
            </button>
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {packages.map((pkg, index) => {
            const isSelected = selectedPackage === pkg.id;
            const cashAmount = paymentMethod === 'pix' ? Math.floor(pkg.base_cash * 1.1) : pkg.base_cash;
            
            // Map package to 3D icon variant
            const getVariant = (idx: number) => {
              if (idx === 0) return "coin";
              if (idx === 1) return "bag";
              if (idx === 2) return "wings";
              if (idx === 3) return "gem";
              return "trophy";
            };

            return (
              <div 
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`
                  relative cursor-pointer group p-8 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center
                  ${isSelected ? 'bg-white/10 border-brand-blue shadow-[0_0_30px_rgba(110,143,214,0.15)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                `}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-md bg-brand-purple text-white text-[9px] font-bold tracking-[0.1em] uppercase z-20 shadow-lg">
                    Mais Popular
                  </div>
                )}

                <div className="mb-8 relative">
                  <CashIconLarge 
                    variant={getVariant(index)} 
                    className="w-24 h-24 group-hover:scale-110 transition-transform duration-500 ease-out" 
                  />
                </div>

                <div className="text-4xl font-serif-display text-white mb-2">
                  {cashAmount.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">
                  {paymentMethod === 'pix' ? (
                    <span>{pkg.base_cash.toLocaleString('pt-BR')} Base + {(cashAmount - pkg.base_cash).toLocaleString('pt-BR')} Bônus</span>
                  ) : (
                    <span>Cash de elite</span>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 w-full">
                  <span className="text-brand-blue font-semibold text-lg">
                    R$ {(pkg.price_brl_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 text-brand-blue">
                    <Check size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleDeposit}
            disabled={loading || !selectedPackage}
            className="w-full max-w-md h-16 rounded-xl bg-white text-black text-sm font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? "Processando..." : "Depositar"}
          </Button>
          <p className="mt-6 text-white/20 text-xs text-center max-w-xs leading-relaxed">
            Ao clicar em depositar, você será redirecionado para o ambiente seguro do {paymentMethod === 'pix' ? 'Mercado Pago' : 'Stripe'}.
          </p>
        </div>

        <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
          <DialogContent className="bg-[#121212] border-white/10 text-white max-w-sm rounded-3xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-serif-display text-center">Pagamento via PIX</DialogTitle>
              <DialogDescription className="text-white/40 text-center text-sm">
                Escaneie o QR Code abaixo para finalizar sua compra de Cash com bônus.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-8">
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <div className="w-48 h-48 bg-white flex items-center justify-center rounded-lg overflow-hidden relative group">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("00020126580014br.gov.bcb.pix013654c3601f-4872-44bc-81d4-b8f61de5d2cd5204000053039865802BR5909SOLZAKAYO6009Sao Paulo610901227-20062230519daqr2924465906051116304C37F")}`}
                    alt="QR Code PIX" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="w-full space-y-4">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix013654c3601f-4872-44bc-81d4-b8f61de5d2cd5204000053039865802BR5909SOLZAKAYO6009Sao Paulo610901227-20062230519daqr2924465906051116304C37F");
                    toast.success("Código PIX copiado!");
                  }}
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl text-xs font-bold tracking-widest uppercase"
                >
                  Copiar Código PIX
                </Button>
                <Button 
                  onClick={async () => {
                    const pkg = packages.find(p => p.id === selectedPackage);
                    if (pkg) {
                      const cashAmount = Math.floor(pkg.base_cash * 1.1);
                      const amount = (pkg.price_brl_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                      
                      try {
                        await supabase.functions.invoke('notify-pix-payment', {
                          body: { 
                            packageName: pkg.name,
                            amount: amount,
                            cashAmount: cashAmount
                          }
                        });
                        toast.success("Admins notificados! Seu cash será creditado em breve.");
                        setShowPixModal(false);
                      } catch (err) {
                        console.error(err);
                        toast.error("Erro ao notificar admins.");
                      }
                    }
                  }}
                  className="w-full bg-white text-black hover:bg-white/90 h-12 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  Já realizei o pagamento <Bell size={14} className="animate-pulse" />
                </Button>
              </div>

              <p className="text-[10px] text-white/20 text-center leading-relaxed">
                O seu Cash será creditado automaticamente após a confirmação da rede.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
          &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
        </div>
      </footer>
    </div>
  );
}