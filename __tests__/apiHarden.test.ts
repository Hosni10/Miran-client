import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../src/lib/api';
import { unwrap } from '../src/api/helpers';

describe('API Hardening Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Axios JSON enforcement', () => {
    it('should throw error on non-JSON response', async () => {
      mock.onGet('/test-non-json').reply(200, '<html><body>Not JSON</body></html>', {
        'Content-Type': 'text/html',
      });

      await expect(api.get('/test-non-json')).rejects.toThrow('Non-JSON response from API');
    });

    it('should pass through JSON response', async () => {
      const testData = { message: 'success', data: [1, 2, 3] };
      mock.onGet('/test-json').reply(200, testData, {
        'Content-Type': 'application/json',
      });

      const response = await api.get('/test-json');
      expect(response.data).toEqual(testData);
    });

    it('should handle JSON response with charset', async () => {
      const testData = { message: 'success' };
      mock.onGet('/test-json-charset').reply(200, testData, {
        'Content-Type': 'application/json; charset=utf-8',
      });

      const response = await api.get('/test-json-charset');
      expect(response.data).toEqual(testData);
    });
  });

  describe('unwrap helper', () => {
    it('should extract data from successful response', async () => {
      const testData = { items: [1, 2, 3], count: 3 };
      mock.onGet('/test-unwrap').reply(200, testData, {
        'Content-Type': 'application/json',
      });

      const result = await unwrap(api.get('/test-unwrap'));
      expect(result).toEqual(testData);
    });

    it('should handle errors and re-throw', async () => {
      mock.onGet('/test-error').reply(500, { error: 'Server error' }, {
        'Content-Type': 'application/json',
      });

      await expect(unwrap(api.get('/test-error'))).rejects.toThrow();
    });
  });

  describe('Authorization header', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it('should include auth token when present', async () => {
      localStorage.setItem('userTokenSaved', 'test-token-123');
      
      mock.onGet('/test-auth').reply(200, { success: true }, {
        'Content-Type': 'application/json',
      });

      await api.get('/test-auth');

      expect(mock.history.get[0].headers?.Authorization).toBe('Token test-token-123');
    });

    it('should work without auth token', async () => {
      mock.onGet('/test-no-auth').reply(200, { success: true }, {
        'Content-Type': 'application/json',
      });

      await api.get('/test-no-auth');

      expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
    });
  });
}); 