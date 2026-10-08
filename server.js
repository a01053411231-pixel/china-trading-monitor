const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>China Trading Monitor</title>
<style>
body{margin:0;background:#111827;color:white;font-family:Arial}
header{padding:20px;text-align:center;background:#1f2937}
main{padding:15px}
.card{background:#1f2937;border-radius:14px;padding:18px;margin-bottom:12px}
.green{color:#22c55e;font-weight:bold}
.gray{color:#9ca3af}
</style>
</head>
<body>
<header>
<h2>🇨🇳 China Trading Monitor</h2>
<div class="green">● 서버 연결 정상</div>
</header>
<main>
<div class="card">
<h3>📊 중국 관련 종목 감시</h3>
<p class="gray">미국 증시에 상장된 중국 관련 종목을 감시합니다.</p>
</div>

<div class="card">
<h3>⚡ 감시 조건</h3>
<p>상승률 ≥ 1%</p>
<p>거래량 급증 ≥ 3배</p>
<p>거래대금 ≥ $100M</p>
</div>

<div class="card">
<h3>👀 감시 종목</h3>
<p>BABA · JD · PDD · BIDU</p>
<p>NIO · XPEV · LI · BEKE</p>
<p>TME · BZ · ZTO · FUTU</p>
<p>TAL · EDU · VIPS · WB</p>
</div>

<div class="card">
<h3>🔔 알림</h3>
<p class="gray">실시간 주가 API 연결을 다음 단계에서 추가합니다.</p>
</div>
</main>
</body>
</html>
  `);
});

app.get("/health", (req, res) => {
  res.json({status:"healthy"});
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
