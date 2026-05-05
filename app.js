const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const htmlPage = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CI/CD Pipeline App</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background: #0a0a0f;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Animated background orbs */
    body::before {
      content: '';
      position: fixed;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
      top: -150px; left: -150px;
      border-radius: 50%;
      animation: float1 8s ease-in-out infinite;
      pointer-events: none;
    }
    body::after {
      content: '';
      position: fixed;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
      bottom: -100px; right: -100px;
      border-radius: 50%;
      animation: float2 10s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes float1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, 30px) scale(1.1); }
    }
    @keyframes float2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-30px, -40px) scale(1.05); }
    }

    .container {
      width: 100%;
      max-width: 780px;
      padding: 20px;
      position: relative;
      z-index: 1;
    }

    /* Status badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.3);
      color: #10b981;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 100px;
      margin-bottom: 28px;
    }
    .status-dot {
      width: 7px; height: 7px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    h1 {
      font-size: clamp(28px, 5vw, 42px);
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6ee7b7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #64748b;
      font-size: 15px;
      margin-bottom: 40px;
      font-weight: 400;
    }

    /* Cards grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 22px;
      transition: transform 0.2s ease, border-color 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }
    .card:hover {
      transform: translateY(-3px);
      border-color: rgba(255,255,255,0.12);
    }

    .card-icon {
      font-size: 22px;
      margin-bottom: 12px;
    }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 6px;
    }
    .card-value {
      font-size: 15px;
      font-weight: 600;
      color: #e2e8f0;
      word-break: break-all;
    }
    .card-value.highlight {
      background: linear-gradient(135deg, #a5b4fc, #6ee7b7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 18px;
    }

    /* Pipeline stages bar */
    .pipeline {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 20px;
    }
    .pipeline-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 16px;
    }
    .stages {
      display: flex;
      align-items: center;
      gap: 0;
      flex-wrap: wrap;
      gap: 8px;
    }
    .stage {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 500;
    }
    .stage-dot {
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
    }
    .stage-dot.done {
      background: rgba(16,185,129,0.15);
      border: 1px solid rgba(16,185,129,0.4);
    }
    .stage-name { color: #94a3b8; }
    .stage-arrow { color: #334155; font-size: 14px; }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 12px;
      color: #334155;
      margin-top: 8px;
    }
    .footer span {
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">

    <div class="status-badge">
      <span class="status-dot"></span>
      Pipeline Active
    </div>

    <h1>CI/CD Pipeline<br/>Running on Kubernetes</h1>
    <p class="subtitle">Deployed via Jenkins · Docker · Kubernetes on AWS EC2</p>

    <div class="grid">
      <div class="card">
        <div class="card-icon">💬</div>
        <div class="card-label">Message</div>
        <div class="card-value highlight">${data.message}</div>
      </div>
      <div class="card">
        <div class="card-icon">🏷️</div>
        <div class="card-label">Version</div>
        <div class="card-value">${data.version}</div>
      </div>
      <div class="card">
        <div class="card-icon">🖥️</div>
        <div class="card-label">Hostname (Pod)</div>
        <div class="card-value">${data.hostname}</div>
      </div>
      <div class="card">
        <div class="card-icon">🕐</div>
        <div class="card-label">Timestamp</div>
        <div class="card-value">${new Date(data.timestamp).toLocaleString()}</div>
      </div>
    </div>

    <div class="pipeline">
      <div class="pipeline-title">⚡ Pipeline Stages</div>
      <div class="stages">
        <div class="stage">
          <div class="stage-dot done">✓</div>
          <span class="stage-name">Checkout</span>
        </div>
        <span class="stage-arrow">→</span>
        <div class="stage">
          <div class="stage-dot done">✓</div>
          <span class="stage-name">Test</span>
        </div>
        <span class="stage-arrow">→</span>
        <div class="stage">
          <div class="stage-dot done">✓</div>
          <span class="stage-name">Build Image</span>
        </div>
        <span class="stage-arrow">→</span>
        <div class="stage">
          <div class="stage-dot done">✓</div>
          <span class="stage-name">Push to Hub</span>
        </div>
        <span class="stage-arrow">→</span>
        <div class="stage">
          <div class="stage-dot done">✓</div>
          <span class="stage-name">Deploy K8s</span>
        </div>
        <span class="stage-arrow">→</span>
        <div class="stage">
          <div class="stage-dot done">✓</div>
          <span class="stage-name">Verify</span>
        </div>
      </div>
    </div>

    <div class="footer">
      AWS Learner's Lab &nbsp;·&nbsp;
      <span>Jenkins + Docker + Kubernetes</span> &nbsp;·&nbsp;
      Ubuntu 24.04
    </div>

  </div>
</body>
</html>
`;

app.get('/', (req, res) => {
  const data = {
    message: 'Hello from CI/CD Pipeline!',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname()
  };
  res.send(htmlPage(data));
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello from CI/CD Pipeline!',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});