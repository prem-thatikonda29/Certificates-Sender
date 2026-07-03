# CertDrop Plan 3 — Local Web UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local web UI served by FastAPI that guides users through a 5-step wizard: upload template → place text visually → upload CSV → preview → send with a live dashboard.

**Architecture:** FastAPI serves static files from `ui/` and exposes REST endpoints under `/api/`. The UI is vanilla JS (no framework) — a single HTML page with step-based state. The visual template builder uses an HTML canvas to let users click/drag the text position. Server-Sent Events (SSE) power the live send dashboard.

**Prerequisite:** Plan 1 (Core Engine) and Plan 2 (CLI) must be complete.

**Tech Stack:** Python 3.12, FastAPI, uvicorn, vanilla JS, HTML Canvas API

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `api/__init__.py` | Create | Package marker |
| `api/server.py` | Create | FastAPI app, all endpoints |
| `ui/index.html` | Create | Single-page wizard UI |
| `ui/builder.js` | Create | Canvas-based template builder |
| `ui/dashboard.js` | Create | Live send dashboard (SSE) |
| `ui/style.css` | Create | Minimal styling |
| `tests/test_api.py` | Create | API endpoint tests |

---

## Task 1: FastAPI server scaffold

**Files:**
- Create: `api/__init__.py`
- Create: `api/server.py`
- Create: `tests/test_api.py`

- [ ] **Step 1: Write failing API test**

Create `tests/test_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from api.server import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_api.py -v
```

Expected: `ModuleNotFoundError: No module named 'api'`

- [ ] **Step 3: Create API scaffold**

Create `api/__init__.py` (empty).

Create `api/server.py`:

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="CertDrop")
app.mount("/static", StaticFiles(directory="ui"), name="static")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/")
def index():
    return FileResponse("ui/index.html")
```

- [ ] **Step 4: Create ui directory placeholder**

```bash
mkdir -p ui
touch ui/.gitkeep
```

- [ ] **Step 5: Run test**

```bash
pytest tests/test_api.py::test_health -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add api/ tests/test_api.py ui/.gitkeep
git commit -m "feat: FastAPI server scaffold with health endpoint"
```

---

## Task 2: Template upload and preview endpoint

**Files:**
- Modify: `api/server.py`
- Modify: `tests/test_api.py`

- [ ] **Step 1: Write failing test**

Append to `tests/test_api.py`:

```python
import io
from PIL import Image


def _make_test_image() -> bytes:
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, "JPEG")
    return buf.getvalue()


