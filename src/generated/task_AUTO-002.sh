#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/contextual_emotional_resonance.js
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
EOF
cat << 'EOF' > $HYPER_ROOT/tests/contextual_emotional_resonance.test.js
import { describe, it, expect, vi } from 'vitest';
import { analyzeEmotion, adjustResponse } from '../src/contextual_emotional_resonance';

describe('Contextual Emotional Resonance Engine', () => {
  it('correctly identifies positive emotion', () => {
    expect(analyzeEmotion('This is a great day!')).toBe('positive');
  });

  it('correctly identifies negative emotion', () => {
    expect(analyzeEmotion('I hate this terrible service.')).toBe('negative');
  });

  it('correctly identifies neutral emotion', () => {
    expect(analyzeEmotion('The weather is nice today.')).toBe('neutral');
  });

  it('adjusts response for positive emotion', () => {
    const response = adjustResponse('This is a great day!', 'Thank you!');
    expect(response).toBe("That's wonderful! Thank you! 😊");
  });

  it('adjusts response for negative emotion', () => {
    const response = adjustResponse('I hate this terrible service.', 'We\'ll fix it.');
    expect(response).toBe("I'm sorry to hear that. We'll fix it. Let's find a solution together.");
  });

  it('adjusts response for neutral emotion', () => {
    const response = adjustResponse('The weather is nice today.', 'Okay.');
    expect(response).toBe('Okay.');
  });

  it('handles mixed emotional content', () => {
    expect(analyzeEmotion('This is good but the service is bad')).toBe('neutral');
    const response = adjustResponse('This is good but the service is bad', 'We\'re working on it.');
    expect(response).toBe('We\'re working on it.');
  });
});
EOF
