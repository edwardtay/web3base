import { 
  validateInput, 
  validateCVEId, 
  validateIPAddress, 
  validateEthereumAddress,
  validateDomain 
} from '../../src/utils/input-validator';

describe('Input Validator', () => {
  describe('validateInput', () => {
    it('should accept valid input', () => {
      const result = validateInput('Hello, world!');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Hello, world!');
    });

    it('should trim whitespace', () => {
      const result = validateInput('  test  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test');
    });

    it('should reject empty input', () => {
      const result = validateInput('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-empty');
    });

    it('should reject input exceeding max length', () => {
      const longInput = 'a'.repeat(10001);
      const result = validateInput(longInput);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum length');
    });

    it('should reject script injection attempts', () => {
      const malicious = '<script>alert("xss")</script>';
      const result = validateInput(malicious);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('unsafe');
    });

    it('should remove control characters', () => {
      const input = 'test\x00\x01\x02';
      const result = validateInput(input);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test');
    });
  });

  describe('validateCVEId', () => {
    it('should accept valid CVE IDs', () => {
      expect(validateCVEId('CVE-2024-1234')).toBe(true);
      expect(validateCVEId('CVE-2023-12345')).toBe(true);
    });

    it('should reject invalid CVE IDs', () => {
      expect(validateCVEId('CVE-2024')).toBe(false);
      expect(validateCVEId('cve-2024-1234')).toBe(false);
      expect(validateCVEId('2024-1234')).toBe(false);
    });
  });

  describe('validateIPAddress', () => {
    it('should accept valid IP addresses', () => {
      expect(validateIPAddress('192.168.1.1')).toBe(true);
      expect(validateIPAddress('10.0.0.1')).toBe(true);
      expect(validateIPAddress('255.255.255.255')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(validateIPAddress('256.1.1.1')).toBe(false);
      expect(validateIPAddress('192.168.1')).toBe(false);
      expect(validateIPAddress('not.an.ip.address')).toBe(false);
    });
  });

  describe('validateEthereumAddress', () => {
    it('should accept valid Ethereum addresses', () => {
      expect(validateEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(false); // 39 chars
      expect(validateEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(true); // 40 chars
    });

    it('should reject invalid Ethereum addresses', () => {
      expect(validateEthereumAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(false);
      expect(validateEthereumAddress('0x123')).toBe(false);
      expect(validateEthereumAddress('0xGGGG35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(false);
    });
  });

  describe('validateDomain', () => {
    it('should accept valid domains', () => {
      expect(validateDomain('example.com')).toBe(true);
      expect(validateDomain('sub.example.com')).toBe(true);
      expect(validateDomain('my-site.co.uk')).toBe(true);
    });

    it('should reject invalid domains', () => {
      expect(validateDomain('example')).toBe(false);
      expect(validateDomain('.com')).toBe(false);
      expect(validateDomain('example..com')).toBe(false);
    });
  });
});
