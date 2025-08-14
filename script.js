// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, query, orderByChild, equalTo, remove, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { firebaseConfig } from './config.js';

//favicon em emoji
const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '64px serif'; // tamanho e fonte do emoji
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💼', 32, 32); // substitua pelo emoji que quiser

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL();
    document.head.appendChild(link);

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const forgotPasswordBtn = document.getElementById('forgot-password-btn');
// Lógica de Recuperação de Senha
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;

        if (!email) {
            showMessage("Por favor, digite seu e-mail para recuperar a senha.");
            return;
        }

        showLoadingScreen();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                hideLoadingScreen();
                showMessage("Se o e-mail estiver cadastrado, um link de recuperação de senha foi enviado para ele.");
            })
            .catch((error) => {
                hideLoadingScreen();
                // O Firebase envia uma resposta genérica para evitar vazar informações de e-mails cadastrados.
                // Portanto, a mensagem de sucesso deve ser a mesma para ambos os casos.
                showMessage("Se o e-mail estiver cadastrado, um link de recuperação de senha foi enviado para ele.");
                console.error("Erro ao enviar e-mail de recuperação: ", error.message);
            });
    });
}


// Referências aos containers de cada página
const loginPage = document.getElementById('login-page');
const cadastroPage = document.getElementById('cadastro-page');
const adminPage = document.getElementById('admin-page');
const clientePage = document.getElementById('cliente-page');
const loadingScreen = document.getElementById('loading-screen');
const pageFooter = document.getElementById('page-footer'); // <-- Rodapé adicionado

// Referências aos botões e campos
const loginBtn = document.getElementById('login-btn');
const goToCadastroBtn = document.getElementById('go-to-cadastro-btn');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const registerBtn = document.getElementById('register-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminEmailSpan = document.getElementById('admin-user-email');
const clienteLogoutBtn = document.getElementById('cliente-logout-btn');
const clienteEmailSpan = document.getElementById('cliente-user-email');
const messageContainer = document.getElementById('message-container');

// --- LOGICA DE UI (LOADING, MENSAGENS, TEMA) ---

// Funcao para esconder a tela de loading
const hideLoadingScreen = () => {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
};
// Funcao para mostrar a tela de loading
const showLoadingScreen = () => {
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
};

// Funcao para aplicar o tema (sem a logica de alternancia)
const applyTheme = () => {
    const body = document.body;
    body.classList.add('dark');
};

// Configura o toggle de tema (nao faz nada, apenas para evitar erros)
const setupThemeToggle = (elementId) => {
    // A logica de alternancia foi removida.
};

// Funcao para exibir a caixa de mensagem personalizada
const showMessage = (text, isConfirmation = false, onConfirm = null) => {
    const box = document.createElement('div');
    box.className = 'message-box border border-gray-300 rounded-lg shadow-lg p-6 dark:bg-gray-800 hidden';
    
    const messageText = document.createElement('p');
    messageText.className = 'text-xl mb-4';
    messageText.textContent = text;
    box.appendChild(messageText);

    const closeBox = () => {
        box.classList.add('hidden');
        setTimeout(() => messageContainer.removeChild(box), 300); // Remove depois da transição
    }

    if (isConfirmation) {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'bg-red-500 text-white font-bold py-2 px-4 rounded-lg mr-2 hover:bg-red-600 transition-colors btn-custom';
        confirmBtn.textContent = 'Confirmar';
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            closeBox();
        });
        box.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.addEventListener('click', closeBox);
        box.appendChild(cancelBtn);
    } else {
        const okBtn = document.createElement('button');
        okBtn.className = 'bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors';
        okBtn.textContent = 'OK';
        okBtn.addEventListener('click', closeBox);
        box.appendChild(okBtn);
    }
    messageContainer.appendChild(box);
    // Exibe a caixa de mensagem com transição
    setTimeout(() => {
        box.classList.remove('hidden');
    }, 10);
};

// --- LOGICA DE NAVEGACAO E AUTENTICACAO ---

// Funcao para exibir a pagina correta com transição
const showPage = (pageToShow) => {
    const pages = [loginPage, cadastroPage, adminPage, clientePage];
    let currentPage = pages.find(p => !p.classList.contains('hidden'));

    if (currentPage) {
        currentPage.classList.remove('visible');
        currentPage.classList.add('hidden');
    }

    // LÓGICA DO RODAPÉ
    if (pageToShow === loginPage || pageToShow === cadastroPage) {
        pageFooter.classList.remove('hidden');
    } else {
        pageFooter.classList.add('hidden');
    }

    setTimeout(() => {
        pages.forEach(page => page.classList.add('hidden'));
        pageToShow.classList.remove('hidden');
        setTimeout(() => {
            pageToShow.classList.add('visible');
        }, 10);
    }, 300); // Espera a transição de saída terminar
};


// Logica de navegacao entre login e cadastro
if (goToCadastroBtn) {
    goToCadastroBtn.addEventListener('click', () => showPage(cadastroPage));
}
if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => showPage(loginPage));
}

// Logica de Login
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        showLoadingScreen();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        signInWithEmailAndPassword(auth, email, senha)
            .catch((error) => {
                hideLoadingScreen();

                let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";

                if (error.code === 'auth/invalid-login-credentials') {
                    errorMessage = "E-mail ou senha incorreto.";
                }
               
                 else if (error.code === 'auth/user-not-found') {
                   errorMessage = "Usuário não encontrado.";
                 }

                showMessage(errorMessage);
            });
    });
}

// Logica de Cadastro
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        showLoadingScreen();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            hideLoadingScreen();
            showMessage("As senhas não coincidem.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userRef = ref(database, 'users/' + user.uid);
                return set(userRef, {
                    role: 'cliente',
                    name: name
                });
            })
            .then(() => {
                hideLoadingScreen();
                showMessage("Cadastro realizado com sucesso! Faça login para continuar.");
                showPage(loginPage);
            })
            .catch((error) => {
                hideLoadingScreen();
                showMessage("Erro ao cadastrar: " + error.message);
            });
    });
}

// Logica de Logout
const handleLogout = () => {
    showLoadingScreen();
    signOut(auth).catch((error) => {
        hideLoadingScreen();
        console.error("Erro ao fazer logout: ", error);
    });
};
if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);
if (clienteLogoutBtn) clienteLogoutBtn.addEventListener('click', handleLogout);

// Gerenciador de estado de autenticacao
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.role === 'admin') {
                showPage(adminPage);
                loadAdminDashboard(user);
            } else {
                showPage(clientePage);
                loadClientDashboard(user);
            }
            hideLoadingScreen();
        }, { onlyOnce: true });
    } else {
        showPage(loginPage);
        hideLoadingScreen();
    }
});


