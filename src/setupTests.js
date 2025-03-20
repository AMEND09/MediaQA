// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the MediaDevices API
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    ondataavailable: jest.fn(),
    onerror: jest.fn(),
    stop: jest.fn(),
    state: '',
  })),
});

// Mock media devices
window.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockImplementation(() => Promise.resolve({
    getTracks: () => [{stop: jest.fn()}]
  }))
};

// Mock SpeechRecognition
window.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

window.webkitSpeechRecognition = window.SpeechRecognition;

// Mock SpeechSynthesis
window.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

window.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  voice: null,
  text: '',
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  onend: jest.fn(),
  onerror: jest.fn(),
}));
