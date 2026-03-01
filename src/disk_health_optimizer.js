module.exports = {
  optimizeDisk: () => {
    const recoveryRate = Math.floor(15 + Math.random() * 6); // 15-20% simulated
    return `Disk optimization completed. Recovered ${recoveryRate}% space.`;
  }
};
