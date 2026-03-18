import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerson, addEvent, updateEvent, deleteEvent, updatePerson, RELATIONS } from '../db';
import EventForm from '../components/EventForm';
import PersonForm from '../components/PersonForm';

const getRelationLabel = (value) => {
    const relation = RELATIONS.find((item) => item.value === value);
    return relation ? relation.label : value;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '未署年月';
    if (dateStr.length === 7) {
        const [year, month] = dateStr.split('-');
        return `${year}年${parseInt(month, 10)}月`;
    }

    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

export default function PersonDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showPersonForm, setShowPersonForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadPerson = useCallback(async () => {
        setLoading(true);
        const data = await getPerson(Number(id));

        if (data) {
            data.events?.sort((a, b) => new Date(b.date) - new Date(a.date));
            setPerson(data);
        }

        setLoading(false);
    }, [id]);

    useEffect(() => {
        loadPerson();
    }, [loadPerson]);

    const handleEventSubmit = async (formData) => {
        if (editingEvent) {
            await updateEvent(editingEvent.id, formData);
        } else {
            await addEvent({ ...formData, personId: Number(id) });
        }

        setShowEventForm(false);
        setEditingEvent(null);
        loadPerson();
    };

    const handlePersonSubmit = async (formData) => {
        await updatePerson(Number(id), formData);
        setShowPersonForm(false);
        loadPerson();
    };

    const handleEventDelete = async (eventId) => {
        if (confirm('确定要焚毁此段恩怨？')) {
            await deleteEvent(eventId);
            loadPerson();
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">簿</div>
                <p className="empty-state-text">人物卷宗载入中……</p>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">失</div>
                <p className="empty-state-text">未寻得此人卷宗。</p>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/grudges')}>
                    返回恩仇簿
                </button>
            </div>
        );
    }

    return (
        <div className="page-shell animate-fade-in motion-page-shell" data-motion="page">
            <button className="btn btn-secondary mb-2 detail-back-btn motion-section" onClick={() => navigate('/grudges')}>
                返回恩仇簿
            </button>

            <section className="folio-card person-dossier-header dossier-panel dossier-cover-sheet motion-section">
                <div className="person-dossier-main">
                    <div className="person-dossier-identity">
                        <div className="person-dossier-avatar">
                            {person.avatar ? (
                                <img src={person.avatar} alt={person.name} className="person-avatar person-avatar-large" />
                            ) : (
                                <div className="person-avatar person-avatar-fallback person-avatar-large">像</div>
                            )}
                        </div>
                        <div>
                            <p className="section-kicker">人物卷宗</p>
                            <h1 className="page-title person-detail-title">{person.name}</h1>
                            <div className="entry-badges">
                                <span className="badge badge-relation">{getRelationLabel(person.relation)}</span>
                                <span className={`badge ${(person.karmaScore || 0) >= 0 ? 'badge-positive' : 'badge-negative'}`}>
                                    {(person.karmaScore || 0) >= 0 ? '恩势偏盛' : '怨痕犹深'}
                                </span>
                            </div>
                            <div className="person-dossier-fileline">
                                <span>卷号 {String(person.id).padStart(3, '0')}</span>
                                <span>归档人物案卷</span>
                            </div>
                        </div>
                    </div>

                    <div className="person-dossier-stats">
                        <div className="ledger-stat">
                            <span className="ledger-label">恩怨值</span>
                            <strong className={person.karmaScore > 0 ? 'karma-positive' : person.karmaScore < 0 ? 'karma-negative' : 'karma-neutral'}>
                                {person.karmaScore > 0 ? '+' : ''}{person.karmaScore || 0}
                            </strong>
                        </div>
                        <div className="ledger-stat">
                            <span className="ledger-label">立卷次数</span>
                            <strong>{person.events?.length || 0}</strong>
                        </div>
                    </div>
                </div>

                {person.note ? (
                    <div className="annotation-block">
                        <span className="annotation-label">批注</span>
                        <p>{person.note}</p>
                    </div>
                ) : null}

                <div className="person-dossier-actions">
                    <button className="btn btn-secondary" onClick={() => setShowPersonForm(true)}>
                        修撰此人
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowEventForm(true)}>
                        记一段恩仇
                    </button>
                </div>
            </section>

            <section className="page-section">
                <div className="section-heading motion-section">
                    <div>
                        <p className="section-kicker">往事</p>
                        <h2>恩怨记事</h2>
                    </div>
                </div>

                {!person.events || person.events.length === 0 ? (
                    <div className="empty-state motion-soft-enter">
                        <div className="empty-state-icon">记</div>
                        <p className="empty-state-text">此人尚无恩怨条目，可先记下一段来往。</p>
                    </div>
                ) : (
                    <div className="timeline-container detail-timeline motion-stagger-group">
                        {person.events.map((event, index) => (
                            <div
                                key={event.id}
                                className="moment-card-wrapper motion-stagger-item"
                                style={{ '--motion-index': index }}
                            >
                                <div className="timeline-dot"></div>
                                <article className="narrative-card dossier-entry event-entry">
                                    <div className="dossier-entry-header">
                                        <div className="entry-title-block">
                                            <p className="entry-kicker">{event.score > 0 ? '恩卷' : '仇录'}</p>
                                            <h3 className="card-title">{formatDate(event.date)}</h3>
                                        </div>
                                        <div className="entry-badges">
                                            <span className={`badge ${event.score > 0 ? 'badge-positive' : 'badge-negative'}`}>
                                                {event.score > 0 ? '+' : ''}{event.score}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-content entry-body">
                                        <p className="entry-paragraph">{event.content}</p>
                                        {event.feeling ? (
                                            <div className="annotation-block entry-annotation">
                                                <span className="annotation-label">心中批注</span>
                                                <p>{event.feeling}</p>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="entry-footer">
                                        <span className="entry-created-at">
                                            录于 {formatDate(event.createdAt || event.date)}
                                        </span>
                                        <div className="entry-actions">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setEditingEvent(event);
                                                    setShowEventForm(true);
                                                }}
                                            >
                                                修撰
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleEventDelete(event.id)}
                                            >
                                                焚毁
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {showEventForm && (
                <EventForm
                    personName={person.name}
                    event={editingEvent}
                    onSubmit={handleEventSubmit}
                    onCancel={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                    }}
                />
            )}

            {showPersonForm && (
                <PersonForm
                    person={person}
                    onSubmit={handlePersonSubmit}
                    onCancel={() => setShowPersonForm(false)}
                />
            )}
        </div>
    );
}
