import { useState } from 'react';
import { MOODS, SCENES } from '../db';
import { generateTitle } from '../utils/titleGenerator';
import { generateAiTitle, getStoredKey } from '../services/aiService';

export default function MomentForm({ moment, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        title: moment?.title || '',
        content: moment?.content || '',
        rememberedAt: moment?.rememberedAt || (() => {
            const now = new Date();
            // Adjust for timezone offset to get local time string in ISO format
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now.getTime() - offset).toISOString().slice(0, 16);
        })(),
        occurredAt: moment?.occurredAt || '',
        mood: moment?.mood || '',
        scene: moment?.scene || '',
    });

    const [generating, setGenerating] = useState(false);
    const [recordType, setRecordType] = useState('present'); // 'present' | 'past'
    const [aiError, setAiError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = { ...formData };
        if (recordType === 'present') {
            submitData.occurredAt = submitData.rememberedAt;
        }
        onSubmit(submitData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenerateTitle = async () => {
        if (!formData.content) return;
        setGenerating(true);
        setAiError(null);

        try {
            if (getStoredKey()) {
                const newTitle = await generateAiTitle(formData.content, formData.mood, formData.scene);
                setFormData(prev => ({ ...prev, title: newTitle }));
            } else {
                // 没有 Key，使用模拟生成
                await new Promise(resolve => setTimeout(resolve, 800));
                const newTitle = generateTitle(formData.content, formData.mood, formData.scene);
                setFormData(prev => ({ ...prev, title: newTitle }));
            }
        } catch (err) {
            console.error("AI 生成出错，使用规则兜底", err);

            // 友好的错误提示
            let errorMsg = "灵力连接中断";
            if (err.message.includes("not a function")) {
                errorMsg = "请重启应用以激活新的灵力通道";
            } else if (err.message.includes("fetch failed") || err.message.includes("Network")) {
                errorMsg = "网络受阻，请检查代理设置";
            }
            setAiError(`${errorMsg}，已自动切换为规则生成。`);

            const newTitle = generateTitle(formData.content, formData.mood, formData.scene);
            setFormData(prev => ({ ...prev, title: newTitle }));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-wide animate-slide-up motion-modal-sheet" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{moment ? '修撰记忆' : '提笔记事'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="moment-form-layout">
                        {/* 左侧：其他信息 */}
                        <div className="moment-form-left">
                            {!moment && (
                                <div className="segmented-control mb-2">
                                    <button
                                        type="button"
                                        className={`segment-btn ${recordType === 'present' ? 'active' : ''}`}
                                        onClick={() => setRecordType('present')}
                                    >
                                        当此感怀
                                    </button>
                                    <button
                                        type="button"
                                        className={`segment-btn ${recordType === 'past' ? 'active' : ''}`}
                                        onClick={() => setRecordType('past')}
                                    >
                                        追忆往昔
                                    </button>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">标题</label>
                                <div className="form-inline-row">
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="这段记忆的名称..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleGenerateTitle}
                                        disabled={generating || !formData.content}
                                        title="AI 赐名"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {generating ? '拟题中' : '借天机拟题'}
                                    </button>
                                </div>
                                {aiError && (
                                    <p className="form-hint form-hint-danger animate-fade-in">
                                        {aiError}
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">忆起之时</label>
                                <input
                                    type="datetime-local"
                                    name="rememberedAt"
                                    className="form-input"
                                    value={formData.rememberedAt}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {(recordType === 'past' || moment) && (
                                <div className="form-group motion-drawer">
                                    <div className="flex-between mb-1">
                                        <label className="form-label">往昔之日</label>
                                        <label className="flex items-center gap-1" style={{ fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.occurredAt && !formData.occurredAt.includes('T')}
                                                onChange={(e) => {
                                                    const isDateOnly = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        occurredAt: isDateOnly
                                                            ? prev.occurredAt.split('T')[0]
                                                            : prev.occurredAt + 'T00:00'
                                                    }));
                                                }}
                                            />
                                            只记日期
                                        </label>
                                    </div>
                                    <input
                                        type={formData.occurredAt && !formData.occurredAt.includes('T') ? "date" : "datetime-local"}
                                        name="occurredAt"
                                        className="form-input"
                                        value={formData.occurredAt}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">心境</label>
                                <select
                                    name="mood"
                                    className="form-select"
                                    value={formData.mood}
                                    onChange={handleChange}
                                >
                                    <option value="">请选择心境</option>
                                    {MOODS.map((mood) => (
                                        <option key={mood.value} value={mood.value}>
                                            {mood.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">场景</label>
                                <select
                                    name="scene"
                                    className="form-select"
                                    value={formData.scene}
                                    onChange={handleChange}
                                >
                                    <option value="">请选择场景</option>
                                    {SCENES.map((scene) => (
                                        <option key={scene.value} value={scene.value}>
                                            {scene.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 右侧：详情 */}
                        <div className="moment-form-right">
                            <div className="form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <label className="form-label">详情</label>
                                <textarea
                                    name="content"
                                    className="form-textarea"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder={recordType === 'present' ? "当下所思所感..." : "记下这段往事..."}
                                    required
                                    style={{ flex: 1, minHeight: '280px', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            罢了
                        </button>
                        <button type="submit" className="btn btn-primary">
                            落笔
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
