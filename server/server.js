const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 3000;

// Configuração do pool do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'apae',
    password: 'admin',
    port: 5432,
});

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para analisar o corpo das requisições
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint para testar a conexão com o banco de dados
app.get('/test-connection', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({ message: 'Conexão bem-sucedida', time: result.rows[0].now });
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        res.status(500).json({ message: 'Erro ao conectar ao banco de dados' });
    }
});

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
    const { nome, dataNascimento, email, senha, cpf, telefone } = req.body;

    try {
        // Verificar se o usuário ou email já existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE cpf = $1 OR email = $2', [cpf, email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'CPF ou email já existe' });
        }

        // Inserir novo usuário no banco de dados
        await pool.query('INSERT INTO usuarios (nome, data_nascimento, email, senha, cpf, telefone) VALUES ($1, $2, $3, $4, $5, $6)', [nome, dataNascimento, email, senha, cpf, telefone]);
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Rota para criar um novo agendamento
app.post('/agendamentos', async (req, res) => {
    const { id_aluno, id_funcionario, data_agendamento, hora_inicio, hora_fim, tipo_atendimento } = req.body;

    try {
        // Verificar disponibilidade usando a função PL/pgSQL
        const disponibilidade = await pool.query('SELECT verificar_disponibilidade($1, $2, $3, $4)', [id_funcionario, data_agendamento, hora_inicio, hora_fim]);
        if (!disponibilidade.rows[0].verificar_disponibilidade) {
            return res.status(400).json({ message: 'Horário indisponível para o funcionário' });
        }

        // Inserir novo agendamento no banco de dados
        await pool.query('INSERT INTO agendamentos (id_aluno, id_funcionario, data_agendamento, hora_inicio, hora_fim, tipo_atendimento) VALUES ($1, $2, $3, $4, $5, $6)', [id_aluno, id_funcionario, data_agendamento, hora_inicio, hora_fim, tipo_atendimento]);
        res.status(201).json({ message: 'Agendamento criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ message: 'Erro ao criar agendamento' });
    }
});

// Rota para listar todos os agendamentos
app.get('/agendamentos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM agendamentos');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({ message: 'Erro ao listar agendamentos' });
    }
});

// Redirecionar para index.html quando acessar localhost
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});