import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpsProxyAgent } from 'https-proxy-agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let db;

function initDB() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'xianxia-journal.db');
    console.log('Database path:', dbPath);

    db = new Database(dbPath); // open the database

    // Create tables if they don't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      mood TEXT,
      scene TEXT,
      occurredAt TEXT,
      rememberedAt TEXT,
      images TEXT, -- JSON string
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      relation TEXT,
      avatar TEXT,
      desc TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personId INTEGER,
      type TEXT,
      score INTEGER,
      date TEXT,
      desc TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY(personId) REFERENCES persons(id) ON DELETE CASCADE
    );
  `);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';

    if (process.env.ELECTRON_START_URL) {
        mainWindow.loadURL(startUrl);
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        // We need to adjust this path based on where main.js is relative to dist
        // Usually electron-builder packages files differently.
        // For now, let's assume standard vite build output in ../dist
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    initDB();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers
ipcMain.handle('db-get-moments', () => {
    return db.prepare('SELECT * FROM moments ORDER BY occurredAt DESC').all().map(m => ({
        ...m,
        images: m.images ? JSON.parse(m.images) : []
    }));
});

ipcMain.handle('db-add-moment', (event, moment) => {
    const stmt = db.prepare(`
        INSERT INTO moments (title, content, mood, scene, occurredAt, rememberedAt, images, createdAt)
        VALUES (@title, @content, @mood, @scene, @occurredAt, @rememberedAt, @images, @createdAt)
    `);
    const info = stmt.run({
        ...moment,
        images: JSON.stringify(moment.images || []),
        createdAt: new Date().toISOString()
    });
    return info.lastInsertRowid;
});

ipcMain.handle('db-update-moment', (event, { id, updates }) => {
    const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = @${k}`).join(', ');
    if (!fields) return;

    // Special handling for images array
    const params = { ...updates, id, updatedAt: new Date().toISOString() };
    if (updates.images) params.images = JSON.stringify(updates.images);

    const stmt = db.prepare(`UPDATE moments SET ${fields}, updatedAt = @updatedAt WHERE id = @id`);
    stmt.run(params);
});

ipcMain.handle('db-delete-moment', (event, id) => {
    db.prepare('DELETE FROM moments WHERE id = ?').run(id);
});

ipcMain.handle('db-search-moments', (event, query) => {
    const likeQuery = `%${query}%`;
    return db.prepare(`
        SELECT * FROM moments 
        WHERE title LIKE ? OR content LIKE ? 
        ORDER BY occurredAt DESC
    `).all(likeQuery, likeQuery).map(m => ({
        ...m,
        images: m.images ? JSON.parse(m.images) : []
    }));
});

// Person IPC
ipcMain.handle('db-get-persons', () => {
    const persons = db.prepare('SELECT * FROM persons').all();
    // Calculate karma
    for (const person of persons) {
        const events = db.prepare('SELECT score FROM events WHERE personId = ?').all(person.id);
        person.karmaScore = events.reduce((sum, e) => sum + (e.score || 0), 0);
        person.eventCount = events.length;
    }
    return persons;
});

ipcMain.handle('db-add-person', (event, person) => {
    const stmt = db.prepare(`
        INSERT INTO persons (name, relation, avatar, desc, createdAt)
        VALUES (@name, @relation, @avatar, @desc, @createdAt)
    `);
    const info = stmt.run({
        ...person,
        createdAt: new Date().toISOString()
    });
    return info.lastInsertRowid;
});

ipcMain.handle('db-get-person', (event, id) => {
    const person = db.prepare('SELECT * FROM persons WHERE id = ?').get(id);
    if (person) {
        const events = db.prepare('SELECT * FROM events WHERE personId = ? ORDER BY date DESC').all(id);
        person.karmaScore = events.reduce((sum, e) => sum + (e.score || 0), 0);
        person.events = events;
    }
    return person;
});

