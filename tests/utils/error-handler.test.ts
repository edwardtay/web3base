import {
  createErrorResponse,
  handleAgentInitError,
  handleAPIError,
  isRetryableError,
  ErrorCode,
} from '../../src/utils/error-handler';

describe('Error Handler', () => {
  describe('createErrorResponse', () => {
    it('should create error response from Error object', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error, ErrorCode.INTERNAL_ERROR);
      
      expect(response.error).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.message).toBe('Test error');
      expect(response.timestamp).toBeDefined();
    });

    it('should create error response from string', () => {
      const response = createErrorResponse('String error', ErrorCode.VALIDATION_ERROR);
      
      expect(response.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.message).toBe('String error');
    });

    it('should include context in response', () => {
      const error = new Error('Test error');
      const context = {
        action: 'test_action',
        level: 'high',
        metadata: { key: 'value' },
      };
      
      const response = createErrorResponse(error, ErrorCode.API_ERROR, context);
      
      expect(response.details).toEqual({
        action: 'test_action',
        level: 'high',
        metadata: { key: 'value' },
      });
    });
  });

  describe('handleAgentInitError', () => {
    it('should handle missing API key errors', () => {
      const error = new Error('Missing CDP_API_KEY');
      const response = handleAgentInitError(error);
      
      expect(response.error).toBe(ErrorCode.AGENT_INITIALIZATION_FAILED);
      expect(response.message).toContain('API keys');
    });

    it('should handle generic initialization errors', () => {
      const error = new Error('Generic init error');
      const response = handleAgentInitError(error);
      
      expect(response.error).toBe(ErrorCode.AGENT_INITIALIZATION_FAILED);
      expect(response.message).toBe('Generic init error');
    });
  });

  describe('handleAPIError', () => {
    it('should create API error response', () => {
      const error = new Error('API failed');
      const response = handleAPIError(error, '/api/test', true);
      
      expect(response.error).toBe(ErrorCode.API_ERROR);
      expect(response.message).toContain('API error');
      expect(response.details).toMatchObject({
        action: 'api_call',
        metadata: {
          endpoint: '/api/test',
          retryable: true,
        },
      });
    });
  });

  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const error = new Error('Network error occurred');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify timeout errors as retryable', () => {
      const error = new Error('Request timeout');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify rate limit errors as retryable', () => {
      const error = new Error('429 Too Many Requests');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should not identify validation errors as retryable', () => {
      const error = new Error('Invalid input');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should handle non-Error objects', () => {
      expect(isRetryableError('string error')).toBe(false);
      expect(isRetryableError(null)).toBe(false);
    });
  });
});
