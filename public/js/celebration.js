/**
 * Module Hiệu Ứng Chúc Mừng & Meme Hoành Tráng Theo Giá Trị Giải Thưởng
 */

// Các Meme SVG Vector nét căng, siêu nhẹ, hài hước và giàu cảm xúc
const CELEBRATION_MEMES = {
  // Cấp 4: ĐẠI ĐỘC ĐẮC (2 TỶ / 1 TỶ) - MÈO TỶ PHÚ ĐEO KÍNH NGẦU LÒI & TIỀN RƠI
  JACKPOT: `
    <svg viewBox="0 0 200 200" width="140" height="140" style="margin: 0 auto; display: block; filter: drop-shadow(0 8px 16px rgba(220,38,38,0.3));">
      <circle cx="100" cy="100" r="92" fill="#fef08a" stroke="#eab308" stroke-width="4"/>
      <!-- Vương miện vàng kim -->
      <polygon points="65,45 80,68 100,35 120,68 135,45 130,80 70,80" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
      <circle cx="65" cy="45" r="5" fill="#ef4444"/>
      <circle cx="100" cy="35" r="6" fill="#3b82f6"/>
      <circle cx="135" cy="45" r="5" fill="#10b981"/>
      <!-- Đầu mèo vàng may mắn -->
      <ellipse cx="100" cy="120" rx="60" ry="50" fill="#fbbf24"/>
      <!-- Tai mèo -->
      <polygon points="50,90 65,55 85,80" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
      <polygon points="150,90 135,55 115,80" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
      <polygon points="55,85 67,62 80,78" fill="#f43f5e"/>
      <polygon points="145,85 133,62 120,78" fill="#f43f5e"/>
      <!-- Kính râm đen siêu ngầu đại gia -->
      <rect x="52" y="102" width="42" height="26" rx="6" fill="#0f172a"/>
      <rect x="106" y="102" width="42" height="26" rx="6" fill="#0f172a"/>
      <line x1="94" y1="112" x2="106" y2="112" stroke="#0f172a" stroke-width="4"/>
      <line x1="56" y1="106" x2="72" y2="122" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <line x1="110" y1="106" x2="126" y2="122" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <!-- Miệng cười toe toét ngậm xì gà tiền -->
      <path d="M 85 142 Q 100 158 115 142" stroke="#78350f" stroke-width="3" fill="none"/>
      <!-- Xấp tiền đô la -->
      <rect x="110" y="138" width="45" height="24" rx="3" fill="#86efac" stroke="#15803d" stroke-width="2" transform="rotate(-15 110 138)"/>
      <circle cx="132" cy="150" r="6" fill="#15803d" opacity="0.4"/>
      <text x="132" y="154" font-size="11" font-weight="900" fill="#15803d" text-anchor="middle">$</text>
    </svg>
  `,

  // Cấp 3: GIẢI LỚN (10 - 50 TRIỆU) - CHÚNG TA NÂNG LY KHAO CẢ LÀNG
  BIG_WIN: `
    <svg viewBox="0 0 200 200" width="130" height="130" style="margin: 0 auto; display: block; filter: drop-shadow(0 6px 12px rgba(217,119,6,0.25));">
      <circle cx="100" cy="100" r="90" fill="#ffedd5" stroke="#f97316" stroke-width="4"/>
      <!-- Mặt cười sảng khoái nhắm mắt cười tít -->
      <ellipse cx="100" cy="105" rx="60" ry="55" fill="#fde047"/>
      <!-- Mắt cong hình chữ V cười tít -->
      <path d="M 65 95 Q 78 80 90 95" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 110 95 Q 122 80 135 95" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Má hồng phấn khởi -->
      <circle cx="62" cy="115" r="10" fill="#f43f5e" opacity="0.5"/>
      <circle cx="138" cy="115" r="10" fill="#f43f5e" opacity="0.5"/>
      <!-- Miệng cười mở to hết cỡ -->
      <path d="M 75 118 Q 100 160 125 118 Z" fill="#b91c1c"/>
      <path d="M 85 140 Q 100 130 115 140" fill="#f43f5e"/>
      <!-- 2 Ly sâm panh cụng nhau tóe bọt vàng -->
      <g transform="translate(130, 45) rotate(20)">
        <polygon points="10,10 25,10 20,35 15,35" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
        <line x1="17" y1="35" x2="17" y2="55" stroke="#b45309" stroke-width="2"/>
        <line x1="8" y1="55" x2="26" y2="55" stroke="#b45309" stroke-width="2"/>
      </g>
      <g transform="translate(45, 45) rotate(-20)">
        <polygon points="10,10 25,10 20,35 15,35" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
        <line x1="17" y1="35" x2="17" y2="55" stroke="#b45309" stroke-width="2"/>
        <line x1="8" y1="55" x2="26" y2="55" stroke="#b45309" stroke-width="2"/>
      </g>
      <!-- Tia sáng ăn mừng -->
      <circle cx="100" cy="50" r="4" fill="#f59e0b"/>
      <line x1="100" y1="35" x2="100" y2="42" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
      <line x1="85" y1="42" x2="92" y2="47" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
      <line x1="115" y1="42" x2="108" y2="47" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,

  // Cấp 2: GIẢI VỪA (1 - 3 TRIỆU) - MÈO LIKE VUI VẺ "HÔM NAY ĂN LẨU KHAO CẢ NHÀ"
  MEDIUM_WIN: `
    <svg viewBox="0 0 200 200" width="120" height="120" style="margin: 0 auto; display: block; filter: drop-shadow(0 4px 10px rgba(16,185,129,0.2));">
      <circle cx="100" cy="100" r="88" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
      <!-- Chú Mèo may mắn mập mạp -->
      <ellipse cx="100" cy="115" rx="52" ry="46" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Tai mèo -->
      <polygon points="56,88 68,58 86,80" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="144,88 132,58 114,80" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="62,84 70,66 82,78" fill="#fda4af"/>
      <polygon points="138,84 130,66 118,78" fill="#fda4af"/>
      <!-- Mắt long lanh hình ngôi sao -->
      <ellipse cx="78" cy="105" rx="8" ry="10" fill="#0f172a"/>
      <ellipse cx="122" cy="105" rx="8" ry="10" fill="#0f172a"/>
      <circle cx="75" cy="102" r="3" fill="#ffffff"/>
      <circle cx="119" cy="102" r="3" fill="#ffffff"/>
      <!-- Má hồng đào -->
      <circle cx="68" cy="118" r="8" fill="#f43f5e" opacity="0.35"/>
      <circle cx="132" cy="118" r="8" fill="#f43f5e" opacity="0.35"/>
      <!-- Mũi và miệng cười hình số 3 nằm ngang -->
      <polygon points="98,114 102,114 100,117" fill="#f43f5e"/>
      <path d="M 90 120 Q 95 125 100 121 Q 105 125 110 120" stroke="#475569" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Nồi lẩu thơm phức bốc khói -->
      <ellipse cx="100" cy="155" rx="36" ry="12" fill="#ea580c"/>
      <path d="M 85 145 Q 88 135 92 142" stroke="#94a3b8" stroke-width="2" fill="none"/>
      <path d="M 100 144 Q 103 132 107 141" stroke="#94a3b8" stroke-width="2" fill="none"/>
      <path d="M 112 146 Q 115 136 118 143" stroke="#94a3b8" stroke-width="2" fill="none"/>
    </svg>
  `,

  // Cấp 1: GIẢI NHỎ (40K - 400K) - CHÚNG TA CÓ TIỀN ĂN SÁNG & CÀ PHÊ
  SMALL_WIN: `
    <svg viewBox="0 0 200 200" width="115" height="115" style="margin: 0 auto; display: block; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.1));">
      <circle cx="100" cy="100" r="85" fill="#f0fdf4" stroke="#86efac" stroke-width="3"/>
      <!-- Mặt cười hài hước nháy mắt -->
      <circle cx="100" cy="100" r="55" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
      <!-- Mắt trái nháy (Wink) -->
      <path d="M 72 96 Q 82 86 92 96" stroke="#713f12" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Mắt phải mở to -->
      <circle cx="120" cy="94" r="7" fill="#713f12"/>
      <circle cx="118" cy="92" r="2.5" fill="#ffffff"/>
      <!-- Miệng cười tươi hé răng -->
      <path d="M 82 115 Q 100 135 118 115" stroke="#713f12" stroke-width="3" fill="#ffffff"/>
      <!-- Ly cà phê đá thơm ngon -->
      <g transform="translate(132, 110)">
        <rect x="0" y="8" width="22" height="30" rx="3" fill="#78350f" opacity="0.8"/>
        <rect x="0" y="4" width="22" height="6" rx="2" fill="#cbd5e1"/>
        <line x1="16" y1="0" x2="6" y2="20" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
      </g>
    </svg>
  `
};

/**
 * Xác định cấp độ trúng thưởng dựa trên danh sách giải trúng
 */
function determineCelebrationTier(winningStations = []) {
  let highestTier = 1; // 1: Nhỏ, 2: Vừa, 3: Lớn, 4: Độc Đắc

  winningStations.forEach(ws => {
    ws.prizesWon.forEach(p => {
      const prizeKey = String(p.prize).toUpperCase();
      if (prizeKey === 'ĐB') {
        highestTier = Math.max(highestTier, 4);
      } else if (prizeKey === 'PHU_DB' || prizeKey === '1' || prizeKey === '2') {
        highestTier = Math.max(highestTier, 3);
      } else if (['3', '4', '5'].includes(prizeKey)) {
        highestTier = Math.max(highestTier, 2);
      } else {
        highestTier = Math.max(highestTier, 1);
      }
    });
  });

  return highestTier;
}

/**
 * Phát âm thanh chúc mừng bằng Web Audio API theo cấp độ
 */
function playCelebrationSound(tier) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (tier === 4) {
      // ĐẠI KHÚC KHẢI HOÀN HOÀNH TRÁNG (Độc đắc 2 Tỷ đồng)
      const fanfare = [
        { f: 523.25, d: 0.15, t: 0 },
        { f: 659.25, d: 0.15, t: 0.15 },
        { f: 783.99, d: 0.15, t: 0.30 },
        { f: 1046.50, d: 0.40, t: 0.45 },
        { f: 880.00, d: 0.15, t: 0.90 },
        { f: 1046.50, d: 0.70, t: 1.05 }
      ];
      fanfare.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d);
      });
    } else if (tier === 3) {
      // GIẢI LỚN (10 - 50 Triệu) - Kèn chiến thắng
      const victory = [
        { f: 587.33, d: 0.2, t: 0 },
        { f: 739.99, d: 0.2, t: 0.2 },
        { f: 880.00, d: 0.5, t: 0.4 }
      ];
      victory.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d);
      });
    } else if (tier === 2) {
      // GIẢI VỪA (1 - 3 Triệu) - Tiếng tiền vàng rơi rủng rỉnh
      [659.25, 880, 1174.66].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    } else {
      // GIẢI NHỎ (100k - 200k) - Ting ting vui nhộn
      [523.25, 783.99].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.3);
      });
    }
  } catch (e) {
    // Không hỗ trợ âm thanh thì bỏ qua
  }
}

/**
 * Hiệu ứng Canvas Confetti & Pháo hoa tùy chỉnh siêu nhẹ
 */
let confettiAnimationId = null;

function launchCelebrationFX(tier) {
  // Dọn dẹp canvas cũ nếu có
  const oldCanvas = document.getElementById('celebrationCanvas');
  if (oldCanvas) oldCanvas.remove();
  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  const canvas = document.createElement('canvas');
  canvas.id = 'celebrationCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { once: true });

  // Khởi tạo các hạt
  const particles = [];
  const particleCount = tier === 4 ? 160 : (tier === 3 ? 110 : (tier === 2 ? 75 : 45));
  const colors = tier === 4
    ? ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#fbbf24', '#ffffff']
    : (tier === 3 
        ? ['#f59e0b', '#dc2626', '#fbbf24', '#f97316', '#ffffff']
        : ['#10b981', '#3b82f6', '#f59e0b', '#84cc16']);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * -1, // Rơi từ trên đỉnh màn hình
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      isCoin: tier >= 2 && Math.random() > 0.6 // Đồng tiền vàng
    });
  }

  let startTime = Date.now();
  const maxDuration = tier === 4 ? 7000 : 5000; // Thời gian chạy hiệu ứng

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > maxDuration) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.isCoin) {
        // Vẽ đồng tiền vàng xoay tròn
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Pháo giấy chữ nhật
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      }

      ctx.restore();

      // Hạt rơi quá đáy thì quay lại đỉnh nếu chưa hết giờ
      if (p.y > height && elapsed < maxDuration - 1500) {
        p.y = -20;
        p.x = Math.random() * width;
      }
    });

    confettiAnimationId = requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Trả về giao diện chúc mừng hoành tráng kèm Meme tương ứng
 */
function buildCelebrationHTML(result, tier) {
  let memeSVG = '';
  let headline = '';
  let subQuote = '';
  let cardClass = '';

  if (tier === 4) {
    // ĐỘC ĐẮC (2 TỶ / 1 TỶ)
    memeSVG = CELEBRATION_MEMES.JACKPOT;
    headline = '👑 ĐẠI ĐỘC ĐẮC! BÁC ĐÃ TRÚNG GIẢI ĐẶC BIỆT! 👑';
    subQuote = '🎉 CHÚC MỪNG TỶ PHÚ! ĐỔI ĐỜI RỒI BÁC ƠI! LỘC LÁ NGẬP TRÀN! 🎉';
    cardClass = 'celebration-tier-jackpot';
  } else if (tier === 3) {
    // GIẢI LỚN (10 - 50 TRIỆU)
    memeSVG = CELEBRATION_MEMES.BIG_WIN;
    headline = '🌟 LỘC LỚN VỀ NHÀ! CHÚC MỪNG TRÚNG GIẢI LỚN! 🌟';
    subQuote = '🥂 CẢ NHÀ NÂNG LY CHÚC MỪNG! HÔM NAY KHAO TO CẢ XÓM NHA BÁC!';
    cardClass = 'celebration-tier-big';
  } else if (tier === 2) {
    // GIẢI VỪA (1 - 3 TRIỆU)
    memeSVG = CELEBRATION_MEMES.MEDIUM_WIN;
    headline = '⭐ QUÁ ĐÃ! BÁC ĐÃ TRÚNG THƯỞNG RỒI! ⭐';
    subQuote = '🍲 LỘC VỀ RỒI! HÔM NAY ĐI ĂN LẨU KHAO CẢ NHÀ THÔI NÀO!';
    cardClass = 'celebration-tier-medium';
  } else {
    // GIẢI NHỎ (40K - 400K)
    memeSVG = CELEBRATION_MEMES.SMALL_WIN;
    headline = '🍀 CHÚC MỪNG! VÉ CỦA BÁC ĐÃ TRÚNG GIẢI! 🍀';
    subQuote = '☕ TUYỆT VỜI! CÓ TIỀN CÀ PHÊ ĂN SÁNG CẢ TUẦN RỒI NHA BÁC!';
    cardClass = 'celebration-tier-small';
  }

  // Danh sách các đài trúng
  let stationsHtml = '';
  result.winningStations.forEach(ws => {
    let prizesList = '';
    ws.prizesWon.forEach(p => {
      prizesList += `
        <div class="celebration-prize-item">
          <span class="prize-tag">${p.name}</span>
          <span class="prize-matched">Số trúng: <strong>${p.matchedNumber}</strong></span>
          <span class="prize-money">💰 Tiền thưởng: <strong>${p.reward}</strong></span>
        </div>
      `;
    });
    stationsHtml += `
      <div class="celebration-station-box">
        <div class="station-win-title">📍 Đài ${ws.province}</div>
        ${prizesList}
      </div>
    `;
  });

  return `
    <div class="celebration-card ${cardClass}">
      <div class="celebration-meme-wrap">
        ${memeSVG}
      </div>
      <div class="celebration-headline">${headline}</div>
      <div class="celebration-subquote">${subQuote}</div>
      <div class="celebration-ticket-info">
        Số vé của bác: <strong class="highlight-ticket-num">${result.ticketNumber}</strong> • Ngày mở thưởng: <strong>${result.date} (${result.dayOfWeek || ''})</strong>
      </div>
      <div class="celebration-stations-list">
        ${stationsHtml}
      </div>
      <div class="celebration-notice">
        📌 Bác nhớ giữ tờ vé số phẳng phiu, nguyên vẹn và mang đến đại lý gần nhất để nhận thưởng nhé!
      </div>
    </div>
  `;
}
