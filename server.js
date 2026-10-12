const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fetchLotteryByRegion } = require('./scraper');
const { checkTicket } = require('./checker');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình lưu trữ tích lũy
const MAX_HISTORY_DAYS = 30; // Lưu tối đa 30 ngày (1 tháng)
const isVercel = process.env.VERCEL === '1';
const CACHE_FILE = isVercel ? path.join(os.tmpdir(), 'lottery_cache.json') : path.join(__dirname, 'lottery_cache.json');

const cache = {
  mb: { data: { region: 'mb', regionName: 'Miền Bắc', days: [] }, lastFetch: 0 },
  mn: { data: { region: 'mn', regionName: 'Miền Nam', days: [] }, lastFetch: 0 },
  mt: { data: { region: 'mt', regionName: 'Miền Trung', days: [] }, lastFetch: 0 }
};

// Khôi phục dữ liệu lịch sử từ file nếu có
try {
  if (fs.existsSync(CACHE_FILE)) {
    const saved = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    if (saved.mb) cache.mb.data = saved.mb;
    if (saved.mn) cache.mn.data = saved.mn;
    if (saved.mt) cache.mt.data = saved.mt;
    console.log(`Đã nạp lịch sử từ bộ nhớ: MB (${cache.mb.data.days?.length || 0} ngày), MN (${cache.mn.data.days?.length || 0} ngày), MT (${cache.mt.data.days?.length || 0} ngày)`);
  }
} catch (e) {
  console.log('Không thể đọc file cache:', e.message);
}

function saveCacheToFile() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      mb: cache.mb.data,
      mn: cache.mn.data,
      mt: cache.mt.data,
      savedAt: new Date().toISOString()
    }, null, 2));
  } catch (e) {
    console.error('Lỗi lưu cache:', e.message);
  }
}

/**
 * Hợp nhất (merge) dữ liệu mới vào lịch sử cũ mà không làm mất các ngày trước đó
 */
function mergeLotteryDays(existingDays = [], incomingDays = [], maxDays = MAX_HISTORY_DAYS) {
  const map = new Map();

  // 1. Nạp dữ liệu mới nhất trước
  incomingDays.forEach(d => {
    if (d && d.date) {
      map.set(d.date, d);
    }
  });

  // 2. Nạp tiếp các ngày cũ trong lịch sử nếu chưa có trong danh sách mới
  existingDays.forEach(d => {
    if (d && d.date && !map.has(d.date)) {
      map.set(d.date, d);
    }
  });

  // 3. Giữ tối đa maxDays gần nhất
  return Array.from(map.values()).slice(0, maxDays);
}

// Hàm lấy dữ liệu có tích lũy lịch sử
async function getLotteryData(region, forceRefresh = false) {
  const reg = region.toLowerCase();
  const now = Date.now();
  
  // TTL bình thường là 3 phút
  const CACHE_TTL_MS = 3 * 60 * 1000;
  
  if (!forceRefresh && cache[reg]?.data?.days?.length > 0 && (now - cache[reg].lastFetch < CACHE_TTL_MS)) {
    return cache[reg].data;
  }

  try {
    const fresh = await fetchLotteryByRegion(reg);
    const existingDays = cache[reg]?.data?.days || [];
    const mergedDays = mergeLotteryDays(existingDays, fresh.days, MAX_HISTORY_DAYS);

    cache[reg].data = {
      ...fresh,
      days: mergedDays
    };
    cache[reg].lastFetch = now;
    saveCacheToFile();
    return cache[reg].data;

  } catch (err) {
    console.error(`Lỗi fetch dữ liệu miền ${reg}:`, err.message);
    if (cache[reg]?.data?.days?.length > 0) {
      return cache[reg].data; // trả về cache cũ nếu mạng chập chờn
    }
    throw err;
  }
}

// Background Cron Job: Tự động chạy ngầm cập nhật kết quả khi đến giờ mở thưởng
// Miền Nam: 16:15 - 16:45
// Miền Trung: 17:15 - 17:45
// Miền Bắc: 18:15 - 18:45
setInterval(async () => {
  try {
    const vnTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const hour = vnTime.getHours();
    const minute = vnTime.getMinutes();

    // Nếu đang trong khung giờ quay thưởng (16h00 đến 19h00) -> cập nhật liên tục mỗi 2 phút
    if (hour >= 16 && hour <= 19) {
      if (hour === 16 && minute >= 15) await getLotteryData('mn', true);
      if (hour === 17 && minute >= 15) await getLotteryData('mt', true);
      if (hour === 18 && minute >= 15) await getLotteryData('mb', true);
    }
  } catch (e) {
    // lỗi ngầm không làm gián đoạn server
  }
}, 2 * 60 * 1000); // 2 phút 1 lần

