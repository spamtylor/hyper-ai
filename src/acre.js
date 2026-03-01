export default class AdaptiveContextualReconfigurationEngine {
  constructor(initialConfig = {}) {
    this.config = { ...initialConfig };
  }

  updateConfig(newData) {
    this.config = { ...this.config, ...newData };
  }

  getCurrentConfig() {
    return { ...this.config };
  }
}
