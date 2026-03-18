import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersons, addPerson, updatePerson, deletePerson, RELATIONS } from '../db';
import PersonForm from '../components/PersonForm';

export default function GrudgesPage() {
    const navigate = useNavigate();
    const [persons, setPersons] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRelation, setFilterRelation] = useState('');
    const [loading, setLoading] = useState(true);

    const loadPersons = async () => {
        setLoading(true);
        const data = await getPersons();
        // 按恩怨值排序
        data.sort((a, b) => Math.abs(b.karmaScore) - Math.abs(a.karmaScore));
        setPersons(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPersons();
    }, []);

    const handleSubmit = async (formData) => {
        if (editingPerson) {
            await updatePerson(editingPerson.id, formData);
        } else {
            await addPerson(formData);
        }
        setShowForm(false);
        setEditingPerson(null);
        loadPersons();
    };

    const handleEdit = (person) => {
        setEditingPerson(person);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('确定要焚毁此人之记录？所有相关恩怨也将一并消失。')) {
            await deletePerson(id);
            loadPersons();
        }
    };

    const getRelationLabel = (value) => {
        const rel = RELATIONS.find((r) => r.value === value);
        return rel ? rel.label : value;
    };

    const filteredPersons = persons.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRelation = !filterRelation || p.relation === filterRelation;
        return matchesSearch && matchesRelation;
    });
    const motionKey = `${filterRelation}-${searchQuery}-${filteredPersons.length}`;

    return (
        <div className="page-shell animate-fade-in motion-page-shell" data-motion="page">
            <div className="page-intro motion-section">
                <div>
                    <p className="section-kicker">人物卷宗</p>
                    <h1 className="page-title">恩仇簿</h1>
                    <p className="page-description">将故人、同门、挚友与陌路逐一立卷，以签条、印鉴与批注辨其分量。</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    录入人物
                </button>
            </div>

            <section className="folio-card toolbar-card dossier-panel dossier-toolbar motion-section">
                <div className="toolbar-heading">
                    <div>
                        <p className="section-kicker">名录栏</p>
                        <h2 className="toolbar-title">卷内检索</h2>
                    </div>
                    <span className="toolbar-count">现存 {filteredPersons.length} 人</span>
                </div>
                <div className="search-box">
                    <span className="search-icon">寻</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="检索姓名与江湖称呼"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-row">
                    <span className="filter-label">关系</span>
                    <div className="filter-group">
                        <button
                            className={`filter-btn ${!filterRelation ? 'active' : ''}`}
                            onClick={() => setFilterRelation('')}
                        >
                            全部
                        </button>
                        {RELATIONS.map((rel) => (
                            <button
                                key={rel.value}
                                className={`filter-btn ${filterRelation === rel.value ? 'active' : ''}`}
                                onClick={() => setFilterRelation(rel.value)}
                            >
                                {rel.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="empty-state motion-soft-enter">
                    <div className="empty-state-icon">簿</div>
                    <p className="empty-state-text">人物卷宗整理中……</p>
                </div>
            ) : filteredPersons.length === 0 ? (
                <div className="empty-state motion-soft-enter">
                    <div className="empty-state-icon">人</div>
                    <p className="empty-state-text">
                        {searchQuery || filterRelation ? '未检得此人卷宗。' : '恩仇簿尚无人名，先录入一位来往之人。'}
                    </p>
                </div>
            ) : (
                <div key={motionKey} className="bulletin-board dossier-wall motion-section">
                    <div className="person-grid">
                        {filteredPersons.map((person, index) => {
                            const stamp = (() => {
                                const s = person.karmaScore || 0;
                                if (s <= -20) return '极恶';
                                if (s < 0) return '仇';
                                if (s >= 20) return '至善';
                                if (s > 0) return '恩';
                                return null;
                            })();

                            return (
                                <div
                                    key={person.id}
                                    className="person-card motion-stagger-item motion-paper-lift"
                                    style={{ '--motion-index': index }}
                                    onClick={() => navigate(`/grudges/${person.id}`)}
                                >
                                    {stamp && (
                                        <div
                                            className={`stamp-seal motion-seal ${(person.karmaScore || 0) > 0 ? 'stamp-good' : 'stamp-bad'}`}
                                            style={{ '--motion-index': index }}
                                        >
                                            {stamp}
                                        </div>
                                    )}

                                    <div className="person-card-content">
                                        <div className="person-card-fileline">
                                            <span>卷号 {String(person.id).padStart(3, '0')}</span>
                                            <span>人物档案</span>
                                        </div>
                                        <div className="person-avatar-wrapper">
                                            {person.avatar ? (
                                                <img src={person.avatar} alt={person.name} className="person-avatar" />
                                            ) : (
                                                <div className="person-avatar person-avatar-fallback">
                                                    像
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="person-name">{person.name}</h3>

                                        <span className="relation-badge">{getRelationLabel(person.relation)}</span>

                                        <div className="karma-display">
                                            <span className={`karma-val ${(person.karmaScore || 0) > 0 ? 'positive' : (person.karmaScore || 0) < 0 ? 'negative' : 'neutral'}`}>
                                                {(person.karmaScore || 0) > 0 ? '+' : ''}{person.karmaScore || 0}
                                            </span>
                                            <span className="karma-note">
                                                共记 {person.eventCount || 0} 事
                                            </span>
                                        </div>

                                        <div className="person-card-footer-note">
                                            点击翻阅完整卷宗
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="action-btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(person);
                                                }}
                                            >
                                                修撰
                                            </button>
                                            <button
                                                className="action-btn-small danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(person.id);
                                                }}
                                            >
                                                焚毁
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showForm && (
                <PersonForm
                    person={editingPerson}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingPerson(null);
                    }}
                />
            )}
        </div>
    );
}
