const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Erro ao criar as estruturas do banco:', err.message);
        } else {
            console.log('Estrutura do banco de dados (schema.sql) executada com sucesso.');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Erro ao fechar a conexão do banco de dados.', err.message);
    } else {
        console.log('Conexão com o banco de dados fechada.');
    }
});
