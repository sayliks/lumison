export default {
  // 通用
  common: {
    confirm: "确认",
    cancel: "取消",
    close: "关闭",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    search: "搜索",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    done: "完成",
  },

  // 关于对话框
  about: {
    description: "本地优先的沉浸式音乐播放器",
    inspiredBy: "围绕导入文件与本地歌词构建。",
  },

  // 首页外壳
  home: {
    navHome: "首页",
    navLibrary: "资料库",
    navQueue: "队列",
    navLyrics: "歌词",
    importMusic: "导入音乐",
    emptyLibrary: "会话资料库",
    output: "输出",
    quickPicks: "快速选择",
    tunesForSeason: "季节歌单",
    summer: "夏日",
    exploreSources: "按来源探索",
    openQueue: "打开队列",
    readyToPlay: "可立即播放",
    emptyQuickPicks: "导入本地音乐开始",
    nowPlaying: "播放中",
    ready: "就绪",
    playbackProgress: "播放进度",
    librarySubtitle: "本次会话中导入的音乐",
    libraryEmpty: "资料库暂无内容",
    moodRelax: "放松",
    moodFeelGood: "好心情",
    moodEnergize: "提神",
    moodCommute: "通勤",
    moodWorkout: "运动",
    moodRomance: "浪漫",
    moodSad: "伤感",
    moodParty: "派对",
    moodFocus: "专注",
    moodSleep: "睡眠",
    shelfSummerParty: "夏日派对",
    shelfKPop: "K-Pop 派对热歌",
    shelfJPop: "J-Pop 夏日",
    shelfAlbums: "专辑",
  },

  // 音效
  audioEffect: {
    none: "无",
    noEffect: "无音效",
    reverb: "混响",
    reverbEffect: "混响效果",
    echo: "回声",
    echoEffect: "回声效果",
    bass: "低音",
    bassBoost: "低音增强",
    off: "关闭",
  },

  // 空间音频
  spatialAudio: {
    title: "3D 空间音频",
    subtitle: "影院级沉浸体验",
    on: "开启",
    off: "关闭",
    active: "已激活",
    inactive: "未激活",
    presets: "预设",
    music: "音乐",
    cinema: "影院",
    vocal: "人声",
    advanced: "高级设置",
    equalizer: "五段均衡器",
    spatial: "空间参数",
    sub: "超低音",
    bass: "低音",
    mid: "中音",
    highMid: "中高音",
    treble: "高音",
    width: "宽度",
    depth: "深度",
    height: "高度",
    roomSize: "房间大小",
    distance: "距离",
    disclaimer: "⚠️ 这不是真正的 Dolby Atmos，这是一个模拟空间增强系统，用于沉浸式耳机聆听体验。",
  },

  // 播放器控制
  player: {
    noMusicLoaded: "暂无音乐",
    selectSong: "选择一首歌曲",
    play: "播放",
    pause: "暂停",
    next: "下一首",
    prev: "上一首",
    shuffle: "随机播放",
    loopAll: "顺序播放",
    loopOne: "单曲循环",
    volume: "音量",
    settings: "设置",
    speed: "倍速",
    welcomeTitle: "欢迎使用 Lumison",
  },

  // 倍速设置
  speed: {
    title: "播放速度",
    slow: "慢速",
    normal: "正常",
    fast: "快速",
    veryFast: "很快",
    ultraFast: "超快",
    digital: "数字",
    vinyl: "黑胶",
    preservePitch: "保持音调",
    vinylMode: "黑胶模式",
    presets: "快速预设",
  },

  // 播放列表
  playlist: {
    title: "播放列表",
    playingNext: "即将播放",
    songs: "首歌曲",
    empty: "队列为空",
    addSongs: "添加歌曲开始播放",
    importLocal: "导入本地文件",
    remove: "移除",
    clear: "清空全部",
    songCount: "{count} 首歌曲",
    selectAll: "全选",
    deleteSelected: "删除所选",
    done: "完成",
    editList: "编辑列表",
    songInfo: "歌曲信息",
    album: "专辑",
    lyricsCount: "{count} 行歌词",
    lyricsFromEmbedded: "来自内嵌 ID3/FLAC",
    lyricsFromLrc: "来自 LRC 文件（备用）",
    sourceLocal: "本地文件",
    duration: "时长",
  },

  // 歌词
  lyrics: {
    noLyrics: "暂无歌词",
    loading: "加载歌词中...",
    failed: "歌词加载失败",
    importLyrics: "导入歌词文件",
    fontSize: "字体大小",
    originalAndTranslation: "原文+译文",
    originalOnly: "仅原文",
    translation: "译",
    original: "原",
    playMusicToViewLyrics: "播放音乐以查看歌词",
  },

  // 背景
  background: {
    label: "背景效果",
    fluid: "流体",
    shader1: "熔化",
    shader2: "黑洞",
    shader3: "波浪",
    shader4: "光环",
    shader5: "漩涡",
    playMusicToChange: "播放音乐后才能切换背景效果",
  },

  // 可视化器
  visualizer: {
    label: "音频可视化",
    toggle: "可视化器",
    memoryHint: "关闭可节省 5-10MB 内存",
  },

  // 音频过渡
  audioTransition: {
    label: "音频过渡",
    fadeIn: "淡入",
    fadeOut: "淡出",
    gapless: "无缝切换",
    fadeInDesc: "播放开始时音量渐强",
    fadeOutDesc: "播放结束时音量渐弱",
    gaplessDesc: "歌曲间无缝衔接",
  },

  // 键盘快捷键
  shortcuts: {
    title: "键盘快捷键",
    subtitle: "快速播放控制",
    playPause: "播放 / 暂停",
    loopMode: "循环模式",
    seek: "快进/快退 ±5秒",
    prevNext: "上一首 / 下一首",
    volumeControl: "音量控制",
    speedControl: "倍速 ±0.25x",
    speedPreset: "倍速预设",
    resetSpeed: "重置倍速 (1x)",
    volumeDialog: "音量对话框",
    speedDialog: "倍速对话框",
    togglePlaylist: "切换播放列表",
    toggleShortcuts: "切换快捷键",
    closeHint: "关闭",
    pressEsc: "按",
  },

  toast: {
    fileImportSuccess: "文件导入成功",
    lyricsLoaded: "歌词已加载",
    lyricsFailed: "歌词加载失败",
    speedChanged: "倍速已更改为 {speed}x",
  },

  // 顶部栏
  topBar: {
    import: "导入",
    settings: "设置",
    lab: "实验室",
    theme: "主题",
    language: "语言",
    about: "关于",
    enterFullscreen: "进入全屏",
    exitFullscreen: "退出全屏",
    minimize: "最小化",
    maximize: "最大化",
    restore: "还原",
    close: "关闭",
  },

  // 主题
  theme: {
    light: "浅色",
    dark: "深色",
    auto: "自动",
  },

  // 视图模式
  viewMode: {
    label: "视图模式",
    default: "默认",
    lyrics: "歌词",
  },

  settings: {
    visual: "视觉",
  },

  visualMode: {
    gradient: "渐变",
  },

  // 分享
  share: {
    title: "分享音乐",
    noSong: "当前没有正在播放的音乐",
    copied: "已复制到剪贴板！",
    failed: "分享失败",
  },

  // 高级功能
  advanced: {
    exhibitionMode: "展览模式",
    exitExhibition: "退出展览",
    multiScreen: "多屏输出",
    audioCapture: "系统音频捕获",
    targetLanguage: "目标语言",
    selectMonitor: "选择显示器",
    createWindow: "创建窗口",
    windowCreated: "输出窗口已创建",
    windowFailed: "创建窗口失败",
    captureStarted: "音频捕获已开始",
    captureFailed: "不支持音频捕获",
    captureStopped: "音频捕获已停止",
  },
};
