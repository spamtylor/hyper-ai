class DynamicDiskTiering {
    constructor() {
        this.tiers = {
            hot: new Map(),
            warm: new Map(),
            cold: new Map()
        };
        this.accessPatterns = new Map();
    }

    monitorAccess(filePath) {
        const count = this.accessPatterns.get(filePath) || 0;
        this.accessPatterns.set(filePath, count + 1);
    }

    migrateData() {
        for (const [filePath, count] of this.accessPatterns.entries()) {
            if (count > 10) {
                if (!this.tiers.hot.has(filePath)) {
                    this.tiers.hot.set(filePath, this.tiers.warm.get(filePath) || this.tiers.cold.get(filePath));
                    this.tiers.warm.delete(filePath);
                    this.tiers.cold.delete(filePath);
                }
            } else if (count > 5) {
                if (!this.tiers.warm.has(filePath)) {
                    this.tiers.warm.set(filePath, this.tiers.cold.get(filePath));
                    this.tiers.cold.delete(filePath);
                }
            } else {
                this.tiers.cold.set(filePath, this.tiers.cold.get(filePath) || this.tiers.warm.get(filePath) || this.tiers.hot.get(filePath));
                this.tiers.warm.delete(filePath);
                this.tiers.hot.delete(filePath);
            }
        }
    }
}

export { DynamicDiskTiering };
