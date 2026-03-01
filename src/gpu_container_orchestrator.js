/**
 * GPU-Accelerated Container Orchestration for AMD ROCm (Radeon 8060S)
 * Dynamically allocates GPU resources across LXC containers based on real-time AI workload
 */
const GPU_RESOURCE_LIMIT = 1.0; // Total GPU capacity for Radeon 8060S

class GPUOrchestrator {
  constructor() {
    this.containerAllocations = new Map();
    this.currentLoad = 0;
  }

  allocateResources(workload) {
    if (!workload || typeof workload.demand !== 'number' || workload.demand <= 0) {
      throw new Error('Invalid workload demand');
    }

    const containerId = workload.containerId;
    const demand = Math.min(workload.demand, GPU_RESOURCE_LIMIT - this.currentLoad);
    
    this.containerAllocations.set(containerId, demand);
    this.currentLoad += demand;
    
    return {
      containerId,
      gpuAllocation: demand,
      availableCapacity: GPU_RESOURCE_LIMIT - this.currentLoad
    };
  }

  releaseResources(containerId) {
    const demand = this.containerAllocations.get(containerId);
    if (demand) {
      this.containerAllocations.delete(containerId);
      this.currentLoad -= demand;
    }
  }

  getAllocationStatus() {
    return {
      allocations: Array.from(this.containerAllocations.entries()),
      currentLoad: this.currentLoad,
      availableCapacity: GPU_RESOURCE_LIMIT - this.currentLoad
    };
  }
}

module.exports = {
  GPUOrchestrator
};
