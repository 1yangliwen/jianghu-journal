// 简易的标题生成逻辑 (模拟 AI)
// 真正的 AI 需要后端 API 支持，这里使用关键词提取和模板生成

const KEYWORDS = [
    '时光', '岁月', '流年', '往事', '回忆', '瞬息', '浮生', '梦回',
    '春风', '夏蝉', '秋叶', '冬雪', '故人', '江湖', '天涯', '羁绊'
];

const TEMPLATES = [
    '${keyword}一梦',
    '记${keyword}',
    '${keyword}随笔',
    '又见${keyword}',
    '难忘${keyword}',
    '${keyword}之约',
];

export function generateTitle(content, mood, scene) {
    if (!content) return '由心而发';

    // 1. 尝试从内容中提取前几个字作为标题
    const cleanContent = content.replace(/[^\u4e00-\u9fa5]/g, '');
    if (cleanContent.length > 0 && cleanContent.length <= 6) {
        return cleanContent;
    }

    // 2. 关键词匹配
    for (const keyword of KEYWORDS) {
        if (content.includes(keyword)) {
            const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
            return template.replace('${keyword}', keyword);
        }
    }

    // 3. 基于场景和心情生成
    const map = {
        joyful: '心悦之刻',
        moved: '动容瞬间',
        regret: '往事如烟',
        relieved: '云淡风轻',
        nostalgic: '旧梦重温',
        grateful: '心存感激',
        work: '案牍劳形',
        family: '天伦之乐',
        travel: '仗剑天涯',
        social: '江湖夜雨',
        study: '寒窗苦读',
        daily: '浮生一日',
    };

    if (mood && map[mood]) return map[mood];
    if (scene && map[scene]) return map[scene];

    // 4. 默认古风标题
    const defaults = [
        '浮生若梦', '似水流年', '白驹过隙', '岁月静好', '惊鸿一瞥'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}
