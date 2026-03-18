import { MOODS, SCENES } from '../db';

export default function MomentCard({ moment, onEdit, onDelete }) {
    const mood = MOODS.find((m) => m.value === moment.mood);
    const scene = SCENES.find((s) => s.value === moment.scene);

    const formatDate = (dateStr) => {
        if (!dateStr) return '未知';
        const date = new Date(dateStr);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        // 如果包含时间部分 (T)，则显示时分
        if (dateStr.includes('T')) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return date.toLocaleString('zh-CN', options);
    };

    return (
        <article className="narrative-card dossier-entry animate-fade-in">
            <div className="dossier-entry-header">
                <div className="entry-title-block">
                    <p className="entry-kicker">浮生札记</p>
                    <h3 className="card-title">{moment.title}</h3>
                </div>
                <div className="entry-badges">
                    {mood && <span className="badge badge-neutral">{mood.label}</span>}
                    {scene && <span className="badge badge-relation">{scene.label}</span>}
                </div>
            </div>

            <div className="card-content entry-body">
                <p className="entry-paragraph">{moment.content}</p>

                <div className="annotation-block entry-annotation">
                    <span className="annotation-label">落款与时序</span>
                    <div className="entry-meta-list">
                        {moment.occurredAt === moment.rememberedAt ? (
                            <p><span>落笔</span>{formatDate(moment.rememberedAt)}</p>
                        ) : (
                            <>
                                <p><span>忆起</span>{formatDate(moment.rememberedAt)}</p>
                                {moment.occurredAt && (
                                    <p><span>事发</span>{formatDate(moment.occurredAt)}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="entry-paper-tail">
                    {moment.occurredAt === moment.rememberedAt ? (
                        <span>当时即记</span>
                    ) : (
                        <span>追忆成卷</span>
                    )}
                </div>
            </div>

            <div className="entry-footer">
                <span className="entry-created-at">
                    {new Date(moment.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <div className="entry-actions">
                    <button className="btn btn-secondary" onClick={() => onEdit(moment)}>
                        修撰
                    </button>
                    <button className="btn btn-danger" onClick={() => onDelete(moment.id)}>
                        焚毁
                    </button>
                </div>
            </div>
        </article>
    );
}
