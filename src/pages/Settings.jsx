import { useRef, useState, useEffect } from 'react';
import { exportData, importData } from '../db';
import {
    getStoredKey,
    setStoredKey,
    verifyApiKey,
    getStoredBaseUrl,
    setStoredBaseUrl,
    getStoredProxyUrl,
    setStoredProxyUrl,
    getStoredModel,
    setStoredModel,
    fetchModels,
} from '../services/aiService';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
    const fileInputRef = useRef(null);
    const { homeMode, setHomeMode } = useTheme();
    const [message, setMessage] = useState(null);
    const [importing, setImporting] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [proxyUrl, setProxyUrl] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    const [showKey, setShowKey] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        const key = getStoredKey();
        if (key) setApiKey(key);

        const url = getStoredBaseUrl();
        if (url) setBaseUrl(url);

        const proxy = getStoredProxyUrl();
        if (proxy) setProxyUrl(proxy);

        const model = getStoredModel();
        if (model) setSelectedModel(model);

        if (key) {
            fetchModels(key).then((models) => {
                if (models && models.length > 0) {
                    setAvailableModels(models);
                }
            }).catch(console.error);
        }
    }, []);

    const handleSaveKey = () => {
        if (!apiKey.trim()) {
            setMessage({ type: 'error', text: '请输入有效的 API Key。' });
            return;
        }

        setStoredKey(apiKey.trim());
        setStoredBaseUrl(baseUrl.trim() || '');
        setStoredProxyUrl(proxyUrl.trim() || '');

        if (selectedModel) {
            setStoredModel(selectedModel);
        }

        setMessage({ type: 'success', text: '天机令与相关配置已妥善封存。' });
    };

    const handleTestKey = async () => {
        if (!apiKey.trim()) return;
        setVerifying(true);

        try {
            await verifyApiKey(apiKey.trim());
            const models = await fetchModels(apiKey.trim());
            setAvailableModels(models);
            setMessage({ type: 'success', text: '天机连通无碍，可继续借其拟题。' });
        } catch {
            setMessage({ type: 'error', text: '天机未通，请检查 Key、代理或网络设置。' });
        } finally {
            setVerifying(false);
        }
    };

    const handleExport = async () => {
        try {
            await exportData();
            setMessage({ type: 'success', text: '馆藏已传书备份。' });
        } catch (error) {
            setMessage({ type: 'error', text: `传书失败：${error.message}` });
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!confirm('收录新卷将覆盖现有全部记录，确定继续？')) {
            fileInputRef.current.value = '';
            return;
        }

        setImporting(true);
        try {
            const result = await importData(file);
            setMessage({ type: 'success', text: `${result.message}，请刷新页面查阅。` });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }

        setImporting(false);
        fileInputRef.current.value = '';
    };

    return (
        <div className="page-shell animate-fade-in motion-page-shell" data-motion="page">
            <div className="page-intro motion-section">
                <div>
                    <p className="section-kicker">馆藏管理</p>
                    <h1 className="page-title">藏经阁</h1>
                    <p className="page-description">在此整备卷宗样式、天机拟题与馆藏备份，使全库井然有序。</p>
                </div>
            </div>

            {message && (
                <div className={`alert motion-soft-enter ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-grid settings-ledger">
                <section className="folio-card settings-card dossier-panel settings-card-feature motion-stagger-item" style={{ '--motion-index': 0 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">外观</p>
                            <h2>首页样式</h2>
                        </div>
                    </div>
                    <p className="card-content mb-2">默认首页可在卷宗总览与旧版幻境之间切换，随时回退，不会影响数据。</p>
                    <div className="segmented-control appearance-picker">
                        <button
                            type="button"
                            className={`segment-btn ${homeMode === 'dossier' ? 'active' : ''}`}
                            onClick={() => setHomeMode('dossier')}
                        >
                            卷宗总览
                        </button>
                        <button
                            type="button"
                            className={`segment-btn ${homeMode === 'fantasy' ? 'active' : ''}`}
                            onClick={() => setHomeMode('fantasy')}
                        >
                            幻境旧卷
                        </button>
                    </div>
                    <p className="form-hint">卷宗总览更克制统一，幻境旧卷保留你原先那版的场景氛围。</p>
                </section>

                <section className="folio-card settings-card dossier-panel settings-card-feature motion-stagger-item" style={{ '--motion-index': 1 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">天机</p>
                            <h2>AI 拟题设置</h2>
                        </div>
                    </div>
                    <p className="card-content mb-2">
                        配置 Gemini API Key 后，可为浮生录借天机拟题。
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-link inline-link"
                        >
                            获取 Key
                        </a>
                    </p>

                    <div className="form-inline-row">
                        <input
                            type={showKey ? 'text' : 'password'}
                            className="form-input"
                            value={apiKey}
                            onChange={(event) => setApiKey(event.target.value)}
                            placeholder="输入 Gemini API Key"
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowKey(!showKey)}
                            title={showKey ? '隐藏' : '显示'}
                            type="button"
                        >
                            {showKey ? '隐去' : '显露'}
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">模型</label>
                        <select
                            className="form-select"
                            value={selectedModel}
                            onChange={(event) => setSelectedModel(event.target.value)}
                        >
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-pro">Gemini Pro</option>
                            {availableModels.length > 0 && availableModels
                                .filter((model) => !['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-pro'].includes(model.name))
                                .map((model) => (
                                    <option key={model.name} value={model.name}>
                                        {model.displayName || model.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <button
                            type="button"
                            className="text-button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? '收起高级设置' : '展开高级设置'}
                        </button>

                        {showAdvanced && (
                            <div className="annotation-block advanced-block attached-note-block motion-drawer">
                                <div className="form-group">
                                    <label className="form-label">API Base URL</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={baseUrl}
                                        onChange={(event) => setBaseUrl(event.target.value)}
                                        placeholder="默认：https://generativelanguage.googleapis.com"
                                    />
                                    <p className="form-hint">如需走中转服务，可在此填写自定义地址。</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">本地代理</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={proxyUrl}
                                        onChange={(event) => setProxyUrl(event.target.value)}
                                        placeholder="例如：http://127.0.0.1:7890"
                                    />
                                    <p className="form-hint">若本机已挂代理，可直接在此填写端口。</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-inline-row">
                        <button
                            className="btn btn-secondary"
                            onClick={handleTestKey}
                            disabled={verifying || !apiKey}
                            type="button"
                        >
                            {verifying ? '连通中' : '试连天机'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveKey}
                            type="button"
                        >
                            封存配置
                        </button>
                    </div>
                </section>

                <section className="folio-card settings-card dossier-panel motion-stagger-item" style={{ '--motion-index': 2 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">馆藏</p>
                            <h2>传书备份</h2>
                        </div>
                    </div>
                    <p className="card-content mb-2">将浮生录、恩仇簿与相关条目导出为 JSON 卷宗，以备迁移或封存。</p>
                    <button className="btn btn-primary" onClick={handleExport} type="button">
                        立即传书
                    </button>
                </section>

                <section className="folio-card settings-card dossier-panel motion-stagger-item" style={{ '--motion-index': 3 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">收录</p>
                            <h2>导入旧卷</h2>
                        </div>
                    </div>
                    <p className="card-content mb-2">
                        从 JSON 卷宗收录旧有记录。
                        <strong className="danger-inline"> 此操作会覆盖当前全部数据。</strong>
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        type="button"
                    >
                        {importing ? '收录中' : '选择卷宗文件'}
                    </button>
                </section>

                <section className="folio-card settings-card dossier-panel motion-stagger-item" style={{ '--motion-index': 4 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">题记</p>
                            <h2>关于此卷</h2>
                        </div>
                    </div>
                    <div className="card-content">
                        <p><strong>江湖恩怨录</strong> v1.0.0</p>
                        <p>以纸墨、印鉴、卷宗、案台为核心意象，以低浓度仙侠细节收纳个人记事与人物来往。</p>
                        <p className="form-hint">所有数据仅存于本地，请定期传书备份。</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
