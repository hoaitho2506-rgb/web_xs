/**
 * Module Tạo Ảnh Kết Quả Xổ Số & Chia Sẻ Zalo
 * Phát triển bởi CrisTho
 */

let currentGeneratedBlob = null;
let currentGeneratedDataUrl = null;
let currentShareFileName = 'ket-qua-xo-so.png';

/**
 * Mở modal chia sẻ ảnh
 */
async function openShareModal() {
  const modal = document.getElementById('shareModal');
  const loading = document.getElementById('shareLoading');
  const imgPreview = document.getElementById('sharePreviewImg');
  const alertBox = document.getElementById('shareStatusAlert');

  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (loading) loading.style.display = 'flex';
  if (imgPreview) imgPreview.style.display = 'none';
  if (alertBox) alertBox.style.display = 'none';

  try {
    const dataUrl = await generateLotteryCardImage();
    if (dataUrl && imgPreview) {
      imgPreview.src = dataUrl;
      imgPreview.style.display = 'block';
      if (loading) loading.style.display = 'none';
    }
  } catch (err) {
    console.error('Lỗi tạo ảnh kết quả:', err);
    if (loading) {
      loading.innerHTML = `<span style="color:#dc2626;">Không thể tạo ảnh kết quả: ${err.message}</span>`;
    }
  }
}

/**
 * Đóng modal chia sẻ
 */
function closeShareModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('share-modal-close')) {
    return;
  }
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Vẽ bảng kết quả lên Canvas và xuất ra ảnh độ nét cao
 */
