const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.FINNHUB_API_KEY || "";

const SYMBOLS = [
  "BABA","JD","PDD","BIDU",
  "NIO","XPEV","LI","BEKE",
  "TME","BZ","ZTO","FUTU",
  "TAL","EDU","VIPS","WB"
];

const MIN_GAIN = 1;
const MIN_VOLUME_MULTIPLE = 3;
const MIN_DOLLAR_VOLUME = 100000000;

let dailyData = {};
let dailyTime = 0;

app.use(cors());

async function quote(symbol) {
  const url =
    "https://finnhub.io/api/v1/quote?symbol=" +
    symbol + "&token=" + KEY;

  const r = await fetch(url);

  if (!r.ok) {
    throw new Error("Finnhub 오류 " + r.status);
  }

  const q = await r.json();

  return {
    symbol: symbol,
    price: Number(q.c || 0),
    change: Number(q.dp || 0)
  };
}

async function daily(symbol) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - (45 * 24 * 60 * 60);

  const url =
    "https://finnhub.io/api/v1/stock/candle" +
    "?symbol=" + symbol +
    "&resolution=D" +
    "&from=" + from +
    "&to=" + now +
    "&token=" + KEY;

  const r = await fetch(url);

  if (!r.ok) {
    throw new Error("거래량 조회 오류 " + r.status);
  }

  const d = await r.json();

  if (d.s !== "ok" || !d.v || d.v.length < 2) {
    return {
      volume: 0,
      multiple: 0
    };
  }

  const volumes = d.v.map(Number);

  const current = volumes[volumes.length - 1];

  const previous = volumes.slice(
    Math.max(0, volumes.length - 21),
    -1
  );

  const average =
    previous.reduce((a,b) => a + b, 0) /
    previous.length;

  return {
    volume: current,
    multiple: average > 0
      ? current / average
      : 0
  };
}

async function getDailyData() {

  if (
    Date.now() - dailyTime < 300000 &&
    Object.keys(dailyData).length
  ) {
    return dailyData;
  }

  const result = {};

  for (const symbol of SYMBOLS) {

    try {
      result[symbol] = await daily(symbol);
    } catch (e) {
      result[symbol] = {
        volume: 0,
        multiple: 0
      };
    }
  }

  dailyData = result;
  dailyTime = Date.now();

  return result;
}

function money(n) {

  if (n >= 1000000000) {
    return "$" + (n / 1000000000).toFixed(2) + "B";
  }

  if (n >= 1000000) {
    return "$" + (n / 1000000).toFixed(1) + "M";
  }

  return "$" + Math.round(n).toLocaleString();
}

app.get("/", (req, res) => {

  res.send(`
<!DOCTYPE html>
<html lang="ko">

<head>

<meta charset="UTF
