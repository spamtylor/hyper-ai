const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = 8085;
const HYPER_ROOT = path.resolve(__dirname, '../../');
const TASK_DIR = path.join(HYPER_ROOT, 'src/taskboard/tasks');
const ARCHIVE_DIR = path.join(HYPER_ROOT, 'src/taskboard/archive');
const LOG_DIR = path.join(HYPER_ROOT, 'src/taskboard/logs');

async function tailFile(filePath, lines = 50) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const allLines = content.split('\n').filter(l => l.trim() !== '');
        return allLines.slice(-lines);
    } catch (e) {
        return [`[Log file not found or empty: ${path.basename(filePath)}]`];
    }
}

async function getTaskFiles(dir) {
    try {
        const files = await fs.readdir(dir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const tasks = [];
        for (const file of jsonFiles) {
            try {
                const content = await fs.readFile(path.join(dir, file), 'utf-8');
                tasks.push(JSON.parse(content));
            } catch (e) {
                // Ignore broken json silently
            }
        }
        return tasks;
    } catch (e) {
        return [];
    }
}

async function handleApiStatus(req, res) {
    try {
        const [pendingTasks, archivedTasks, ralphLogs, cronLogs] = await Promise.all([
            getTaskFiles(TASK_DIR),
            getTaskFiles(ARCHIVE_DIR),
            tailFile(path.join(LOG_DIR, 'ralph-loop.log'), 50),
            tailFile(path.join(LOG_DIR, 'cron.log'), 30)
        ]);

        const telemetry = require('../monitor/telemetry.js').getMetrics();
        const activeTasks = pendingTasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority || 'MEDIUM'
        }));

        const payload = {
            status: 'online',
            tasks: {
                pending: pendingTasks.length,
                completed: archivedTasks.length,
                activeList: activeTasks
            },
            logs: {
                ralph: ralphLogs,
                cron: cronLogs
            },
            resources: telemetry
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
    } catch (e) {
        console.error('API Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
    }
}