async function generateLotteryCardImage() {
  const curData = lotteryCache[activeRegion];
  if (!curData || !curData.days) {
    throw new Error('Chưa có dữ liệu kết quả để tạo ảnh.');
  }

  const dayData = curData.days.find(d => d.date === currentDate) || curData.days[0];
  if (!dayData) {
    throw new Error('Không tìm thấy dữ liệu ngày đã chọn.');
  }

  const provinces = dayData.provinces || [];
  if (provinces.length === 0) {
    throw new Error('Ngày này chưa có thông tin đài mở thưởng.');
  }

  const isMB = activeRegion === 'mb';
  const regionNameText = isMB ? 'Miền Bắc' : (activeRegion === 'mt' ? 'Miền Trung' : 'Miền Nam');
  currentShareFileName = `Ket-qua-xo-so-${regionNameText.replace(/\s+/g, '-')}-${dayData.date.replace(/\//g, '-')}.png`;

  const prizeOrder = isMB
    ? [
        { key: '7', name: 'Giải Bảy', isSpecial: false },
        { key: '6', name: 'Giải Sáu', isSpecial: false },
        { key: '5', name: 'Giải Năm', isSpecial: false },
        { key: '4', name: 'Giải Tư', isSpecial: false },
        { key: '3', name: 'Giải Ba', isSpecial: false },
        { key: '2', name: 'Giải Nhì', isSpecial: false },
        { key: '1', name: 'Giải Nhất', isSpecial: false },
        { key: 'ĐB', name: 'Đặc Biệt', isSpecial: true }
      ]
    : [
        { key: '8', name: 'Giải Tám', isSpecial: false },
        { key: '7', name: 'Giải Bảy', isSpecial: false },
        { key: '6', name: 'Giải Sáu', isSpecial: false },
        { key: '5', name: 'Giải Năm', isSpecial: false },
        { key: '4', name: 'Giải Tư', isSpecial: false },
        { key: '3', name: 'Giải Ba', isSpecial: false },
        { key: '2', name: 'Giải Nhì', isSpecial: false },
        { key: '1', name: 'Giải Nhất', isSpecial: false },
        { key: 'ĐB', name: 'Đặc Biệt', isSpecial: true }
      ];

  // Tính toán chiều cao từng dòng
  const numProvinces = provinces.length;
  const canvasWidth = 860;
  const paddingX = 24;
  const tableX = paddingX;
  const tableWidth = canvasWidth - paddingX * 2;
  const prizeColWidth = 110;
  const stationColWidth = (tableWidth - prizeColWidth) / numProvinces;

  // Tính chiều cao cho từng giải
  const rowHeights = prizeOrder.map(item => {
    if (item.isSpecial) return 66; // Hàng đặc biệt rộng rãi
    if (item.key === '4') return 94; // Giải tư có 7 số (2-3 hàng)
    if (item.key === '3') return 58; // Giải ba có 2 số
    if (item.key === '6') return 58; // Giải sáu có 3 số
    if (isMB && (item.key === '5' || item.key === '3')) return 84;
    return 48; // Hàng chuẩn
  });

  const headerHeight = 112;
  const subBannerHeight = 44;
  const tableHeaderHeight = 46;
  const tableRowsTotalHeight = rowHeights.reduce((a, b) => a + b, 0);
  const footerHeight = 64;
  const totalHeight = 24 + headerHeight + subBannerHeight + 14 + tableHeaderHeight + tableRowsTotalHeight + 16 + footerHeight + 20;

  // Khởi tạo Canvas độ phân giải cao 2X
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // 1. NỀN TOÀN BỘ BẢNG
  ctx.fillStyle = '#f8fafc';
  drawRoundedRect(ctx, 0, 0, canvasWidth, totalHeight, 20);
  ctx.fill();

  // Khung viền ngoài
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 1, 1, canvasWidth - 2, totalHeight - 2, 20);
  ctx.stroke();

  // 2. KHỐI HEADER TRÊN CÙNG
  const headerY = 20;
  const headerCardHeight = headerHeight;
  const headerCardWidth = canvasWidth - paddingX * 2;

  // Gradient nền header sang trọng
  const gradHeader = ctx.createLinearGradient(paddingX, headerY, paddingX + headerCardWidth, headerY + headerCardHeight);
  gradHeader.addColorStop(0, '#0f172a');
  gradHeader.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradHeader;
  drawRoundedRect(ctx, paddingX, headerY, headerCardWidth, headerCardHeight, 14);
  ctx.fill();

  // Dải viền xanh gradient trên đầu header
  const gradLine = ctx.createLinearGradient(paddingX, headerY, paddingX + headerCardWidth, headerY);
  gradLine.addColorStop(0, '#2563eb');
  gradLine.addColorStop(0.5, '#38bdf8');
  gradLine.addColorStop(1, '#2563eb');
  ctx.fillStyle = gradLine;
  ctx.beginPath();
  drawRoundedRect(ctx, paddingX, headerY, headerCardWidth, 4, { tl: 14, tr: 14, br: 0, bl: 0 });
  ctx.fill();

  // Tiêu đề: KẾT QUẢ XỔ SỐ
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`KẾT QUẢ XỔ SỐ ${regionNameText.toUpperCase()}`, paddingX + 20, headerY + 44);

  // Ngày mở thưởng & Thứ
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const dayOfWeekStr = dayData.dayOfWeek ? `${dayData.dayOfWeek}, ` : '';
  ctx.fillText(`Mở thưởng: ${dayOfWeekStr}ngày ${dayData.date}`, paddingX + 20, headerY + 74);

  // Badge "Không quảng cáo"
  ctx.fillStyle = 'rgba(37, 99, 235, 0.25)';
  drawRoundedRect(ctx, paddingX + 20, headerY + 83, 195, 18, 5);
  ctx.fill();
  ctx.fillStyle = '#60a5fa';
  ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('✓ CHÍNH XÁC • KHÔNG QUẢNG CÁO', paddingX + 26, headerY + 96);

  // VẼ LOGO CRISTHO Ở GÓC PHẢI HEADER
  const logoBoxX = paddingX + headerCardWidth - 180;
  const logoBoxY = headerY + 28;
  drawCrisThoLogo(ctx, logoBoxX, logoBoxY);

  // 3. THANH DANH SÁCH ĐÀI MỞ THƯỞNG
  const subBannerY = headerY + headerCardHeight + 10;
  ctx.fillStyle = '#eff6ff';
  drawRoundedRect(ctx, paddingX, subBannerY, headerCardWidth, subBannerHeight, 10);
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, paddingX, subBannerY, headerCardWidth, subBannerHeight, 10);
  ctx.stroke();

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const provNamesText = provinces.map(p => p.province).join('   •   ');
  ctx.fillText(`ĐÀI MỞ THƯỞNG HÔM NAY (${provinces.length} đài):  ${provNamesText}`, paddingX + 16, subBannerY + 27);

  // 4. VẼ BẢNG KẾT QUẢ
  const tableStartY = subBannerY + subBannerHeight + 14;

  // Nền bảng trắng bo góc
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, tableX, tableStartY, tableWidth, tableHeaderHeight + tableRowsTotalHeight, 12);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, tableX, tableStartY, tableWidth, tableHeaderHeight + tableRowsTotalHeight, 12);
  ctx.stroke();

  // DÒNG HEADER CỦA BẢNG (Cột Giải + Cột Các Đài)
  ctx.fillStyle = '#f1f5f9';
  drawRoundedRect(ctx, tableX, tableStartY, tableWidth, tableHeaderHeight, { tl: 12, tr: 12, br: 0, bl: 0 });
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(tableX, tableStartY + tableHeaderHeight - 1, tableWidth, 1);

  // Chữ "Giải"
  ctx.fillStyle = '#475569';
  ctx.font = '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GIẢI', tableX + prizeColWidth / 2, tableStartY + 29);

  // Tên từng đài trên cột
  provinces.forEach((p, idx) => {
    const colX = tableX + prizeColWidth + idx * stationColWidth;
    
    // Đường ngăn cách dọc
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(colX, tableStartY, 1, tableHeaderHeight + tableRowsTotalHeight);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(p.province.toUpperCase(), colX + stationColWidth / 2, tableStartY + 29);
  });

  // VẼ TỪNG HÀNG GIẢI
  let curRowY = tableStartY + tableHeaderHeight;
  prizeOrder.forEach((item, rIdx) => {
    const h = rowHeights[rIdx];

    // Nền hàng đặc biệt (Đỏ nhạt sang trọng)
    if (item.isSpecial) {
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(tableX + 1, curRowY, tableWidth - 2, h - (rIdx === prizeOrder.length - 1 ? 1 : 0));
      
      // Viền dải vàng đỏ nhấn cho Giải Đặc Biệt
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(tableX, curRowY, 5, h);
    } else if (rIdx % 2 === 1) {
      // Hàng xen kẽ xám rất nhẹ
      ctx.fillStyle = '#fcfdfe';
      ctx.fillRect(tableX + 1, curRowY, tableWidth - 2, h);
    }

    // Đường kẻ ngang giữa các hàng
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(tableX, curRowY, tableWidth, 1);

    // Tên giải
    ctx.textAlign = 'center';
    if (item.isSpecial) {
      ctx.fillStyle = '#dc2626';
      ctx.font = '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.name.toUpperCase(), tableX + prizeColWidth / 2, curRowY + h / 2 + 6);
    } else {
      ctx.fillStyle = '#475569';
      ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.name, tableX + prizeColWidth / 2, curRowY + h / 2 + 5);
    }

    // Điền số các đài
    provinces.forEach((p, idx) => {
      const colCenterX = tableX + prizeColWidth + idx * stationColWidth + stationColWidth / 2;
      const numbers = p.prizes[item.key] || [];

      if (item.isSpecial) {
        // GIẢI ĐẶC BIỆT: Font to đậm màu đỏ nổi bật
        ctx.fillStyle = '#dc2626';
        ctx.font = '900 28px "SF Mono", "Roboto Mono", Consolas, monospace';
        const numStr = numbers.join(' - ') || '—';
        ctx.fillText(numStr, colCenterX, curRowY + h / 2 + 9);
      } else if (item.key === '1') {
        // GIẢI NHẤT
        ctx.fillStyle = '#1e3a8a';
        ctx.font = '800 21px "SF Mono", "Roboto Mono", Consolas, monospace';
        ctx.fillText(numbers.join(' - ') || '—', colCenterX, curRowY + h / 2 + 7);
      } else if (numbers.length > 3) {
        // GIẢI TƯ HOẶC CÁC GIẢI NHIỀU SỐ (7 số): Thêm dấu "-" ngăn cách rõ ràng, chia 2 dòng
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 14px "SF Mono", "Roboto Mono", Consolas, monospace';
        const half = Math.ceil(numbers.length / 2);
        const line1 = numbers.slice(0, half).join(' - ');
        const line2 = numbers.slice(half).join(' - ');
        ctx.fillText(line1, colCenterX, curRowY + h / 2 - 10);
        ctx.fillText(line2, colCenterX, curRowY + h / 2 + 15);
      } else if (numbers.length > 1) {
        // CÁC GIẢI CÓ TỪ 2 ĐẾN 3 SỐ (như Giải Ba, Giải Sáu...): Dùng dấu "-" để chống rối mắt
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 16.5px "SF Mono", "Roboto Mono", Consolas, monospace';
        ctx.fillText(numbers.join(' - ') || '—', colCenterX, curRowY + h / 2 + 6);
      } else {
        // CÁC GIẢI CHỈ CÓ 1 SỐ
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 18px "SF Mono", "Roboto Mono", Consolas, monospace';
        ctx.fillText(numbers.join(' - ') || '—', colCenterX, curRowY + h / 2 + 6);
      }
    });

    curRowY += h;
  });

  // 5. FOOTER THIỆP CHIA SẺ NỔI BẬT & SANG TRỌNG
  const footerY = curRowY + 16;
  const leftBadgeWidth = 562;
  const badgeHeight = 38;

  // Khung Badge bên trái: Xem kết quả trực tuyến & Link web nổi bật
  ctx.fillStyle = '#eff6ff';
  drawRoundedRect(ctx, paddingX, footerY, leftBadgeWidth, badgeHeight, 9);
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, paddingX, footerY, leftBadgeWidth, badgeHeight, 9);
  ctx.stroke();

  // Chấm sáng xanh nhận diện
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(paddingX + 18, footerY + 19, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Chữ "Xem kết quả trực tuyến:" nổi bật
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Xem kết quả trực tuyến:', paddingX + 30, footerY + 24);

  // Đường link web CrisTho nổi bật rõ nét
  const linkX = paddingX + 30 + ctx.measureText('Xem kết quả trực tuyến:').width + 8;
  ctx.fillStyle = '#2563eb';
  ctx.font = '800 13.5px "SF Mono", "Roboto Mono", Consolas, monospace';
  ctx.fillText('https://web-xs-cristho.vercel.app', linkX, footerY + 24);

  // Huy hiệu "Không quảng cáo"
  const tagX = linkX + ctx.measureText('https://web-xs-cristho.vercel.app').width + 10;
  ctx.fillStyle = '#dcfce7';
  drawRoundedRect(ctx, tagX, footerY + 9, 86, 20, 5);
  ctx.fill();
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, tagX, footerY + 9, 86, 20, 5);
  ctx.stroke();
  ctx.fillStyle = '#15803d';
  ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('✓ Không QC', tagX + 8, footerY + 23);

  // Khung Badge bên phải: Được phát triển bởi CrisTho
  const rightBadgeWidth = tableWidth - leftBadgeWidth - 12;
  const rightBadgeX = paddingX + leftBadgeWidth + 12;

  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, rightBadgeX, footerY, rightBadgeWidth, badgeHeight, 9);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, rightBadgeX, footerY, rightBadgeWidth, badgeHeight, 9);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Được phát triển bởi', rightBadgeX + 13, footerY + 24);

  const authX = rightBadgeX + 13 + ctx.measureText('Được phát triển bởi').width + 5;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '800 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CrisTho', authX, footerY + 24);

  // Xuất ảnh
  currentGeneratedDataUrl = canvas.toDataURL('image/png');
  currentGeneratedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  return currentGeneratedDataUrl;
}

