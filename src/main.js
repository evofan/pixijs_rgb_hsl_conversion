console.log("jQuery ver. ", $.fn.jquery);

$('#box_input').change(function() {
  console.log("change !");
  input_value = $('#box_input').val();
  let hsl_result = changeRGBtoHSL(255, 0, 0);
  console.log("hsl_result; ", hsl_result);
  $('#box_output').val(hsl_result);
  bg.tint = 0xff0000;
});

const WIDTH = 384;
const HEIGHT = 384;
const APP_FPS = 60;

// init
let app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT
});
let canvas = document.getElementById("canvas");
canvas.appendChild(app.view);
app.renderer.backgroundColor = 0x000000;
app.stage.interactive = true;
app.ticker.remove(app.render, app);
const fpsDelta = 60 / APP_FPS;

let bg;
let elapsedTime = 0;

let input_value;

let container_bg = new PIXI.Container();
container_bg.x = 0;
container_bg.y = 0;
app.stage.addChild(container_bg);

let container = new PIXI.Container();
container.width = 384;
container.height = 384;
container.x = 0;
container.y = 0;
container.pivot.x = 0;
container.pivot.y = 0;
container.interactive = true;
app.stage.addChild(container);

// asset property
const ASSET_BG = "images/pic_bg_fish.jpg";

PIXI.loader.add("bg_fish", ASSET_BG).load(onAssetsLoaded);

/**
 * Asset load Complete
 * @param { object } loader object
 * @param { object } res asset data
 */
function onAssetsLoaded(loader, res) {
  // BG
  bg = new PIXI.Sprite(res.bg_fish.texture);
  container_bg.addChild(bg);
  bg.x = 0;
  bg.y = 0;
  bg.interactive = true;
  bg.on("tap", event => {
    console.log("onTap"); // Desktop(Touch)
  });
  bg.on("click", event => {
    console.log("click"); // Desktop
  });

  /*
  // HSL to RGB
  let rgb_result = changeHSLtoRGB(0, 1, 0.5); // [0, 1, 0.5] ok, but [360, 1, 0.5] -> 0, 0, 0
  console.log("rgb_result: ", rgb_result); // rgb_result: [255, 0, 0]

  // RGB to HSL
  let hsl_result = changeRGBtoHSL(255, 0, 0);
  console.log("hsl_result: ", hsl_result); // hsl_result: [0, 1, 0.5]
  */

  // ticker
  let ticker = PIXI.ticker.shared;
  ticker.autoStart = false;
  ticker.stop();
  PIXI.settings.TARGET_FPMS = 0.06;
  app.ticker.add(tick);
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * @see https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * @see https://ja.wikipedia.org/wiki/HLS%E8%89%B2%E7%A9%BA%E9%96%93
 * HLS色空間とは色相、彩度、輝度の3つの成分からなる色空間。HSV空間によく似ている。HSL、HSIとも呼ばれる。
 * @param { number } h Hue（ヒュー）... 色相…色味を0-360度の角度で表す。0度=赤、反対の180度=青
 * @param { number } s Saturation（サチュレイション）... 彩度…純色から彩度が落ちる=灰色になっていく
 * @param { number } l Lightness（ライトネス）/ Luminance（ルミナンス） / Intensity（インテンシティ） ... 輝度…輝度0%を黒、100%を白、50%を純色とする。
 * @returns { array } rgb representation
 */
function changeHSLtoRGB(h, s, l) {
  console.log("changeHSLtoRGB(): ", h, s, l);
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic（アクロマティック）… 無彩色・白黒
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) { t += 1; }
      if (t > 1) { t -= 1; }
      if (t < 1 / 6) { return p + (q - p) * 6 * t; }
      if (t < 1 / 2) { return q; }
      if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1.0 / 3.0);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1.0 / 3.0);
  }

  // return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  return [ Math.min(Math.floor(r * 256), 255), Math.min(Math.floor(g * 256), 255), Math.min(Math.floor(b * 256), 255) ];
}

function changeRGBtoHSL(r, g, b) {
  console.log("changeRGBtoHSL(): ", r, g, b);
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic（アクロマティック）… 無彩色・白黒
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

/**
 * adjust fps
 * @param { number } delta time
 */
function tick(delta) {
  elapsedTime += delta;

  if (elapsedTime >= fpsDelta) {
    // enough time passed, update app
    update(elapsedTime);
    // reset
    elapsedTime = 0;
  }
}

/**
 * rendering
 * @param { number } delta time
 */
function update(delta) {
  // console.log("update()");

  // render the canvas
  app.render();
}
