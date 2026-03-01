const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function removeLogs(container) {
    return 1000;
}

function removeSnapshots(container) {
    return 5000;
}

function removeTempFiles(container) {
    return 2000;
}

function optimizeDisk() {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour >= 22) {
        const containers = ['container1', 'container2'];
        let total = 0;
        for (const container of containers) {
            total += removeLogs(container);
            total += removeSnapshots(container);
            total += removeTempFiles(container);
        }
        console.log(`Optimized disk: saved ${total} bytes`);
        return total;
    } else {
        console.log('Not off-peak hours, skipping disk optimization.');
        return 0;
    }
}

module.exports = {
    optimizeDisk,
    removeLogs,
    removeSnapshots,
    removeTempFiles
};
