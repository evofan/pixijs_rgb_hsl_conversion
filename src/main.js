console.log("jQuery ver. ", $.fn.jquery);

//// RGB => HSL

// INPUT RGB
$("#box_input_rgb10").change(function() {
  console.log("rgb color inputed...");

  let input_val = $("#box_input_rgb10").val();
  console.log("input_val: ", input_val);

  let temp = input_val.split(",");
  if (temp.length !== 3) {
    $("#box_input_rgb10").val("");
    showMessageAlert("Please enter a number within the specification.", 1);
    return false;
  }

  let input_val_ary = temp.map(el => {
    return Number(el);
  });

  // Check Out og range, NaN
  let numCheck = input_val_ary.filter(el => el > 255 || el < 0 || isNaN(el));
  if (numCheck.length) {
    showMessageAlert("Please enter a number within the specification.", 1);
    $("#box_input_rgb10").val("");
    return false;
  }

  let rgb_hexa_result = input_val_ary.map(el => {
    return Number(el).toString(16); // .toUpperCase(); // ff -> FF
  });
  console.log(rgb_hexa_result); // ["ff", "0", "0"]
  showMessageAlert("", 1);
  $("#box_output_rgb16").val(rgb_hexa_result);

  let hsl_result = changeRGBtoHSL(
    // changeRGBtoHSL():  255 0 0
    input_val_ary[0],
    input_val_ary[1],
    input_val_ary[2]
  );
  console.log("hsl_result: ", hsl_result); // hsl_result: [0, 1, 0.5]
  $("#box_output_hsl").val(hsl_result);

  // Padding zero
  let paddingZeroNum = rgb_hexa_result.map(el => {
    return ("0" + el).slice(-2);
  });
  console.log("paddingZeroNum: ", paddingZeroNum); // ff, 00, 00
  $("#box_output_rgb16").val(paddingZeroNum);

  // Concatenate numbers
  let concatenateNum = `0x${paddingZeroNum[0]}${paddingZeroNum[1]}${
    paddingZeroNum[2]
  }`;
  console.log("concatenateNum: ", concatenateNum); // 0xff0000
  bg.tint = concatenateNum;
});

//// HSL -> RGB

let hsl_h, hsl_s, hsl_l;
let hsl_h_flg = false;
let hsl_s_flg = false;
let hsl_l_flg = false;

// INPUT HSL(H)
$("#box_input_h10").change(function() {
  console.log("hsl-h inputed...");
  hsl_h = Number($("#box_input_h10").val());
  let result = validateInputData(hsl_h, 360);
  if (result) {
    showMessageAlert("param h is ok.", 2);
    hsl_h_flg = true;
    completeInputHSL();
  } else {
    hsl_h_flg = false;
    showMessageAlert("Please enter a number within the specification.", 2);
  }
});

// INPUT HSL(S)
$("#box_input_s10").change(function() {
  console.log("hsl-s inputed...");
  hsl_s = Number($("#box_input_s10").val());
  let result = validateInputData(hsl_s, 100);
  if (result) {
    showMessageAlert("param s is ok.", 2);
    hsl_s_flg = true;
    completeInputHSL();
  } else {
    hsl_s_flg = false;
    showMessageAlert("Please enter a number within the specification.", 2);
  }
});

// INPUT HSL(L)
$("#box_input_l10").change(function() {
  console.log("hsl-l inputed...");
  hsl_l = Number($("#box_input_l10").val());
  let result = validateInputData(hsl_l, 100);
  if (result) {
    showMessageAlert("param l is ok.", 2);
    hsl_l_flg = true;
    completeInputHSL();
  } else {
    hsl_l_flg = false;
    showMessageAlert("Please enter a number within the specification.", 2);
  }
});

/**
 * Validating input values
 * @param { string } str inputed value
 * @param { number } num maximum value
 * @returns { boolean } result
 */
function validateInputData(str, max) {
  if (
    str === null ||
    str === undefined ||
    str === "" ||
    str > max ||
    str < 0 ||
    isNaN(str)
  ) {
    return false;
  }
  return true;
}

/**
 * Check if the HSL values are complete
 */
function completeInputHSL() {
  console.log("completeInputHSL(): ", hsl_h, hsl_s, hsl_l);
  if (hsl_h_flg && hsl_s_flg && hsl_l_flg) {
    showMessageAlert("param h, s, l all ok.", 2);
    let rgb_result = changeHSLtoRGB(hsl_h, hsl_s, hsl_l);
    console.log("rgb_result: ", rgb_result);
    $("#box_output_rgb10").val(rgb_result);
    let rgb_hexa_result = rgb_result.map(el => {
      return Number(el).toString(16);
    });
    let paddingZeroNum = rgb_hexa_result.map(el => {
      return ("0" + el).slice(-2);
    });
    $("#box_output_rgb16_hsl").val(paddingZeroNum);

    // Concatenate numbers
    let concatenateNum = `0x${paddingZeroNum[0]}${paddingZeroNum[1]}${
      paddingZeroNum[2]
    }`;
    console.log("concatenateNum: ", concatenateNum); // 0xff0000
    bg.tint = concatenateNum;
  } else {
    console.log("There are unfilled items");
  }
}

/**
 * Display text in message box.
 * @param { string } str text
 * @param { number } num message textfield number(1-2)
 */
