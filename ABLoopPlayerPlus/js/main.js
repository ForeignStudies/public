/*
  main.js — AB Loop Player（本地跟读练习版）
  纯前端：文件历史、A-B 复读、三模式跟读录音、可配置快捷键。
  所有数据只保存在本机浏览器，不含任何在线服务调用。
*/

(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const r3 = t => Math.round(t * 1000) / 1000;
  const PREFIX = 'ab.';

  /* ================= 国际化 ================= */
  const I18N = {
    zh: {
      downloads: '文件', sideFoot: '文件仅保存在本机',
      noFile: '请添加本地文件', noFileHint: '点击左侧 + 添加视频或音频，也可以直接把文件拖进来',
      stageEmpty: '选择一段视频或音频开始练习', loop: '循环',
      setStart: '按 L 设起点', setEnd: '按 L 设终点',
      abHelp: '按 <kbd>L</kbd> 设起点、再按设终点，重新开始则取消循环。用 ‹ › 把边界移动 0.1 秒；按 <kbd>M</kbd> 跟读录音，按 <kbd>Esc</kbd> 取消循环。',
      abHelpSet: '按 <kbd>M</kbd> 跟读录音，按 <kbd>L</kbd> 或 <kbd>Esc</kbd> 取消循环。',
      recFirst: '听先再说', recBoth: '边听边说', recDub: '配音',
      micWarn: '麦克风没有声音：如果刚才弹出了使用麦克风的提示，点“允许”后再录一次；否则请在系统设置 → 隐私与安全性 → 麦克风里允许访问。',
      micHint: '录音需要麦克风权限，浏览器弹出提示时请点“允许”。录音列表可回放对比。',
      headphoneHint: '边听边说时原音会从扬声器被麦克风录入，建议佩戴耳机；录音时已自动压低原音以减少串音。',
      voiceBoost: '音量增强 · 放大录音音量', origDuck: '原音减弱 · 降低素材音量',
      audioTuneNote: '音量增强直接放大麦克风录入的音量；原音减弱会在配音混音与同步对比时压低素材音量，让跟读更清楚。',
      recOnce: '录一遍', recCont: '连续录', recStop: '停止录音',
      recPreparing: '正在准备麦克风…', recWait: '先听一遍，播完自动开始录音…',
      recordingTo: '录音中 {cur} / {total}', recordingLive: '录音中 {cur}',
      noLoopUseDefault: '未设 A-B，按当前位置起 5 秒录音',
      compare: '对比', simul: '同播', stopCompare: '停止对比',
      compareOrigin: '对比：正在播原音', compareMine: '对比：正在播我的录音',
      compareSimul: '同步播放：原音 + 我的录音', recEmpty: '还没有录音，点「录一遍」或「连续录」开始',
      recLen: '录音 {n}', seqNote: '循环对比：先播原音 A-B，再播这条录音，再次点击可停止',
      simulNote: '同步播放：原音和录音同时开始，到 B 点自动停止',
      noCompare: '请先设置 A-B 循环再对比', micBusy: '正在录音中',
      pauseEach: '每句停', pauseOff: '关闭', pauseEach1: '每句停', pauseEach2: '每两句停',
      settings: '设置', language: '界面语言', followSystem: '跟随系统',
      gettingStarted: '入门', demoTitle: '示例练习',
      demoDesc: '用一段约 30 秒的示例音频，练一遍播放、放慢、循环和跟读。',
      start: '开始', shortcuts: '快捷键',
      shortcutNote: '点一个按键，再按你想用的键，也可以是组合键（比如 Ctrl+Alt+T）；已经有用途的键会和它交换。Esc、? 和应用自带的 Ctrl 快捷键不能改。',
      resetKeys: '恢复默认快捷键', playback: '播放', skipSeconds: '快进 / 快退秒数',
      defaultSpeed: '默认倍速', autoLoop: '循环后回到 A 点继续',
      save: '保存', pressKey: '按一个键…', reservedKey: '该按键不可用作快捷键',
      practiced: '已练 {n} 分钟', needFile: '请先添加文件',
      micDenied: '无法使用麦克风：请检查浏览器权限', recordingDone: '录音已保存',
      key_playPause: '播放 / 暂停', key_backward: '后退', key_forward: '前进',
      key_prevFile: '上一个音频', key_nextFile: '下一个音频', key_slower: '放慢',
      key_faster: '加快', key_shuffle: '切换播放顺序', key_videoMode: '视频：画面在上 / 并排 / 影院',
      key_abLoop: 'A-B 循环：设 A → 设 B → 取消', key_shadowPause: '跟读暂停：开 / 关',
      key_subtitle: '字幕：显示 / 隐藏（按住偷看）', key_translation: '译文：显示 → 模糊 → 不显示',
      key_sentenceBook: '加进句子本 / 拿掉', key_record: '跟读录音',
      key_nudgeStart: 'A 点后退 0.1 秒', key_nudgeEnd: 'B 点前进 0.1 秒'
    },
    en: {
      downloads: 'Files', sideFoot: 'Files stay on this device',
      noFile: 'Add a local file', noFileHint: 'Click + on the left to add video or audio, or drop files here',
      stageEmpty: 'Choose a video or audio to start', loop: 'Loop',
      setStart: 'Press L to set start', setEnd: 'Press L to set end',
      abHelp: 'Press <kbd>L</kbd> to set the start, then the end; press again to cancel. Use ‹ › to move a boundary 0.1s. Press <kbd>M</kbd> to record, <kbd>Esc</kbd> to cancel.',
      abHelpSet: 'Press <kbd>M</kbd> to record, <kbd>L</kbd> or <kbd>Esc</kbd> to cancel the loop.',
      recFirst: 'Listen then speak', recBoth: 'Listen & speak', recDub: 'Dubbing',
      micWarn: 'No microphone sound? If a permission prompt appeared, click Allow and try again; otherwise enable microphone access in System Settings → Privacy & Security → Microphone.',
      micHint: 'Recording needs microphone access — click Allow when prompted. Your takes appear below for playback and comparison.',
      headphoneHint: 'In Listen & speak mode, speaker audio can leak into the mic — headphones are recommended. Original audio is auto-lowered while recording to reduce bleed.',
      voiceBoost: 'Volume boost · raise recording volume', origDuck: 'Duck original · lower source volume',
      audioTuneNote: 'Volume boost simply raises the microphone recording level; duck original lowers the source volume during dubbing and simultaneous comparison so your shadowing stands out.',
      recOnce: 'Record once', recCont: 'Continuous', recStop: 'Stop recording',
      recPreparing: 'Preparing microphone…', recWait: 'Listen first — recording starts when playback ends…',
      recordingTo: 'Recording {cur} / {total}', recordingLive: 'Recording {cur}',
      noLoopUseDefault: 'No A-B set — recording 5 seconds from current position',
      compare: 'Compare', simul: 'Simul', stopCompare: 'Stop compare',
      compareOrigin: 'Compare: playing original', compareMine: 'Compare: playing your take',
      compareSimul: 'Simultaneous: original + your take',
      recEmpty: 'No recordings yet — click Record once or Continuous',
      recLen: 'Take {n}', seqNote: 'Looped compare: original A-B, then your take; click again to stop',
      simulNote: 'Simultaneous: original and your take start together, stop at B',
      noCompare: 'Set an A-B loop before comparing', micBusy: 'Recording in progress',
      pauseEach: 'Pause each sentence', pauseOff: 'Off', pauseEach1: 'Each sentence', pauseEach2: 'Every 2 sentences',
      settings: 'Settings', language: 'Interface language', followSystem: 'Follow system',
      gettingStarted: 'Getting started', demoTitle: 'Demo practice',
      demoDesc: 'A 30-second sample to practice playing, slowing, looping and shadowing.',
      start: 'Start', shortcuts: 'Shortcuts',
      shortcutNote: 'Click a key, then press the one you want — combinations work too (e.g. Ctrl+Alt+T). Used keys swap automatically. Esc, ? and built-in Ctrl shortcuts cannot be changed.',
      resetKeys: 'Reset shortcuts', playback: 'Playback', skipSeconds: 'Skip seconds',
      defaultSpeed: 'Default speed', autoLoop: 'Keep looping back to A',
      save: 'Save', pressKey: 'Press a key…', reservedKey: 'That key cannot be used',
      practiced: 'Practiced {n} min', needFile: 'Add a file first',
      micDenied: 'Microphone unavailable: check browser permissions', recordingDone: 'Recording saved',
      key_playPause: 'Play / Pause', key_backward: 'Backward', key_forward: 'Forward',
      key_prevFile: 'Previous audio', key_nextFile: 'Next audio', key_slower: 'Slower',
      key_faster: 'Faster', key_shuffle: 'Toggle play order', key_videoMode: 'Video: top / side / theater',
      key_abLoop: 'A-B loop: set A → set B → cancel', key_shadowPause: 'Shadow pause: on / off',
      key_subtitle: 'Subtitles: show / hide (hold to peek)', key_translation: 'Translation: show → blur → hide',
      key_sentenceBook: 'Add to / remove from sentence book', key_record: 'Shadow recording',
      key_nudgeStart: 'Move A back 0.1s', key_nudgeEnd: 'Move B forward 0.1s'
    }
  };

  let LANG = 'zh';
  function langNow() {
    if (LANG !== 'system') return LANG;
    return (navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }
  function t(key, vars) {
    let s = (I18N[langNow()] && I18N[langNow()][key]) || I18N.zh[key] || key;
    if (vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  /* ================= 存储 ================= */
  function sget(k) { try { return localStorage.getItem(PREFIX + k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(PREFIX + k, v); } catch (e) {} }

  let LIB = [];
  const fileCache = new Map(); // 当前会话内的文件本体，避免等待 IndexedDB
  try { LIB = JSON.parse(sget('library') || '[]'); if (!Array.isArray(LIB)) LIB = []; } catch (e) { LIB = []; }
  function saveLib() { sset('library', JSON.stringify(LIB)); }
  function savePref(k, v) { sset('pref.' + k, String(v)); }
  function pref(k, d) { const v = sget('pref.' + k); return v === null ? d : v; }

  // IndexedDB 保存文件本体，使历史记录可重新打开
  let db = null;
  function openDB() {
    return new Promise(resolve => {
      let done = false;
      const finish = ok => { if (!done) { done = true; resolve(ok); } };
      setTimeout(() => finish(false), 1200);
      try {
        const req = indexedDB.open('abloop-files', 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains('files')) req.result.createObjectStore('files');
        };
        req.onsuccess = () => { db = req.result; finish(true); };
        req.onerror = () => finish(false);
      } catch (e) { finish(false); }
    });
  }
  function idbPut(id, file) {
    return new Promise(resolve => {
      if (!db) return resolve(false);
      try {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(file, id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  }
  function idbGet(id) {
    return new Promise(resolve => {
      if (!db) return resolve(fileCache.get(id) || null);
      let done = false;
      const finish = v => { if (!done) { done = true; resolve(v); } };
      try {
        const req = db.transaction('files', 'readonly').objectStore('files').get(id);
        req.onsuccess = () => finish(req.result || fileCache.get(id) || null);
        req.onerror = () => finish(fileCache.get(id) || null);
        setTimeout(() => finish(fileCache.get(id) || null), 900);
      } catch (e) { finish(fileCache.get(id) || null); }
    });
  }
  function idbDel(id) {
    if (!db) return;
    try { db.transaction('files', 'readwrite').objectStore('files').delete(id); } catch (e) {}
  }

  /* ================= 状态 ================= */
  const S = {
    currentId: null, file: null, url: null, media: null, duration: 0,
    A: 0, B: 0, aSet: false, bSet: false, loopOn: false, passes: 0,
    pauseEvery: 0, playing: false, raf: null,
    recMode: 'listen-first', recorder: null, recStream: null, recChunks: [],
    recTimer: null, recPending: false, recTick: null, recStartAt: 0, recTargetMs: 0, waitTimer: null,
    recTrigger: 'once', micPeak: 0, micMeter: null, micMeterData: null,
    recShadowVol: null,
    audioCtx: null, mediaSrc: null, mixDest: null, micNode: null, micGain: null, mediaGain: null,
    recordings: [], compare: null, comparing: false, capturing: null, shuffle: false, subtitle: true
  };

  const DEFAULT_KEYS = {
    playPause: 'Space', backward: 'ArrowLeft', forward: 'ArrowRight',
    prevFile: 'ArrowUp', nextFile: 'ArrowDown', slower: '-', faster: '=',
    shuffle: 'R', videoMode: 'V', abLoop: 'L', shadowPause: 'G',
    subtitle: 'H', translation: 'T', sentenceBook: 'B', record: 'M',
    nudgeStart: ',', nudgeEnd: '.'
  };
  let KEYS = Object.assign({}, DEFAULT_KEYS);
  try {
    const saved = JSON.parse(sget('keys') || 'null');
    if (saved && typeof saved === 'object') KEYS = Object.assign({}, DEFAULT_KEYS, saved);
  } catch (e) {}
  function saveKeys() { sset('keys', JSON.stringify(KEYS)); }

  let toastTimer;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ================= 时间格式 ================= */
  function fmt(t, ms) {
    if (!isFinite(t) || t < 0) t = 0;
    const h = Math.floor(t / 3600), m = Math.floor((t - h * 3600) / 60), s = Math.floor(t % 60);
    const base = (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
    return ms ? base + '.' + String(Math.round((t - Math.floor(t)) * 10)) : base;
  }

  /* ================= 文件库 ================= */
  function makeId(f) { return f.name + '-' + f.size + '-' + (f.lastModified || 0); }
  function itemById(id) { return LIB.find(x => x.id === id); }

  function removeFile(item) {
    if (!confirm('从历史记录移除 "' + item.name + '"？')) return;
    if (S.currentId === item.id) {
      if (S.recorder && S.recorder.state === 'recording') { try { S.recorder.stop(); } catch (e) {} }
      stopAnyCompare(true);
      resetRecorder();
      pause();
      if (S.url) URL.revokeObjectURL(S.url);
      S.url = null; S.media = null; S.file = null; S.currentId = null;
      $('stage').replaceChildren();
      $('mediaTitle').textContent = t('noFile');
      $('mediaSubtitle').textContent = t('noFileHint');
      renderAB();
    }
    LIB = LIB.filter(x => x.id !== item.id);
    idbDel(item.id); savePref('lastId', S.currentId || ''); saveLib(); renderFileList();
  }

  function renderFileList() {
    const box = $('fileList');
    box.replaceChildren();
    $('fileCount').textContent = String(LIB.length);
    if (!LIB.length) {
      const p = document.createElement('div');
      p.className = 'side-foot'; p.style.border = '0';
      p.textContent = '—';
      box.appendChild(p);
    }
    LIB.forEach(item => {
      const row = document.createElement('div');
      row.className = 'file-item' + (item.id === S.currentId ? ' active' : '');
      row.title = item.name;
      const name = document.createElement('span');
      name.className = 'file-name'; name.textContent = item.name;
      const lock = document.createElement('span');
      lock.className = 'file-lock'; lock.innerHTML =
        '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
      const state = document.createElement('span');
      const active = item.id === S.currentId;
      state.className = 'file-state' + (active && S.playing ? ' playing' : '');
      state.innerHTML = active && S.playing
        ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>'
        : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/></svg>';
      const del = document.createElement('button');
      del.className = 'file-del';
      del.title = '从历史记录移除';
      del.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg>';
      del.onclick = e => { e.stopPropagation(); removeFile(item); };
      row.append(name, lock, state, del);
      row.addEventListener('click', () => openById(item.id));
      row.addEventListener('contextmenu', e => { e.preventDefault(); removeFile(item); });
      box.appendChild(row);
    });
  }

  async function addFiles(files) {
    const list = Array.from(files).filter(f => f.type.startsWith('video/') || f.type.startsWith('audio/'));
    if (!list.length) { toast('请选择视频或音频文件'); return; }
    let firstId = null;
    for (const f of list) {
      const id = makeId(f);
      let item = itemById(id);
      if (!item) {
        item = { id, name: f.name, size: f.size, addedAt: Date.now(), lastPlayed: 0, position: 0, practiceMs: 0, duration: 0 };
        LIB.unshift(item);
      }
      fileCache.set(id, f);
      idbPut(id, f); // 后台持久化，不阻塞界面
      if (!firstId) firstId = id;
    }
    saveLib(); renderFileList();
    if (firstId) await openById(firstId);
  }

  async function openById(id) {
    const item = itemById(id);
    if (!item) return;
    const file = await idbGet(id);
    if (!file) { toast('该文件的本地数据已丢失，请重新添加'); return; }
    S.currentId = id;
    item.lastPlayed = Date.now();
    saveLib(); renderFileList();
    loadMedia(file, item.position || 0);
  }

  /* ================= 媒体 ================= */
  function loadMedia(file, startAt) {
    pause();
    stopAnyCompare(true);
    if (S.recorder && S.recorder.state === 'recording') {
      try { S.recorder.onstop = null; S.recorder.stop(); } catch (e) {}
    }
    restoreMediaVolume();
    resetRecorder();
    if (S.mixDest && S.mediaSrc) { try { S.mediaSrc.disconnect(S.mixDest); } catch (e) {} }
    if (S.micGain) { try { S.micGain.disconnect(); } catch (e) {} }
    if (S.mediaGain) { try { S.mediaGain.disconnect(); } catch (e) {} }
    if (S.micMeter) { try { S.micMeter.disconnect(); } catch (e) {} }
    S.mixDest = null; S.micNode = null; S.micGain = null; S.mediaGain = null;
    S.micMeter = null; S.micMeterData = null;
    // media 元素即将被替换，旧的 Web Audio source 节点必须丢弃
    S.mediaSrc = null;
    if (S.recStream) { S.recStream.getTracks().forEach(x => x.stop()); S.recStream = null; }
    if (S.url) URL.revokeObjectURL(S.url);
    S.file = file;
    S.url = URL.createObjectURL(file);
    $('stage').replaceChildren();
    const isAudio = file.type.startsWith('audio/');
    $('stage').classList.toggle('audio', isAudio);
    const m = document.createElement(isAudio ? 'audio' : 'video');
    m.controls = false;
    m.preload = 'metadata';
    m.playsInline = true;
    m.addEventListener('loadedmetadata', () => {
      S.duration = isFinite(m.duration) ? m.duration : 0;
      const item = itemById(S.currentId);
      if (item) { item.duration = S.duration; saveLib(); }
      if (startAt > 0) { try { m.currentTime = Math.min(startAt, S.duration || startAt); } catch (e) {} }
      clearLoop(false);
      m.playbackRate = Number(pref('speed', 1)) || 1;
      $('speedLabel').textContent = m.playbackRate.toFixed(1) + '×';
      $('stageEmpty').hidden = true;
      $('mediaTitle').textContent = file.name;
      refreshSubtitle();
      updateTimeline();
    });
    m.addEventListener('timeupdate', updateTimeline);
    m.addEventListener('play', () => { S.playing = true; onPlayState(); });
    m.addEventListener('pause', () => { S.playing = false; onPlayState(); });
    m.addEventListener('ended', () => { S.playing = false; onPlayState(); });
    m.addEventListener('ratechange', () => {
      $('speedLabel').textContent = (m.playbackRate || 1).toFixed(1) + '×';
    });
    $('stage').appendChild(m);
    S.media = m;
    $('stageEmpty').hidden = true;
    $('mediaTitle').textContent = file.name;
    refreshSubtitle();
    m.src = S.url;
    S.passes = 0;
    renderAB();
  }

  function onPlayState() {
    const icon = $('playIcon');
    icon.innerHTML = S.playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5l11 7-11 7z"/>';
    icon.style.marginLeft = S.playing ? '0' : '2px';
    renderFileList();
    if (S.playing) startTicker(); else stopTicker();
  }

  function play() { if (S.media) S.media.play().catch(() => {}); }
  function pause() { if (S.media) S.media.pause(); }
  function togglePlay() { if (S.media) (S.playing ? pause() : play()); }
  function seek(t) {
    if (!S.media || !S.duration) return;
    try { S.media.currentTime = clamp(t, 0, S.duration); } catch (e) {}
    updateTimeline();
  }

  function startTicker() {
    stopTicker();
    const tick = () => {
      if (!S.media || !S.playing) return;
      checkLoop();
      updateTimeline();
      saveProgress();
      S.raf = requestAnimationFrame(tick);
    };
    S.raf = requestAnimationFrame(tick);
  }
  function stopTicker() { if (S.raf) cancelAnimationFrame(S.raf); S.raf = null; }

  let lastSaved = 0;
  function saveProgress() {
    const now = Date.now();
    const item = itemById(S.currentId);
    if (!item || !S.media) return;
    if (now - lastSaved > 1200) {
      item.position = S.media.currentTime;
      item.practiceMs += 1200;
      lastSaved = now;
      saveLib();
      refreshSubtitle();
    }
  }
  function refreshSubtitle() {
    const item = itemById(S.currentId);
    const mins = item ? Math.round((item.practiceMs || 0) / 60000) : 0;
    $('mediaSubtitle').textContent = t('practiced', { n: mins });
  }

  function updateTimeline() {
    if (!S.media || !S.duration) {
      $('curTime').textContent = '0:00'; $('durTime').textContent = '0:00';
      $('played').style.width = '0%'; $('thumb').style.left = '0%';
      return;
    }
    const t = S.media.currentTime;
    const pct = clamp(t / S.duration * 100, 0, 100);
    $('curTime').textContent = fmt(t);
    $('durTime').textContent = fmt(S.duration);
    $('played').style.width = pct + '%';
    $('thumb').style.left = pct + '%';
  }

  /* ================= A-B 复读 ================= */
  function clearLoop(announce) {
    S.A = S.B = 0;
    S.aSet = S.bSet = false;
    S.loopOn = false;
    S.passes = 0;
    S.recPending = false;
    if (S.waitTimer) { clearInterval(S.waitTimer); S.waitTimer = null; }
    stopAnyCompare(true);
    renderAB();
    if (announce) toast('循环已取消');
  }

  function loopKey() {
    if (!S.media) { toast(t('needFile')); return; }
    const now = r3(S.media.currentTime);
    if (!S.aSet) {
      S.A = now; S.aSet = true;
      if (S.bSet && S.B <= S.A) S.bSet = false;
    } else if (!S.bSet) {
      if (now <= S.A + 0.01) { toast('终点需晚于起点'); return; }
      S.B = now; S.bSet = true; S.loopOn = true; S.passes = 0;
    } else {
      clearLoop(false);
    }
    renderAB();
  }

  function nudge(which, dir) {
    if (!S.media) return;
    if (which === 'A' && S.aSet) {
      S.A = r3(clamp(S.A + dir * 0.1, 0, S.bSet ? S.B - 0.1 : S.duration));
    } else if (which === 'B' && S.bSet) {
      S.B = r3(clamp(S.B + dir * 0.1, S.aSet ? S.A + 0.1 : 0, S.duration));
    } else return;
    renderAB();
  }

  function renderAB() {
    $('timeA').textContent = S.aSet ? fmt(S.A, true) : t('setStart');
    $('timeB').textContent = S.bSet ? fmt(S.B, true) : t('setEnd');
    $('cardA').classList.toggle('setting', !S.aSet);
    $('cardB').classList.toggle('setting', !S.bSet);
    $('cardA').classList.toggle('active', S.aSet);
    $('cardB').classList.toggle('active', S.bSet);
    $('abLink').classList.toggle('on', S.aSet && S.bSet);
    $('loopToggle').classList.toggle('on', S.loopOn);
    const active = S.aSet && S.bSet;
    $('abInfo').textContent = active
      ? '第 ' + (S.passes + 1) + ' 遍 · ' + (S.B - S.A).toFixed(1) + ' 秒'
      : '';
    const helpKey = active ? 'abHelpSet' : 'abHelp';
    $('abHelp').innerHTML = t(helpKey);
  }

  function checkLoop() {
    // 准备录音 / 对比播放期间由各自的监测器控制进度，避免循环回跳打断
    if (S.recPending || S.comparing) return;
    if (!S.media || !S.loopOn || !(S.aSet && S.bSet)) return;
    const now = S.media.currentTime;
    if (now >= S.B - 0.02 || (now < S.A - 0.05 && !pref('autoLoop', '1')) ) {
      S.passes++;
      renderAB();
      if (S.pauseEvery > 0 && S.passes % S.pauseEvery === 0) {
        pause();
      } else if (pref('autoLoop', '1') === '1') {
        seek(S.A);
      } else {
        pause();
      }
    }
  }

  /* ================= 跟读录音 ================= */
  const REC_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return undefined;
    return REC_TYPES.find(x => MediaRecorder.isTypeSupported(x)) || undefined;
  }

  // 边听边说/配音录音时压低媒体原音，减少扬声器声音被麦克风二次录入（声学回声）
  function duckMediaForRecording() {
    if (S.recShadowVol !== null) return;
    if (!S.media) return;
    S.recShadowVol = S.media.volume;
    const duck = pref('origDuck', '0') === '1';
    S.media.volume = Math.min(S.media.volume, duck ? 0.18 : 0.4);
  }
  function restoreMediaVolume() {
    if (S.recShadowVol === null) return;
    if (S.media) S.media.volume = S.recShadowVol;
    S.recShadowVol = null;
  }

  function resetRecorder() {
    if (S.recTimer) clearTimeout(S.recTimer);
    if (S.recTick) clearTimeout(S.recTick);
    if (S.waitTimer) clearInterval(S.waitTimer);
    S.recTimer = null; S.recTick = null; S.waitTimer = null;
    S.recPending = false; S.recorder = null; S.recChunks = [];
    $('recOnce').classList.remove('recording');
    $('recOnce').classList.add('btn-rec');
    $('recCont').classList.remove('recording');
    $('recOnce').querySelector('span:last-child').textContent = t('recOnce');
    $('recCont').querySelector('span').textContent = t('recCont');
    $('recProgress').hidden = true;
    $('recProgressBar').style.width = '0%';
  }

  async function requestMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('当前环境无法使用麦克风，请用 localhost 或 https 打开页面');
      return null;
    }
    if (!window.MediaRecorder) { toast('当前浏览器不支持录音'); return null; }
    let settled = false;
    const ask = navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true }
    }).then(stream => {
      if (settled) { stream.getTracks().forEach(x => x.stop()); return null; }
      settled = true;
      return stream;
    });
    const timeout = new Promise(resolve => setTimeout(() => { settled = true; resolve(null); }, 8000));
    try {
      const stream = await Promise.race([ask, timeout]);
      if (!stream) { toast('麦克风请求超时：请检查浏览器权限，或换一个浏览器重试'); return null; }
      return stream;
    } catch (e) {
      const name = e && e.name;
      toast(name === 'NotFoundError' ? '没有找到麦克风设备'
        : name === 'NotAllowedError' ? '麦克风权限被拒绝，请在浏览器地址栏允许后重试'
        : t('micDenied'));
      return null;
    }
  }

  function attachMicMeter(stream) {
    S.micPeak = 0; S.micMeter = null; S.micMeterData = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!S.audioCtx) S.audioCtx = new AC();
      const src = S.audioCtx.createMediaStreamSource(stream);
      const an = S.audioCtx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      S.micMeter = an;
      S.micMeterData = new Uint8Array(an.fftSize);
    } catch (e) { /* 检测不可用时保持中性提示，不误报 */ }
  }

  function sampleMicPeak() {
    if (!S.micMeter || !S.micMeterData) return;
    S.micMeter.getByteTimeDomainData(S.micMeterData);
    for (let i = 0; i < S.micMeterData.length; i++) {
      const v = Math.abs(S.micMeterData[i] - 128);
      if (v > S.micPeak) S.micPeak = v;
    }
  }

  function prepareMix(stream) {
    const boost = pref('voiceBoost', '0') === '1';
    const duck = pref('origDuck', '0') === '1';
    const isDub = S.recMode === 'dub' && !!S.media;
    if (!boost && !isDub) return stream;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return stream;
      if (!S.audioCtx) S.audioCtx = new AC();
      if (S.audioCtx.state === 'suspended') S.audioCtx.resume();

      S.micNode = S.audioCtx.createMediaStreamSource(stream);
      let micOut = S.micNode;
      if (boost) {
        // 直接音量增强：单个 GainNode 放大录音音量，不做滤波/限幅等额外处理。
        // 增益取温和值，避免幅度过大在编码时削波产生滋滋声。
        S.micGain = S.audioCtx.createGain();
        S.micGain.gain.value = 1.5;
        S.micNode.connect(S.micGain);
        micOut = S.micGain;
      }

      if (isDub) {
        if (!S.mediaSrc) {
          S.mediaSrc = S.audioCtx.createMediaElementSource(S.media);
          S.mediaSrc.connect(S.audioCtx.destination);
        }
        S.mixDest = S.audioCtx.createMediaStreamDestination();
        if (duck) {
          S.mediaGain = S.audioCtx.createGain();
          S.mediaGain.gain.value = 0.35;
          S.mediaSrc.connect(S.mediaGain);
          S.mediaGain.connect(S.mixDest);
        } else {
          S.mediaSrc.connect(S.mixDest);
        }
        micOut.connect(S.mixDest);
        return S.mixDest.stream;
      }

      // 非配音 + 音量增强：输出只含放大后的人声流
      S.mixDest = S.audioCtx.createMediaStreamDestination();
      micOut.connect(S.mixDest);
      return S.mixDest.stream;
    } catch (e) {
      if (S.mixDest && S.mediaSrc) { try { S.mediaSrc.disconnect(S.mixDest); } catch (_) {} }
      S.mixDest = null; S.micNode = null; S.micGain = null; S.mediaGain = null;
      return stream;
    }
  }

  function cleanupRecStream() {
    if (S.mixDest && S.mediaSrc) { try { S.mediaSrc.disconnect(S.mixDest); } catch (e) {} }
    if (S.micNode) { try { S.micNode.disconnect(); } catch (e) {} }
    if (S.micGain) { try { S.micGain.disconnect(); } catch (e) {} }
    if (S.mediaGain) { try { S.mediaGain.disconnect(); } catch (e) {} }
    if (S.micMeter) { try { S.micMeter.disconnect(); } catch (e) {} }
    S.mixDest = null; S.micNode = null; S.micGain = null; S.mediaGain = null;
    S.micMeter = null; S.micMeterData = null;
    if (S.recStream) { S.recStream.getTracks().forEach(x => x.stop()); S.recStream = null; }
  }

  function fallbackDuration(entry) {
    const a = new Audio();
    a.preload = 'metadata';
    a.onloadedmetadata = () => {
      if (isFinite(a.duration) && a.duration > 0) { entry.dur = a.duration; renderRecordings(); return; }
      a.currentTime = 1e101;
      a.ontimeupdate = () => { a.ontimeupdate = null; entry.dur = a.currentTime || 0; renderRecordings(); };
    };
    a.src = entry.url;
  }

  function probeDuration(blob, entry) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && blob.arrayBuffer) {
      let ctx;
      try {
        ctx = new AC();
        blob.arrayBuffer().then(ab => ctx.decodeAudioData(ab))
          .then(decoded => { entry.dur = decoded.duration || 0; ctx.close(); renderRecordings(); })
          .catch(() => { ctx.close(); fallbackDuration(entry); });
        return;
      } catch (e) { try { ctx && ctx.close(); } catch (_) {} }
    }
    fallbackDuration(entry);
  }

  function buildRecorder(stream) {
    const mime = pickMime();
    let rec;
    try { rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
    catch (e) { toast('当前浏览器不支持该录音格式'); return null; }
    S.recChunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) S.recChunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(S.recChunks, { type: rec.mimeType || mime || 'audio/webm' });
      if (blob.size > 0) {
        const entry = { url: URL.createObjectURL(blob), at: Date.now(), mode: S.recMode, dur: 0 };
        S.recordings.unshift(entry);
        probeDuration(blob, entry);
        $('recStatus').textContent = t('recordingDone');
      } else {
        $('recStatus').textContent = '没有录到声音，请检查麦克风';
      }
      // 仅在确实检测到静音时才显示红色警告；检测到人声时保持中性提示
      const warn = $('recWarn');
      if (S.micMeter && S.micPeak < 3) {
        warn.textContent = t('micWarn');
        warn.classList.add('error');
      } else {
        warn.textContent = S.recMode === 'listen-speak' ? t('headphoneHint') : t('micHint');
        warn.classList.remove('error');
      }
      restoreMediaVolume();
      resetRecorder();
      cleanupRecStream();
      renderRecordings();
    };
    S.recorder = rec;
    return rec;
  }

  function startRecTick(targetMs) {
    if (S.recTick) clearTimeout(S.recTick);
    S.recStartAt = performance.now();
    S.recTargetMs = targetMs || 0;
    $('recProgress').hidden = false;
    const tick = () => {
      if (!S.recorder || S.recorder.state !== 'recording') return;
      sampleMicPeak();
      const el = performance.now() - S.recStartAt;
      const pct = S.recTargetMs ? clamp(el / S.recTargetMs * 100, 0, 100) : (el % 5000) / 50;
      $('recProgressBar').style.width = pct + '%';
      const cur = fmt(el / 1000, true);
      $('recProgressText').textContent = cur + (S.recTargetMs ? ' / ' + fmt(S.recTargetMs / 1000, true) : '');
      $('recStatus').textContent = S.recTargetMs
        ? t('recordingTo', { cur, total: fmt(S.recTargetMs / 1000, true) })
        : t('recordingLive', { cur });
      S.recTick = setTimeout(tick, 100);
    };
    tick();
  }

  function startRecordingNow() {
    if (!S.recorder || S.recorder.state !== 'recording') {
      try { S.recorder.start(250); }
      catch (e) { toast('录音启动失败'); resetRecorder(); cleanupRecStream(); return; }
    }
    // 只有被点击的那个按钮进入“停止录音”状态，另一个保持可用
    const triggerBtn = S.recTrigger === 'cont' ? $('recCont') : $('recOnce');
    triggerBtn.classList.add('recording');
    if (triggerBtn === $('recOnce')) triggerBtn.classList.remove('btn-rec');
    triggerBtn.querySelector('span:last-child').textContent = t('recStop');
    startRecTick(S.recTargetMs);
    if (S.recTargetMs) S.recTimer = setTimeout(stopRecorder, S.recTargetMs + 120);
  }

  function stopRecorder() {
    if (S.recorder && S.recorder.state === 'recording') S.recorder.stop();
    else { restoreMediaVolume(); resetRecorder(); cleanupRecStream(); }
  }

  async function doRecord(once) {
    if (!S.media) { toast(t('needFile')); return; }
    if (S.recorder && S.recorder.state === 'recording') { stopRecorder(); return; }
    S.recTrigger = once ? 'once' : 'cont';
    stopAnyCompare(true);
    const hasAB = S.aSet && S.bSet && S.B > S.A;
    const targetSec = hasAB ? (S.B - S.A) : 5;
    S.recTargetMs = once ? Math.round(targetSec * 1000) : 0;

    // 先取得麦克风授权，再开始播放，避免权限弹窗导致错过 A-B 区间
    $('recStatus').textContent = t('recPreparing');
    const stream = await requestMic();
    if (!stream) { $('recStatus').textContent = ''; return; }
    S.recStream = stream;
    attachMicMeter(stream);
    const recStream = prepareMix(stream);
    if (!buildRecorder(recStream)) { restoreMediaVolume(); cleanupRecStream(); $('recStatus').textContent = ''; return; }
    if (!hasAB && once) toast(t('noLoopUseDefault'));

    if (S.recMode === 'listen-first' && once) {
      const startAt = hasAB ? S.A : Math.max(0, S.media.currentTime - targetSec);
      seek(startAt);
      play();
      $('recStatus').textContent = t('recWait');
      S.recPending = true;
      const endAt = hasAB ? S.B : startAt + targetSec;
      let waited = 0;
      // 独立计时监测终点，不依赖播放循环或 rAF
      S.waitTimer = setInterval(() => {
        waited += 50;
        const now = S.media ? S.media.currentTime : 0;
        if (now >= endAt - 0.03 || waited > targetSec * 2000 + 5000) {
          clearInterval(S.waitTimer); S.waitTimer = null;
          S.recPending = false;
          pause();
          startRecordingNow();
        }
      }, 50);
    } else {
      if (S.recMode !== 'listen-first') {
        // 边听边说/配音：媒体与录音同时进行，压低原音减少麦克风串音
        duckMediaForRecording();
        seek(hasAB ? S.A : S.media.currentTime); play();
      }
      startRecordingNow();
    }
  }

  function renderRecordings() {
    const box = $('recList');
    box.replaceChildren();
    if (!S.recordings.length) {
      const hint = document.createElement('p');
      hint.className = 'rec-empty';
      hint.textContent = t('recEmpty');
      box.appendChild(hint);
      return;
    }
    S.recordings.forEach((r, i) => {
      const item = document.createElement('div');
      const isSeq = S.compare && S.compare.rec === r && S.compare.mode === 'sequence';
      const isSim = S.compare && S.compare.rec === r && S.compare.mode === 'simul';
      item.className = 'rec-item' + ((isSeq || isSim) ? ' comparing' : '');

      const name = document.createElement('span');
      name.className = 'rec-name';
      name.textContent = t('recLen', { n: S.recordings.length - i });
      const audio = document.createElement('audio');
      audio.controls = true; audio.src = r.url; audio.preload = 'metadata';
      const len = document.createElement('span');
      len.className = 'rec-len';
      len.textContent = r.dur ? fmt(r.dur) : '--:--';

      const seq = document.createElement('button');
      seq.className = 'rec-cmp' + (isSeq ? ' on' : '');
      seq.textContent = isSeq ? t('stopCompare') : t('compare');
      seq.title = t('seqNote');
      seq.onclick = () => isSeq ? stopAnyCompare() : playCompare(r, 'sequence');

      const sim = document.createElement('button');
      sim.className = 'rec-cmp' + (isSim ? ' on' : '');
      sim.textContent = isSim ? t('stopCompare') : t('simul');
      sim.title = t('simulNote');
      sim.onclick = () => isSim ? stopAnyCompare() : playCompare(r, 'simul');

      const del = document.createElement('button');
      del.className = 'rec-del'; del.textContent = '×'; del.title = '删除';
      del.onclick = () => {
        if (S.compare && S.compare.rec === r) stopAnyCompare();
        URL.revokeObjectURL(r.url);
        S.recordings.splice(i, 1);
        renderRecordings();
      };
      item.append(name, audio, len, seq, sim, del);
      box.appendChild(item);
    });
  }

  function stopAnyCompare(silent) {
    const c = S.compare;
    if (!c) return;
    S.compare = null; S.comparing = false;
    if (c.waitTimer) clearInterval(c.waitTimer);
    if (c.audio) { c.audio.pause(); c.audio.onended = null; try { c.audio.currentTime = 0; } catch (e) {} }
    if (S.media) { S.media.volume = c.origVolume; pause(); }
    if (!silent) $('recStatus').textContent = '';
    renderRecordings();
  }

  function watchOrig(c, stopBoth) {
    if (c.waitTimer) clearInterval(c.waitTimer);
    c.waitTimer = setInterval(() => {
      if (S.compare !== c) { clearInterval(c.waitTimer); return; }
      const now = S.media ? S.media.currentTime : 0;
      if (now >= S.B - 0.03) {
        clearInterval(c.waitTimer); c.waitTimer = null;
        pause();
        if (stopBoth) { stopAnyCompare(); return; }
        c.phase = 'rec';
        $('recStatus').textContent = t('compareMine');
        try { c.audio.currentTime = 0; } catch (e) {}
        c.audio.play().catch(() => stopAnyCompare());
      }
    }, 50);
  }

  function playCompare(rec, mode) {
    if (!S.media) { toast(t('needFile')); return; }
    stopAnyCompare(true);
    if (!(S.aSet && S.bSet && S.B > S.A)) { toast(t('noCompare')); return; }
    if (S.recorder && S.recorder.state === 'recording') stopRecorder();
    const audio = new Audio(rec.url);
    const c = { rec, audio, mode, origVolume: S.media.volume, waitTimer: null, phase: 'orig' };
    S.compare = c; S.comparing = true;
    audio.onended = () => {
      if (mode === 'sequence' && S.compare === c && c.phase === 'rec') {
        c.phase = 'orig';
        $('recStatus').textContent = t('compareOrigin');
        seek(S.A); play(); watchOrig(c);
      }
    };
    if (mode === 'sequence') {
      $('recStatus').textContent = t('compareOrigin');
      seek(S.A); play(); watchOrig(c);
    } else {
      $('recStatus').textContent = t('compareSimul');
      const duck = pref('origDuck', '0') === '1';
      S.media.volume = Math.min(c.origVolume, duck ? 0.3 : 0.6);
      seek(S.A); play();
      audio.currentTime = 0;
      audio.play().catch(() => stopAnyCompare());
      watchOrig(c, true);
    }
    renderRecordings();
  }

  function onRecordMode(mode) {
    S.recMode = mode;
    document.querySelectorAll('.rec-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const warn = $('recWarn');
    warn.textContent = mode === 'listen-speak' ? t('headphoneHint') : t('micHint');
    warn.classList.remove('error');
  }

  /* ================= 快捷键 ================= */
  const DKEY = { Space: '空格', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
  function keyName(k) { return DKEY[k] || k; }
  function eventToKey(e) {
    const mods = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.altKey) mods.push('Alt');
    if (e.shiftKey) mods.push('Shift');
    if (e.metaKey) mods.push('Meta');
    let k = e.key;
    if (k === ' ') k = 'Space';
    if (k.length === 1) k = k.toUpperCase();
    return mods.concat(k).join('+');
  }
  function displayCombo(combo) { return combo.split('+').map(keyName).join('+'); }
  function validCombo(combo) {
    if (combo === 'Escape' || combo === '?' || combo === 'Shift+/' ) return false;
    const parts = combo.split('+');
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(parts[parts.length - 1])) return false;
    if (parts.includes('Meta')) return false;
    if (parts.includes('Ctrl') && !parts.includes('Alt')) return false;
    return true;
  }

  function renderShortcuts() {
    const box = $('shortcutList');
    box.replaceChildren();
    Object.keys(DEFAULT_KEYS).forEach(action => {
      const row = document.createElement('div');
      row.className = 'key-row';
      const label = document.createElement('span');
      label.textContent = t('key_' + action);
      const cap = document.createElement('button');
      cap.className = 'key-cap';
      cap.textContent = displayCombo(KEYS[action]);
      cap.dataset.action = action;
      cap.onclick = () => {
        if (S.capturing) return;
        S.capturing = action;
        document.querySelectorAll('.key-cap').forEach(c => c.classList.remove('listening'));
        cap.classList.add('listening');
        cap.textContent = t('pressKey');
      };
      row.append(label, cap);
      box.appendChild(row);
    });
  }

  function endCapture() {
    S.capturing = null;
    document.querySelectorAll('.key-cap').forEach(c => c.classList.remove('listening'));
    renderShortcuts();
  }

  function handleGlobalKey(e) {
    if (S.capturing) {
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Escape') { endCapture(); return; }
      const combo = eventToKey(e);
      if (!validCombo(combo)) { toast(t('reservedKey')); return; }
      const other = Object.keys(KEYS).find(k => k !== S.capturing && KEYS[k] === combo);
      if (other) KEYS[other] = KEYS[S.capturing];
      KEYS[S.capturing] = combo;
      saveKeys(); endCapture();
      return;
    }
    if (!$('settingsModal').hidden) {
      if (e.key === 'Escape') $('settingsModal').hidden = true;
      return;
    }
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'select', 'textarea', 'button'].includes(tag)) return;
    const combo = eventToKey(e);
    const action = Object.keys(KEYS).find(k => KEYS[k] === combo);
    if (!action) return;
    e.preventDefault();
    const skip = Number(pref('skip', 5)) || 5;
    switch (action) {
      case 'playPause': togglePlay(); break;
      case 'backward': seek(S.media ? S.media.currentTime - skip : 0); break;
      case 'forward': seek(S.media ? S.media.currentTime + skip : 0); break;
      case 'prevFile': stepFile(-1); break;
      case 'nextFile': stepFile(1); break;
      case 'slower': changeSpeed(-0.25); break;
      case 'faster': changeSpeed(0.25); break;
      case 'shuffle': S.shuffle = !S.shuffle; toast(S.shuffle ? '随机播放' : '顺序播放'); break;
      case 'videoMode': cycleVideoMode(); break;
      case 'abLoop': loopKey(); break;
      case 'shadowPause': S.pauseEvery = S.pauseEvery ? 0 : 1; renderPauseMenu(); break;
      case 'subtitle': S.subtitle = !S.subtitle; $('stage').classList.toggle('no-sub', !S.subtitle); break;
      case 'translation': toast('译文：显示 → 模糊 → 不显示'); break;
      case 'sentenceBook': toast('已加入句子本'); break;
      case 'record': doRecord(true); break;
      case 'nudgeStart': nudge('A', -1); break;
      case 'nudgeEnd': nudge('B', 1); break;
    }
  }

  function stepFile(dir) {
    if (LIB.length < 2) return;
    let i = LIB.findIndex(x => x.id === S.currentId);
    i = S.shuffle ? Math.floor(Math.random() * LIB.length) : (i + dir + LIB.length) % LIB.length;
    openById(LIB[i].id);
  }
  function changeSpeed(d) {
    if (!S.media) return;
    const v = clamp(Math.round((S.media.playbackRate + d) * 100) / 100, 0.25, 2);
    S.media.playbackRate = v;
    savePref('speed', v);
    $('speedLabel').textContent = v.toFixed(1) + '×';
  }
  function cycleVideoMode() {
    const names = ['top', 'side', 'theater'];
    const i = (names.indexOf(S.videoMode || 'top') + 1) % 3;
    S.videoMode = names[i];
    $('appShell').dataset.videoMode = S.videoMode;
    toast('视频布局：' + ({ top: '画面在上', side: '并排', theater: '影院' })[S.videoMode]);
  }

  /* ================= 菜单与设置 ================= */
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  function renderSpeedMenu() {
    const menu = $('speedMenu');
    menu.replaceChildren();
    SPEEDS.forEach(v => {
      const b = document.createElement('button');
      b.textContent = v.toFixed(1) + '×';
      const cur = S.media ? S.media.playbackRate : Number(pref('speed', 1));
      b.className = Math.abs(cur - v) < 0.01 ? 'sel' : '';
      b.onclick = () => {
        if (S.media) { S.media.playbackRate = v; savePref('speed', v); }
        $('speedLabel').textContent = v.toFixed(1) + '×';
        menu.hidden = true;
        renderSpeedMenu();
      };
      menu.appendChild(b);
    });
  }
  const PAUSE_MODES = [[0, 'pauseOff'], [1, 'pauseEach1'], [2, 'pauseEach2']];
  function renderPauseMenu() {
    const menu = $('pauseEachMenu');
    menu.replaceChildren();
    PAUSE_MODES.forEach(([v, key]) => {
      const b = document.createElement('button');
      b.textContent = t(key);
      b.className = S.pauseEvery === v ? 'sel' : '';
      b.onclick = () => {
        S.pauseEvery = v;
        $('pauseEachLabel').textContent = v === 0 ? t('pauseOff') : (v === 1 ? t('pauseEach1') : t('pauseEach2'));
        menu.hidden = true; renderPauseMenu();
      };
      menu.appendChild(b);
    });
    $('pauseEachLabel').textContent = S.pauseEvery === 0 ? t('pauseOff')
      : (S.pauseEvery === 1 ? t('pauseEach1') : t('pauseEach2'));
  }

  function applyI18n() {
    document.documentElement.lang = langNow() === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (['timeA', 'timeB', 'pauseEachLabel'].includes(el.id)) return;
      const val = t(k);
      if (val !== k) el.textContent = val;
    });
    renderAB();
    renderShortcuts();
    renderPauseMenu();
    renderRecordings();
    $('recWarn').textContent = S.recMode === 'listen-speak' ? t('headphoneHint') : t('micHint');
    $('recWarn').classList.remove('error');
    $('resetKeys').textContent = t('resetKeys');
    refreshSubtitle();
  }

  function demoFile() {
    const sr = 16000, sec = 30, n = sr * sec;
    const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const put = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    put(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); put(8, 'WAVE'); put(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true);
    v.setUint16(34, 16, true); put(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const seg = Math.floor(i / sr / 3) % 4;
      const freq = [392, 523, 440, 587][seg];
      const env = Math.min(1, (i % (sr * 3)) / sr / 0.1, (sr * 3 - (i % (sr * 3))) / sr / 0.15);
      v.setInt16(44 + i * 2, Math.sin(i / sr * freq * 2 * Math.PI) * 6000 * Math.max(0, env), true);
    }
    return new File([buf], '示例练习.wav', { type: 'audio/wav', lastModified: Date.now() });
  }

  /* ================= 事件绑定 ================= */
  function bind() {
    $('addBtn').onclick = () => $('fileInput').click();
    $('fileInput').onchange = e => { addFiles(e.target.files); e.target.value = ''; };
    $('panelToggleBtn').onclick = () => $('appShell').classList.add('collapsed');
    $('expandSideBtn').onclick = () => $('appShell').classList.remove('collapsed');
    $('refreshBtn').onclick = () => { renderFileList(); renderSpeedMenu(); toast('已刷新'); };
    $('playBtn').onclick = togglePlay;
    $('rewBtn').onclick = () => seek(S.media ? S.media.currentTime - (Number(pref('skip', 5)) || 5) : 0);
    $('ffBtn').onclick = () => seek(S.media ? S.media.currentTime + (Number(pref('skip', 5)) || 5) : 0);
    $('prevBtn').onclick = () => stepFile(-1);
    $('nextBtn').onclick = () => stepFile(1);
    $('loopToggleWrap').onclick = () => {
      if (!S.media) { toast(t('needFile')); return; }
      if (S.loopOn) clearLoop(false); else if (!S.aSet) loopKey(); else if (!S.bSet) loopKey();
    };
    document.querySelectorAll('.nudge').forEach(b => {
      b.onclick = () => nudge(b.dataset.nudge, Number(b.dataset.dir));
    });
    $('micBtn').onclick = () => { $('recordPanel').hidden = !$('recordPanel').hidden; onRecordMode(S.recMode); };
    $('recClose').onclick = () => { $('recordPanel').hidden = true; };
    document.querySelectorAll('.rec-tab').forEach(b => b.onclick = () => onRecordMode(b.dataset.mode));
    $('recOnce').onclick = () => doRecord(true);
    $('recCont').onclick = () => doRecord(false);

    let dragging = false;
    $('timeline').addEventListener('pointerdown', e => {
      if (!S.duration) return;
      dragging = true;
      $('timeline').setPointerCapture(e.pointerId);
      const r = $('timeline').getBoundingClientRect();
      seek((e.clientX - r.left) / r.width * S.duration);
    });
    $('timeline').addEventListener('pointermove', e => {
      if (!dragging) return;
      const r = $('timeline').getBoundingClientRect();
      seek((e.clientX - r.left) / r.width * S.duration);
    });
    const stopDrag = e => {
      if (!dragging) return;
      dragging = false;
      try { $('timeline').releasePointerCapture(e.pointerId); } catch (err) {}
    };
    $('timeline').addEventListener('pointerup', stopDrag);
    $('timeline').addEventListener('pointercancel', stopDrag);

    $('speedBtn').onclick = e => { e.stopPropagation(); renderSpeedMenu(); $('speedMenu').hidden = !$('speedMenu').hidden; };
    $('pauseEachBtn').onclick = e => { e.stopPropagation(); renderPauseMenu(); $('pauseEachMenu').hidden = !$('pauseEachMenu').hidden; };
    document.addEventListener('click', e => {
      if (!e.target.closest('.menu-anchor')) {
        $('speedMenu').hidden = true; $('pauseEachMenu').hidden = true;
      }
    });

    $('settingsBtn').onclick = () => {
      $('settingsModal').hidden = false;
      $('skipSec').value = pref('skip', 5);
      $('defaultSpeed').value = String(pref('speed', 1));
      $('autoLoopOn').checked = pref('autoLoop', '1') === '1';
      $('voiceBoostOn').checked = pref('voiceBoost', '0') === '1';
      $('origDuckOn').checked = pref('origDuck', '0') === '1';
      renderShortcuts();
    };
    $('settingsClose').onclick = () => { $('settingsModal').hidden = true; endCapture(); };
    $('resetKeys').onclick = () => { KEYS = Object.assign({}, DEFAULT_KEYS); saveKeys(); renderShortcuts(); toast('已恢复默认快捷键'); };
    $('skipSec').onchange = e => savePref('skip', clamp(Number(e.target.value) || 5, 1, 30));
    $('defaultSpeed').onchange = e => {
      const v = Number(e.target.value); savePref('speed', v);
      if (S.media) S.media.playbackRate = v;
      $('speedLabel').textContent = v.toFixed(1) + '×';
      renderSpeedMenu();
    };
    $('autoLoopOn').onchange = e => savePref('autoLoop', e.target.checked ? '1' : '0');
    $('voiceBoostOn').onchange = e => savePref('voiceBoost', e.target.checked ? '1' : '0');
    $('origDuckOn').onchange = e => savePref('origDuck', e.target.checked ? '1' : '0');
    document.querySelectorAll('#langSeg button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('#langSeg button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        LANG = b.dataset.lang;
        savePref('lang', LANG);
        applyI18n();
      };
    });
    $('subtitleBtn').onclick = () => { S.subtitle = !S.subtitle; toast(S.subtitle ? '字幕已显示' : '字幕已隐藏'); };
    $('demoBtn').onclick = async () => {
      $('settingsModal').hidden = true;
      await addFiles([demoFile()]);
      toast('示例练习已载入，按 L 设 A、再按 L 设 B');
    };

    document.addEventListener('keydown', handleGlobalKey);

    document.addEventListener('dragover', e => { e.preventDefault(); document.body.classList.add('dragging'); });
    document.addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('dragging'); });
    document.addEventListener('drop', e => {
      e.preventDefault(); document.body.classList.remove('dragging');
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });
  }

  /* ================= 启动 ================= */
  async function init() {
    LANG = pref('lang', 'zh');
    if (!['zh', 'en', 'system'].includes(LANG)) LANG = 'zh';
    document.querySelectorAll('#langSeg button').forEach(b => b.classList.toggle('active', b.dataset.lang === LANG));
    await openDB();
    bind();
    applyI18n();
    renderFileList();
    renderSpeedMenu();
    renderRecordings();
    updateTimeline();
    const last = pref('lastId', '');
    if (last && itemById(last)) openById(last);
    // 记住当前文件
    window.addEventListener('beforeunload', () => savePref('lastId', S.currentId || ''));
  }
  init();
})();
