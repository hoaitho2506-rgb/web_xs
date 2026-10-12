const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Format date string to dd/mm/yyyy if needed
function normalizeDate(rawDate) {
  if (!rawDate) return '';
  const m = rawDate.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : new Date().getFullYear();
    return `${day}/${month}/${year}`;
  }
  return rawDate.trim();
}

/**
 * Phân tích RSS XSKT cho miền Bắc
 */
function parseMBItem(item) {
  const title = item.title || '';
  const desc = item.description || '';

  const dateMatch = title.match(/NGÀY\s*([0-9\/]+)(?:\s*\((.*?)\))?/i);
  const rawDate = dateMatch ? dateMatch[1] : '';
  const dayOfWeek = dateMatch && dateMatch[2] ? dateMatch[2].trim() : '';
  const date = normalizeDate(rawDate);

  const prizes = {
    'ĐB': [],
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': [],
    '7': []
  };

  const lines = desc.split('\n');
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    const match = cleanLine.match(/^(ĐB|[1-7]):\s*(.*)$/i);
    if (match) {
      const key = match[1].toUpperCase() === 'ĐB' ? 'ĐB' : match[1];
      const numbers = match[2]
        .split(/[-–]/)
        .map(n => n.trim().replace(/\D/g, ''))
        .filter(n => n.length > 0);
      if (prizes[key]) {
        prizes[key] = numbers;
      }
    }
  }

  return {
    date,
    dayOfWeek,
    provinces: [
      {
        province: 'Miền Bắc (Hà Nội & các đài)',
        prizes
      }
    ]
  };
}

/**
 * Phân tích RSS XSKT cho Miền Nam & Miền Trung
 */
function parseMNMTItem(item, regionName) {
  const title = item.title || '';
  const desc = item.description || '';

  const dateMatch = title.match(/NGÀY\s*([0-9\/]+)(?:\s*\((.*?)\))?/i);
  const rawDate = dateMatch ? dateMatch[1] : '';
  const dayOfWeek = dateMatch && dateMatch[2] ? dateMatch[2].trim() : '';
  const date = normalizeDate(rawDate);

  // Sửa lỗi text dính liền của XSKT: '7: 2878: 80' -> '7: 287\n8: 80'
  let cleaned = desc.replace(/7:\s*(\d{3})\s*8:\s*(\d{2})/g, '7: $1\n8: $2');
  
  // Tách từng tỉnh: [Tên Tỉnh] ...
  const provMatches = [...cleaned.matchAll(/\[(.*?)\]([\s\S]*?)(?=\[|$)/g)];
  const provinces = [];

  for (const match of provMatches) {
    const provName = match[1].trim();
    const body = match[2].trim();

    const prizes = {
      'ĐB': [],
      '1': [],
      '2': [],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': []
    };

    const lines = body.split('\n');
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      const prizeMatch = cleanLine.match(/^(ĐB|[1-8]):\s*(.*)$/i);
      if (prizeMatch) {
        const key = prizeMatch[1].toUpperCase() === 'ĐB' ? 'ĐB' : prizeMatch[1];
        const numbers = prizeMatch[2]
          .split(/[-–]/)
          .map(n => n.trim().replace(/\D/g, ''))
          .filter(n => n.length > 0);
        if (prizes[key]) {
          prizes[key] = numbers;
        }
      }
    }

    // Chuẩn hóa tên đài theo tên in trên tờ vé số truyền thống
    let displayName = provName;
    if (provName === 'Lâm Đồng') {
      displayName = 'Đà Lạt';
    } else if (provName === 'Hồ Chí Minh') {
      displayName = 'TP.HCM';
    } else if (provName.includes('Vũng Tàu')) {
      displayName = 'Vũng Tàu';
    }

    provinces.push({
      province: displayName,
      rawProvince: provName,
      prizes
    });
  }

  return {
    date,
    dayOfWeek,
    provinces
  };
}

/**
 * Lấy dữ liệu RSS cho vùng (mb, mn, mt)
 */
async function fetchLotteryByRegion(region) {
  const map = {
    mb: { url: 'https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss', name: 'Miền Bắc' },
    mn: { url: 'https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss', name: 'Miền Nam' },
    mt: { url: 'https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss', name: 'Miền Trung' }
  };

  const config = map[region.toLowerCase()];
  if (!config) {
    throw new Error('Miền không hợp lệ: mb, mn, mt');
  }

  const response = await axios.get(config.url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 10000
  });

  const parsed = parser.parse(response.data);
  let items = parsed?.rss?.channel?.item || [];
  if (!Array.isArray(items)) {
    items = [items];
  }

  const results = [];
  for (const it of items) {
    try {
      if (region === 'mb') {
        results.push(parseMBItem(it));
      } else {
        results.push(parseMNMTItem(it, config.name));
      }
    } catch (err) {
      console.error('Lỗi phân tích item:', err.message);
    }
  }

  return {
    region,
    regionName: config.name,
    updatedAt: new Date().toISOString(),
    days: results
  };
}

module.exports = {
  fetchLotteryByRegion
};
