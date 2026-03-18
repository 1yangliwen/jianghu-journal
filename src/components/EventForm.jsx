import { useState } from 'react';

export default function EventForm({ personName, event, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        type: event?.type || 'favor', // 'favor' = 恩, 'grudge' = 仇
        score: event?.score || 1,
        date: event?.date || (() => {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now.getTime() - offset).toISOString().slice(0, 10);
        })(),
        content: event?.content || '',
        feeling: event?.feeling || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalScore = formData.type === 'grudge' ? -Math.abs(formData.score) : Math.abs(formData.score);
        onSubmit({ ...formData, score: finalScore });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal animate-slide-up motion-modal-sheet" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                    {event ? '修撰恩怨' : `记「${personName}」之事`}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">恩怨类型</label>
                        <div className="choice-grid">
                            <label className={`choice-card ${formData.type === 'favor' ? 'active favor' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="favor"
                                    checked={formData.type === 'favor'}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="choice-card-title">恩卷</div>
                                <div className="choice-card-note">记下此人之恩</div>
                            </label>
                            <label className={`choice-card ${formData.type === 'grudge' ? 'active grudge' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="grudge"
                                    checked={formData.type === 'grudge'}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="choice-card-title">仇录</div>
                                <div className="choice-card-note">记下此人之怨</div>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            程度（1-5）
                            <span style={{ marginLeft: '0.5rem', color: formData.type === 'favor' ? '#228B22' : '#8B0000' }}>
                                {formData.type === 'favor' ? `+${formData.score}` : `-${formData.score}`}
                            </span>
                        </label>
                        <input
                            type="range"
                            name="score"
                            min="1"
                            max="5"
                            value={Math.abs(formData.score)}
                            onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                            style={{ width: '100%' }}
                        />
                        <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>微不足道</span>
                            <span>刻骨铭心</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="flex-between mb-1">
                            <label className="form-label">发生日期</label>
                            <label className="flex items-center gap-1" style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.date && formData.date.length === 7}
                                    onChange={(e) => {
                                        const isMonthOnly = e.target.checked;
                                        setFormData(prev => ({
                                            ...prev,
                                            date: isMonthOnly
                                                ? prev.date.slice(0, 7)
                                                : prev.date + '-01'
                                        }));
                                    }}
                                />
                                忘却时日，只记月份
                            </label>
                        </div>
                        <input
                            type={formData.date && formData.date.length === 7 ? "month" : "date"}
                            name="date"
                            className="form-input"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">事件详情</label>
                        <textarea
                            name="content"
                            className="form-textarea"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="发生了什么事..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">我的感受</label>
                        <textarea
                            name="feeling"
                            className="form-textarea"
                            value={formData.feeling}
                            onChange={handleChange}
                            placeholder="对此事的感受..."
                            style={{ minHeight: '80px' }}
                        />
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