/**
 * Vẽ Logo CrisTho vector trên Canvas
 */
function drawCrisThoLogo(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // Nền badge kính mờ nhẹ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  drawRoundedRect(ctx, 0, 0, 160, 48, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 0, 0, 160, 48, 12);
  ctx.stroke();

  // Khối Monogram Squircle
  const markGrad = ctx.createLinearGradient(8, 6, 44, 42);
  markGrad.addColorStop(0, '#3b82f6');
  markGrad.addColorStop(0.5, '#2563eb');
  markGrad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = markGrad;
  drawRoundedRect(ctx, 8, 6, 36, 36, 9);
  ctx.fill();

  // Chữ CT Monogram
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CT', 26, 29);

  // Chấm sáng cyan
  ctx.fillStyle = '#67e8f9';
  ctx.beginPath();
  ctx.arc(38, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Chữ CrisTho
  ctx.textAlign = 'left';
  ctx.font = '800 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Cris', 52, 27);

  const thoGrad = ctx.createLinearGradient(88, 12, 125, 30);
  thoGrad.addColorStop(0, '#60a5fa');
  thoGrad.addColorStop(1, '#93c5fd');
  ctx.fillStyle = thoGrad;
  ctx.fillText('Tho', 87, 27);

  // Dòng phụ DEVELOPER
  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DEVELOPER', 53, 38);

  ctx.restore();
}

