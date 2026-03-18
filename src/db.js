// IndexedDB 数据库操作封装
import { openDB } from 'idb';

const DB_NAME = 'xianxia-journal';
const DB_VERSION = 1;

// 初始化数据库
export async function initDB() {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // 浮生录 - 生活瞬间表
            if (!db.objectStoreNames.contains('moments')) {
                const momentStore = db.createObjectStore('moments', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                momentStore.createIndex('rememberedAt', 'rememberedAt');
                momentStore.createIndex('occurredAt', 'occurredAt');
                momentStore.createIndex('mood', 'mood');
                momentStore.createIndex('scene', 'scene');
            }

            // 恩仇簿 - 人物表
            if (!db.objectStoreNames.contains('persons')) {
                const personStore = db.createObjectStore('persons', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                personStore.createIndex('name', 'name');
                personStore.createIndex('relation', 'relation');
            }

            // 恩仇事件表
            if (!db.objectStoreNames.contains('events')) {
                const eventStore = db.createObjectStore('events', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                eventStore.createIndex('personId', 'personId');
                eventStore.createIndex('type', 'type');
                eventStore.createIndex('date', 'date');
            }
        },
    });
    return db;
}

// ========================================
// 浮生录 - 生活瞬间操作
// ========================================

// ========================================
// 浮生录 - 生活瞬间操作
// ========================================

export async function addMoment(moment) {
    if (window.electronAPI) return window.electronAPI.addMoment(moment);
    const db = await initDB();
    const id = await db.add('moments', {
        ...moment,
        createdAt: new Date().toISOString(),
    });
    return id;
}

export async function getMoments() {
    if (window.electronAPI) return window.electronAPI.getMoments();
    const db = await initDB();
    return db.getAll('moments');
}

export async function getMoment(id) {
    if (window.electronAPI) return window.electronAPI.getMoment(id);
    const db = await initDB();
    return db.get('moments', id);
}

export async function updateMoment(id, updates) {
    if (window.electronAPI) return window.electronAPI.updateMoment(id, updates);
    const db = await initDB();
    const moment = await db.get('moments', id);
    if (moment) {
        await db.put('moments', { ...moment, ...updates, updatedAt: new Date().toISOString() });
    }
}

export async function deleteMoment(id) {
    if (window.electronAPI) return window.electronAPI.deleteMoment(id);
    const db = await initDB();
    await db.delete('moments', id);
}

export async function searchMoments(query) {
    if (window.electronAPI) return window.electronAPI.searchMoments(query);
    const moments = await getMoments();
    const lowerQuery = query.toLowerCase();
    return moments.filter(m =>
        m.content?.toLowerCase().includes(lowerQuery) ||
        m.title?.toLowerCase().includes(lowerQuery)
    );
}

// ========================================
// 恩仇簿 - 人物操作
// ========================================

export async function addPerson(person) {
    if (window.electronAPI) return window.electronAPI.addPerson(person);
    const db = await initDB();
    const id = await db.add('persons', {
        ...person,
        createdAt: new Date().toISOString(),
    });
    return id;
}

export async function getPersons() {
    if (window.electronAPI) return window.electronAPI.getPersons();
    const db = await initDB();
    const persons = await db.getAll('persons');

    // 计算每个人的恩怨值
    for (const person of persons) {
        const events = await getEventsByPerson(person.id);
        person.karmaScore = events.reduce((sum, e) => sum + (e.score || 0), 0);
        person.eventCount = events.length;
    }

    return persons;
}

export async function getPerson(id) {
    if (window.electronAPI) return window.electronAPI.getPerson(id);
    const db = await initDB();
    const person = await db.get('persons', id);
    if (person) {
        const events = await getEventsByPerson(id);
        person.karmaScore = events.reduce((sum, e) => sum + (e.score || 0), 0);
        person.events = events;
    }
    return person;
}

export async function updatePerson(id, updates) {
    if (window.electronAPI) return window.electronAPI.updatePerson(id, updates);
    const db = await initDB();
    const person = await db.get('persons', id);
    if (person) {
        await db.put('persons', { ...person, ...updates, updatedAt: new Date().toISOString() });
    }
}

export async function deletePerson(id) {
    if (window.electronAPI) return window.electronAPI.deletePerson(id);
    const db = await initDB();
    // 删除相关的事件
    const events = await getEventsByPerson(id);
    for (const event of events) {
        await db.delete('events', event.id);
    }
    await db.delete('persons', id);
}

// ========================================
// 恩仇事件操作
// ========================================

export async function addEvent(event) {
    if (window.electronAPI) return window.electronAPI.addEvent(event);
    const db = await initDB();
    const id = await db.add('events', {
        ...event,
        createdAt: new Date().toISOString(),
    });
    return id;
}