def test_upload_template():
    img_bytes = _make_test_image()
    response = client.post(
        "/api/template",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    assert "template_id" in response.json()


def test_preview_certificate():
    img_bytes = _make_test_image()
    upload = client.post("/api/template", files={"file": ("test.jpg", img_bytes, "image/jpeg")})
    template_id = upload.json()["template_id"]

    response = client.post("/api/preview", json={
        "template_id": template_id,
        "name": "Priya Sharma",
        "text_x": 50,
        "text_y": 50,
        "font_size": 12,
    })
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_api.py::test_upload_template tests/test_api.py::test_preview_certificate -v
```

Expected: 404 errors.

- [ ] **Step 3: Implement template upload and preview**

Add to `api/server.py`:

```python
import io
import os
import uuid

from fastapi import UploadFile, File
from fastapi.responses import Response
from PIL import Image, ImageDraw, ImageFont

from config import FONT_PATH, FONT_COLOR, PILL_COLOR, PILL_PADDING_X, PILL_PADDING_Y
from core.generator import generate_certificate_bytes

TEMPLATE_STORE: dict[str, bytes] = {}


@app.post("/api/template")
async def upload_template(file: UploadFile = File(...)):
    contents = await file.read()
    template_id = str(uuid.uuid4())
    TEMPLATE_STORE[template_id] = contents
    return {"template_id": template_id}


@app.post("/api/preview")
async def preview_certificate(body: dict):
    template_id = body["template_id"]
    name = body["name"]
    text_x = body["text_x"]
    text_y = body["text_y"]
    font_size = body.get("font_size", 66)

    if template_id not in TEMPLATE_STORE:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")

    template_bytes = TEMPLATE_STORE[template_id]
    img = Image.open(io.BytesIO(template_bytes)).convert("RGBA")

    tier = {
        "template_bytes": template_bytes,
        "font_size": font_size,
        "max_text_width": img.width - 100,
        "text_position": (text_x, text_y),
    }

    png_buf = io.BytesIO()
    img.convert("RGB").save(png_buf, "PNG")
    png_buf.seek(0)
    return Response(content=png_buf.read(), media_type="image/png")
```

Also update `generate_certificate_bytes` in `core/generator.py` to accept `template_bytes` in tier dict as an alternative to `template` file path:

```python
def generate_certificate_bytes(name: str, tier: dict) -> bytes:
    if "template_bytes" in tier:
        img = Image.open(io.BytesIO(tier["template_bytes"])).convert("RGBA")
    else:
        img = Image.open(tier["template"]).convert("RGBA")
    # ... rest unchanged
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_api.py -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add api/server.py core/generator.py tests/test_api.py
git commit -m "feat: template upload and certificate preview API"
```

---

## Task 3: CSV upload and validation endpoint

**Files:**
- Modify: `api/server.py`
- Modify: `tests/test_api.py`

- [ ] **Step 1: Write failing test**

Append to `tests/test_api.py`:

```python
def test_upload_csv_valid():
    csv_content = b"name,email\nPriya Sharma,priya@gmail.com\n"
    response = client.post("/api/csv", files={"file": ("data.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    data = response.json()
    assert data["row_count"] == 1
    assert data["issues"] == []


def test_upload_csv_with_issues():
    csv_content = b"name,email\nPriya Sharma,priya@gamil.com\n"
    response = client.post("/api/csv", files={"file": ("data.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    data = response.json()
    assert len(data["issues"]) > 0
    assert data["issues"][0]["issue"] == "Typo domain detected"
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_api.py::test_upload_csv_valid tests/test_api.py::test_upload_csv_with_issues -v
```

Expected: 404 errors.

- [ ] **Step 3: Implement CSV upload endpoint**

Add to `api/server.py`:

```python
import csv as _csv
from core.validator import validate_csv, clean_name

CSV_STORE: dict[str, list[dict]] = {}


@app.post("/api/csv")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    text = contents.decode("utf-8")
    issues = validate_csv(io.StringIO(text))
    reader = _csv.DictReader(io.StringIO(text))
    rows = [{"name": clean_name(r.get("name", "")), "email": r.get("email", "").strip()} for r in reader]
    csv_id = str(uuid.uuid4())
    CSV_STORE[csv_id] = rows
    return {"csv_id": csv_id, "row_count": len(rows), "issues": issues}
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_api.py -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add api/server.py tests/test_api.py
git commit -m "feat: CSV upload and validation API endpoint"
```

---

## Task 4: Live send with SSE dashboard

**Files:**
- Modify: `api/server.py`
- Modify: `tests/test_api.py`

- [ ] **Step 1: Write failing test**

Append to `tests/test_api.py`:

```python
def test_send_dry_run_returns_stream():
    # Upload a template
    img_bytes = _make_test_image()
    t = client.post("/api/template", files={"file": ("t.jpg", img_bytes, "image/jpeg")}).json()

    # Upload a CSV
    csv_content = b"name,email\nPriya Sharma,priya@gmail.com\n"
    c = client.post("/api/csv", files={"file": ("d.csv", csv_content, "text/csv")}).json()

    # Trigger dry-run send
    response = client.post("/api/send", json={
        "template_id": t["template_id"],
        "csv_id": c["csv_id"],
        "tier_name": "test",
        "dry_run": True,
        "text_position": [50, 50],
        "font_size": 12,
    })
    assert response.status_code == 200
```

- [ ] **Step 2: Run to verify failure**

```bash
pytest tests/test_api.py::test_send_dry_run_returns_stream -v
```

Expected: 404 error.

- [ ] **Step 3: Implement send endpoint with SSE**

Add to `api/server.py`:

```python
import asyncio
import json as _json
from fastapi.responses import StreamingResponse
from core.generator import generate_certificate_bytes
from core.sender import AccountPool, send_one
from core.progress import ProgressTracker
from config import CC_ADDRESSES
import os


@app.post("/api/send")
async def send_certificates(body: dict):
    template_id = body["template_id"]
    csv_id = body["csv_id"]
    dry_run = body.get("dry_run", False)
    text_x, text_y = body["text_position"]
    font_size = body.get("font_size", 66)

    if template_id not in TEMPLATE_STORE or csv_id not in CSV_STORE:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template or CSV not found")

    rows = CSV_STORE[csv_id]
    template_bytes = TEMPLATE_STORE[template_id]

    async def event_stream():
        pool = None
        smtp = None
        if not dry_run:
            accounts_raw = os.getenv("SMTP_ACCOUNTS", "")
            if accounts_raw:
                accounts = [tuple(p.split(":", 1)) for p in accounts_raw.split(",") if ":" in p]
            else:
                accounts = [(os.getenv("GMAIL_USER"), os.getenv("GMAIL_APP_PASSWORD"))]
            pool = AccountPool(accounts)
            smtp = pool.connect()

        progress = ProgressTracker()
        sent = failed = 0

        for i, row in enumerate(rows):
            name = row["name"]
            email = row["email"]

            tier = {
                "template_bytes": template_bytes,
                "font_size": font_size,
                "max_text_width": 1740,
                "text_position": (text_x, text_y),
                "cert_suffix": "certificate",
                "email_subject": body.get("email_subject", "Your Certificate"),
                "email_html_body": body.get("email_html_body", "<p>Hi {name}, your certificate is attached.</p>"),
                "email_plain_body": body.get("email_plain_body", "Hi {name}, your certificate is attached."),
            }

            try:
                pdf_bytes = generate_certificate_bytes(name, tier)
                if not dry_run and smtp:
                    filename = f"{name.lower().replace(' ', '_')}_certificate.pdf"
                    smtp = send_one(smtp=smtp, pool=pool, from_addr=pool.current_user,
                                    to_addr=email, cc_addrs=CC_ADDRESSES,
                                    subject=tier["email_subject"],
                                    html_body=tier["email_html_body"].format(name=name),
                                    plain_body=tier["email_plain_body"].format(name=name),
                                    pdf_bytes=pdf_bytes, filename=filename)
                    progress.mark_sent("ui_send", name, email)
                    sent += 1
                    status = "sent"
                else:
                    status = "dry_run"
            except Exception as exc:
                failed += 1
                status = f"failed: {exc}"

            event = _json.dumps({"i": i + 1, "total": len(rows), "name": name, "email": email, "status": status, "sent": sent, "failed": failed})
            yield f"data: {event}\n\n"
            await asyncio.sleep(0)

        if smtp:
            smtp.quit()
        yield f"data: {_json.dumps({'done': True, 'sent': sent, 'failed': failed})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/test_api.py -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add api/server.py tests/test_api.py
git commit -m "feat: SSE live send endpoint"
```

---

## Task 5: Build the UI

**Files:**
- Create: `ui/index.html`
- Create: `ui/style.css`
- Create: `ui/builder.js`
- Create: `ui/dashboard.js`

- [ ] **Step 1: Create style.css**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #0f0f0f; color: #f0f0f0; min-height: 100vh; }
.container { max-width: 900px; margin: 0 auto; padding: 2rem; }
h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
.steps { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
.step { padding: 0.4rem 1rem; border-radius: 999px; background: #2a2a2a; font-size: 0.85rem; cursor: pointer; }
.step.active { background: #6366f1; color: white; }
.step.done { background: #22c55e; color: white; }
.panel { display: none; } .panel.active { display: block; }
.btn { padding: 0.6rem 1.4rem; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; }
.btn-primary { background: #6366f1; color: white; }
.btn-primary:hover { background: #4f46e5; }
.row-ok { color: #22c55e; } .row-fail { color: #ef4444; }
#canvas-wrap { position: relative; display: inline-block; }
#builder-canvas { cursor: crosshair; max-width: 100%; border: 1px solid #333; }
.issue-badge { background: #ef4444; color: white; border-radius: 4px; padding: 2px 6px; font-size: 0.75rem; }
.progress-bar { height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden; margin: 1rem 0; }
.progress-fill { height: 100%; background: #6366f1; transition: width 0.3s; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #2a2a2a; font-size: 0.9rem; }
```

- [ ] **Step 2: Create builder.js**

```javascript
// Visual template builder — canvas click/drag to set text position
const BuilderModule = (() => {
  let canvas, ctx, img, pos = { x: 0, y: 0 }, dragging = false;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", () => { dragging = false; });
  }

  function loadImage(url) {
    return new Promise(resolve => {
      img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        pos = { x: img.width / 2, y: img.height / 2 };
        draw();
        resolve();
      };
      img.src = url;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x - 20, pos.y); ctx.lineTo(pos.x + 20, pos.y);
    ctx.moveTo(pos.x, pos.y - 20); ctx.lineTo(pos.x, pos.y + 20);
    ctx.stroke();
  }

  function getScale() {
    return img ? img.width / canvas.getBoundingClientRect().width : 1;
  }

  function onDown(e) {
    dragging = true;
    const r = canvas.getBoundingClientRect(), scale = getScale();
    pos = { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale };
    draw();
  }

  function onMove(e) {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect(), scale = getScale();
    pos = { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale };
    draw();
  }

  function getPosition() { return { x: Math.round(pos.x), y: Math.round(pos.y) }; }

  return { init, loadImage, getPosition };
})();
```

- [ ] **Step 3: Create dashboard.js**

```javascript
// Live send dashboard — consumes SSE stream from /api/send
const DashboardModule = (() => {
  function start({ templateId, csvId, textPosition, fontSize, emailSubject, emailHtmlBody, emailPlainBody, dryRun, onEvent, onDone }) {
    const source = new EventSource("/api/send-stream?" + new URLSearchParams({
      template_id: templateId, csv_id: csvId,
      text_x: textPosition.x, text_y: textPosition.y,
      font_size: fontSize, dry_run: dryRun ? "1" : "0",
    }));

    source.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.done) { source.close(); onDone(data); }
      else onEvent(data);
    };

    source.onerror = () => source.close();
  }

  return { start };
})();
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CertDrop</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
<div class="container">
  <h1>CertDrop</h1>
  <p style="color:#888;margin-bottom:1.5rem">Bulk certificate generator & sender</p>

  <div class="steps">
    <div class="step active" data-step="1">1. Template</div>
    <div class="step" data-step="2">2. Position</div>
    <div class="step" data-step="3">3. CSV</div>
    <div class="step" data-step="4">4. Preview</div>
    <div class="step" data-step="5">5. Send</div>
  </div>

  <!-- Step 1: Upload template -->
  <div class="panel active" id="step-1">
    <h2>Upload Template</h2>
    <p style="color:#888;margin:.5rem 0 1rem">Any PNG or JPG. This is the background image for your certificate.</p>
    <input type="file" id="template-input" accept="image/*">
    <br><br>
    <button class="btn btn-primary" id="btn-upload-template">Upload & Continue</button>
  </div>

  <!-- Step 2: Position builder -->
  <div class="panel" id="step-2">
    <h2>Set Name Position</h2>
    <p style="color:#888;margin:.5rem 0 1rem">Click on the certificate where the name should appear.</p>
    <div id="canvas-wrap"><canvas id="builder-canvas"></canvas></div>
    <br>
    <button class="btn btn-primary" id="btn-confirm-position">Confirm Position</button>
  </div>

  <!-- Step 3: Upload CSV -->
  <div class="panel" id="step-3">
    <h2>Upload Recipients CSV</h2>
    <p style="color:#888;margin:.5rem 0 1rem">Two columns: <code>name</code> and <code>email</code>.</p>
    <input type="file" id="csv-input" accept=".csv">
    <div id="validation-report" style="margin-top:1rem"></div>
    <br>
    <button class="btn btn-primary" id="btn-upload-csv">Upload & Validate</button>
  </div>

  <!-- Step 4: Preview -->
  <div class="panel" id="step-4">
    <h2>Preview</h2>
    <p style="color:#888;margin:.5rem 0 1rem">Sample certificates for the first 3 recipients.</p>
    <div id="preview-container"></div>
    <br>
    <button class="btn btn-primary" id="btn-go-send">Looks Good — Send</button>
  </div>

  <!-- Step 5: Send dashboard -->
  <div class="panel" id="step-5">
    <h2>Sending</h2>
    <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
    <p id="progress-label" style="color:#888;margin-bottom:1rem">0 / 0 sent</p>
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Status</th></tr></thead>
      <tbody id="send-log"></tbody>
    </table>
  </div>
</div>

<script src="/static/builder.js"></script>
<script src="/static/dashboard.js"></script>
<script>
  let templateId, csvId, textPosition = { x: 0, y: 0 };
  const steps = document.querySelectorAll(".step");
  const panels = document.querySelectorAll(".panel");

  function goTo(n) {
    steps.forEach((s, i) => { s.classList.toggle("active", i + 1 === n); if (i + 1 < n) s.classList.add("done"); });
    panels.forEach((p, i) => p.classList.toggle("active", i + 1 === n));
  }

  // Step 1: upload template
  document.getElementById("btn-upload-template").onclick = async () => {
    const file = document.getElementById("template-input").files[0];
    if (!file) return alert("Pick a file first");
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/template", { method: "POST", body: fd });
    const data = await res.json();
    templateId = data.template_id;
    const url = URL.createObjectURL(file);
    BuilderModule.init(document.getElementById("builder-canvas"));
    await BuilderModule.loadImage(url);
    goTo(2);
  };

  // Step 2: confirm position
  document.getElementById("btn-confirm-position").onclick = () => {
    textPosition = BuilderModule.getPosition();
    goTo(3);
  };

  // Step 3: upload CSV
  document.getElementById("btn-upload-csv").onclick = async () => {
    const file = document.getElementById("csv-input").files[0];
    if (!file) return alert("Pick a CSV first");
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/csv", { method: "POST", body: fd });
    const data = await res.json();
    csvId = data.csv_id;
    const report = document.getElementById("validation-report");
    if (data.issues.length === 0) {
      report.innerHTML = `<p style="color:#22c55e">✓ ${data.row_count} recipients, no issues found.</p>`;
      setTimeout(() => goTo(4), 800);
    } else {
      report.innerHTML = `<p><span class="issue-badge">${data.issues.length} issues</span></p><ul style="margin-top:.5rem;color:#ef4444">` +
        data.issues.map(i => `<li>Row ${i.row}: ${i.name} &lt;${i.email}&gt; — ${i.issue}</li>`).join("") + "</ul>";
    }
  };

  // Step 4: preview
  document.getElementById("btn-go-send").onclick = () => goTo(5);

  // Step 5: send
  document.addEventListener("DOMContentLoaded", () => {});

  document.querySelector("[data-step='5']").addEventListener("click", () => {
    const log = document.getElementById("send-log");
    const fill = document.getElementById("progress-fill");
    const label = document.getElementById("progress-label");

    const es = new EventSource(`/api/send-stream?template_id=${templateId}&csv_id=${csvId}&text_x=${textPosition.x}&text_y=${textPosition.y}&font_size=66&dry_run=0`);
    es.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.done) { es.close(); return; }
      fill.style.width = `${(d.i / d.total) * 100}%`;
      label.textContent = `${d.sent} / ${d.total} sent`;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.i}</td><td>${d.name}</td><td>${d.email}</td><td class="${d.status === 'sent' ? 'row-ok' : 'row-fail'}">${d.status}</td>`;
      log.prepend(tr);
    };
  });
</script>
</body>
</html>
```

- [ ] **Step 5: Add SSE GET endpoint to server.py**

Add to `api/server.py`:

```python
from fastapi import Request


@app.get("/api/send-stream")
async def send_stream(
    request: Request,
    template_id: str,
    csv_id: str,
    text_x: int,
    text_y: int,
    font_size: int = 66,
    dry_run: str = "0",
):
    body = {
        "template_id": template_id,
        "csv_id": csv_id,
        "text_position": [text_x, text_y],
        "font_size": font_size,
        "dry_run": dry_run == "1",
        "email_subject": "Your Certificate",
        "email_html_body": "<p>Hi {name}, your certificate is attached.</p>",
        "email_plain_body": "Hi {name}, your certificate is attached.",
    }
    return await send_certificates(body)
```

- [ ] **Step 6: Smoke test the UI**

```bash
python run.py ui
```

Open `http://localhost:5000`. Walk through all 5 steps with a test image and CSV. Verify: template uploads, canvas loads, click sets crosshair, CSV validates, send streams events to table.

- [ ] **Step 7: Commit**

```bash
git add ui/ api/server.py
git commit -m "feat: local web UI — 5-step wizard with visual builder and live dashboard"
```

---

## Task 6: Full test suite pass

- [ ] **Step 1: Run all tests**

```bash
pytest tests/ -v --cov=core --cov=api --cov-report=term-missing
```

Expected: all PASS.

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: local UI complete — wizard, builder, live dashboard"
```
