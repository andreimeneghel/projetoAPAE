

function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

// Função para aplicar a máscara de CPF
function aplicarMascaraCPF(campo) {
    campo.addEventListener('input', function (event) {
        let value = campo.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        campo.value = value;
    });
}

// Função para aplicar a máscara de telefone
function aplicarMascaraTelefone(campo) {
    campo.addEventListener('input', function (event) {
        let value = campo.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        campo.value = value;
    });
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    return true;
}

// Aplicar a máscara de CPF e telefone nos campos de cadastro e login
document.addEventListener('DOMContentLoaded', function () {
    const cpfRegister = document.getElementById('cpf-register');
    const cpfLogin = document.getElementById('cpf-login');
    const telefone = document.getElementById('telefone');
    if (cpfRegister) {
        aplicarMascaraCPF(cpfRegister);
    }
    if (cpfLogin) {
        aplicarMascaraCPF(cpfLogin);
    }
    if (telefone) {
        aplicarMascaraTelefone(telefone);
    }
});

// JavaScript para validação de formulário Bootstrap
(function () {
    'use strict';
    var forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const cpfRegister = document.getElementById('cpf-register');
            const cpfLogin = document.getElementById('cpf-login');
            console.log(cpfLogin)
            console.log(validarCPF(cpfRegister.value))
                if (cpfRegister && !validarCPF(cpfRegister.value)) {
                    event.preventDefault();
                    event.stopPropagation();
                    cpfRegister.setCustomValidity('CPF inválido');
                    cpfRegister.classList.add('is-invalid');
                } else {
                    if (cpfRegister) {
                        console.log('c')
                        cpfRegister.setCustomValidity('');
                        cpfRegister.classList.remove('is-invalid');
                    }
                    if (cpfLogin) {
                        console.log('d')
                        cpfLogin.setCustomValidity('');
                        cpfLogin.classList.remove('is-invalid');
                    }
                    if (!form.checkValidity()) {
                        console.log('e')
                        event.preventDefault();
                        event.stopPropagation();
                    } else {
                    event.preventDefault();
                    console.log('oi3')
                    const formData = new FormData(form);
                    const jsonData = JSON.stringify(Object.fromEntries(formData));
                    console.log(jsonData);
                    fetch('/register', {
                        method: 'POST',
                        body: jsonData,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            alert(data.message);
                        }
                    })
                    .catch(error => console.error('Erro ao registrar usuário:', error));
                }
            }
            form.classList.add('was-validated');
        }, false);
    });
})();