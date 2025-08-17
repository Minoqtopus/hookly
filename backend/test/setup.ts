import 'reflect-metadata';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'test-webhook-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};