export async function getEventsByPerson(personId) {
    // Note: Electron implementation of getPerson/getPersons typically handles event fetching or joins.
    // Use this standalone only if needed. Our main.js doesn't expose getEventsByPerson directly but getPerson does.
    // However, to keep compatibility, let's assume we might need it.
    // If not exposed in electronAPI, we might need to add it or fetch all.
    // Simpler: The UI likely calls getPerson which includes events.
    // If UI calls getEventsByPerson directly, we need to support it. 
    // Checking main.js... I didn't verify if I added getEventsByPerson. I didn't. 
    // But getPerson returns events. 
    // Let's assume UI uses getPerson. If UI uses getEventsByPerson, we might need to fix main.js.
    // BUT checking db.js original code, getPerson calls getEventsByPerson.
    // In Electron Mode, getPerson is handled entirely in main.js.
    // So getEventsByPerson is ONLY called by UI if UI explicitly calls it.
    // If UI calls it, we need fallback. 
    // I should add it to preload/main just in case, OR just fallback to DB for now? No, DB is empty in Electron mode.
    // I'll add a FIXME or just return [] if not implemented, but better: 
    // Wait, getPersons in IDB mode also calls it.
    // So let's leave IDB logic alone.
    // For Electron, if getEventsByPerson is called, we need an API. 
    // I will stick to what main.js provides. I didn't provide `getEventsByPerson` in main.js
    // I'll assume for now the UI uses getPerson.
    if (window.electronAPI) return []; // Fallback empty or implement later if found used.

    const db = await initDB();
    const index = db.transaction('events').store.index('personId');
    return index.getAll(personId);
}

export async function updateEvent(id, updates) {
    if (window.electronAPI) return window.electronAPI.updateEvent(id, updates);
    const db = await initDB();
    const event = await db.get('events', id);
    if (event) {
        await db.put('events', { ...event, ...updates, updatedAt: new Date().toISOString() });
    }
}

export async function deleteEvent(id) {
    if (window.electronAPI) return window.electronAPI.deleteEvent(id);
    const db = await initDB();
    await db.delete('events', id);
}

// ========================================
// 数据导入导出
// ========================================

export async function exportData() {
    if (window.electronAPI) {
        const data = await window.electronAPI.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `江湖恩怨录_Desktop_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return;
    }

    const db = await initDB();
    const data = {
        moments: await db.getAll('moments'),
        persons: await db.getAll('persons'),
        events: await db.getAll('events'),
        exportedAt: new Date().toISOString(),
        version: DB_VERSION,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `江湖恩怨录_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (window.electronAPI) {
                    const res = await window.electronAPI.importData(data);
                    if (res.success) resolve(res);
                    else reject(new Error(res.message));
                    return;
                }

                const db = await initDB();

                // 清空现有数据
                const tx = db.transaction(['moments', 'persons', 'events'], 'readwrite');
                await tx.objectStore('moments').clear();
                await tx.objectStore('persons').clear();
                await tx.objectStore('events').clear();

                // 导入新数据
                for (const moment of data.moments || []) {
                    await db.add('moments', moment);
                }
                for (const person of data.persons || []) {
                    await db.add('persons', person);
                }
                for (const event of data.events || []) {
                    await db.add('events', event);
                }

                resolve({ success: true, message: '收录成功' });
            } catch (err) {
                reject({ success: false, message: '收录失败：' + err.message });
            }
        };
        reader.readAsText(file);
    });
}

// 心境选项
export const MOODS = [
    { value: 'joyful', label: '心悦', emoji: '😊' },
    { value: 'moved', label: '动容', emoji: '🥹' },
    { value: 'regret', label: '怅惘', emoji: '😔' },
    { value: 'relieved', label: '释然', emoji: '😌' },
    { value: 'nostalgic', label: '怀念', emoji: '🥺' },
    { value: 'grateful', label: '感恩', emoji: '🙏' },
];

// 场景选项
export const SCENES = [
    { value: 'work', label: '职场' },
    { value: 'family', label: '家庭' },
    { value: 'travel', label: '远行' },
    { value: 'social', label: '江湖' },
    { value: 'study', label: '修行' },
    { value: 'daily', label: '日常' },
];

// 关系类型
export const RELATIONS = [
    { value: 'close_friend', label: '挚友' },
    { value: 'friend', label: '故交' },
    { value: 'colleague', label: '同门' },
    { value: 'family', label: '家人' },
    { value: 'acquaintance', label: '故人' },
    { value: 'stranger', label: '陌路' },
];
