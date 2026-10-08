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

app.use(cors());

async function api(path, params = {}) {
  if (!KEY) throw new Error("FINNHUB_API_KEY가 없습니다.");

  const url = new URL("https://finnhub.io/api/v1/" + path);

  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  url.searchParams.set("token", KEY);

  const r = await fetch(url);

  if (!r.ok) {
    throw new Error("Finnhub 오류: " + r.status);
  }

  return r.json();
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width,initial-scale=1">
<title>China Trading Monitor</title>

<style>
body{
 margin:0;
 background:#07111f;
 color:white;
 font-family:Arial,sans-serif;
}
header{
 padding:22px;
 text-align:center;
 background:#111c2e;
}
.green{color:#22c55e;font-weight:bold}
.yellow{color:#facc15}
.card{
 background:#111c2e;
 border-radius:14px;
 padding:16px;
 margin:12px;
}
.row{
 display:grid;
 grid-template-columns:60px 1fr 1fr;
 gap:8px;
 padding:11px 0;
 border-bottom:1px solid #26344b;
}
.up{color:#22c55e}
button{
 background:#2563eb;
 color:white;
 border:0;
 border-radius:10px;
 padding:10px 15px;
}
</style>
</head>

<body>

<header>
<h2>🇨🇳 China Trading Monitor</h2>
<div class="green">● 서버 연결 정상</div>
</header>

<div class="card">
<h3>⚡ 감시 조건</h3>
<p>상승률 ≥ 1%</p>
<p>거래량 급증 ≥ 3배</p>
<p>거래대금 ≥ $100M</p>
<button onclick="load()">🔄 새로고침</button>
<p id="time">데이터 확인 중...</p>
</div>

<div class="card">
<h3>🚨 상승 포착</h3>
<div id="alerts">확인 중...</div>
</div>

<div class="card">
<h3>👀 감시 종목</h3>
<div id="stocks">확인 중...</div>
</div>

<script>

function load(){

 fetch("/api/stocks")
 .then(r=>r.json())
 .then(data=>{

   document.getElementById("time").innerText =
     "마지막 확인: " + new Date().toLocaleTimeString();

   if(data.error){

     document.getElementById("alerts").innerHTML =
       '<span class="yellow">⚠️ '+data.error+'</span>';

     return;
   }

   const alerts =
     data.stocks.filter(x => x.change >= 1);

   document.getElementById("alerts").innerHTML =
     alerts.length
     ? alerts.map(x =>
       "🚨 <b>"+x.symbol+
       "</b> 상승 "+x.change.toFixed(2)+"%"
       ).join("<br>")
     : "현재 1% 이상 상승 종목 없음";

   document.getElementById("stocks").innerHTML =
     data.stocks.map(x =>
       '<div class="row">'+
       '<b>'+x.symbol+'</b>'+
       '<span>$'+x.price.toFixed(2)+'</span>'+
       '<span class="'+
       (x.change >= 0 ? "up" : "")+
       '">'+x.change.toFixed(2)+'%</span>'+
       '</div>'
     ).join("");

 });

}

load();

setInterval(load,30000);

</script>

</body>
</html>
`);
});

app.get("/api/stocks", async (req,res)=>{

 try{

   const stocks = await Promise.all(

     SYMBOLS.map(async symbol=>{

       const q = await api("quote",{symbol});

       return {
         symbol,
         price:Number(q.c
