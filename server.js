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

async function getQuote(symbol) {
  const url =
    "https://finnhub.io/api/v1/quote?symbol=" +
    symbol + "&token=" + KEY;

  const r = await fetch(url);

  if (!r.ok) throw new Error("Finnhub 오류 " + r.status);

  const q = await r.json();

  return {
    symbol: symbol,
    price: Number(q.c || 0),
    change: Number(q.dp || 0)
  };
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
font-family:Arial;
}
header{
padding:22px;
text-align:center;
background:#111c2e;
}
.green{color:#22c55e}
.card{
background:#111c2e;
margin:12px;
padding:16px;
border-radius:14px;
}
.row{
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid #26344b;
}
.up{color:#22c55e}
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
async function load(){

const r = await fetch("/api/stocks");
const data = await r.json();

if(data.error){
document.getElementById("alerts").innerHTML =
"⚠️ " + data.error;
return;
}

const alerts = data.stocks.filter(x => x.change >= 1);

document.getElementById("alerts").innerHTML =
alerts.length
? alerts.map(x =>
"🚨 " + x.symbol +
" 상승 " + x.change.toFixed(2) + "%"
).join("<br>")
: "현재 1% 이상 상승 종목 없음";

document.getElementById("stocks").innerHTML =
data.stocks.map(x =>
'<div class="row">' +
"<b>" + x.symbol + "</b>" +
"<span>$" + x.price.toFixed(2) + "</span>" +
'<span class="' +
(x.change >= 0 ? "up" : "") +
'">' + x.change.toFixed(2) + "%</span>" +
"</div>"
).join("");

}

load();
setInterval(load,30000);
</script>

</body>
</html>
`);
});

app.get("/api/stocks", async (req, res) => {

try {

if (!KEY) {
throw new Error("FINNHUB_API_KEY가 없습니다.");
}

const stocks = await Promise.all(
SYMBOLS.map(getQuote)
);

res.json({
stocks: stocks,
error: ""
});

} catch (e) {

res.json({
stocks: [],
error: e.message
});

}

});

app.get("/health", (req,res) => {
res.json({
status: "healthy",
apiConfigured: Boolean(KEY)
});
});

app.listen(PORT, "0.0.0.0", () => {
console.log("Server running on port " + PORT);
});
