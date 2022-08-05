// Node.js system
const fs = require("node:fs");
const path = require("node:path");

const imgPath = path.join(__dirname, "../public/img"); // dirpath to imgs
const imgFiles = fs.readdirSync(imgPath).filter((file) => file.endsWith(".png")); // get all commands with .jpg

function getGameImg(gameName) {
  for (const img of imgFiles) {
    if(img.includes(gameName)) return img; // return img string
  }
}

module.exports = getGameImg;
