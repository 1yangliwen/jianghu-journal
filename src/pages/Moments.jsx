import { useState, useEffect } from 'react';
import { getMoments, addMoment, updateMoment, deleteMoment, MOODS, SCENES } from '../db';
import MomentForm from '../components/MomentForm';
import MomentCard from '../components/MomentCard';

export default function MomentsPage() {
    const [moments, setMoments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMoment, setEditingMoment] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMood, setFilterMood] = useState('');
    const [filterScene, setFilterScene] = useState('');
    const [loading, setLoading] = useState(true);

    const loadMoments = async () => {
        setLoading(true);
        const data = await getMoments();
        // 按创建时间倒序
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMoments(data);
        setLoading(false);
    };

    useEffect(() => {
        loadMoments();
    }, []);

    const handleSubmit = async (formData) => {
        if (editingMoment) {
            await updateMoment(editingMoment.id, formData);
        } else {
            await addMoment(formData);
        }
        setShowForm(false);
        setEditingMoment(null);
        loadMoments();
    };

    const handleEdit = (moment) => {
        setEditingMoment(moment);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('确定要焚毁这段记忆吗？')) {
            await deleteMoment(id);
            loadMoments();
        }
    };

    const filteredMoments = moments.filter((m) => {
        const matchesSearch =
            m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMood = !filterMood || m.mood === filterMood;
        const matchesScene = !filterScene || m.scene === filterScene;
        return matchesSearch && matchesMood && matchesScene;
    });
    const motionKey = `${filterMood}-${filterScene}-${searchQuery}-${filteredMoments.length}`;

    return (
        <div className="page-shell animate-fade-in motion-page-shell" data-motion="page">
            <div className="page-intro motion-section">
                <div>
                    <p className="section-kicker">卷宗</p>
                    <h1 className="page-title">浮生录</h1>
                    <p className="page-description">把一段心绪、一场往事、一页当下，归入纸边批注与旧卷条目之中。</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    新立一卷
                </button>
            </div>

            <section className="folio-card toolbar-card dossier-panel dossier-toolbar motion-section">
                <div className="toolbar-heading">
                    <div>
                        <p className="section-kicker">目录栏</p>
                        <h2 className="toolbar-title">卷内检索</h2>
                    </div>
                    <span className="toolbar-count">现存 {filteredMoments.length} 条</span>
                </div>
                <div className="search-box">
                    <span className="search-icon">寻</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="检索卷中题名与内容"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="toolbar-filters">
                    <div className="filter-row">
                        <span className="filter-label">心境</span>
                        <div className="filter-group">
                            <button
                                className={`filter-btn ${!filterMood ? 'active' : ''}`}
                                onClick={() => setFilterMood('')}
                            >
                                全部
                            </button>
                            {MOODS.map((mood) => (
                                <button
                                    key={mood.value}
                                    className={`filter-btn ${filterMood === mood.value ? 'active' : ''}`}
                                    onClick={() => setFilterMood(mood.value)}
                                >
                                    {mood.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="filter-row">
                        <span className="filter-label">场景</span>
                        <div className="filter-group">
                            <button
                                className={`filter-btn ${!filterScene ? 'active' : ''}`}
                                onClick={() => setFilterScene('')}
                            >
                                全部
                            </button>
                            {SCENES.map((scene) => (
                                <button
                                    key={scene.value}
                                    className={`filter-btn ${filterScene === scene.value ? 'active' : ''}`}
                                    onClick={() => setFilterScene(scene.value)}
                                >
                                    {scene.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="empty-state motion-soft-enter">
                    <div className="empty-state-icon">录</div>
                    <p className="empty-state-text">卷宗整理中……</p>
                </div>
            ) : filteredMoments.length === 0 ? (
                <div className="empty-state motion-soft-enter">
                    <div className="empty-state-icon">卷</div>
                    <p className="empty-state-text">
                        {searchQuery || filterMood || filterScene
                            ? '未检得相应条目，请换个签条再查。'
                            : '浮生录尚未立卷，先记下一段当下或往昔。'}
                    </p>
                </div>
            ) : (
                <div key={motionKey} className="timeline-container motion-stagger-group">
                    {filteredMoments.map((moment, index) => (
                        <div
                            key={moment.id}
                            className="moment-card-wrapper motion-stagger-item"
                            style={{ '--motion-index': index }}
                        >
                            <div className="timeline-dot"></div>
                            <MomentCard
                                moment={moment}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <MomentForm
                    moment={editingMoment}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingMoment(null);
                    }}
                />
            )}
        </div>
    );
}
