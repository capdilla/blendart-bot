/**
 * This file have to be delete in a future
 */

const remote = require("electron").remote;
remote.getCurrentWindow().toggleDevTools();
const publisher = require("./publisher");

const { makeStart, saveImage } = require("./ai");

const createStyleTransfer = async (imgPaths) => {
  const result = await makeStart(imgPaths[0], imgPaths[1]);

  const canvas = document.getElementById("out");
  await saveImage(result, canvas);

  // var window = remote.getCurrentWindow();
  // window.close();
};

publisher(createStyleTransfer);
// makeStart().then((d) => {
//   const canvas = document.getElementById("out");
//   saveImage(d, canvas).then(() => {
//     var window = remote.getCurrentWindow();
//     window.close();
//   });
// });