// ===================================
// LOGICA PARA O ADMINISTRADOR
// ===================================
const loadAdminDashboard = (user) => {
    if (adminEmailSpan) adminEmailSpan.textContent = user.email;
    
    renderAllAppointments();
    renderBlockedTimes();
    renderProcedures();
    setupBlockedDaysCheckboxes();
    showAdminPanel('admin-agenda-panel'); // Exibe o painel de agenda por padrão
    applyTheme(); // Aplica o tema escuro
};

// Funcao para renderizar o historico de atendimentos
const renderHistory = (filter = 'dia') => {
    const historyTableBody = document.getElementById('history-table-body');
    const historyListMobile = document.getElementById('history-list-mobile');
    const totalAtendimentosEl = document.getElementById('total-atendimentos');
    const lucroTotalEl = document.getElementById('lucro-total');
    
    const filterTodayBtn = document.getElementById('filter-today-btn');
    const filterWeekBtn = document.getElementById('filter-week-btn');
    const filterMonthBtn = document.getElementById('filter-month-btn');

    if (!historyTableBody || !historyListMobile) return;

    // Limpa a formatação dos botões
    const filterBtns = [filterTodayBtn, filterWeekBtn, filterMonthBtn];
    filterBtns.forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-800');
        }
    });

    // Adiciona a formatação ao botão ativo
    if (filter === 'dia' && filterTodayBtn) {
        filterTodayBtn.classList.add('bg-blue-500', 'text-white');
        filterTodayBtn.classList.remove('bg-gray-200', 'text-gray-800');
    } else if (filter === 'semana' && filterWeekBtn) {
        filterWeekBtn.classList.add('bg-blue-500', 'text-white');
        filterWeekBtn.classList.remove('bg-gray-200', 'text-gray-800');
    } else if (filter === 'mes' && filterMonthBtn) {
        filterMonthBtn.classList.add('bg-blue-500', 'text-white');
        filterMonthBtn.classList.remove('bg-gray-200', 'text-gray-800');
    }
    
    const historyRef = ref(database, 'historico');
    onValue(historyRef, (snapshot) => {
        historyTableBody.innerHTML = '';
        historyListMobile.innerHTML = '';

        let totalAtendimentos = 0;
        let lucroTotal = 0;
        
        let appointmentsToRender = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                appointmentsToRender.push({
                    key: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        
        const now = new Date();
        let filteredAppointments = [];

        if (filter === 'dia') {
            const todayStr = now.toISOString().slice(0, 10);
            filteredAppointments = appointmentsToRender.filter(appt => appt.data === todayStr);
        } else if (filter === 'semana') {
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            filteredAppointments = appointmentsToRender.filter(appt => {
                const apptDate = new Date(appt.data + 'T00:00:00');
                return apptDate >= startOfWeek;
            });
        } else if (filter === 'mes') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredAppointments = appointmentsToRender.filter(appt => {
                const apptDate = new Date(appt.data + 'T00:00:00');
                return apptDate >= startOfMonth;
            });
        }

        if (filteredAppointments.length > 0) {
            filteredAppointments.forEach((finishedAppointment) => {
                totalAtendimentos++;
                lucroTotal += parseFloat(finishedAppointment.preco) || 0;

                // Renderizacao para desktop
                const newRow = document.createElement('tr');
                newRow.className = 'border-b dark:border-gray-700';
                newRow.innerHTML = `
                    <td class="py-2 px-4">${finishedAppointment.data}</td>
                    <td class="py-2 px-4">${finishedAppointment.nome}</td>
                    <td class="py-2 px-4">${finishedAppointment.hora} (${finishedAppointment.duracao || '30'} min)</td>
                    <td class="py-2 px-4">R$ ${parseFloat(finishedAppointment.preco).toFixed(2)}</td>
                    <td class="py-2 px-4">${finishedAppointment.procedimento}</td>
                    <td class="py-2 px-4">
                        <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm btn-custom delete-history-btn" data-key="${finishedAppointment.key}">
                            Excluir
                        </button>
                    </td>
                `;
                historyTableBody.appendChild(newRow);

                // Renderizacao para mobile
                const newCard = document.createElement('div');
                newCard.className = 'bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md mb-4';
                newCard.innerHTML = `
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DATA</span>
                        <span class="text-gray-800 dark:text-gray-200">${finishedAppointment.data}</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">NOME</span>
                        <span class="text-gray-800 dark:text-gray-200">${finishedAppointment.nome}</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">HORA</span>
                        <span class="text-gray-800 dark:text-gray-200">${finishedAppointment.hora} (${finishedAppointment.duracao || '30'} min)</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">VALOR</span>
                        <span class="text-gray-800 dark:text-gray-200">R$ ${parseFloat(finishedAppointment.preco).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 mb-2">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">TIPO</span>
                        <span class="text-gray-800 dark:text-gray-200">${finishedAppointment.procedimento}</span>
                    </div>
                    <div class="mt-4 text-right">
                        <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm btn-custom delete-history-btn-mobile" data-key="${finishedAppointment.key}">
                            Excluir
                        </button>
                    </div>
                `;
                historyListMobile.appendChild(newCard);
            });

            // Adiciona o listener para os botoes de excluir na versao desktop
            historyTableBody.querySelectorAll('.delete-history-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja excluir este item do histórico?", true, () => {
                            const historyItemRef = ref(database, 'historico/' + key);
                            remove(historyItemRef)
                                .then(() => showMessage("Item do histórico excluído com sucesso."))
                                .catch(error => showMessage("Erro ao excluir item do histórico: " + error.message));
                        });
                    }
                });
            });

            // Adiciona o listener para os botoes de excluir na versao mobile
            historyListMobile.querySelectorAll('.delete-history-btn-mobile').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja excluir este item do histórico?", true, () => {
                            const historyItemRef = ref(database, 'historico/' + key);
                            remove(historyItemRef)
                                .then(() => showMessage("Item do histórico excluído com sucesso."))
                                .catch(error => showMessage("Erro ao excluir item do histórico: " + error.message));
                        });
                    }
                });
            });
        } else {
            const noHistoryRow = document.createElement('tr');
            noHistoryRow.innerHTML = `<td colspan="6" class="py-4 text-center text-gray-500">Nenhum atendimento finalizado.</td>`;
            historyTableBody.appendChild(noHistoryRow);
            
            historyListMobile.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum atendimento finalizado.</p>`;
        }

        totalAtendimentosEl.textContent = filteredAppointments.length;
        lucroTotalEl.textContent = `R$ ${lucroTotal.toFixed(2)}`;
    });
};

const renderAllAppointments = () => {
    const appointmentsTableBody = document.querySelector('#appointments-table tbody');
    const appointmentsListMobile = document.getElementById('appointments-list-mobile');
    if (!appointmentsTableBody || !appointmentsListMobile) return;
    
    const appointmentsRef = ref(database, 'agendamentos');
    const proceduresRef = ref(database, 'procedimentos');

    // Faz um get único dos procedimentos para ter o preco
    get(proceduresRef).then((proceduresSnapshot) => {
        const procedures = {};
        proceduresSnapshot.forEach(childSnapshot => {
            const procedure = childSnapshot.val();
            procedures[procedure.descricao] = procedure.preco;
        });

        onValue(appointmentsRef, (snapshot) => {
            appointmentsTableBody.innerHTML = '';
            appointmentsListMobile.innerHTML = ''; // Limpa a lista mobile
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const appointment = childSnapshot.val();
                    const appointmentKey = childSnapshot.key;
                    
                    const preco = procedures[appointment.procedimento] || 0;
                    
                    // Renderizacao para desktop
                    const newRow = document.createElement('tr');
                    newRow.className = 'border-b dark:border-gray-700';
                    newRow.innerHTML = `
                        <td class="py-2 px-4">${appointment.data}</td>
                        <td class="py-2 px-4">${appointment.nome}</td>
                        <td class="py-2 px-4">${appointment.hora} (${appointment.duracao || '30'} min)</td>
                        <td class="py-2 px-4">R$ ${parseFloat(preco).toFixed(2)}</td>
                        <td class="py-2 px-4">${appointment.procedimento}</td>
                        <td class="py-2 px-4">
                            <button class="bg-green-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm btn-custom finalize-btn" data-key="${appointmentKey}" data-preco="${preco}">
                                Finalizar
                            </button>
                            <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm btn-custom cancel-btn" data-key="${appointmentKey}" data-phone="${appointment.telefone}" data-nome="${appointment.nome}" data-data="${appointment.data}" data-hora="${appointment.hora}">
                                Cancelar
                            </button>
                        </td>
                    `;
                    appointmentsTableBody.appendChild(newRow);

                    // Renderizacao para mobile
                    const newCard = document.createElement('div');
                    newCard.className = 'bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md mb-4';
                    newCard.innerHTML = `
                        <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DATA</span>
                            <span class="text-gray-800 dark:text-gray-200">${appointment.data}</span>
                        </div>
                        <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">NOME</span>
                            <span class="text-gray-800 dark:text-gray-200">${appointment.nome}</span>
                        </div>
                        <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">HORA</span>
                            <span class="text-gray-800 dark:text-gray-200">${appointment.hora} (${appointment.duracao || '30'} min)</span>
                        </div>
                        <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">PRECO</span>
                            <span class="text-gray-800 dark:text-gray-200">R$ ${parseFloat(preco).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center pb-2 mb-2">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">TIPO</span>
                            <span class="text-gray-800 dark:text-gray-200">${appointment.procedimento}</span>
                        </div>
                        <div class="mt-4 text-right">
                            <button class="bg-green-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm btn-custom finalize-btn-mobile" data-key="${appointmentKey}" data-preco="${preco}">
                                Finalizar
                            </button>
                            <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm btn-custom cancel-btn-mobile" data-key="${appointmentKey}" data-phone="${appointment.telefone}" data-nome="${appointment.nome}" data-data="${appointment.data}" data-hora="${appointment.hora}">
                                Cancelar
                            </button>
                        </div>
                    `;
                    appointmentsListMobile.appendChild(newCard);
                });
                
                // Adiciona o listener para os botoes de cancelar na versao desktop
                appointmentsTableBody.querySelectorAll('.cancel-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const { key, phone, nome, data, hora } = event.target.dataset;
                        if (key && phone) {
                            showMessage("Tem certeza que deseja cancelar este agendamento?", true, () => {
                                let cleanedPhone = phone.replace(/\D/g, '');
                                if (!cleanedPhone.startsWith('55')) {
                                    cleanedPhone = '55' + cleanedPhone;
                                }
                                const message = encodeURIComponent(`Olá, ${nome}! Seu agendamento para o dia ${data} às ${hora} foi cancelado pelo administrador. Para reagendar, por favor, entre em contato.`);
                                const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${message}`;
                                window.open(whatsappUrl, '_blank');

                                const appointmentRef = ref(database, 'agendamentos/' + key);
                                remove(appointmentRef)
                                    .then(() => showMessage("Agendamento cancelado e notificação enviada."))
                                    .catch(error => showMessage("Erro ao cancelar agendamento: " + error.message));
                            });
                        }
                    });
                });

                // Adiciona o listener para os botoes de finalizar na versao desktop
                appointmentsTableBody.querySelectorAll('.finalize-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const { key, preco } = event.target.dataset;
                        if (key) {
                            showMessage("Tem certeza que deseja finalizar este agendamento?", true, () => {
                                const appointmentRef = ref(database, 'agendamentos/' + key);
                                get(appointmentRef).then(snapshot => {
                                    if (snapshot.exists()) {
                                        const finishedAppointment = snapshot.val();
                                        finishedAppointment.preco = preco; // Adiciona o preco ao objeto antes de salvar
                                        const historyRef = push(ref(database, 'historico'));
                                        set(historyRef, finishedAppointment)
                                            .then(() => remove(appointmentRef))
                                            .then(() => showMessage("Agendamento finalizado com sucesso!"))
                                            .catch(error => showMessage("Erro ao finalizar agendamento: " + error.message));
                                    }
                                });
                            });
                        }
                    });
                });


                // Adiciona o listener para os botoes de cancelar na versao mobile
                appointmentsListMobile.querySelectorAll('.cancel-btn-mobile').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const key = event.target.dataset.key;
                        if (key) {
                            showMessage("Tem certeza que deseja cancelar este agendamento?", true, () => {
                                const appointmentRef = ref(database, 'agendamentos/' + key);
                                remove(appointmentRef)
                                    .then(() => showMessage("Agendamento cancelado com sucesso."))
                                    .catch(error => showMessage("Erro ao cancelar agendamento: " + error.message));
                            });
                        }
                    });
                });

                // Adiciona o listener para os botoes de finalizar na versao mobile
                appointmentsListMobile.querySelectorAll('.finalize-btn-mobile').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const { key, preco } = event.target.dataset;
                        if (key) {
                            showMessage("Tem certeza que deseja finalizar este agendamento?", true, () => {
                                const appointmentRef = ref(database, 'agendamentos/' + key);
                                get(appointmentRef).then(snapshot => {
                                    if (snapshot.exists()) {
                                        const finishedAppointment = snapshot.val();
                                        finishedAppointment.preco = preco; // Adiciona o preco ao objeto antes de salvar
                                        const historyRef = push(ref(database, 'historico'));
                                        set(historyRef, finishedAppointment)
                                            .then(() => remove(appointmentRef))
                                            .then(() => showMessage("Agendamento finalizado com sucesso!"))
                                            .catch(error => showMessage("Erro ao finalizar agendamento: " + error.message));
                                    }
                                });
                            });
                        }
                    });
                });

            } else {
                const noAppointmentsRow = document.createElement('tr');
                noAppointmentsRow.innerHTML = `<td colspan="6" class="py-4 text-center text-gray-500">Nenhum agendamento realizado.</td>`;
                appointmentsTableBody.appendChild(noAppointmentsRow);
                
                appointmentsListMobile.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum agendamento realizado.</p>`;
            }
        });
    });
};

const renderBlockedTimes = () => {
    const blockedTimesTableBody = document.querySelector('#blocked-times-table tbody');
    const blockedTimesListMobile = document.getElementById('blocked-times-list-mobile');
    if (!blockedTimesTableBody || !blockedTimesListMobile) return;
    
    const blockedRef = ref(database, 'horariosBloqueados');
    onValue(blockedRef, (snapshot) => {
        blockedTimesTableBody.innerHTML = '';
        blockedTimesListMobile.innerHTML = ''; // Limpa a lista mobile
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const blockedTime = childSnapshot.val();
                const key = childSnapshot.key;
                
                // Renderizacao para desktop
                const newRow = document.createElement('tr');
                newRow.className = 'border-b dark:border-gray-700';
                newRow.innerHTML = `
                    <td class="py-2 px-4">${blockedTime.data}</td>
                    <td class="py-2 px-4">${blockedTime.hora}</td>
                    <td class="py-2 px-4">${blockedTime.duracao || '30'} min</td>
                    <td class="py-2 px-4">
                        <button class="bg-blue-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm btn-custom unblock-btn" data-key="${key}">
                            Liberar
                        </button>
                    </td>
                `;
                blockedTimesTableBody.appendChild(newRow);
                
                // Renderizacao para mobile
                const newCard = document.createElement('div');
                newCard.className = 'bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md mb-4';
                newCard.innerHTML = `
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DATA</span>
                        <span class="text-gray-800 dark:text-gray-200">${blockedTime.data}</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">HORA</span>
                        <span class="text-gray-800 dark:text-gray-200">${blockedTime.hora}</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 mb-2">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DURACAO</span>
                        <span class="text-gray-800 dark:text-gray-200">${blockedTime.duracao || '30'} min</span>
                    </div>
                    <div class="mt-4 text-right">
                        <button class="bg-blue-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm btn-custom unblock-btn-mobile" data-key="${key}">
                            Liberar
                        </button>
                    </div>
                `;
                blockedTimesListMobile.appendChild(newCard);
            });
            
            // Adiciona o listener para os botoes de liberar na versao desktop
            blockedTimesTableBody.querySelectorAll('.unblock-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja liberar este horário?", true, () => {
                            const blockedRef = ref(database, 'horariosBloqueados/' + key);
                            remove(blockedRef)
                                .then(() => showMessage("Horário liberado com sucesso."))
                                .catch(error => showMessage("Erro ao liberar horário: " + error.message));
                        });
                    }
                });
            });

            // Adiciona o listener para os botoes de liberar na versao mobile
            blockedTimesListMobile.querySelectorAll('.unblock-btn-mobile').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja liberar este horário?", true, () => {
                            const blockedRef = ref(database, 'horariosBloqueados/' + key);
                            remove(blockedRef)
                                .then(() => showMessage("Horário liberado com sucesso."))
                                .catch(error => showMessage("Erro ao liberar horário: " + error.message));
                        });
                    }
                });
            });
        } else {
            const noBlockedRow = document.createElement('tr');
            noBlockedRow.innerHTML = `<td colspan="4" class="py-4 text-center text-gray-500">Nenhum horário bloqueado.</td>`;
            blockedTimesTableBody.appendChild(noBlockedRow);
            
            blockedTimesListMobile.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum horário bloqueado.</p>`;
        }
    });
};

