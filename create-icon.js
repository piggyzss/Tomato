// 使用 Node.js 创建简单的 PNG 图标
// 运行: node create-icon.js

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景色 - 番茄红
  ctx.fillStyle = '#E55D5C';
  ctx.fillRect(0, 0, size, size);

  // 绘制简单的猫脸轮廓
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Math.max(1, size / 12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const scale = size / 24;

  // 猫头
  ctx.beginPath();
  ctx.arc(12 * scale, 13 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // 左耳
  ctx.beginPath();
  ctx.moveTo(7 * scale, 8 * scale);
  ctx.lineTo(5 * scale, 5 * scale);
  ctx.stroke();

  // 右耳
  ctx.beginPath();
  ctx.moveTo(17 * scale, 8 * scale);
  ctx.lineTo(19 * scale, 5 * scale);
  ctx.stroke();

  // 眼睛
  ctx.beginPath();
  ctx.arc(10 * scale, 12 * scale, 0.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(14 * scale, 12 * scale, 0.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 鼻子
  ctx.beginPath();
  ctx.moveTo(11.5 * scale, 15 * scale);
  ctx.lineTo(12 * scale, 16 * scale);
  ctx.lineTo(12.5 * scale, 15 * scale);
  ctx.stroke();

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
});

console.log('All icons created successfully!');
