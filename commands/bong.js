const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  name: 'bong',
  description: 'Edit image with custom text',
  author: 'light', //modify by joshua Apostol
  nashPrefix: true,
  execute(api, event, args) {
    runCommand(api, event, args);
  },
};

async function runCommand(api, event, args) {
  const { senderID, threadID, messageID } = event;
  const text = args.join(" ");
  if (!text) return api.sendMessage("Enter the content of the comment on the board", threadID, messageID);

  const pathImg = __dirname + '/cache/obama.png';
  const imageData = await axios.get('https://i.imgur.com/hJLF2Ds.jpeg', { responseType: 'arraybuffer' });
  fs.writeFileSync(pathImg, Buffer.from(imageData.data, 'utf-8'));

  const baseImage = await loadImage(pathImg);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "350 50px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "start";

  let fontSize = 350;
  while (ctx.measureText(text).width > 2650) {
    fontSize--;
    ctx.font = `350 ${fontSize}px Arial, sans-serif`;
  }

  const lines = await wrapText(ctx, text, 1160);
  ctx.fillText(lines.join('\n'), 60, 180);
  ctx.beginPath();

  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);

  api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
}

async function wrapText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width < maxWidth) return [text];
  if (ctx.measureText('W').width > maxWidth) return null;

  const words = text.split(' ');
  const lines = [];
  let line = '';

  while (words.length > 0) {
    let split = false;
    while (ctx.measureText(words[0]).width >= maxWidth) {
      const temp = words[0];
      words[0] = temp.slice(0, -1);
      if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
      else {
        split = true;
        words.splice(1, 0, temp.slice(-1));
      }
    }

    if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
      line += `${words.shift()} `;
    } else {
      lines.push(line.trim());
      line = '';
    }

    if (words.length === 0) lines.push(line.trim());
  }

  return lines;
}
