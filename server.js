const express = require('express');
const sql = require('mssql');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); 

const dbConfig = {
    user: 'SA',
    password: 'CodeWithArjun123',
    server: 'localhost',
    database: 'task_manager',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function createTable() {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tasks')
            BEGIN
                CREATE TABLE tasks(
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    description NVARCHAR(MAX),
                    date DATE,
                    priority NVARCHAR(10)
                )
            END
        `);
    } catch (error) {
        console.error('Error creating table: ', error);
    }
}

createTable();

app.get('/api/tasks', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM tasks');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Could not get data from database' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { name, description, date, priority } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('date', sql.Date, date)
            .input('priority', sql.NVarChar, priority)
            .query(`
                INSERT INTO tasks (name, description, date, priority)
                OUTPUT INSERTED.id
                VALUES (@name, @description, @date, @priority)
            `);

        res.status(201).json({
            id: result.recordset[0].id, 
            name,
            description,
            date,
            priority
        });
    } catch (err) {
        res.status(501).json({ error: 'Could not add task' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM tasks WHERE id = @id');
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Could not delete' });
    }
});

app.listen(port, () => {
    console.log(`Listening on port:  http://localhost:${port}`);
});
