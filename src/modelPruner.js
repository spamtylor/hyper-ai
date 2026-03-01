const pruneModel = (model) => {
  return {
    ...model,
    size: model.size * 0.7
  };
};

module.exports = { pruneModel };