// API: Lấy kết quả xổ số theo miền
app.get('/api/lottery', async (req, res) => {
  try {
    const region = req.query.region || 'mb';
    const refresh = req.query.refresh === 'true';
    if (!['mb', 'mn', 'mt'].includes(region.toLowerCase())) {
      return res.status(400).json({ error: 'Miền không hợp lệ. Chọn mb, mn hoặc mt.' });
    }
    const data = await getLotteryData(region, refresh);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải kết quả lúc này: ' + err.message });
  }
});

// API: Dò vé số tự động
app.post('/api/check-ticket', async (req, res) => {
  try {
    const { ticketNumber, region = 'mn', date, province } = req.body;
    if (!ticketNumber) {
      return res.status(400).json({ error: 'Vui lòng nhập số vé số!' });
    }

    const reg = region.toLowerCase();
    const data = await getLotteryData(reg);
    if (!data || !data.days || data.days.length === 0) {
      return res.status(404).json({ error: 'Chưa có dữ liệu kết quả để dò!' });
    }

    // Tìm theo ngày (nếu không chọn ngày thì lấy ngày mới nhất)
    let selectedDay = data.days[0];
    if (date) {
      const found = data.days.find(d => d.date === date || d.date.includes(date));
      if (found) selectedDay = found;
    }

    // Tự động đối chiếu vé với TẤT CẢ các đài trong ngày mở thưởng
    const winningStations = [];
    const allStationsNames = selectedDay.provinces.map(p => p.province);

    selectedDay.provinces.forEach(prov => {
      // Nếu có chỉ định 1 đài cụ thể thì chỉ so đài đó, ngược lại so khớp tất cả các đài
      if (province && province !== 'all') {
        const query = province.toLowerCase();
        const isMatch = prov.province.toLowerCase().includes(query) || 
                        (prov.rawProvince && prov.rawProvince.toLowerCase().includes(query));
        if (!isMatch) return;
      }

      const res = checkTicket(ticketNumber, prov.prizes, reg);
      if (res.isWinner && res.prizesWon.length > 0) {
        winningStations.push({
          province: prov.province,
          prizesWon: res.prizesWon
        });
      }
    });

    res.json({
      ticketNumber,
      date: selectedDay.date,
      dayOfWeek: selectedDay.dayOfWeek,
      checkedProvince: province && province !== 'all' ? province : 'Tất cả các đài',
      isWinner: winningStations.length > 0,
      winningStations,
      allStations: allStationsNames
    });

  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi dò vé: ' + err.message });
  }
});

// API: Lịch quay số và trạng thái hôm nay
app.get('/api/schedule', (req, res) => {
  res.json({
    schedules: [
      {
        region: 'mn',
        name: 'Miền Nam',
        drawTime: '16:15 - 16:35 hàng ngày',
        info: '3 hoặc 4 đài luân phiên mỗi ngày (TP.HCM, Cần Thơ, Tây Ninh, Tiền Giang, Kiên Giang...)'
      },
      {
        region: 'mt',
        name: 'Miền Trung',
        drawTime: '17:15 - 17:35 hàng ngày',
        info: '2 hoặc 3 đài luân phiên mỗi ngày (Đà Nẵng, Khánh Hòa, Thừa Thiên Huế, Quảng Nam...)'
      },
      {
        region: 'mb',
        name: 'Miền Bắc',
        drawTime: '18:15 - 18:35 hàng ngày',
        info: 'Mở thưởng chung tại Cung Văn Hóa Hà Nội hoặc các tỉnh lân cận.'
      }
    ]
  });
});

// Lấy IP mạng Lan
app.get('/api/network-ip', (req, res) => {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  res.json({
    port: PORT,
    localIps: ips,
    recommendedUrl: ips.length > 0 ? `http://${ips[0]}:${PORT}` : `http://localhost:${PORT}`
  });
});

// Khởi chạy server khi chạy độc lập (Local)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  ỨNG DỤNG XỔ SỐ GIA ĐÌNH ĐANG CHẠY TẠI:`);
    console.log(`  - Máy tính: http://localhost:${PORT}`);
    
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`  - Điện thoại Android (cùng Wifi): http://${net.address}:${PORT}`);
        }
      }
    }
    console.log(`====================================================`);
  });
}

// Xuất app để Vercel Serverless có thể gọi trực tiếp
module.exports = app;