ipcMain.handle('db-update-person', (event, { id, updates }) => {
    const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = @${k}`).join(', ');
    if (!fields) return;
    const stmt = db.prepare(`UPDATE persons SET ${fields}, updatedAt = @updatedAt WHERE id = @id`);
    stmt.run({ ...updates, id, updatedAt: new Date().toISOString() });
});

ipcMain.handle('db-delete-person', (event, id) => {
    // Delete events first (handled by ON DELETE CASCADE if supported, but safer to do manually or rely on FK)
    // better-sqlite3 enables FK constraints by default? Actually no, need PRAGMA foreign_keys = ON;
    // Let's just do manual delete for safety in this robust script
    db.prepare('DELETE FROM events WHERE personId = ?').run(id);
    db.prepare('DELETE FROM persons WHERE id = ?').run(id);
});

// Event IPC
ipcMain.handle('db-add-event', (event, evtData) => {
    const stmt = db.prepare(`
        INSERT INTO events (personId, type, score, date, desc, createdAt)
        VALUES (@personId, @type, @score, @date, @desc, @createdAt)
    `);
    const info = stmt.run({
        ...evtData,
        createdAt: new Date().toISOString()
    });
    return info.lastInsertRowid;
});

ipcMain.handle('db-update-event', (event, { id, updates }) => {
    const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = @${k}`).join(', ');
    if (!fields) return;
    const stmt = db.prepare(`UPDATE events SET ${fields}, updatedAt = @updatedAt WHERE id = @id`);
    stmt.run({ ...updates, id, updatedAt: new Date().toISOString() });
});

ipcMain.handle('db-delete-event', (event, id) => {
    db.prepare('DELETE FROM events WHERE id = ?').run(id);
});

// Import/Export
ipcMain.handle('db-export-data', () => {
    const moments = db.prepare('SELECT * FROM moments').all().map(m => ({ ...m, images: m.images ? JSON.parse(m.images) : [] }));
    const persons = db.prepare('SELECT * FROM persons').all();
    const events = db.prepare('SELECT * FROM events').all();
    return { moments, persons, events, exportDate: new Date().toISOString() };
});

ipcMain.handle('db-import-data', (event, data) => {
    const importTransaction = db.transaction((data) => {
        db.prepare('DELETE FROM moments').run();
        db.prepare('DELETE FROM persons').run();
        db.prepare('DELETE FROM events').run();

        const insertMoment = db.prepare(`INSERT INTO moments (id, title, content, mood, scene, occurredAt, rememberedAt, images, createdAt, updatedAt) VALUES (@id, @title, @content, @mood, @scene, @occurredAt, @rememberedAt, @images, @createdAt, @updatedAt)`);
        const insertPerson = db.prepare(`INSERT INTO persons (id, name, relation, avatar, desc, createdAt, updatedAt) VALUES (@id, @name, @relation, @avatar, @desc, @createdAt, @updatedAt)`);
        const insertEvent = db.prepare(`INSERT INTO events (id, personId, type, score, date, desc, createdAt, updatedAt) VALUES (@id, @personId, @type, @score, @date, @desc, @createdAt, @updatedAt)`);

        for (const m of data.moments || []) {
            insertMoment.run({ ...m, images: JSON.stringify(m.images || []) });
        }
        for (const p of data.persons || []) {
            insertPerson.run(p);
        }
        for (const e of data.events || []) {
            insertEvent.run(e);
        }
    });

    try {
        importTransaction(data);
        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
});

// AI Service
ipcMain.handle('ai-generate-content', async (event, { apiKey, modelName, prompt, baseUrl, proxyUrl }) => {
    try {
        const options = {};
        if (baseUrl && baseUrl.trim()) {
            options.baseUrl = baseUrl.trim();
        }

        // 动态代理支持
        if (proxyUrl && proxyUrl.trim()) {
            // Node.js 18+ fetch 自动读取环境变量，但 Google SDK 可能需要 node-fetch 的 agent 支持
            // GoogleGenerativeAI SDK 目前底层用 fetch，可能不直接暴露 agent 选项
            // 最佳实践：设置临时环境变量
            process.env.HTTPS_PROXY = proxyUrl.trim();
            process.env.HTTP_PROXY = proxyUrl.trim();
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // SDK 这里仍依赖全局 fetch，因此优先沿用环境变量方式设置代理。

        const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" }, options);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { success: true, text: response.text() };
    } catch (error) {
        console.error("AI Generation Error (Main Process):", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('ai-fetch-models', async (event, { apiKey, baseUrl, proxyUrl }) => {
    try {
        const urlBase = baseUrl || "https://generativelanguage.googleapis.com";
        const cleanBaseUrl = urlBase.replace(/\/$/, '');
        const url = `${cleanBaseUrl}/v1beta/models?key=${apiKey}`;

        const fetchOptions = {};
        if (proxyUrl && proxyUrl.trim()) {
             fetchOptions.agent = new HttpsProxyAgent(proxyUrl.trim());
        }

        // Main process fetch uses Node.js network stack
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, models: data.models };
    } catch (error) {
        console.error("Fetch Models Error (Main Process):", error);
        return { success: false, error: error.message };
    }
});
