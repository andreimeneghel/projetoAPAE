const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'apae',
    password: 'admin',
    port: 5432,
});


app.use(express.static(path.join(__dirname, '../public')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/test-connection', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({ message: 'Conexão bem-sucedida', time: result.rows[0].now });
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        res.status(500).json({ message: 'Erro ao conectar ao banco de dados' });
    }
});


app.post('/register', async (req, res) => {
    const { nome, dataNascimento, email, senha, cpf, telefone } = req.body;

    try {
       
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE cpf = $1 OR email = $2', [cpf, email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'CPF ou email já existe' });
        }


        const hashedPassword = await bcrypt.hash(senha, 10);


        await pool.query('INSERT INTO usuarios (nome, data_nascimento, email, senha, cpf, telefone) VALUES ($1, $2, $3, $4, $5, $6)', [nome, dataNascimento, email, hashedPassword, cpf, telefone]);
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});


app.post('/login', async (req, res) => {
    const { cpf, senha } = req.body; 
    try {
        console.log("Dados recebidos para login:", req.body); // Debug: mostre os dados recebidos

        const userCheck = await pool.query('SELECT * FROM usuarios WHERE cpf = $1', [cpf]);
        
        console.log("Resultado da consulta ao usuário:", userCheck.rows); // Debug: mostre o resultado da consulta

        if (userCheck.rows.length === 0) {
            return res.status(400).json({ message: 'CPF ou senha incorretos' });
        }

        const user = userCheck.rows[0];

        // Verificar a senha
        const validPassword = await bcrypt.compare(senha, user.senha);
        if (!validPassword) {
            return res.status(400).json({ message: 'CPF ou senha incorretos' });
        }

        res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        res.status(500).json({ message: 'Erro ao autenticar usuário' });
    }
});



// Redirecionar para index.html quando acessar localhost
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});