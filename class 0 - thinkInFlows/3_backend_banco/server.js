const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

// Conecta ao banco de dados SQLite (cria o arquivo se não existir)
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
                console.log("Schema do banco de dados executado.");
            }
        });
    }
});

// CREATE - Adicionar um novo usuário
app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;
    db.run("INSERT INTO usuarios (nome, email) VALUES (?, ?)", [nome, email], function(err) {
        if (err) {
            return res.status(400).json({ erro: err.message });
        }
        res.status(201).json({ id: this.lastID, nome, email });
    });
});

// READ - Listar todos os usuários
app.get('/usuarios', (req, res) => {
    db.all("SELECT * FROM usuarios", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

// READ - Obter um usuário específico
app.get('/usuarios/:id', (req, res) => {
    db.get("SELECT * FROM usuarios WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (!row) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        res.json(row);
    });
});

// UPDATE - Atualizar um usuário
app.put('/usuarios/:id', (req, res) => {
    const { nome, email } = req.body;
    db.run("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?", [nome, email, req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ erro: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        res.json({ mensagem: "Usuário atualizado com sucesso" });
    });
});

// DELETE - Deletar um usuário
app.delete('/usuarios/:id', (req, res) => {
    db.run("DELETE FROM usuarios WHERE id = ?", [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        res.json({ mensagem: "Usuário deletado com sucesso" });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
