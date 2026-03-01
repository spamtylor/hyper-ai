export class DynamicResourceOrchestrator {
  constructor() {
    this.containers = {};
  }

  updateContainer(containerId, resources) {
    this.containers[containerId] = resources;
  }

  rebalance() {
    const plan = [];
    for (const [id, resources] of Object.entries(this.containers)) {
      if (resources.cpu > 80) {
        plan.push({ containerId: id, cpu: resources.cpu - 10 });
      }
    }
    return plan;
  }
}
