const fs = require("fs");

const axios = require("axios");

axios.defaults.adapter = require("axios/lib/adapters/http");

const _getImg = async (url, imgPath) => {
  const response = await axios.default({ url, responseType: "stream" });

  console.log(response);

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(imgPath))
      .on("finish", () => resolve())
      .on("error", (e) => reject(e));
  });
};

const checkDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const dowloadImages = (imgArr) => {
  return Promise.all(
    imgArr.map(async (img, key) => {
      const path = `${__dirname}/temp/`;

      checkDir(path);
      const fileName = `img${key + 1}.png`;

      const fullPath = `${path}${fileName}`;

      await _getImg(img, fullPath);

      return fullPath;
    })
  );
};

module.exports = dowloadImages;
