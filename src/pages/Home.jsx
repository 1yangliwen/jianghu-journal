import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMoments, getPersons, RELATIONS, SCENES } from '../db';
import { useTheme } from '../contexts/ThemeContext';

const toChineseNum = (num) => {
    const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    if (num < 10) return chars[num];
    if (num < 20) return '十' + (num % 10 === 0 ? '' : chars[num % 10]);
    if (num < 100) return chars[Math.floor(num / 10)] + '十' + (num % 10 === 0 ? '' : chars[num % 10]);
    return `${num}`;
};

const formatShortDate = (dateStr) => {
    if (!dateStr) return '未署年月';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
    });
};

const formatCompactDate = (dateStr) => {
    if (!dateStr) return '未署年月';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const getRelationLabel = (value) => {
    const relation = RELATIONS.find((item) => item.value === value);
    return relation ? relation.label : value;
};

const getSceneLabel = (value) => {
    const scene = SCENES.find((item) => item.value === value);
    return scene ? scene.label : value;
};

const createSpringPetals = () => Array.from({ length: 30 }, (_, index) => ({
    id: `spring-${index}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * -20}%`,
    width: `${Math.random() * 10 + 5}px`,
    height: `${Math.random() * 10 + 5}px`,
    startX: `${(Math.random() - 0.5) * 50}vw`,
    endX: `${(Math.random() - 0.5) * 100}vw`,
    duration: `${Math.random() * 5 + 5}s`,
    delay: `${Math.random() * 5}s`,
}));

const createSummerFireflies = () => Array.from({ length: 20 }, (_, index) => ({
    id: `summer-${index}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    dx: `${(Math.random() - 0.5) * 200}px`,
    dy: `${(Math.random() - 0.5) * 200}px`,
    duration: `${Math.random() * 10 + 10}s`,
    delay: `${Math.random() * 5}s`,
}));

const createAutumnLeaves = () => Array.from({ length: 25 }, (_, index) => ({
    id: `autumn-${index}`,
    left: `${Math.random() * 100}%`,
    startX: `${(Math.random() - 0.5) * 20}vw`,
    endX: `${(Math.random() - 0.5) * 100}vw`,
    duration: `${Math.random() * 5 + 8}s`,
    delay: `${Math.random() * 5}s`,
}));

const createWinterSnowflakes = () => Array.from({ length: 40 }, (_, index) => ({
    id: `winter-${index}`,
    startX: `${(Math.random() - 0.5) * 200}vw`,
    startY: `${(Math.random() - 0.5) * 200}vh`,
    endX: `${(Math.random() - 0.5) * 100}vw`,
    endY: `${(Math.random() - 0.5) * 100}vh`,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 2}s`,
}));

function DossierHome({ stats, recentMoments, notablePersons, randomVerse, homeMode, setHomeMode }) {
    const ledgerStats = [
        { label: '浮生卷数', value: toChineseNum(stats.momentCount) },
        { label: '江湖人物', value: toChineseNum(stats.personCount) },
        { label: '记恩总计', value: stats.favorScore },
        { label: '记仇总计', value: stats.grudgeScore },
    ];

    return (
        <div className="home-dossier animate-fade-in">
            <div className="home-toolbar">
                <div className="appearance-toggle">
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
            </div>

            <section className="hero-dossier hero-dossier-unfurl">
                <div className="hero-dossier-copy dossier-surface dossier-surface-hero motion-unfurl-panel motion-unfurl-left">
                    <div className="hero-copy-sequence">
                        <div className="hero-copy-topline motion-unfurl-step" style={{ '--motion-index': 0 }}>
                            <span className="section-kicker">卷首题记</span>
                            <span className="hero-copy-mark">总卷壹号</span>
                        </div>
                        <h1 className="hero-title motion-unfurl-step" style={{ '--motion-index': 1 }}>江湖往来，皆可立卷</h1>
                        <p className="hero-text motion-unfurl-step" style={{ '--motion-index': 2 }}>
                            此卷不记浮华异象，只收人间来往。以纸墨存片刻，以名录记故人，把当下的轻重缓急、往昔的恩怨眉目，安放在同一方案台之上。
                        </p>
                        <div className="hero-copy-footnote motion-unfurl-step" style={{ '--motion-index': 3 }}>
                            <span>今开总卷，检点近事与旧人。</span>
                        </div>
                        <div className="hero-actions motion-unfurl-step" style={{ '--motion-index': 4 }}>
                            <Link to="/moments" className="btn btn-primary">翻阅浮生录</Link>
                            <Link to="/grudges" className="btn btn-secondary">查阅恩仇簿</Link>
                        </div>
                    </div>
                </div>
                <div className="hero-dossier-ledger dossier-surface dossier-surface-ledger motion-unfurl-panel motion-unfurl-right">
                    <div className="ledger-sequence">
                        <div className="ledger-header motion-unfurl-step" style={{ '--motion-index': 0 }}>
                            <div>
                                <p className="section-kicker">总目账册</p>
                                <h2 className="ledger-title">案台总览</h2>
                            </div>
                            <div className="ledger-seal">总览</div>
                        </div>
                        <div className="ledger-grid">
                            {ledgerStats.map((item, index) => (
                                <div key={item.label} className="ledger-stat motion-ledger-item" style={{ '--motion-index': index + 1 }}>
                                    <span className="ledger-label">{item.label}</span>
                                    <strong>{item.value}</strong>
                                </div>
                            ))}
                        </div>
                        {randomVerse && (
                            <div className="ledger-note motion-unfurl-step" style={{ '--motion-index': 5 }}>
                                <span className="ledger-note-label">卷边批注</span>
                                <p>{randomVerse.content.length > 56 ? `${randomVerse.content.slice(0, 56)}...` : randomVerse.content}</p>
                            </div>
                        )}
                        <div className="ledger-footer motion-unfurl-step" style={{ '--motion-index': 6 }}>
                            <span>总卷今日可查</span>
                            <span>{stats.momentCount + stats.personCount} 项</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="folio-grid motion-stagger-group">
                <article className="folio-card dossier-panel motion-stagger-item" style={{ '--motion-index': 2 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">近录</p>
                            <h2>最近落笔</h2>
                        </div>
                        <Link to="/moments" className="text-link">查看全卷</Link>
                    </div>
                    {recentMoments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">卷</div>
                            <p className="empty-state-text">尚未立卷，先写下第一段近事。</p>
                        </div>
                    ) : (
                        <div className="record-list">
                            {recentMoments.map((moment, index) => (
                                <article key={moment.id} className="record-item">
                                    <div className="record-item-index">札{index + 1}</div>
                                    <div className="record-item-meta">
                                        <span>{formatShortDate(moment.rememberedAt || moment.createdAt)}</span>
                                        {moment.scene ? <span>{getSceneLabel(moment.scene)}</span> : null}
                                    </div>
                                    <h3>{moment.title || '无题小记'}</h3>
                                    <p>{moment.content.length > 70 ? `${moment.content.slice(0, 70)}...` : moment.content}</p>
                                    <div className="record-item-tail">存于浮生录</div>
                                </article>
                            ))}
                        </div>
                    )}
                </article>

                <article className="folio-card dossier-panel motion-stagger-item" style={{ '--motion-index': 3 }}>
                    <div className="folio-heading">
                        <div>
                            <p className="section-kicker">人物</p>
                            <h2>关系异动</h2>
                        </div>
                        <Link to="/grudges" className="text-link">翻阅簿册</Link>
                    </div>
                    {notablePersons.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">簿</div>
                            <p className="empty-state-text">尚无人名入簿，人物卷宗会在这里显现。</p>
                        </div>
                    ) : (
                        <div className="record-list">
                            {notablePersons.map((person, index) => (
                                <article key={person.id} className="record-item person-record">
                                    <div className="record-item-index">名{index + 1}</div>
                                    <div className="record-person-top">
                                        <div>
                                            <h3>{person.name}</h3>
                                            <p className="person-relation-line">{person.relationLabel}</p>
                                        </div>
                                        <span className={`mini-seal ${person.karmaScore >= 0 ? 'positive' : 'negative'}`}>
                                            {person.karmaScore >= 0 ? '恩' : '仇'}
                                        </span>
                                    </div>
                                    <p className="person-score-line">
                                        恩怨值 {person.karmaScore > 0 ? '+' : ''}{person.karmaScore || 0}，共记 {person.eventCount || 0} 事
                                    </p>
                                    <div className="record-item-tail">最近收录于 {person.lastUpdated}</div>
                                </article>
                            ))}
                        </div>
                    )}
                </article>
            </section>

            <section className="folio-card quick-actions-card dossier-panel motion-stagger-item" style={{ '--motion-index': 4 }}>
                <div className="folio-heading">
                    <div>
                        <p className="section-kicker">目录</p>
                        <h2>案台速览</h2>
                    </div>
                </div>
                <div className="quick-actions-grid">
                    <Link to="/moments" className="quick-action quick-action-directory">
                        <span className="quick-action-index">壹</span>
                        <div>
                            <strong>提笔记事</strong>
                            <p>将当日所感收作一页札记。</p>
                        </div>
                    </Link>
                    <Link to="/grudges" className="quick-action quick-action-directory">
                        <span className="quick-action-index">贰</span>
                        <div>
                            <strong>录入人物</strong>
                            <p>为来往之人建立卷宗与批注。</p>
                        </div>
                    </Link>
                    <Link to="/settings" className="quick-action quick-action-directory">
                        <span className="quick-action-index">叁</span>
                        <div>
                            <strong>整备馆藏</strong>
                            <p>备份旧卷、配置天机与切换首页样式。</p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}

function FantasyHome({ stats, randomVerse, homeMode, setHomeMode }) {
    const currentMonth = new Date().getMonth() + 1;
    const defaultSeason =
        currentMonth >= 3 && currentMonth <= 5 ? 'spring' :
        currentMonth >= 6 && currentMonth <= 8 ? 'summer' :
        currentMonth >= 9 && currentMonth <= 11 ? 'autumn' : 'winter';

    const [season, setSeason] = useState(defaultSeason);
    const [ripples, setRipples] = useState([]);
    const [springPetals] = useState(createSpringPetals);
    const [summerFireflies] = useState(createSummerFireflies);
    const [autumnLeaves] = useState(createAutumnLeaves);
    const [winterSnowflakes] = useState(createWinterSnowflakes);
    const containerRef = useRef(null);
    const lastRippleTime = useRef(0);

    const handleMouseMove = (event) => {
        const now = Date.now();
        if (now - lastRippleTime.current < 80) return;

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const newRipple = { id: now, x, y };

            setRipples((prev) => [...prev, newRipple]);
            lastRippleTime.current = now;

            setTimeout(() => {
                setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
            }, 1000);
        }
    };

    return (
        <div
            className={`guixu-container animate-fade-in ${season}-scene`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
        >
            <div className="home-toolbar fantasy-toolbar">
                <div className="appearance-toggle">
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
                <div className="appearance-toggle">
                    {[
                        { key: 'spring', label: '春' },
                        { key: 'summer', label: '夏' },
                        { key: 'autumn', label: '秋' },
                        { key: 'winter', label: '冬' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`segment-btn ${season === item.key ? 'active' : ''}`}
                            onClick={() => setSeason(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {season === 'spring' && (
                <div className="spring-layer">
                    <div className="sakura-container">
                        {springPetals.map((petal) => (
                            <div
                                key={petal.id}
                                className="sakura-petal"
                                style={{
                                    left: petal.left,
                                    top: petal.top,
                                    width: petal.width,
                                    height: petal.height,
                                    '--start-x': petal.startX,
                                    '--start-y': '0px',
                                    '--end-x': petal.endX,
                                    '--end-y': '100vh',
                                    animationDuration: petal.duration,
                                    animationDelay: petal.delay,
                                }}
                            />
                        ))}
                    </div>
                    <div className="pond-decorations">
                        <div className="lily-pad type-1"></div>
                        <div className="lily-pad type-2"></div>
                        <div className="willow-branch" style={{ left: '10%', height: '150px' }}><div className="willow-leaf" style={{ top: '20%' }}></div><div className="willow-leaf" style={{ top: '50%' }}></div><div className="willow-leaf" style={{ top: '80%' }}></div></div>
                        <div className="willow-branch" style={{ left: '15%', height: '100px', animationDelay: '0.5s' }}><div className="willow-leaf" style={{ top: '30%' }}></div><div className="willow-leaf" style={{ top: '70%' }}></div></div>
                        <div className="willow-branch" style={{ right: '10%', height: '180px', animationDelay: '1s' }}><div className="willow-leaf" style={{ top: '15%' }}></div><div className="willow-leaf" style={{ top: '45%' }}></div><div className="willow-leaf" style={{ top: '75%' }}></div></div>
                    </div>
                </div>
            )}

            {season === 'summer' && (
                <div className="summer-layer">
                    <div className="firefly-container">
                        {summerFireflies.map((firefly) => (
                            <div
                                key={firefly.id}
                                className="firefly"
                                style={{
                                    left: firefly.left,
                                    top: firefly.top,
                                    '--dx': firefly.dx,
                                    '--dy': firefly.dy,
                                    animationDuration: firefly.duration,
                                    animationDelay: firefly.delay,
                                }}
                            />
                        ))}
                    </div>
                    <div className="pond-decorations">
                        <div className="lotus"></div>
                        <div className="lily-pad type-1" style={{ bottom: '20%', right: '40%', transform: 'scale(1.5)' }}></div>
                    </div>
                </div>
            )}

            {season === 'autumn' && (
                <div className="autumn-layer">
                    <div className="leaf-container">
                        {autumnLeaves.map((leaf) => (
                            <div
                                key={leaf.id}
                                className="maple-leaf"
                                style={{
                                    left: leaf.left,
                                    top: '-20px',
                                    '--start-x': leaf.startX,
                                    '--end-x': leaf.endX,
                                    animationDuration: leaf.duration,
                                    animationDelay: leaf.delay,
                                }}
                            />
                        ))}
                    </div>
                    <div className="pond-decorations">
                        <div className="autumn-reed"></div>
                        <div className="autumn-reed" style={{ right: '90px', height: '60px', transform: 'rotate(25deg)' }}></div>
                        <div className="autumn-reed" style={{ right: '70px', height: '50px', transform: 'rotate(5deg)' }}></div>
                    </div>
                </div>
            )}

            {season === 'winter' && (
                <div className="winter-layer">
                    <div className="snow-container">
                        {winterSnowflakes.map((snowflake) => (
                            <div
                                key={snowflake.id}
                                className="snowflake"
                                style={{
                                    '--start-x': snowflake.startX,
                                    '--start-y': snowflake.startY,
                                    '--end-x': snowflake.endX,
                                    '--end-y': snowflake.endY,
                                    animationDuration: snowflake.duration,
                                    animationDelay: snowflake.delay,
                                }}
                            />
                        ))}
                    </div>
                    <div className="pond-decorations">
                        <div className="snow-stone stone-1"></div>
                        <div className="snow-stone stone-2"></div>
                        <div className="snow-stone stone-3"></div>
                        <div className="dry-branch branch-1"></div>
                        <div className="dry-branch branch-2"></div>
                    </div>
                </div>
            )}

            <div className="void-circle"></div>

            {ripples.map((ripple) => (
                <div
                    key={ripple.id}
                    className="interactive-ripple"
                    style={{ left: ripple.x, top: ripple.y }}
                />
            ))}

            <div className="core-stat">
                <div className="stat-subtitle">浮生若梦，已历</div>
                <div className="stat-big-num">{toChineseNum(stats.momentCount)}</div>
                <div className="stat-subtitle">阙往事</div>
            </div>

            <div className="floating-element float-left">
                <span className="ink-label red">仇</span>
                <span className="ink-num">{stats.grudgeScore}</span>
            </div>

            <div className="floating-element float-right">
                <span className="ink-label gold">恩</span>
                <span className="ink-num">{stats.favorScore}</span>
            </div>

            <div className="floating-element float-bottom">
                <span className="ink-label">人</span>
                <span className="ink-num">{toChineseNum(stats.personCount)}</span>
            </div>

            {randomVerse && (
                <div className="memory-verse">
                    <div className="verse-content">
                        {randomVerse.content.length > 20
                            ? `${randomVerse.content.substring(0, 20)}...`
                            : randomVerse.content}
                    </div>
                </div>
            )}

            <div className="guixu-actions">
                <Link to="/moments" className="ink-action-btn">
                    <span className="action-text">提笔</span>
                </Link>
                <div className="divider"></div>
                <Link to="/grudges" className="ink-action-btn">
                    <span className="action-text">阅卷</span>
                </Link>
            </div>
        </div>
    );
}

export default function HomePage() {
    const { homeMode, setHomeMode } = useTheme();
    const [renderedMode, setRenderedMode] = useState(homeMode);
    const [modeStage, setModeStage] = useState('enter');
    const [stats, setStats] = useState({ momentCount: 0, favorScore: 0, grudgeScore: 0, personCount: 0 });
    const [recentMoments, setRecentMoments] = useState([]);
    const [notablePersons, setNotablePersons] = useState([]);
    const [randomVerse, setRandomVerse] = useState(null);

    useEffect(() => {
        if (homeMode === renderedMode) {
            setModeStage('enter');
            return undefined;
        }

        setModeStage('exit');
        const timer = setTimeout(() => {
            setRenderedMode(homeMode);
            setModeStage('enter');
        }, 180);

        return () => clearTimeout(timer);
    }, [homeMode, renderedMode]);

    useEffect(() => {
        const loadStats = async () => {
            const moments = await getMoments();
            const persons = await getPersons();

            const sortedMoments = [...moments].sort((a, b) => new Date(b.rememberedAt || b.createdAt) - new Date(a.rememberedAt || a.createdAt));
            const sortedPersons = [...persons].sort((a, b) => Math.abs(b.karmaScore || 0) - Math.abs(a.karmaScore || 0));

            let favor = 0;
            let grudge = 0;

            persons.forEach((person) => {
                if ((person.karmaScore || 0) > 0) favor += person.karmaScore;
                if ((person.karmaScore || 0) < 0) grudge += Math.abs(person.karmaScore);
            });

            let verse = null;
            if (sortedMoments.length > 0) {
                const random = sortedMoments[Math.floor(Math.random() * sortedMoments.length)];
                verse = {
                    title: random.title || '无题',
                    content: random.content,
                };
            }

            setStats({
                momentCount: moments.length,
                personCount: persons.length,
                favorScore: favor,
                grudgeScore: grudge,
            });
            setRecentMoments(sortedMoments.slice(0, 3));
            setNotablePersons(sortedPersons.slice(0, 3).map((person) => ({
                ...person,
                relationLabel: getRelationLabel(person.relation) || '未定关系',
                lastUpdated: formatCompactDate(person.updatedAt || person.createdAt),
            })));
            setRandomVerse(verse);
        };

        loadStats();
    }, []);

    return (
        <div className={`home-mode-shell motion-mode-${modeStage}`} data-motion="page">
            {renderedMode === 'fantasy' ? (
                <FantasyHome
                    stats={stats}
                    randomVerse={randomVerse}
                    homeMode={homeMode}
                    setHomeMode={setHomeMode}
                />
            ) : (
                <DossierHome
                    stats={stats}
                    recentMoments={recentMoments}
                    notablePersons={notablePersons}
                    randomVerse={randomVerse}
                    homeMode={homeMode}
                    setHomeMode={setHomeMode}
                />
            )}
        </div>
    );
}
