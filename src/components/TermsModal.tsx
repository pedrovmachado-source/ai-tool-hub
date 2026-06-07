import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass-smooth border-white/10 bg-black text-white p-0 overflow-hidden rounded-[2.5rem]">
        <DialogHeader className="p-8 border-b border-white/5 shrink-0">
          <DialogTitle className="text-2xl font-serif-display text-white">Termos de Serviço — KAYOSA</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-8 h-full max-h-[calc(90vh-100px)]">
          <div className="prose prose-invert max-w-none text-white/70 font-light space-y-6">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Última atualização: 7 de junho de 2026</p>
            
            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">ACEITAÇÃO DESTES TERMOS</h2>
              <p>
                Estes Termos de Serviço ("Termos") regulam a contratação e o uso dos serviços de mentoria oferecidos por <strong>[RAZÃO SOCIAL COMPLETA]</strong>, inscrita no CNPJ sob o nº <strong>[CNPJ]</strong>, com sede em <strong>[LOGRADOURO, NÚMERO E CEP]</strong>, Rio de Janeiro/RJ, operando sob a marca <strong>KAYOSA</strong>, por meio do site <strong>kayosa.com.br</strong> e demais domínios e plataformas associados (a "Kayosa", "nós").
              </p>
              <p>
                <strong>Ao criar uma conta, marcar a caixa de aceite no momento da contratação e/ou efetuar o pagamento, o Aluno declara que: (i) leu integralmente estes Termos, compreendeu-os em todos os seus termos e com eles concorda de forma livre, expressa e informada; e (ii) é maior de 18 (dezoito) anos de idade e plenamente capaz para contratar.</strong> A criação de conta não é permitida sem o aceite prévio destes Termos nem a menores de idade.
              </p>
              <p>
                Caso o Aluno não concorde com qualquer disposição aqui prevista, deverá abster-se de criar conta e de contratar os serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">1. DEFINIÇÕES</h2>
              <div className="space-y-3">
                <p><strong>1.1. Aluno:</strong> pessoa física, maior de 18 (dezoito) anos e plenamente capaz, que cria conta e contrata os serviços de mentoria.</p>
                <p><strong>1.2. Mentoria:</strong> serviço educacional prestado de forma individual e ao vivo, voltado ao ensino de estratégias de venda de produtos digitais (infoprodutos) em mercados europeus, com remuneração em euro.</p>
                <p><strong>1.3. Aula:</strong> cada sessão individual de mentoria, ao vivo, com valor unitário definido na Cláusula 5.</p>
                <p><strong>1.4. Plataforma:</strong> o conjunto de sistemas, área restrita, site, ferramentas de videoconferência e materiais por meio dos quais o serviço é prestado.</p>
                <p><strong>1.5. Conteúdo:</strong> todo material didático, gravações, apresentações, planilhas, modelos, estratégias e informações transmitidos durante a Mentoria.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">2. OBJETO DO SERVIÇO</h2>
              <p>2.1. A Kayosa presta serviço de <strong>mentoria individual e ao vivo</strong>, de natureza estritamente educacional e consultiva, cujo objetivo é transmitir conhecimento, métodos e estratégias relacionados à comercialização de produtos digitais em mercados europeus.</p>
              <p>2.2. O serviço caracteriza-se como <strong>prestação de serviço de execução imediata e de consumo instantâneo</strong>: o valor entregue ao Aluno é o próprio conhecimento e a orientação transmitidos durante cada Aula, os quais, uma vez prestados, são incorporados ao Aluno e não podem ser devolvidos.</p>
              <p>2.3. A Kayosa <strong>não comercializa promessa de resultado financeiro</strong>, conforme detalhado na Cláusula 9.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">3. CADASTRO E CONTA</h2>
              <p>3.1. Para contratar a Mentoria, o Aluno deverá criar conta na Plataforma, fornecendo dados verdadeiros, completos e atualizados.</p>
              <p>3.2. <strong>Ao criar a conta, o Aluno declara expressamente ser maior de 18 (dezoito) anos completos e possuir plena capacidade civil para contratar.</strong> A Kayosa não permite o cadastro nem a contratação por menores de idade.</p>
              <p>3.3. As credenciais de acesso são pessoais e intransferíveis. O Aluno é o único responsável pela guarda de seu login e senha e por toda atividade realizada em sua conta.</p>
              <p>3.4. É vedado o compartilhamento de conta, de acesso à área restrita ou de qualquer Conteúdo com terceiros, sob pena de suspensão imediata e responsabilização nos termos da Cláusula 10.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">4. CONSENTIMENTO E REGISTRO DE ACEITE</h2>
              <p>4.1. No momento da contratação, o Aluno deverá manifestar consentimento por meio de <strong>caixa de seleção (checkbox) obrigatória e não pré-marcada</strong>, contendo o seguinte texto:</p>
              <blockquote className="border-l-2 border-white/20 pl-4 italic">
                "Autorizo o início imediato dos serviços. Estou ciente de que, ao acessar a primeira Aula, perco o direito de arrependimento previsto no art. 49 do Código de Defesa do Consumidor em relação ao serviço já prestado, pois este será considerado executado e consumido. Declaro, ainda, ser maior de 18 anos."
              </blockquote>
              <p>4.2. A Kayosa <strong>registrará e armazenará</strong>, como prova do aceite: data e hora exatas (timestamp), endereço IP, dados do dispositivo e, quando disponível, geolocalização do Aluno no ato da contratação e do aceite destes Termos.</p>
              <p>4.3. A Kayosa <strong>registrará a data e a hora exatas do primeiro acesso</strong> do Aluno ao Conteúdo, à área restrita ou à Aula ao vivo (incluindo login e confirmação de participação), constituindo tal registro prova da efetiva prestação do serviço.</p>
              <p>4.4. O Aluno reconhece e concorda que os registros eletrônicos mencionados nesta Cláusula constituem <strong>meio idôneo e suficiente de prova</strong> da contratação, do aceite e da prestação do serviço.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">5. PREÇO E PAGAMENTO</h2>
              <p>5.1. O <strong>valor unitário de cada Aula individual de mentoria é de R$ 1.200,00 (mil e duzentos reais)</strong>.</p>
              <p>5.2. Quando contratado pacote com mais de uma Aula, o valor de R$ 1.200,00 por Aula representa o <strong>valor individualizado e líquido de cada sessão</strong>, servindo de base para o cálculo de eventuais valores prestados e não prestados.</p>
              <p>5.3. O pagamento poderá ser realizado pelos meios disponibilizados no momento da contratação. O acesso à Mentoria fica condicionado à confirmação do pagamento.</p>
              <p>5.4. Os valores poderão ser reajustados a qualquer tempo para novas contratações, sem afetar contratações já concluídas.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">6. POLÍTICA DE REEMBOLSO E DIREITO DE ARREPENDIMENTO</h2>
              <p>6.1. Direito de arrependimento (antes do acesso à primeira Aula)</p>
              <p>6.1.1. Nos termos do <strong>art. 49 do Código de Defesa do Consumidor</strong>, o Aluno poderá exercer o direito de arrependimento no prazo de <strong>7 (sete) dias corridos, contados da data da contratação, DESDE QUE NÃO tenha acessado, iniciado ou participado da primeira Aula</strong> e desde que não tenha acessado qualquer Conteúdo da área restrita.</p>
              <p>6.2. Perda do direito de arrependimento (após o acesso à primeira Aula)</p>
              <p>6.2.1. Ao <strong>acessar, iniciar ou participar da primeira Aula</strong> — caracterizado pelo login na sessão ao vivo, pela confirmação de presença, ou pelo acesso a Conteúdo/área restrita — o serviço daquela Aula passa a ser considerado <strong>prestado, executado e consumido</strong>.</p>
              <p>6.2.2. Em razão da natureza de consumo imediato do serviço (Cláusula 2.2) e do consentimento expresso de início imediato (Cláusula 4.1), <strong>uma vez acessada a primeira Aula, não há direito a reembolso do valor correspondente ao serviço já prestado</strong>, no importe de R$ 1.200,00 por Aula consumida.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">9. AUSÊNCIA DE GARANTIA DE RESULTADOS</h2>
              <p>9.1. A Mentoria tem natureza <strong>educacional e consultiva</strong>. A Kayosa transmite métodos, estratégias e orientações, <strong>mas NÃO garante, promete ou assegura qualquer resultado financeiro, faturamento, vendas, ganhos em euro ou retorno específico</strong> ao Aluno.</p>
              <p>9.2. Os resultados dependem de inúmeros fatores fora do controle da Kayosa, incluindo, sem limitação, a dedicação, a aplicação prática, a capacidade, o investimento, o mercado e as decisões do próprio Aluno.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">13. PROTEÇÃO DE DADOS PESSOAIS (LGPD)</h2>
              <p>13.1. A Kayosa trata os dados pessoais do Aluno em conformidade com a <strong>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD)</strong>.</p>
              <p>13.4. Compartilhamento de dados para fins de publicidade e marketing. A Kayosa poderá compartilhar, transferir ou ceder dados pessoais do Aluno — incluindo e-mail, telefone, localização, dados de contato e demais dados pessoais — a parceiros, anunciantes e plataformas de publicidade e marketing, para fins de veiculação de anúncios e ações de marketing.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">15. LEGISLAÇÃO APLICÁVEL E FORO</h2>
              <p>15.1. Estes Termos são regidos pela legislação brasileira.</p>
              <p>15.2. Fica eleito o foro da comarca da <strong>Capital do Rio de Janeiro/RJ</strong> para dirimir quaisquer controvérsias decorrentes destes Termos.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif-display text-white mb-4">16. CONTATO</h2>
              <p><strong>Kayosa</strong><br />E-mail: <strong>kayodesouzaapj@gmail.com</strong><br />Site: <strong>kayosa.com.br</strong><br />Rio de Janeiro/RJ</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};