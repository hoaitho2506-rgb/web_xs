/**
 * Module Dò Vé Số Tự Động chuẩn xác theo luật Xổ Số Kiến Thiết Việt Nam
 */

const PRIZE_VALUES_MN_MT = {
  'ĐB': { title: 'Giải ĐẶC BIỆT', value: '2.000.000.000đ (2 TỶ ĐỒNG)' },
  'PHU_DB': { title: 'Giải Phụ Đặc Biệt', value: '50.000.000đ' },
  'KHUYEN_KHICH': { title: 'Giải Khuyến Khích', value: '6.000.000đ' },
  '1': { title: 'Giải Nhất', value: '30.000.000đ' },
  '2': { title: 'Giải Nhì', value: '15.000.000đ' },
  '3': { title: 'Giải Ba', value: '10.000.000đ' },
  '4': { title: 'Giải Tư', value: '3.000.000đ' },
  '5': { title: 'Giải Năm', value: '1.000.000đ' },
  '6': { title: 'Giải Sáu', value: '400.000đ' },
  '7': { title: 'Giải Bảy', value: '200.000đ' },
  '8': { title: 'Giải Tám', value: '100.000đ' },
};

const PRIZE_VALUES_MB = {
  'ĐB': { title: 'Giải ĐẶC BIỆT', value: '1 TỶ ĐỒNG / 500 TRIỆU' },
  'PHU_DB': { title: 'Giải Phụ Đặc Biệt', value: '20.000.000đ' },
  '1': { title: 'Giải Nhất', value: '10.000.000đ' },
  '2': { title: 'Giải Nhì', value: '5.000.000đ' },
  '3': { title: 'Giải Ba', value: '1.000.000đ' },
  '4': { title: 'Giải Tư', value: '400.000đ' },
  '5': { title: 'Giải Năm', value: '200.000đ' },
  '6': { title: 'Giải Sáu', value: '100.000đ' },
  '7': { title: 'Giải Bảy', value: '40.000đ' },
  'KHUYEN_KHICH': { title: 'Giải Khuyến Khích (Trùng 2 số cuối ĐB)', value: '40.000đ' }
};

