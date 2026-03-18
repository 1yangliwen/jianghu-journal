import { useState } from 'react';
import { RELATIONS } from '../db';

export default function PersonForm({ person, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: person?.name || '',
        relation: person?.relation || '',
        note: person?.note || '',
        avatar: person?.avatar || '',
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal animate-slide-up motion-modal-sheet" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{person ? '修撰人物' : '录入江湖人'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">画像</label>
                        <div className="avatar-upload dossier-upload" onClick={() => document.getElementById('avatar-input').click()}>
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="预览" className="avatar-preview" />
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-placeholder-title">录入画像</span>
                                    <div className="upload-placeholder-note">点击载入人物图像</div>
                                </div>
                            )}
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">姓名/称呼</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="此人名讳..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">关系</label>
                        <select
                            name="relation"
                            className="form-select"
                            value={formData.relation}
                            onChange={handleChange}
                            required
                        >
                            <option value="">请选择关系</option>
                            {RELATIONS.map((rel) => (
                                <option key={rel.value} value={rel.value}>
                                    {rel.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">备注</label>
                        <textarea
                            name="note"
                            className="form-textarea"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="此人印象..."
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