const renderProcedures = () => {
    const proceduresTableBody = document.querySelector('#procedures-table tbody');
    const proceduresListMobile = document.getElementById('procedures-list-mobile');
    if (!proceduresTableBody || !proceduresListMobile) return;
    
    const proceduresRef = ref(database, 'procedimentos');
    onValue(proceduresRef, (snapshot) => {
        proceduresTableBody.innerHTML = '';
        proceduresListMobile.innerHTML = ''; // Limpa a lista mobile
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const procedure = childSnapshot.val();
                const key = childSnapshot.key;
                
                // Renderização para desktop
                const newRow = document.createElement('tr');
                newRow.className = 'border-b dark:border-gray-700';
                newRow.innerHTML = `
                    <td class="py-2 px-4">${procedure.descricao}</td>
                    <td class="py-2 px-4">${procedure.duracao || '30'} min</td>
                    <td class="py-2 px-4">R$ ${parseFloat(procedure.preco).toFixed(2) || '0.00'}</td>
                    <td class="py-2 px-4">
                        <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm btn-custom delete-procedure-btn" data-key="${key}">
                            Excluir
                        </button>
                    </td>
                `;
                proceduresTableBody.appendChild(newRow);

                // Renderização para mobile
                const newCard = document.createElement('div');
                newCard.className = 'bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md mb-4';
                newCard.innerHTML = `
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DESCRIÇÃO</span>
                        <span class="text-gray-800 dark:text-gray-200">${procedure.descricao}</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DURAÇÃO</span>
                        <span class="text-gray-800 dark:text-gray-200">${procedure.duracao || '30'} min</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 mb-2">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">PREÇO</span>
                        <span class="text-gray-800 dark:text-gray-200">R$ ${parseFloat(procedure.preco).toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="mt-4 text-right">
                        <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm btn-custom delete-procedure-btn-mobile" data-key="${key}">
                            Excluir
                        </button>
                    </div>
                `;
                proceduresListMobile.appendChild(newCard);
            });

            // Adiciona o listener para os botões de excluir na versão desktop
            proceduresTableBody.querySelectorAll('.delete-procedure-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja excluir este procedimento?", true, () => {
                            const procedureRef = ref(database, 'procedimentos/' + key);
                            remove(procedureRef)
                                .then(() => showMessage("Procedimento excluído com sucesso."))
                                .catch(error => showMessage("Erro ao excluir procedimento: " + error.message));
                        });
                    }
                });
            });

            // Adiciona o listener para os botões de excluir na versão mobile
            proceduresListMobile.querySelectorAll('.delete-procedure-btn-mobile').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja excluir este procedimento?", true, () => {
                            const procedureRef = ref(database, 'procedimentos/' + key);
                            remove(procedureRef)
                                .then(() => showMessage("Procedimento excluído com sucesso."))
                                .catch(error => showMessage("Erro ao excluir procedimento: " + error.message));
                        });
                    }
                });
            });
        } else {
            const noProceduresRow = document.createElement('tr');
            noProceduresRow.innerHTML = `<td colspan="4" class="py-4 text-center text-gray-500">Nenhum procedimento cadastrado.</td>`;
            proceduresTableBody.appendChild(noProceduresRow);
            
            proceduresListMobile.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum procedimento cadastrado.</p>`;
        }
    });
};

const blockTimeBtn = document.getElementById('block-time-btn');
const blockDayBtn = document.getElementById('block-day-btn');
const blockDurationSelect = document.getElementById('block-duration-select');

if (blockTimeBtn) {
    blockTimeBtn.addEventListener('click', () => {
        const dateInput = document.getElementById('block-date-input').value;
        const timeInput = document.getElementById('block-time-input').value;
        const duration = blockDurationSelect.value;

        if (!dateInput || !timeInput || !duration) {
            showMessage("Por favor, selecione uma data, um horário e uma duração para bloquear.");
            return;
        }

        const newBlockedTime = {
            data: dateInput,
            hora: timeInput,
            duracao: duration,
            blockedBy: auth.currentUser.uid
        };
        
        const blockedRef = push(ref(database, 'horariosBloqueados'));
        set(blockedRef, newBlockedTime)
            .then(() => {
                showMessage("Horário bloqueado com sucesso!");
                document.getElementById('block-date-input').value = '';
                document.getElementById('block-time-input').value = '';
                blockDurationSelect.value = '30';
            })
            .catch(error => showMessage("Erro ao bloquear horário: " + error.message));
    });
}

if (blockDayBtn) {
    blockDayBtn.addEventListener('click', async () => {
        const dateInput = document.getElementById('block-date-input').value;
        const duration = blockDurationSelect.value;

        if (!dateInput || !duration) {
            showMessage("Por favor, selecione uma data e uma duração para bloquear.");
            return;
        }

        // --- CÓDIGO ATUALIZADO ---
        // Gera a lista de horários dinamicamente
        const allPossibleTimes = [];
        const startTime = 9; // Horário de início: 09:00
        const endTime = 17; // Horário de término: 17:00
        const interval = 30; // Intervalo em minutos

        for (let hour = startTime; hour < endTime; hour++) {
            for (let min = 0; min < 60; min += interval) {
                const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                allPossibleTimes.push(time);
            }
        }
        // --- FIM DO CÓDIGO ATUALIZADO ---

        const blockedRef = ref(database, 'horariosBloqueados');
        const promises = allPossibleTimes.map(time => {
            const newBlockedRef = push(blockedRef);
            return set(newBlockedRef, {
                data: dateInput,
                hora: time,
                duracao: duration,
                blockedBy: auth.currentUser.uid
            });
        });
        
        try {
            await Promise.all(promises);
            showMessage(`O dia ${dateInput} foi bloqueado com sucesso!`);
            document.getElementById('block-date-input').value = '';
        } catch (error) {
            showMessage("Erro ao bloquear o dia: " + error.message);
        }
    });
}

const addProcedureBtn = document.getElementById('add-procedure-btn');
if (addProcedureBtn) {
    addProcedureBtn.addEventListener('click', () => {
        const procedureDescription = document.getElementById('procedure-description').value;
        const procedureDuration = document.getElementById('procedure-duration-select').value;
        const procedurePrice = document.getElementById('procedure-price-input').value;
        
        if (!procedureDescription || !procedureDuration || !procedurePrice) {
            showMessage("Por favor, preencha a descrição, a duração e o preço do procedimento.");
            return;
        }
        
        const newProcedure = {
            descricao: procedureDescription,
            duracao: procedureDuration,
            preco: procedurePrice,
        };
        
        const proceduresRef = push(ref(database, 'procedimentos'));
        set(proceduresRef, newProcedure)
            .then(() => {
                showMessage("Procedimento adicionado com sucesso!");
                document.getElementById('procedure-description').value = '';
                document.getElementById('procedure-duration-select').value = '30';
                document.getElementById('procedure-price-input').value = '';
            })
            .catch(error => showMessage("Erro ao adicionar procedimento: " + error.message));
    });
}

const showAdminPanel = (panelId) => {
    const agendaBtn = document.getElementById('show-agenda-btn');
    const proceduresBtn = document.getElementById('show-procedures-btn');
    const historyBtn = document.getElementById('show-history-btn');
    
    // Oculta todos os painéis com transição
    const adminAgendaPanel = document.getElementById('admin-agenda-panel');
    const adminProceduresPanel = document.getElementById('admin-procedures-panel');
    const adminHistoryPanel = document.getElementById('admin-history-panel');

    const panels = [adminAgendaPanel, adminProceduresPanel, adminHistoryPanel];
    panels.forEach(panel => {
        if (panel) {
            panel.classList.remove('visible');
            panel.classList.add('hidden');
        }
    });
    
    // Remove as classes ativas de todos os botões de navegação
    const navButtons = [agendaBtn, proceduresBtn, historyBtn];
    navButtons.forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-800');
        }
    });

    // Espera a transição de saída e exibe o novo painel
    setTimeout(() => {
        const selectedPanel = document.getElementById(panelId);
        if (selectedPanel) {
            selectedPanel.classList.remove('hidden');
            setTimeout(() => selectedPanel.classList.add('visible'), 10);
            
            const selectedBtn = document.getElementById(`show-${panelId.replace('admin-', '').replace('-panel', '')}-btn`);
            if (selectedBtn) {
                selectedBtn.classList.add('bg-blue-500', 'text-white');
                selectedBtn.classList.remove('bg-gray-200', 'text-gray-800');
            }
        }
    }, 300); // tempo de transição do painel
};


const showAgendaBtn = document.getElementById('show-agenda-btn');
const showProceduresBtn = document.getElementById('show-procedures-btn');
const showHistoryBtn = document.getElementById('show-history-btn');

if (showAgendaBtn) showAgendaBtn.addEventListener('click', () => showAdminPanel('admin-agenda-panel'));
if (showProceduresBtn) showProceduresBtn.addEventListener('click', () => showAdminPanel('admin-procedures-panel'));
if (showHistoryBtn) showHistoryBtn.addEventListener('click', () => {
    showAdminPanel('admin-history-panel');
    renderHistory('dia'); // Renderiza o histórico do dia por padrão
});


if (document.getElementById('filter-today-btn')) {
    document.getElementById('filter-today-btn').addEventListener('click', () => renderHistory('dia'));
}

if (document.getElementById('filter-week-btn')) {
    document.getElementById('filter-week-btn').addEventListener('click', () => renderHistory('semana'));
}

if (document.getElementById('filter-month-btn')) {
    document.getElementById('filter-month-btn').addEventListener('click', () => renderHistory('mes'));
}


// Lógica de bloqueio de dias da semana
const blockedDaysRef = ref(database, 'diasBloqueados');
const blockedDaysCheckboxes = {
    domingo: document.getElementById('block-domingo'),
    sabado: document.getElementById('block-sabado')
};
const dayMap = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
let currentlyBlockedDays = [];

const setupBlockedDaysCheckboxes = () => {
    if (!blockedDaysCheckboxes.domingo || !blockedDaysCheckboxes.sabado) return;
    onValue(blockedDaysRef, (snapshot) => {
        currentlyBlockedDays = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                currentlyBlockedDays.push(child.val());
            });
        }
        blockedDaysCheckboxes.domingo.checked = currentlyBlockedDays.includes('domingo');
        blockedDaysCheckboxes.sabado.checked = currentlyBlockedDays.includes('sábado');
    });

    blockedDaysCheckboxes.domingo.addEventListener('change', (e) => toggleBlockedDay('domingo', e.target.checked));
    blockedDaysCheckboxes.sabado.addEventListener('change', (e) => toggleBlockedDay('sábado', e.target.checked));
};

const toggleBlockedDay = (day, shouldBlock) => {
    const dayRef = ref(database, `diasBloqueados/${day}`);
    if (shouldBlock) {
        set(dayRef, day)
            .then(() => showMessage(`${day} bloqueado com sucesso.`))
            .catch(error => showMessage(`Erro ao bloquear ${day}: ${error.message}`));
    } else {
        remove(dayRef)
            .then(() => showMessage(`${day} liberado com sucesso.`))
            .catch(error => showMessage(`Erro ao liberar ${day}: ` + error.message));
    }
};


// ===================================
// LÓGICA PARA O CLIENTE
// ===================================
let selectedDate = null;
let selectedTime = null;

const loadClientDashboard = (user) => {
    if (clienteEmailSpan) clienteEmailSpan.textContent = user.email;
    const today = new Date().toISOString().slice(0, 10);
    selectedDate = today;
    
    // Observa mudanças nos dias bloqueados
    onValue(blockedDaysRef, (snapshot) => {
        currentlyBlockedDays = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                currentlyBlockedDays.push(child.val());
            });
        }
        renderClientCalendar(selectedDate);
        renderAvailableTimes(selectedDate);
    }, { onlyOnce: false });
    
    renderProcedureOptions();
    applyTheme(); // Aplica o tema escuro
    

   // Configuração dos botões de navegação
const showClientFormBtn = document.getElementById('show-client-form-btn');
const showClientAppointmentsBtn = document.getElementById('show-client-appointments-btn');
const showClientProfileBtn = document.getElementById('show-client-profile-btn');

// Função para ativar um botão e desativar os outros
function setActiveButton(activeBtn) {
    [showClientFormBtn, showClientAppointmentsBtn, showClientProfileBtn].forEach(btn => {
        if (btn) {
            if (btn === activeBtn) {
                btn.classList.add('active');
                btn.classList.remove('inactive');
            } else {
                btn.classList.remove('active');
                btn.classList.add('inactive');
            }
        }
    });
}

if (showClientFormBtn) {
    showClientFormBtn.addEventListener('click', () => {
        showClientPanel('client-form-panel');
        setActiveButton(showClientFormBtn);
    });
}

if (showClientAppointmentsBtn) {
    showClientAppointmentsBtn.addEventListener('click', () => {
        showClientPanel('client-appointments-panel');
        setActiveButton(showClientAppointmentsBtn);
        renderClientAppointments(user.uid);
    });
}

if (showClientProfileBtn) {
    showClientProfileBtn.addEventListener('click', () => {
        showClientPanel('client-profile-panel');
        setActiveButton(showClientProfileBtn);
        renderClientProfile(user);
    });
}

    
    // Exibe o painel inicial do cliente
    showClientPanel('client-form-panel');
    if (showClientFormBtn) {
        showClientFormBtn.classList.add('bg-blue-500', 'text-white');
        showClientFormBtn.classList.remove('bg-gray-200', 'text-gray-800');
    }
    if (showClientAppointmentsBtn) {
        showClientAppointmentsBtn.classList.remove('bg-blue-500', 'text-white');
        showClientAppointmentsBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
    if (showClientProfileBtn) {
        showClientProfileBtn.classList.remove('bg-blue-500', 'text-white');
        showClientProfileBtn.classList.add('bg-gray-200', 'text-gray-800');
    }
};

const renderClientProfile = (user) => {
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profilePhoneInput = document.getElementById('profile-phone');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    if (!profileNameInput || !profileEmailInput || !profilePhoneInput || !saveProfileBtn) return;
    
    // Carrega os dados do cliente
    const userRef = ref(database, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            profileNameInput.value = userData.name || '';
            profilePhoneInput.value = userData.phone || '';
        }
    }, { onlyOnce: true });

    profileEmailInput.value = user.email; // O e-mail não pode ser alterado

    // Remove o listener anterior para evitar duplicações
    const oldSaveProfileBtn = document.getElementById('save-profile-btn');
    const newSaveProfileBtn = oldSaveProfileBtn.cloneNode(true);
    oldSaveProfileBtn.parentNode.replaceChild(newSaveProfileBtn, oldSaveProfileBtn);

    // Adiciona o listener para o botão de salvar
    newSaveProfileBtn.addEventListener('click', () => {
        const name = profileNameInput.value;
        const phone = profilePhoneInput.value;
        
        if (!name || !phone) {
            showMessage("Por favor, preencha todos os campos.");
            return;
        }

        const updates = {};
        updates['/users/' + user.uid + '/name'] = name;
        updates['/users/' + user.uid + '/phone'] = (phone || '').replace(/\D/g, '');

        update(ref(database), updates)
            .then(() => showMessage("Dados atualizados com sucesso!"))
            .catch(error => showMessage("Erro ao atualizar dados: " + error.message));
    });
};

// Função para exibir os painéis do cliente com transição
const showClientPanel = (panelId) => {
    // Esconder todos os painéis do cliente
    const formPanel = document.getElementById('client-form-panel');
    const appointmentsPanel = document.getElementById('client-appointments-panel');
    const profilePanel = document.getElementById('client-profile-panel');
    
    const panels = [formPanel, appointmentsPanel, profilePanel];
    panels.forEach(panel => {
        if (panel) {
            panel.classList.remove('visible');
            panel.classList.add('hidden');
        }
    });

    // Espera a transição de saída e exibe o novo painel
    setTimeout(() => {
        const selectedPanel = document.getElementById(panelId);
        if (selectedPanel) {
            selectedPanel.classList.remove('hidden');
            setTimeout(() => selectedPanel.classList.add('visible'), 10);
        }
    }, 300);
};

const renderClientAppointments = (userId) => {
    const appointmentsTableBody = document.getElementById('client-appointments-tbody');
    const appointmentsListMobile = document.getElementById('client-appointments-list-mobile');
    if (!appointmentsTableBody || !appointmentsListMobile) return;
    
    // Busca agendamentos do usuário logado
    const appointmentsQuery = query(ref(database, 'agendamentos'), orderByChild('userId'), equalTo(userId));
    
    onValue(appointmentsQuery, (snapshot) => {
        appointmentsTableBody.innerHTML = ''; // Limpa a tabela
        appointmentsListMobile.innerHTML = ''; // Limpa a lista mobile
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const appointment = childSnapshot.val();
                const appointmentKey = childSnapshot.key;
                
                // Renderização para desktop
                const newRow = document.createElement('tr');
                newRow.className = 'border-b dark:border-gray-700';
                newRow.innerHTML = `
                    <td class="py-2 px-4">${appointment.data}</td>
                    <td class="py-2 px-4">${appointment.hora}</td>
                    <td class="py-2 px-4">${appointment.procedimento}</td>
                    <td class="py-2 px-4">
                        <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm cancel-client-btn" data-key="${appointmentKey}">
                            Cancelar
                        </button>
                    </td>
                `;
                appointmentsTableBody.appendChild(newRow);

                // Renderização para mobile
                const newCard = document.createElement('div');
                newCard.className = 'bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md mb-4';
                newCard.innerHTML = `
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">DATA</span>
                        <span class="text-gray-800 dark:text-gray-200">${appointment.data}</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2 mb-2 dark:border-gray-600">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">HORA</span>
                        <span class="text-gray-800 dark:text-gray-200">${appointment.hora}</span>
                    </div>
                    <div class="flex justify-between items-center pb-2 mb-2">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">PROCEDIMENTO</span>
                        <span class="text-gray-800 dark:text-gray-200">${appointment.procedimento}</span>
                    </div>
                    <div class="mt-4 text-right">
                        <button class="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm cancel-client-btn-mobile" data-key="${appointmentKey}">
                            Cancelar
                        </button>
                    </div>
                `;
                appointmentsListMobile.appendChild(newCard);
            });
            
            // Adiciona o listener para os botões de cancelar na versão desktop
            appointmentsTableBody.querySelectorAll('.cancel-client-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja cancelar este agendamento?", true, () => {
                            const appointmentRef = ref(database, 'agendamentos/' + key);
                            remove(appointmentRef)
                                .then(() => showMessage("Agendamento cancelado com sucesso."))
                                .catch(error => showMessage("Erro ao cancelar agendamento: " + error.message));
                        });
                    }
                });
            });

            // Adiciona o listener para os botões de cancelar na versão mobile
            appointmentsListMobile.querySelectorAll('.cancel-client-btn-mobile').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    if (key) {
                        showMessage("Tem certeza que deseja cancelar este agendamento?", true, () => {
                            const appointmentRef = ref(database, 'agendamentos/' + key);
                            remove(appointmentRef)
                                .then(() => showMessage("Agendamento cancelado com sucesso."))
                                .catch(error => showMessage("Erro ao cancelar agendamento: " + error.message));
                        });
                    }
                });
            });
        } else {
            const noAppointmentsRow = document.createElement('tr');
            noAppointmentsRow.innerHTML = `<td colspan="4" class="py-4 text-center text-gray-500">Você não possui agendamentos.</td>`;
            appointmentsTableBody.appendChild(noAppointmentsRow);
            
            appointmentsListMobile.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">Você não possui agendamentos.</p>`;
        }
    });
};

