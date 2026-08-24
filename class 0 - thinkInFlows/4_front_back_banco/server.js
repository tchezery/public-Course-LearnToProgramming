const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta raiz
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors()); // Permite requisições de outras portas (ex: Live Server)

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database('./banco.sqlite', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite.");
        // Executa o schema.sql para criar as tabelas
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error("Erro ao executar o schema:", err.message);
            } else {
                console.log("Schema do banco executado com sucesso.");
            }
        });
    }
});

// CREATE - Adicionar um novo usuário
app.post('/api/usuarios', (req, res) => {
    const { nome, email } = req.body;
    db.run("INSERT INTO usuarios (nome, email) VALUES (?, ?)", [nome, email], function(err) {
        if (err) {
            return res.status(400).json({ erro: err.message });
        }
        res.status(201).json({ id: this.lastID, nome, email });
    });
});

// READ - Listar todos os usuários
app.get('/api/usuarios', (req, res) => {
    db.all("SELECT * FROM usuarios", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
