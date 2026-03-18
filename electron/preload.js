const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Moments
    getMoments: () => ipcRenderer.invoke('db-get-moments'),
    addMoment: (moment) => ipcRenderer.invoke('db-add-moment', moment),
    updateMoment: (id, updates) => ipcRenderer.invoke('db-update-moment', { id, updates }),
    deleteMoment: (id) => ipcRenderer.invoke('db-delete-moment', id),
    searchMoments: (query) => ipcRenderer.invoke('db-search-moments', query),

    // Persons
    getPersons: () => ipcRenderer.invoke('db-get-persons'),
    addPerson: (person) => ipcRenderer.invoke('db-add-person', person),
    getPerson: (id) => ipcRenderer.invoke('db-get-person', id),
    updatePerson: (id, updates) => ipcRenderer.invoke('db-update-person', { id, updates }),
    deletePerson: (id) => ipcRenderer.invoke('db-delete-person', id),

    // Events
    addEvent: (event) => ipcRenderer.invoke('db-add-event', event),
    updateEvent: (id, updates) => ipcRenderer.invoke('db-update-event', { id, updates }),
    deleteEvent: (id) => ipcRenderer.invoke('db-delete-event', id),

    // Data
    exportData: () => ipcRenderer.invoke('db-export-data'),
    importData: (data) => ipcRenderer.invoke('db-import-data', data),

    // AI
    aiGenerateContent: (params) => ipcRenderer.invoke('ai-generate-content', params),
    aiFetchModels: (params) => ipcRenderer.invoke('ai-fetch-models', params),
});
