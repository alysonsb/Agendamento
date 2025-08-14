# 📅 Sistema de Agendamento

![Imagem do WebSite](https://imgur.com/a/Ul0JLOM)

Um sistema de agendamento completo e responsivo, desenvolvido com HTML, Tailwind CSS e JavaScript, utilizando o Firebase como backend para autenticação e banco de dados em tempo real. A aplicação possui dois painéis distintos: um para clientes e outro para o administrador.

---

## ✨ Funcionalidades

### Painel do Cliente
- **Autenticação:** Sistema de login e cadastro de novos usuários.
- **Recuperação de Senha:** Funcionalidade de "Esqueci a senha" via e-mail.
- **Novo Agendamento:** O cliente pode selecionar um procedimento, escolher uma data e um horário disponível em um calendário interativo.
- **Meus Agendamentos:** Visualização de todos os agendamentos futuros, com a opção de cancelá-los.
- **Meu Cadastro:** Permite ao cliente visualizar e atualizar suas informações de nome e telefone.

### Painel Administrativo
- **Visão Geral (Agenda):** Exibe todos os agendamentos dos clientes em uma tabela, com opções para finalizar (mover para o histórico) ou cancelar o agendamento (notificando o cliente via WhatsApp).
- **Bloqueios e Procedimentos:**
    - **Bloqueio de Dias:** Permite bloquear dias específicos da semana (ex: Sábado, Domingo).
    - **Bloqueio de Horários:** Permite bloquear um dia inteiro ou um horário específico em uma data.
    - **Cadastro de Procedimentos:** Adição de novos serviços com descrição, duração e preço.
- **Histórico:**
    - **Relatórios:** Visualização de atendimentos finalizados com filtros por dia, semana e mês.
    - **Métricas:** Cálculo automático do total de atendimentos e do lucro total para o período filtrado.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:**
  - HTML5
  - CSS3
  - [Tailwind CSS](https://tailwindcss.com/) - Para estilização rápida e responsiva.
  - JavaScript (ES6 Modules)

- **Backend & Infraestrutura:**
  - [Firebase](https://firebase.google.com/)
    - **Authentication:** Para gerenciamento de usuários.
    - **Realtime Database:** Como banco de dados NoSQL para agendamentos, procedimentos e configurações.

---

## 🔧 Configuração e Instalação

Para rodar este projeto, você precisará de uma conta no Firebase.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/nome-do-repositorio.git](https://github.com/seu-usuario/nome-do-repositorio.git)
    ```

2.  **Crie um projeto no Firebase:**
    - Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
    - Adicione um novo aplicativo da Web ao seu projeto.
    - Copie as credenciais de configuração do Firebase (o objeto `firebaseConfig`).

3.  **Crie o arquivo `config.js`:**
    - Na raiz do projeto, crie um arquivo chamado `config.js`.
    - Cole as suas credenciais do Firebase dentro dele, como no exemplo abaixo:
    ```javascript
    // config.js
    export const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      databaseURL: "SUA_DATABASE_URL",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_STORAGE_BUCKET",
      messagingSenderId: "SEU_MESSAGING_SENDER_ID",
      appId: "SEU_APP_ID"
    };
    ```

4.  **Configure o Realtime Database:**
    - No painel do Firebase, vá em **Build > Realtime Database** e crie um banco de dados.
    - Vá para a aba **Regras** (Rules) e cole as regras de segurança abaixo para garantir que a aplicação funcione corretamente:
    ```json
    {
      "rules": {
        "users": {
          "$uid": {
            ".read": "$uid === auth.uid || root.child('users/' + auth.uid + '/role').val() === 'admin'",
            ".write": "$uid === auth.uid"
          }
        },
        "agendamentos": {
          ".read": "auth != null",
          ".indexOn": ["userId", "data"],
          "$agendamentoId": {
            ".write": "root.child('users/' + auth.uid + '/role').val() === 'admin' || (!data.exists() && newData.child('userId').val() === auth.uid) || (!newData.exists() && data.child('userId').val() === auth.uid)"
          }
        },
        "procedimentos": {
          ".read": "auth != null",
          ".write": "root.child('users/' + auth.uid + '/role').val() === 'admin'"
        },
        "horariosBloqueados": {
          ".read": "auth != null",
          ".write": "root.child('users/' + auth.uid + '/role').val() === 'admin'",
          ".indexOn": "data"
        },
        "diasBloqueados": {
          ".read": "auth != null",
          ".write": "root.child('users/' + auth.uid + '/role').val() === 'admin'"
        },
        "historico": {
          ".read": "root.child('users/' + auth.uid + '/role').val() === 'admin'",
          ".write": "root.child('users/' + auth.uid + '/role').val() === 'admin'"
        }
      }
    }
    ```

5.  **Crie um usuário Administrador:**
    - Cadastre um novo usuário normalmente pela tela de cadastro da aplicação.
    - No seu Realtime Database, localize o `uid` desse usuário em `/users` e altere o campo `role` de `"cliente"` para `"admin"`.

6.  **Abra o `index.html`:**
    - Abra o arquivo `index.html` no seu navegador para começar a usar o sistema.

---

## ✒️ Autor

Desenvolvido por **AlysonSB** &copy; 2025