const renderClientCalendar = (currentSelectedDate, monthOffset = 0) => {
    const calendarEl = document.getElementById('calendar-for-client');
    if (!calendarEl) return;
    calendarEl.innerHTML = '';

    const currentDate = new Date();
    const monthToRender = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
    
    const year = monthToRender.getFullYear();
    const month = monthToRender.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const header = document.createElement('div');
    header.className = 'flex justify-between items-center text-center text-lg font-bold mb-4';
    
    const prevMonthBtn = document.createElement('button');
    prevMonthBtn.innerHTML = '&#8249;';
    prevMonthBtn.className = 'px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors';
    if (monthOffset > 0) {
        prevMonthBtn.addEventListener('click', () => {
            renderClientCalendar(currentSelectedDate, monthOffset - 1);
        });
    } else {
        prevMonthBtn.disabled = true;
        prevMonthBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    header.appendChild(prevMonthBtn);

    const monthTitle = document.createElement('span');
    monthTitle.textContent = `${monthToRender.toLocaleString('pt-br', { month: 'long', year: 'numeric' })}`;
    header.appendChild(monthTitle);

    const nextMonthBtn = document.createElement('button');
    nextMonthBtn.innerHTML = '&#8250;';
    nextMonthBtn.className = 'px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors';
    nextMonthBtn.addEventListener('click', () => {
            renderClientCalendar(currentSelectedDate, monthOffset + 1);
        });
    header.appendChild(nextMonthBtn);

    calendarEl.appendChild(header);

    const daysGrid = document.createElement('div');
    daysGrid.className = 'grid grid-cols-7 gap-1';
    calendarEl.appendChild(daysGrid);

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayNames.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'text-center font-semibold text-gray-500 dark:text-gray-400';
        dayNameEl.textContent = day;
        daysGrid.appendChild(dayNameEl);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        daysGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDayOfMonth; day++) {
        const dayEl = document.createElement('div');
        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const date = new Date(fullDate + 'T00:00:00');
        const dayOfWeek = date.getDay();
        const dayName = dayMap[dayOfWeek];

        let isBlockedDay = currentlyBlockedDays.includes(dayName);
        
        let dayClasses = `h-10 w-10 flex items-center justify-center rounded-full transition-colors`;

        if (isBlockedDay) {
            dayClasses += ' bg-gray-400 text-white cursor-not-allowed';
        } else {
            dayClasses += ` cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700`;
            if (fullDate === currentSelectedDate) {
                dayClasses += ' bg-blue-500 text-white';
            }
        }
        
        dayEl.className = dayClasses;
        dayEl.textContent = day;

        if (!isBlockedDay) {
            dayEl.addEventListener('click', () => {
                selectedDate = fullDate;
                renderClientCalendar(fullDate, monthOffset);
                renderAvailableTimes(fullDate);
                selectedTime = null;
            });
        }
        daysGrid.appendChild(dayEl);
    }
};

