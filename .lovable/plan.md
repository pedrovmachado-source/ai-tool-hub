
## Popup de Verificação de Email após Cadastro

Atualmente, após o cadastro, aparece apenas uma mensagem de texto simples dentro do modal de autenticação. Vou criar um popup visualmente destacado que informa o usuário para verificar o email.

### O que será feito

**Modificar `src/components/AuthModal.tsx`:**
- Após o registro bem-sucedido, em vez da mensagem simples atual (linhas 97-102), exibir um popup/overlay dedicado com:
  - Ícone de email (envelope) grande e animado
  - Título: "Verifique seu e-mail"
  - Mensagem clara explicando que um link de confirmação foi enviado
  - O email do usuário destacado em negrito
  - Instrução para verificar a caixa de spam
  - Botão "Ir para login" para fechar o popup e abrir o login

O design seguirá a identidade visual do projeto (Navy/Azul/Teal, DM Sans).

### Resultado esperado

Ao criar a conta, o usuário verá um popup grande e claro com instruções de verificação de email, impossível de ignorar.
