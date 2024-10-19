// Função para alternar entre login e cadastro
function toggleForms() {
    const loginFormContainer = document.getElementById('login-form-container');
    const registerForm = document.getElementById('register-form');
    loginFormContainer.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

// Função para aplicar a máscara de CPF
function aplicarMascaraCPF(campo) {
    campo.addEventListener('input', function () {
        let value = campo.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        campo.value = value;
    });
}

// Função para validar CPF
function TestaCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;
    strCPF = strCPF.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (strCPF == "00000000000") return false;

    for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
}

// Aplicar a máscara de CPF e telefone nos campos de cadastro e login
document.addEventListener('DOMContentLoaded', function () {
    const cpfRegister = document.getElementById('cpf-register');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (cpfRegister) {
        aplicarMascaraCPF(cpfRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const cpf = document.getElementById('cpf-login').value.replace(/\D/g, '');
    
            if (!TestaCPF(cpf)) {
                alert('CPF inválido!');
                return;
            }
    
            const loginData = {
                cpf: cpf, // Enviar CPF agora
                senha: document.getElementById('senha-login').value
            };
    
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
    
                const data = await response.json();
                alert(data.message);
    
                if (response.ok) {
                    // Redirecionar ou realizar outra ação após login bem-sucedido
                    console.log("Usuário logado:", loginData);
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
            }
        });
    }
    

    // Validar formulário de cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const cpf = document.getElementById('cpf-register').value.replace(/\D/g, '');

            if (!TestaCPF(cpf)) {
                alert('CPF inválido!');
                return;
            }

            const registerData = {
                nome: document.getElementById('nome').value,
                dataNascimento: document.getElementById('data-nascimento').value,
                email: document.getElementById('email-register').value,
                senha: document.getElementById('senha-register').value,
                cpf: cpf,
                telefone: document.getElementById('telefone').value
            };

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData),
                });

                const data = await response.json();
                alert(data.message);

                if (response.ok) {
                    toggleForms();
                }
            } catch (error) {
                console.error('Erro ao registrar:', error);
            }
        });
    }
});
