import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = 'gemini_api_key';
const STORAGE_BASE_URL = 'gemini_api_base_url';
const STORAGE_PROXY_URL = 'gemini_api_proxy_url';
const STORAGE_MODEL = 'gemini_model_name';

export const getStoredKey = () => localStorage.getItem(STORAGE_KEY);
export const setStoredKey = (key) => localStorage.setItem(STORAGE_KEY, key);
export const removeStoredKey = () => localStorage.removeItem(STORAGE_KEY);

export const getStoredBaseUrl = () => localStorage.getItem(STORAGE_BASE_URL);
export const setStoredBaseUrl = (url) => localStorage.setItem(STORAGE_BASE_URL, url);

export const getStoredProxyUrl = () => localStorage.getItem(STORAGE_PROXY_URL);
export const setStoredProxyUrl = (url) => localStorage.setItem(STORAGE_PROXY_URL, url);

export const getStoredModel = () => localStorage.getItem(STORAGE_MODEL) || "gemini-1.5-flash";
export const setStoredModel = (model) => localStorage.setItem(STORAGE_MODEL, model);

const getModelOptions = () => {
    const baseUrl = getStoredBaseUrl();
    if (baseUrl && baseUrl.trim()) {
        return { baseUrl: baseUrl.trim() };
    }
    return {};
};

// 获取可用模型列表
export async function fetchModels(key) {
    if (!key) throw new Error('Key 为空');
    const baseUrl = getStoredBaseUrl();
    const proxyUrl = getStoredProxyUrl();

    // 优先使用 Electron Main Process (可自动继承系统代理)
    if (window.electronAPI) {
        try {
            const result = await window.electronAPI.aiFetchModels({ apiKey: key, baseUrl, proxyUrl });
            if (result.success && result.models) {
                return result.models
                    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                    .map(m => ({
                        name: m.name.replace('models/', ''),
                        displayName: m.displayName
                    }));
            }
            // 如果 Electron 失败，不立即抛出，尝试前端请求（虽然可能也失败）
            console.warn("Electron fetch models failed, falling back to browser fetch", result.error);
        } catch (e) {
            console.error("IPC Error:", e);
        }
    }
    // ... 浏览器回退逻辑略，因浏览器无法设置代理
    return [];
}

export async function verifyApiKey(key) {
    if (!key) throw new Error('Key 为空');
    const baseUrl = getStoredBaseUrl();
    const proxyUrl = getStoredProxyUrl();
    const modelName = getStoredModel();

    // 优先使用 Electron Main Process
    if (window.electronAPI) {
        const result = await window.electronAPI.aiGenerateContent({
            apiKey: key,
            modelName: modelName,
            baseUrl: baseUrl,
            proxyUrl: proxyUrl,
            prompt: "Reply with 'OK'"
        });
        if (result.success) {
            return result.text;
        } else {
            throw new Error(result.error || "Electron AI Verify Failed");
        }
    }
    
    // 浏览器回退
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName }, getModelOptions());
        const result = await model.generateContent("Reply with 'OK'");
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("API Key Verification Error:", error);
        throw error;
    }
}

export async function generateAiTitle(content, mood, scene) {
    const apiKey = getStoredKey();
    if (!apiKey) {
        throw new Error('未配置 Gemini API Key');
    }
    const baseUrl = getStoredBaseUrl();
    const proxyUrl = getStoredProxyUrl();
    const modelName = getStoredModel();

    const prompt = `
    作为一位深谙中国古典文学与仙侠文化的文人，请根据以下日记内容、心情和场景，为这篇日记拟定一个标题。
    
    内容：${content}
    心情：${mood || '未知'}
    场景：${scene || '未知'}
    
    要求：
    1. 仅返回标题文本，不要包含引号或其他解释。
    2. 风格要雅致、有仙气或江湖气。
    3. 形式不限：可以是四字成语，可以是五言/七言诗句，也可以是章回体小说回目风格（如“宴桃园豪杰三结义”这种叙事性标题）。
    4. 字数控制在 4 到 14 字之间。
    `;

    // 优先使用 Electron Main Process
    if (window.electronAPI) {
        const result = await window.electronAPI.aiGenerateContent({
            apiKey,
            modelName,
            baseUrl,
            proxyUrl,
            prompt
        });
        
        if (result.success) {
             // 清理可能多余的符号
            return result.text.trim().replace(/['"《》]/g, '');
        } else {
            console.error("Electron AI Generation Failed:", result.error);
            // 失败则降级到浏览器尝试（或者直接抛出）
            throw new Error(result.error);
        }
    }
    // 浏览器回退逻辑 (实际上在 Electron 环境下不应该走到这里，除非 ipc 失败)
    // 但为了代码完整性，保留一个直接调用，但注意浏览器无法设置 proxy
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName }, getModelOptions());

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        return text.replace(/['"《》]/g, '');
    } catch (error) {
        console.error("AI Title Generation Error:", error);
        throw error;
    }
}
