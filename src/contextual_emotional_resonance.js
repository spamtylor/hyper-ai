// Contextual Emotional Resonance Engine
// Real-time emotional tone analysis and response adjustment

const POSITIVE_WORDS = ['good', 'great', 'excellent', 'wonderful', 'happy', 'love', 'like'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'frustrated'];

function analyzeEmotion(text) {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const positiveCount = words.filter(word => POSITIVE_WORDS.includes(word)).length;
  const negativeCount = words.filter(word => NEGATIVE_WORDS.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function adjustResponse(text, originalResponse) {
  const emotion = analyzeEmotion(text);
  const adjustments = {
    positive: { prefix: 'That\'s wonderful! ', suffix: ' 😊' },
    negative: { prefix: 'I\'m sorry to hear that. ', suffix: ' Let\'s find a solution together.' },
    neutral: { prefix: '', suffix: '' }
  };
  
  return adjustments[emotion].prefix + originalResponse + adjustments[emotion].suffix;
}

module.exports = {
  analyzeEmotion,
  adjustResponse
};