/**
 * Hàm hỗ trợ vẽ hình chữ nhật bo góc Canvas
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  let r = radius;
  if (typeof r === 'number') {
    r = { tl: r, tr: r, br: r, bl: r };
  } else {
    r = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, r);
  }

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

/**
 * Hành động 1: Gửi qua Zalo / Chia sẻ Hệ Thống (Web Share API)
 */
async function handleShareZalo() {
  const alertBox = document.getElementById('shareStatusAlert');

  if (!currentGeneratedBlob) {
    showAlert('Đang chuẩn bị ảnh, vui lòng bấm lại sau giây lát!', 'warning');
    return;
  }

  const file = new File([currentGeneratedBlob], currentShareFileName, { type: 'image/png' });
  const shareData = {
    title: `Kết quả xổ số ${currentShareFileName.replace('.png', '')}`,
    text: `Bảng kết quả xổ số gia đình chính xác - Phát triển bởi CrisTho`,
    files: [file]
  };

  // Kiểm tra nếu thiết bị hỗ trợ chia sẻ trực tiếp file ảnh (Điện thoại Android, iOS, Zalo app)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share(shareData);
      showAlert('✓ Đã mở menu chia sẻ thành công!', 'success');
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Lỗi gọi navigator.share:', err);
      }
    }
  }

  // Nếu là máy tính không hỗ trợ share file trực tiếp: tự động Copy vào Clipboard + Tải ảnh
  copyImageToClipboard(true);
}

