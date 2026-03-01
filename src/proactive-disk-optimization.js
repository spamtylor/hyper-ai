const { exec } = require('child_process');

async function cleanContainerLogs() {
    return new Promise((resolve, reject) => {
        exec('find /var/log/lxc -type f -mtime +7 -delete', (error, stdout, stderr) => {
            if (error) {
                console.error(`Container logs cleanup error: ${error}`);
                reject(error);
            } else {
                console.log('Container logs cleaned');
                resolve();
            }
        });
    });
}

async function cleanSnapshots() {
    return new Promise((resolve, reject) => {
        exec('find /var/lib/lxd/snapshots -mindepth 2 -type d -mtime +30 -delete', (error, stdout, stderr) => {
            if (error) {
                console.error(`Snapshots cleanup error: ${error}`);
                reject(error);
            } else {
                console.log('Snapshots cleaned');
                resolve();
            }
        });
    });
}

async function cleanCache() {
    return new Promise((resolve, reject) => {
        exec('find /var/cache/lxd -type f -mtime +7 -delete', (error, stdout, stderr) => {
            if (error) {
                console.error(`Cache cleanup error: ${error}`);
                reject(error);
            } else {
                console.log('Cache cleaned');
                resolve();
            }
        });
    });
}

async function runOptimization() {
    console.log("Starting proactive disk optimization...");
    await cleanContainerLogs();
    await cleanSnapshots();
    await cleanCache();
    console.log("Disk optimization completed.");
}

module.exports = {
    runOptimization
};