const HTML_UI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Setup</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --panel: #1e293b;
            --accent: #38bdf8;
            --success: #10b981;
            --text: #f8fafc;
            --dim: #94a3b8;
        }
        * { box-sizing: border-box; }
        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .title {
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.025em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status-badge {
            font-size: 0.8rem;
            padding: 4px 12px;
            border-radius: 20px;
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.2);
            font-weight: 600;
        }
        .dashboard {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 1.5rem;
            flex: 1;
            min-height: 0;
        }
        .panel {
            background: var(--panel);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
        }
        .panel-header {
            font-size: 0.9rem;
            text-transform: uppercase;
            color: var(--dim);
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .metric-box {
            background: rgba(15, 23, 42, 0.5);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .metric-label { font-size: 0.75rem; color: var(--dim); margin-bottom: 4px; }
        .metric-value { font-size: 1.5rem; font-weight: 600; color: var(--accent); }
        
        .task-list {
            list-style: none;
            padding: 0;
            margin: 0;
            flex: 1;
            overflow-y: auto;
        }
        .task-item {
            padding: 10px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 0.85rem;
            border-left: 3px solid #64748b;
        }
        .task-item.high { border-left-color: #ef4444; }
        .task-item.medium { border-left-color: #f59e0b; }
        .task-priority { font-weight: 600; font-size: 0.7rem; opacity: 0.8; }
        
        .log-container {
            background: #000;
            border-radius: 8px;
            padding: 1rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            flex: 1;
            overflow-y: auto;
            color: #d1d5db;
            line-height: 1.5;
        }
        .toggle-btn {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--dim);
            padding: 2px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.7rem;
        }
        .toggle-btn:hover { background: rgba(255, 255, 255, 0.05); }
        .empty-state {
            color: var(--dim);
            font-style: italic;
            font-size: 0.8rem;
            text-align: center;
            margin-top: 2rem;
        }
        .metric-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">✧ Hyper Setup</div>
        <div style="display: flex; align-items: center; gap: 15px;">
            <div id="clock" style="font-family: 'JetBrains Mono'; font-size: 0.9rem; color: var(--dim);">--:--:--</div>
            <div class="status-badge" id="conn-status">● Live</div>
        </div>
    </div>

    <div class="dashboard">
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="panel">
                <div class="panel-header">Task Metrics</div>
                <div class="metrics-grid">
                    <div class="metric-box">
                        <div class="metric-label">Pending</div>
                        <div class="metric-value" id="pending-count">0</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Completed</div>
                        <div class="metric-value" id="completed-count">0</div>
                    </div>
                </div>
                <div class="panel-header" style="margin-bottom: 1rem;">Active Queue</div>
                <ul class="task-list" id="task-queue">
                    <div class="empty-state">No pending tasks found.</div>
                </ul>
            </div>
            <div class="panel">
                <div class="panel-header" id="cpu-model">System Resources</div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="metric-group">
                        <div class="metric-box">
                            <div class="metric-label">Disk Usage</div>
                            <div class="metric-value" id="disk-usage">0%</div>
                        </div>
                        <div class="metric-box">
                            <div class="metric-label">RAM Used</div>
                            <div class="metric-value" id="ram-usage">0GB</div>
                        </div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">PMX Containers</div>
                        <div class="metric-value" id="pmx-count">0</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="panel" style="flex: 1;">
            <div class="panel-header">
                System Terminal 
                <button class="toggle-btn" id="log-toggle">Tailing: Ralph Loop</button>
            </div>
            <div class="log-container" id="terminal">
                <div>Connecting to Hyper streams...</div>
            </div>
        </div>
    </div>

    <script>
        let showingRalph = true;
        let lastData = null;

        document.getElementById('log-toggle').addEventListener('click', () => {
            showingRalph = !showingRalph;
            document.getElementById('log-toggle').innerText = showingRalph ? 'Tailing: Ralph Loop' : 'Tailing: Cron Daemon';
            renderLogs();
        });

        function renderLogs() {
            if (!lastData) return;
            const term = document.getElementById('terminal');
            const logs = lastData.logs || { ralph: [], cron: [] };
            const lines = showingRalph ? logs.ralph : logs.cron;
            
            if (!lines || lines.length === 0) {
                term.innerHTML = '<div style="color: #64748b; font-style: italic;">[Stream empty]</div>';
            } else {
                term.innerHTML = lines.map(l => {
                    const clean = l.replace(/<br\\\/>/g, '').replace(/&lt;br\\\&gt;/g, '');
                    return '<div>' + clean + '</div>';
                }).join('');
            }
            term.scrollTop = term.scrollHeight;
        }

        async function fetchData() {
            try {
                const res = await fetch('/api/status');
                if (!res.ok) throw new Error('Network error');
                const data = await res.json();
                lastData = data;
                
                const statusBadge = document.getElementById('conn-status');
                statusBadge.style.color = 'var(--success)';
                statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
                statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                statusBadge.innerText = '● Live';
                
                const setSafe = (id, val) => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = val !== undefined && val !== null ? val : '--';
                };

                setSafe('pending-count', data.tasks.pending);
                setSafe('completed-count', data.tasks.completed);
                
                if (data.resources) {
                    setSafe('disk-usage', (data.resources.diskUsage || 0) + '%');
                    setSafe('ram-usage', data.resources.ramUsed || '--');
                    setSafe('pmx-count', data.resources.lxcCount || 0);
                    setSafe('cpu-model', (data.resources.cpuModel || 'Resource') + ' (Titan)');
                }
                
                const queueElem = document.getElementById('task-queue');
                if (!data.tasks.activeList || data.tasks.activeList.length === 0) {
                    queueElem.innerHTML = '<div class="empty-state">No pending tasks found.</div>';
                } else {
                    queueElem.innerHTML = data.tasks.activeList.map(t => 
                        '<li class="task-item ' + (t.priority || 'MEDIUM').toLowerCase() + '">' +
                            '<span class="task-priority">[' + (t.priority || 'NORM').toUpperCase().substring(0,4) + ']</span> ' + t.title +
                        '</li>'
                    ).join('');
                }
                
                renderLogs();
            } catch (e) {
                console.error('Fetch error:', e);
                const statusBadge = document.getElementById('conn-status');
                statusBadge.style.color = '#ef4444';
                statusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
                statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                statusBadge.innerText = '● Offline';
            }
        }

        setInterval(() => {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        }, 1000);

        setInterval(fetchData, 3000);
        fetchData();
        document.getElementById('clock').innerText = new Date().toLocaleTimeString();
    </script>
</body>
</html>
`;

function requestListener(req, res) {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(HTML_UI);
    } else if (req.method === 'GET' && req.url === '/api/status') {
        handleApiStatus(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

function startServer(port = PORT) {
    const server = http.createServer(requestListener);
    server.listen(port, () => {
        console.log(`[Hyper Dashboard] Server running locally on port ${port}`);
    });
    return server;
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer, requestListener, tailFile, getTaskFiles, handleApiStatus };