/**
 * Hành động 2: Tải ảnh về máy
 */
function handleDownloadImage() {
  if (!currentGeneratedDataUrl) {
    showAlert('Chưa có ảnh kết quả để tải!', 'warning');
    return;
  }

  const link = document.createElement('a');
  link.href = currentGeneratedDataUrl;
  link.download = currentShareFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showAlert('✓ Đã tải ảnh kết quả về máy thành công!', 'success');
}

/**
 * Hành động 3: Sao chép ảnh vào Clipboard
 */
function handleCopyImage() {
  copyImageToClipboard(false);
}

/**
 * Logic copy ảnh vào Clipboard
 */
async function copyImageToClipboard(fromZaloBtn = false) {
  if (!currentGeneratedBlob) {
    showAlert('Chưa có dữ liệu ảnh!', 'warning');
    return;
  }

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': currentGeneratedBlob });
      await navigator.clipboard.write([item]);

      if (fromZaloBtn) {
        showAlert('✓ Đã sao chép ảnh vào bộ nhớ tạm! Bạn chỉ cần vào khung chat Zalo nhấn Ctrl + V để dán và gửi ngay.', 'success');
      } else {
        showAlert('✓ Đã sao chép ảnh vào bộ nhớ tạm! Bạn có thể dán (Ctrl+V) vào Zalo, Facebook hoặc Messenger.', 'success');
      }
      return;
    }
  } catch (err) {
    console.warn('Không thể copy ảnh vào clipboard:', err);
  }

  // Phương án dự phòng nếu trình duyệt chặn ClipboardItem: Tự động tải về máy
  handleDownloadImage();
  showAlert('✓ Đã tải ảnh về máy để bạn đính kèm vào khung chat Zalo!', 'info');
}

/**
 * Hiển thị thông báo trạng thái
 */
function showAlert(message, type = 'info') {
  const alertBox = document.getElementById('shareStatusAlert');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.className = `share-status-alert alert-${type}`;
  alertBox.style.display = 'block';

  setTimeout(() => {
    if (alertBox) alertBox.style.display = 'none';
  }, 6000);
}