const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + Number(minutes);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

const renderAvailableTimes = async (date) => {
    const timesContainer = document.getElementById('available-times-container');
    if (!timesContainer) return;
    timesContainer.innerHTML = '<div class="loading-spinner-small"></div>'; // Placeholder
    
    const selectedProcedure = document.getElementById('procedimento').value;
    let slotDuration = 30;

    if (!selectedProcedure) {
        timesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Selecione um procedimento para ver os horários.</p>';
        return;
    }

    const proceduresRef = ref(database, 'procedimentos');
    const proceduresSnapshot = await get(proceduresRef);
    proceduresSnapshot.forEach(childSnapshot => {
        const procedure = childSnapshot.val();
        if (procedure.descricao === selectedProcedure) {
            slotDuration = Number(procedure.duracao);
        }
    });

    let occupiedTimeRanges = [];

    const appointmentsQuery = query(ref(database, 'agendamentos'), orderByChild('data'), equalTo(date));
    const appointmentsSnapshot = await get(appointmentsQuery);
    if (appointmentsSnapshot.exists()) {
        appointmentsSnapshot.forEach(childSnapshot => {
            const appt = childSnapshot.val();
            occupiedTimeRanges.push({ start: appt.hora, end: addMinutesToTime(appt.hora, appt.duracao || '30') });
        });
    }

    const blockedQuery = query(ref(database, 'horariosBloqueados'), orderByChild('data'), equalTo(date));
    const blockedSnapshot = await get(blockedQuery);
    if (blockedSnapshot.exists()) {
        blockedSnapshot.forEach(childSnapshot => {
            const blocked = childSnapshot.val();
            occupiedTimeRanges.push({ start: blocked.hora, end: addMinutesToTime(blocked.hora, blocked.duracao || '30') });
        });
    }

    const availableSlots = [];
    let currentTime = '09:00';
    const endOfDay = '17:00';

    while (currentTime < endOfDay) {
        const currentSlotEnd = addMinutesToTime(currentTime, slotDuration);
        if (currentSlotEnd > endOfDay) break;

        let isOccupied = occupiedTimeRanges.some(range =>
            (currentTime >= range.start && currentTime < range.end) || 
            (currentSlotEnd > range.start && currentSlotEnd <= range.end) || 
            (currentTime <= range.start && currentSlotEnd >= range.end)
        );

        if (!isOccupied) {
            availableSlots.push(currentTime);
        }
        // Este é o valor que controla o intervalo entre os horários
        currentTime = addMinutesToTime(currentTime, 30); // Incrementa de 30 em 30 minutos
    }

    timesContainer.innerHTML = ''; // Clear loading
    if (availableSlots.length === 0) {
        timesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Nenhum horário disponível para este dia.</p>';
        return;
    }

    availableSlots.forEach(time => {
        const timeBtn = document.createElement('button');
        timeBtn.className = 'time-btn bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-300 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-blue-700';
        timeBtn.textContent = `${time}`;
        timeBtn.addEventListener('click', () => {
            selectedTime = time;
            document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
            timeBtn.classList.add('selected');
        });
        timesContainer.appendChild(timeBtn);
    });
};