function showMessageAlert(str, num) {
  $(`#message${num}`).val(str);
}

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
app.stage.interactive = false;
app.ticker.remove(app.render, app);
const fpsDelta = 60 / APP_FPS;

let bg;
let elapsedTime = 0;

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
 * @see https://www.peko-step.com/tool/hslrgb.html
 * HLS色空間とは色相、彩度、輝度の3つの成分からなる色空間。HSV空間によく似ている。HSL、HSIとも呼ばれる。
 * @param { number } h Hue（ヒュー）... 色相 … 色味を0-360度の角度で表す。0度=赤、反対の180度=青
 * @param { number } s Saturation（サチュレイション）... 彩度 … 純色から彩度が落ちる=灰色になっていく
 * @param { number } l Lightness（ライトネス：明度）/ Luminance（ルミナンス：輝度） / Intensity（インテンシティ：明度・彩度・輝度・強度） ... 輝度 … 輝度0%を黒、100%を白、50%を純色とする。
 * @returns { array } rgb representation（リプリゼンテイション、表示）
 */
function changeHSLtoRGB(h, s, l) {
  console.log("changeHSLtoRGB(): ", h, s, l);
  let max, min;
  if (l <= 49) {
    max = 2.55 * (l + l * (s / 100));
    min = 2.55 * (l - l * (s / 100));
  } else {
    max = 2.55 * (l + (100 - l) * (s / 100));
    min = 2.55 * (l - (100 - l) * (s / 100));
  }
  console.log("max: ", max);
  console.log("min: ", min);
  let r, g, b;
  if (h >= 0 && h <= 60) {
    r = max;
    g = (h / 60) * (max - min) + min;
    b = min;
  } else if (h > 60 && h <= 120) {
    r = ((120 - h) / 60) * (max - min) + min;
    g = max;
    b = min;
  } else if (h > 120 && h <= 180) {
    r = min;
    g = max;
    b = ((h - 120) / 60) * (max - min) + min;
  } else if (h > 180 && h <= 240) {
    r = min;
    g = ((240 - h) / 60) * (max - min) + min;
    b = max;
  } else if (h > 240 && h <= 300) {
    r = ((h - 240) / 60) * (max - min) + min;
    g = min;
    b = max;
  } else if (h > 300 && h <= 360) {
    r = max;
    g = min;
    b = ((360 - h) / 60) * (max - min) + min;
  } else {
    //
  }
  return [Math.round(r), Math.round(g), Math.round(b)];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 * @see https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * @see https://www.peko-step.com/tool/hslrgb.html
 * @param { numebr } r Red color value
 * @param { number } g Green color value
 * @param { numer } b Blue color value
 * @returns { array } hsl representation
 */
function changeRGBtoHSL(r, g, b) {
  console.log("changeRGBtoHSL(): ", r, g, b);

  let max = Math.max(r, g, b);
  console.log("max: ", max);

  let min = Math.min(r, g, b);
  console.log("min: ", min);

  let obj = [
    {
      color: "R",
      val: r
    },
    {
      color: "G",
      val: g
    },
    {
      color: "B",
      val: b
    }
  ];
  console.log("obj: ", obj);

  const returnLatestdataMin = req => {
    let hashList = req;
    let tempAgeList = hashList.map(element => {
      return element.val;
    });
    let elmNum = tempAgeList.indexOf(Math.min.apply({}, tempAgeList));
    return hashList[elmNum];
  };
  let min_val = returnLatestdataMin(obj);
  console.log("min_val: ", min_val);

  let min_color = min_val.color;
  console.log("min_color: ", min_color);

  const returnLatestdataMax = req => {
    let hashList = req;
    let tempAgeList = hashList.map(element => {
      return element.val;
    });
    let elmNum = tempAgeList.indexOf(Math.max.apply({}, tempAgeList));
    return hashList[elmNum];
  };

  let max_val = returnLatestdataMax(obj);
  console.log("max_val: ", max_val);
  let max_color = max_val.color;
  console.log("max_color: ", max_color);

  let h;
  // 色相(Hue)
  if (max_color === "R") {
    h = 60 * ((g - b) / (max - min));
  } else if (max_color === "G") {
    h = 60 * ((b - r) / (max - min)) + 120;
  } else if (max_color === "B") {
    h = 60 * ((r - g) / (max - min)) + 240;
  } else {
    //
  }
  if (h < 0) {
    h = h + 360;
  }
  if (r === g && g === b && b === r) {
    h = 0; // achromatic（アクロマティック）… 無彩色・白黒, h=0, s=0
  }
  h = Math.floor(h);
  console.log("h: ", h);

  // 彩度(Saturation)
  let cnt;
  let s;
  cnt = (max + min) / 2;
  if (cnt >= 128) {
    cnt = 255 - cnt;
    s = (max - min) / (510 - max - min);
    s = s || 0; // for 0/0 -> NaN avoidance
  } else {
    s = (max - min) / (max + min);
    s = s || 0;
  }
  console.log("cnt: ", cnt);
  s = s.toFixed(2);
  s = s * 100; // to percent
  console.log("s: ", s);

  // 輝度(Lightness)
  let l;
  l = (max + min) / 2; // 0～255
  l = (l / 255) * 100; // to percent
  console.log("l: ", l);

  return [Math.round(h), Math.round(s), Math.round(l)];
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
  // render the canvas
  app.render();
}
