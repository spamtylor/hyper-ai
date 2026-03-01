const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class HyperHealth {
    /**
     * Pings an HTTP endpoint to verify the service returns a 200 OK.
     * @param {string} url - The healthcheck URL of the service to ping.
     * @returns {Promise<boolean>} True if the service responds with 200 OK, false otherwise.
     */
    async checkService(url) {
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            throw new Error(`Invalid URL provided for health check: ${url}`);
        }

        try {
            const response = await fetch(url, { method: 'GET' });
            return response.ok;
        } catch (error) {
            console.error(`Service at ${url} is unreachable:`, error.message);
            return false;
        }
    }

    /**
     * Executes a shell command to restart a target service.
     * @param {string} serviceName - Human readable name for logging.
     * @param {string} restartCmd - The shell command to execute to heal the service.
     * @returns {Promise<boolean>} True if the command executes successfully, false if it errors out.
     */
    async healService(serviceName, restartCmd) {
        if (!serviceName || !restartCmd) {
            throw new Error('Both serviceName and restartCmd are required to heal a service.');
        }

        console.log(`[HyperHealth] Attempting to self-heal service: ${serviceName}...`);

        try {
            const { stdout, stderr } = await execPromise(restartCmd);
            if (stderr && stderr.toLowerCase().includes('error')) {
                console.error(`[HyperHealth] Healing ${serviceName} encountered stderr:`, stderr);
                return false;
            }
            console.log(`[HyperHealth] Successfully healed ${serviceName}. stdout:`, stdout);
            return true;
        } catch (error) {
            console.error(`[HyperHealth] Failed to restart ${serviceName}:`, error.message);
            return false;
        }
    }
}

module.exports = { HyperHealth };
