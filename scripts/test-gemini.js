/* global process */
import { HttpsProxyAgent } from 'https-proxy-agent';

const apiKey = process.env.GEMINI_API_KEY;
const proxyUrl = process.argv[2] || "http://127.0.0.1:7890";

async function makeRequest(method, path, body = null) {
    const https = await import('https');
    const { URL } = await import('url');
    
    const urlStr = `https://generativelanguage.googleapis.com/v1beta${path}${path.includes('?') ? '&' : '?'}key=${apiKey}`;
    const targetUrl = new URL(urlStr);
    const agent = new HttpsProxyAgent(proxyUrl);
    
    const options = {
        hostname: targetUrl.hostname,
        port: 443,
        path: targetUrl.pathname + targetUrl.search,
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        agent: agent
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`JSON Parse Error: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    if (!apiKey) {
        console.error("❌ 未检测到 GEMINI_API_KEY 环境变量。");
        console.error("用法示例:");
        console.error('   PowerShell: $env:GEMINI_API_KEY="your-key"; node scripts/test-gemini.js');
        process.exit(1);
    }

    console.log("🚀 开始 Gemini 诊断测试...");
    console.log(`🔑 Key: ${apiKey.slice(0, 5)}...${apiKey.slice(-5)}`);
    console.log(`🌐 代理: ${proxyUrl}`);
    console.log("----------------------------------------");

    try {
        // 1. 获取模型列表
        console.log("📋 正在获取可用模型列表...");
        const data = await makeRequest('GET', '/models');
        
        const validModels = [];
        if (data.models) {
            console.log("\n✅ 发现以下模型:");
            data.models.forEach(m => {
                const methods = m.supportedGenerationMethods || [];
                const isChat = methods.includes("generateContent");
                if (isChat) {
                    const simpleName = m.name.replace('models/', '');
                    validModels.push(simpleName);
                    console.log(`   - [可用] ${simpleName} (${m.displayName})`);
                } else {
                    console.log(`   - [忽略] ${m.name.replace('models/', '')} (不支持生成内容)`);
                }
            });
        } else {
            console.log("⚠️ 未返回任何模型数据");
        }

        if (validModels.length === 0) {
            console.error("\n❌ 没有找到任何支持 generateContent 的模型！");
            return;
        }

        // 2. 尝试测试第一个可用模型
        const testModel = validModels.find(m => m.includes('flash')) || validModels[0]; // 优先测试 flash 模型
        console.log("\n----------------------------------------");
        console.log(`🧪 正在尝试使用模型: ${testModel}`);
        
        const payload = {
            contents: [{
                parts: [{ text: "Hello, reply with 'OK'" }]
            }]
        };

        const result = await makeRequest('POST', `/models/${testModel}:generateContent`, payload);
        console.log("✅ 生成测试成功！");
        console.log("✨ AI 回复:", result.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(result));

    } catch (error) {
        console.error("\n❌ 测试失败！");
        console.error("错误信息:", error.message);
    }
}

main();
