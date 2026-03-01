const { exec } = require('child_process');

const getDiskUsage = () => {
  return {
    containers: [
      { id: 'container1', usage: 80 },
      { id: 'container2', usage: 90 }
    ]
  };
};

const cleanUp = (containerId) => {
  console.log(`Cleaning up container ${containerId}`);
  return new Promise(resolve => setTimeout(resolve, 100));
};

const predictAndClean = async () => {
  const usageData = getDiskUsage();
  const containersToClean = usageData.containers.filter(c => c.usage > 85);

  for (const container of containersToClean) {
    await cleanUp(container.id);
  }
};

module.exports = { predictAndClean };