const renderProcedureOptions = () => {
    const procedureSelect = document.getElementById('procedimento');
    if (!procedureSelect) return;
    
    const proceduresRef = ref(database, 'procedimentos');
    onValue(proceduresRef, (snapshot) => {
        procedureSelect.innerHTML = '<option value="">Selecione um procedimento</option>';
        if(snapshot.exists()){
            snapshot.forEach(childSnapshot => {
                const procedure = childSnapshot.val();
                const option = document.createElement('option');
                option.value = procedure.descricao;
                option.textContent = `${procedure.descricao} (${procedure.duracao} min) - R$ ${parseFloat(procedure.preco).toFixed(2)}`;
                option.dataset.duration = procedure.duracao;
                procedureSelect.appendChild(option);
            });
        }
    });

    procedureSelect.addEventListener('change', () => {
        if (selectedDate) {
            renderAvailableTimes(selectedDate);
        }
    });
};

const confirmAgendamentoBtn = document.getElementById('confirm-agendamento-btn');
if (confirmAgendamentoBtn) {
    confirmAgendamentoBtn.addEventListener('click', async () => {
        const selectedProcedureOption = document.getElementById('procedimento').options[document.getElementById('procedimento').selectedIndex];
        
        if (!selectedDate || !selectedTime || !selectedProcedureOption.value) {
            showMessage("Por favor, selecione um dia, horário e procedimento.");
            return;
        }
        
        const selectedDuration = selectedProcedureOption.dataset.duration;
        const nome = document.getElementById('nome-cliente').value;
        const email = document.getElementById('email-cliente').value;
        let telefone = document.getElementById('telefone-cliente').value;
        
        if (!nome || !email || !telefone) {
            showMessage("Por favor, preencha todos os campos.");
            return;
        }

        telefone = telefone.replace(/\D/g, '');

        const newAppointment = {
            nome,
            procedimento: selectedProcedureOption.value,
            duracao: selectedDuration,
            email,
            telefone,
            data: selectedDate,
            hora: selectedTime,
            confirmado: false,
            userId: auth.currentUser.uid
        };

        const newAppointmentRef = push(ref(database, 'agendamentos'));
        set(newAppointmentRef, newAppointment)
            .then(() => {
                showMessage("Agendamento realizado com sucesso!");
                document.getElementById('nome-cliente').value = '';
                document.getElementById('procedimento').value = '';
                document.getElementById('email-cliente').value = '';
                document.getElementById('telefone-cliente').value = '';
                selectedTime = null;
                document.getElementById('available-times-container').innerHTML = '';
                renderAvailableTimes(selectedDate);
            })
            .catch((error) => {
                showMessage("Erro ao agendar: " + error.message);
            });
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); // Aplica o tema escuro como padrão
});
