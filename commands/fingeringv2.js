const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  name: "fingeringv2",
  version: "7.3.1",
  description: "Fingering your image with custom avatars",
  author: "𝙈𝙧𝙏𝙤𝙢𝙓𝙭𝙓", //modify by joshua Apostol
  nashPrefix: false,
  execute(api, event, args) {
    runCommand(api, event, args);
  },
};

async function runCommand(api, event, args) {
  const { senderID, threadID, messageID } = event;
  const mention = Object.keys(event.mentions);
  if (!mention[0]) return api.sendMessage("Please mention 1 person.", threadID, messageID);

  const one = senderID;
  const two = mention[0];

  const imagePath = await makeImage({ one, two });

  api.sendMessage({ body: "", attachment: fs.createReadStream(imagePath) }, threadID, () => fs.unlinkSync(imagePath), messageID);
}

async function makeImage({ one, two }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const jimp = require("jimp");
  const __root = path.resolve(__dirname, "cache", "canvas");

  const avatarOnePath = `${__root}/avt_${one}.png`;
  const avatarTwoPath = `${__root}/avt_${two}.png`;
  const baseImagePath = `${__root}/fingeringv2.png`;
  const pathImg = `${__root}/batman_${one}_${two}.png`;

  const avatarOneData = await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
  fs.writeFileSync(avatarOnePath, Buffer.from(avatarOneData.data, 'utf-8'));

  const avatarTwoData = await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
  fs.writeFileSync(avatarTwoPath, Buffer.from(avatarTwoData.data, 'utf-8'));

  const baseImage = await jimp.read(baseImagePath);
  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  baseImage.composite(circleOne.resize(70, 70), 180, 110)
            .composite(circleTwo.resize(70, 70), 120, 140);

  const raw = await baseImage.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

async function circle(imagePath) {
  const jimp = require("jimp");
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}
