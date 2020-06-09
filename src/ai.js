//@ts-

/**
 * This file generate the new image using tensorflow
 *
 */
const tf = require("@tensorflow/tfjs");
const tfnode = require("@tensorflow/tfjs-node");

const fs = require("fs");

const loadModel = async (path) => {
  const handler = tfnode.io.fileSystem(path);

  return await tf.loadGraphModel(handler);
};

const loadMobileNetStyleModel = async () => {
  const path = `${__dirname}/saved_model_style_js/model.json`;

  return await loadModel(path);
};

const loadTranformModel = async () => {
  const path = `${__dirname}/saved_model_transformer_separable_js/model.json`;

  return await loadModel(path);
};

const start = async (image1, image2) => {
  const net = await loadMobileNetStyleModel();
  const transformNet = await loadTranformModel();

  const imageToPixel = (img) =>
    tfnode.node.decodeJpeg(img).toFloat().div(tf.scalar(255)).expandDims();

  const pixelImage1 = await imageToPixel(image1);
  const pixelImage2 = await imageToPixel(image2);

  // await tf.nextFrame();

  //load the style
  let bottleneck = await tf.tidy(() => net.predict(pixelImage2));

  const stylized = await tf.tidy(() =>
    // @ts-ignore
    transformNet.predict([pixelImage1, bottleneck]).squeeze()
  );

  // const px = await tf.browser.toPixels(stylized);

  /**
   * TODO wait unit tensorflow js fix the tfnode.node.encodePng
   *
   */

  return stylized;
};

const saveImage = async (val, canvas) => {
  await tf.browser.toPixels(val, canvas);

  const data = canvas.toDataURL().replace(/^data:image\/png;base64,/, "");

  const path = `${__dirname}/temp/out.png`;

  fs.writeFileSync(path, data, "base64");

  console.log("done!");
};

const makeStart = (imgPath1, imgPath2) => {
  return new Promise((resolve) => {
    const img1 = fs.readFileSync(imgPath1);
    const img2 = fs.readFileSync(imgPath2);

    start(img1, img2).then((data) => resolve(data));
  });
};

module.exports = {
  makeStart,
  saveImage,
};
