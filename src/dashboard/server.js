const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = 8080;
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
            tailFile(path.join(LOG_DIR, 'ralph.log'), 30),
            tailFile(path.join(LOG_DIR, 'cron.log'), 30)
        ]);

        const payload = {
            status: 'online',
            timestamp: new Date().toISOString(),
            tasks: {
                pending: pendingTasks.length,
                completed: archivedTasks.length,
                activeList: pendingTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority || 'NORMAL' }))
            },
            logs: {
                ralph: ralphLogs,
                cron: cronLogs
            }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to generate status payload' }));
    }
}

const HTML_UI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper AI Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #0f111a;
            --panel-bg: rgba(30, 33, 43, 0.6);
            --border-color: rgba(255, 255, 255, 0.05);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent: #6366f1;
            --accent-glow: rgba(99, 102, 241, 0.4);
            --success: #10b981;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-image: 
                radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.05), transparent 30%),
                radial-gradient(circle at 90% 60%, rgba(139, 92, 246, 0.05), transparent 30%);
        }
        header {
            padding: 1.5rem 3rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 17, 26, 0.8);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 10;
        }
        h1 { font-weight: 600; font-size: 1.25rem; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.75rem; text-transform: uppercase; }
        .status-badge {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 600;
            border: 1px solid rgba(16, 185, 129, 0.2);
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
            letter-spacing: 0.05em;
        }
        .container {
            padding: 3rem;
            max-width: 1600px;
            margin: 0 auto;
            width: 100%;
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 2rem;
            flex: 1;
        }
        .panel {
            background: var(--panel-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.75rem;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(16px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .panel-header {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .metric-group { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .metric-box { flex: 1; background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); }
        .metric-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .metric-value { font-size: 2.5rem; font-weight: 300; margin-top: 0.5rem; color: white; text-shadow: 0 0 20px var(--accent-glow); }
        .task-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; max-height: 400px; padding-right: 0.5rem;}
        .task-item {
            background: rgba(0,0,0,0.25);
            padding: 1rem 1.25rem;
            border-radius: 10px;
            border-left: 3px solid var(--accent);
            font-size: 0.85rem;
            line-height: 1.4;
            transition: background 0.2s;
        }
        .task-item:hover { background: rgba(0,0,0,0.4); }
        .task-item.high { border-left-color: #ef4444; }
        .task-item.medium { border-left-color: #eab308; }
        .task-item.low { border-left-color: #3b82f6; }
        .task-priority { font-size: 0.7rem; font-weight: 600; opacity: 0.8; margin-right: 0.5rem; letter-spacing: 0.05em; }
        .log-container {
            flex: 1;
            background: #0a0a0f;
            border-radius: 12px;
            padding: 1.5rem;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 0.85rem;
            color: #10b981;
            overflow-y: auto;
            max-height: 600px;
            border: 1px solid #1a1a24;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
            line-height: 1.6;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .toggle-btn {
            background: rgba(99, 102, 241, 0.1);
            color: var(--accent);
            border: 1px solid rgba(99, 102, 241, 0.3);
            padding: 0.35rem 0.85rem;
            border-radius: 6px;
            font-size: 0.7rem;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s;
        }
        .toggle-btn:hover { background: rgba(99, 102, 241, 0.2); }
        .empty-state { color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 2rem 0; }
        @media (max-width: 1024px) { .container { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <header>
        <h1>✧ Hyper Setup <span class="status-badge" id="conn-status">● Live</span></h1>
        <div style="color: var(--text-muted); font-size: 0.85rem; letter-spacing: 0.05em;" id="clock">--:--:--</div>
    </header>
    <div class="container">
        <div style="display: flex; flex-direction: column; gap: 2rem;">
            <div class="panel">
                <div class="panel-header">Task Metrics</div>
                <div class="metric-group">
                    <div class="metric-box">
                        <div class="metric-label">Pending</div>
                        <div class="metric-value" id="pending-count">0</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Completed</div>
                        <div class="metric-value" id="completed-count" style="text-shadow: 0 0 20px rgba(16,185,129,0.3);">0</div>
                    </div>
                </div>
                <div class="panel-header" style="margin-bottom: 1rem;">Active Queue</div>
                <ul class="task-list" id="task-queue">
                    <div class="empty-state">No pending tasks found.</div>
                </ul>
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
            const lines = showingRalph ? lastData.logs.ralph : lastData.logs.cron;
            
            if (lines.length === 0) {
                term.innerHTML = '<div style="color: #64748b; font-style: italic;">[Stream empty]</div>';
            } else {
                term.innerHTML = lines.map(l => '<div>' + l.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>').join('');
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
                statusBadge.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.15)';
                statusBadge.innerText = '● Live';
                
                document.getElementById('pending-count').innerText = data.tasks.pending;
                document.getElementById('completed-count').innerText = data.tasks.completed;
                
                const queueElem = document.getElementById('task-queue');
                if (data.tasks.activeList.length === 0) {
                    queueElem.innerHTML = '<div class="empty-state">No pending tasks found.</div>';
                } else {
                    queueElem.innerHTML = data.tasks.activeList.map(t => 
                        '<li class="task-item ' + (t.priority || 'normal').toLowerCase() + '">' +
                            '<span class="task-priority" style="color: #fff;">[' + (t.priority || 'NORM').toUpperCase().substring(0,4) + ']</span> ' + t.title +
                        '</li>'
                    ).join('');
                }
                
                renderLogs();
            } catch (e) {
                const statusBadge = document.getElementById('conn-status');
                statusBadge.style.color = '#ef4444';
                statusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
                statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                statusBadge.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.15)';
                statusBadge.innerText = '● Offline';
            }
        }

        setInterval(() => {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        }, 1000);

        setInterval(fetchData, 2000);
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