function checkTicket(ticketNumber, prizes, region = 'mn') {
  const cleanTicket = String(ticketNumber).trim().replace(/\D/g, '');
  if (!cleanTicket) {
    return { error: 'Vui lòng nhập dãy số vé số cần dò!' };
  }

  const isMB = region.toLowerCase() === 'mb';
  const wonPrizes = [];

  if (isMB) {
    // Dò vé Miền Bắc (thường 5 số)
    const ticket5 = cleanTicket.slice(-5).padStart(5, '0');

    // Giải 7: 2 số cuối
    const last2 = ticket5.slice(-2);
    (prizes['7'] || []).forEach(num => {
      if (last2 === num) {
        wonPrizes.push({
          prize: '7',
          name: PRIZE_VALUES_MB['7'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['7'].value
        });
      }
    });

    // Giải 6: 3 số cuối
    const last3 = ticket5.slice(-3);
    (prizes['6'] || []).forEach(num => {
      if (last3 === num) {
        wonPrizes.push({
          prize: '6',
          name: PRIZE_VALUES_MB['6'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['6'].value
        });
      }
    });

    // Giải 5: 4 số cuối
    const last4 = ticket5.slice(-4);
    (prizes['5'] || []).forEach(num => {
      if (last4 === num) {
        wonPrizes.push({
          prize: '5',
          name: PRIZE_VALUES_MB['5'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['5'].value
        });
      }
    });

    // Giải 4: 4 số cuối
    (prizes['4'] || []).forEach(num => {
      if (last4 === num) {
        wonPrizes.push({
          prize: '4',
          name: PRIZE_VALUES_MB['4'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['4'].value
        });
      }
    });

    // Giải 3: cả 5 số
    (prizes['3'] || []).forEach(num => {
      if (ticket5 === num) {
        wonPrizes.push({
          prize: '3',
          name: PRIZE_VALUES_MB['3'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['3'].value
        });
      }
    });

    // Giải 2: cả 5 số
    (prizes['2'] || []).forEach(num => {
      if (ticket5 === num) {
        wonPrizes.push({
          prize: '2',
          name: PRIZE_VALUES_MB['2'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['2'].value
        });
      }
    });

    // Giải 1: cả 5 số
    (prizes['1'] || []).forEach(num => {
      if (ticket5 === num) {
        wonPrizes.push({
          prize: '1',
          name: PRIZE_VALUES_MB['1'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MB['1'].value
        });
      }
    });

    // Giải Đặc Biệt
    const dbList = prizes['ĐB'] || [];
    dbList.forEach(dbNum => {
      if (ticket5 === dbNum) {
        wonPrizes.push({
          prize: 'ĐB',
          name: PRIZE_VALUES_MB['ĐB'].title,
          matchedNumber: dbNum,
          reward: PRIZE_VALUES_MB['ĐB'].value
        });
      } else if (ticket5.slice(-4) === dbNum.slice(-4)) {
        // Phụ ĐB (sai chữ số đầu tiên)
        wonPrizes.push({
          prize: 'PHU_DB',
          name: PRIZE_VALUES_MB['PHU_DB'].title,
          matchedNumber: dbNum,
          reward: PRIZE_VALUES_MB['PHU_DB'].value
        });
      } else if (ticket5.slice(-2) === dbNum.slice(-2)) {
        // Khuyến khích: trùng 2 số cuối ĐB
        wonPrizes.push({
          prize: 'KHUYEN_KHICH',
          name: PRIZE_VALUES_MB['KHUYEN_KHICH'].title,
          matchedNumber: dbNum.slice(-2),
          reward: PRIZE_VALUES_MB['KHUYEN_KHICH'].value
        });
      }
    });

  } else {
    // Dò vé Miền Nam & Miền Trung (6 số)
    const ticket6 = cleanTicket.slice(-6).padStart(6, '0');

    // Giải 8: 2 số cuối
    const last2 = ticket6.slice(-2);
    (prizes['8'] || []).forEach(num => {
      if (last2 === num) {
        wonPrizes.push({
          prize: '8',
          name: PRIZE_VALUES_MN_MT['8'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['8'].value
        });
      }
    });

    // Giải 7: 3 số cuối
    const last3 = ticket6.slice(-3);
    (prizes['7'] || []).forEach(num => {
      if (last3 === num) {
        wonPrizes.push({
          prize: '7',
          name: PRIZE_VALUES_MN_MT['7'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['7'].value
        });
      }
    });

    // Giải 6: 4 số cuối
    const last4 = ticket6.slice(-4);
    (prizes['6'] || []).forEach(num => {
      if (last4 === num) {
        wonPrizes.push({
          prize: '6',
          name: PRIZE_VALUES_MN_MT['6'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['6'].value
        });
      }
    });

    // Giải 5: 4 số cuối
    (prizes['5'] || []).forEach(num => {
      if (last4 === num) {
        wonPrizes.push({
          prize: '5',
          name: PRIZE_VALUES_MN_MT['5'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['5'].value
        });
      }
    });

    // Giải 4: 5 số cuối
    const last5 = ticket6.slice(-5);
    (prizes['4'] || []).forEach(num => {
      if (last5 === num) {
        wonPrizes.push({
          prize: '4',
          name: PRIZE_VALUES_MN_MT['4'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['4'].value
        });
      }
    });

    // Giải 3: 5 số cuối
    (prizes['3'] || []).forEach(num => {
      if (last5 === num) {
        wonPrizes.push({
          prize: '3',
          name: PRIZE_VALUES_MN_MT['3'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['3'].value
        });
      }
    });

    // Giải 2: 5 số cuối
    (prizes['2'] || []).forEach(num => {
      if (last5 === num) {
        wonPrizes.push({
          prize: '2',
          name: PRIZE_VALUES_MN_MT['2'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['2'].value
        });
      }
    });

    // Giải 1: 5 số cuối
    (prizes['1'] || []).forEach(num => {
      if (last5 === num) {
        wonPrizes.push({
          prize: '1',
          name: PRIZE_VALUES_MN_MT['1'].title,
          matchedNumber: num,
          reward: PRIZE_VALUES_MN_MT['1'].value
        });
      }
    });

    // Giải Đặc Biệt và Phụ ĐB / Khuyến Khích
    const dbList = prizes['ĐB'] || [];
    dbList.forEach(dbNum => {
      if (ticket6 === dbNum) {
        wonPrizes.push({
          prize: 'ĐB',
          name: PRIZE_VALUES_MN_MT['ĐB'].title,
          matchedNumber: dbNum,
          reward: PRIZE_VALUES_MN_MT['ĐB'].value
        });
      } else if (ticket6.slice(1) === dbNum.slice(1)) {
        // Trúng 5 số cuối, chỉ sai số đầu tiên => Giải Phụ Đặc Biệt (50 triệu)
        wonPrizes.push({
          prize: 'PHU_DB',
          name: PRIZE_VALUES_MN_MT['PHU_DB'].title,
          matchedNumber: dbNum,
          reward: PRIZE_VALUES_MN_MT['PHU_DB'].value
        });
      } else {
        // Kiểm tra Giải Khuyến Khích: Trùng chữ số đầu tiên và chỉ sai 1 chữ số bất kỳ ở 5 số còn lại
        if (ticket6[0] === dbNum[0]) {
          let diffCount = 0;
          for (let i = 1; i < 6; i++) {
            if (ticket6[i] !== dbNum[i]) diffCount++;
          }
          if (diffCount === 1) {
            wonPrizes.push({
              prize: 'KHUYEN_KHICH',
              name: PRIZE_VALUES_MN_MT['KHUYEN_KHICH'].title,
              matchedNumber: dbNum,
              reward: PRIZE_VALUES_MN_MT['KHUYEN_KHICH'].value
            });
          }
        }
      }
    });
  }

  return {
    ticketNumber: cleanTicket,
    isWinner: wonPrizes.length > 0,
    prizesWon: wonPrizes
  };
}

module.exports = {
  checkTicket
};
