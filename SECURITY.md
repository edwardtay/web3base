# Security Implementation Guide

## Overview

WebWatcher now includes comprehensive security hardening with multiple layers of protection against common web vulnerabilities and attacks.

## Security Features

### 1. Rate Limiting

**Implementation:** `express-rate-limit` middleware

**Protection Against:**
- Brute force attacks
- DoS/DDoS attacks
- API abuse
- Resource exhaustion

**Configuration:**

```typescript
// General API rate limiter (all routes)
- 100 requests per 15 minutes per IP
- Returns 429 status with retry-after header

// Strict rate limiter (expensive operations)
- 10 requests per minute per IP
- Applied to: /api/chat, /check
```

**Usage:**
```typescript
import { apiLimiter, strictLimiter } from './middleware/security';

app.use(apiLimiter); // Apply to all routes
app.post('/api/chat', strictLimiter, handler); // Apply to specific route
```

### 2. CORS (Cross-Origin Resource Sharing)

**Implementation:** `cors` middleware

**Protection Against:**
- Unauthorized cross-origin requests
- CSRF attacks
- Data theft from other origins

**Configuration:**

```typescript
// Development: Allows all origins
// Production: Restricts to allowed origins list

// Set via environment variable:
ALLOWED_ORIGINS=https://webwatcher.lever-labs.com,https://your-app.com
```

**Default Allowed Origins:**
- `http://localhost:3000`
- `http://localhost:5173`
- `https://webwatcher.lever-labs.com`

### 3. Security Headers (Helmet)

**Implementation:** `helmet` middleware

**Protection Against:**
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing
- Protocol downgrade attacks

**Headers Applied:**
- `Content-Security-Policy`: Prevents XSS attacks
- `Strict-Transport-Security`: Enforces HTTPS
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-DNS-Prefetch-Control`: Controls DNS prefetching
- `X-Download-Options`: Prevents file execution in IE
- `X-Permitted-Cross-Domain-Policies`: Controls Adobe products

### 4. Input Validation

**Implementation:** Zod schemas + custom validators

**Protection Against:**
- SQL injection
- XSS attacks
- Command injection
- Path traversal
- Buffer overflow

**Features:**
- Request body validation
- Query parameter validation
- Automatic sanitization
- Type safety
- Custom error messages

**Example:**
```typescript
import { validateBody, ValidationSchemas } from './middleware/validation';

app.post('/api/chat', 
  validateBody(ValidationSchemas.chatRequest),
  handler
);
```

### 5. Request Size Limiting

**Implementation:** Express body parser + custom middleware

**Protection Against:**
- DoS attacks via large payloads
- Memory exhaustion
- Bandwidth abuse

**Configuration:**
- Maximum body size: 1MB
- Automatic rejection of oversized requests
- Returns 413 Payload Too Large

### 6. Error Handling

**Implementation:** Centralized error handler

**Protection Against:**
- Information leakage
- Stack trace exposure
- Sensitive data disclosure

**Features:**
- Sanitized error messages in production
- Detailed errors in development
- Structured error logging
- Consistent error format

## Security Best Practices

### 1. Environment Variables

**Never commit sensitive data:**
```bash
# ❌ Bad
OPENAI_API_KEY=sk-1234567890abcdef

# ✅ Good - Use .env file (gitignored)
OPENAI_API_KEY=sk-your-actual-key-here
```

### 2. HTTPS Only

**Always use HTTPS in production:**
- Helmet enforces HSTS (HTTP Strict Transport Security)
- Redirects HTTP to HTTPS
- Prevents protocol downgrade attacks

### 3. API Keys

**Rotate keys regularly:**
- OpenAI API keys
- CDP API keys
- Exa API keys
- Letta API keys

### 4. Monitoring

**Enable security monitoring:**
```typescript
// Request logging is automatic
// Check logs for:
- Rate limit violations
- CORS violations
- Validation failures
- Unusual traffic patterns
```

### 5. Updates

**Keep dependencies updated:**
```bash
npm audit
npm audit fix
npm update
```

## Testing Security

### Run Security Tests

```bash
# Run all tests including security tests
npm test

# Run with coverage
npm run test:coverage
```

### Manual Security Testing

**Test rate limiting:**
```bash
# Should succeed
for i in {1..10}; do curl http://localhost:8080/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"test"}'; done

# Should fail with 429
for i in {1..20}; do curl http://localhost:8080/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"test"}'; done
```

**Test CORS:**
```bash
# Should be blocked in production
curl -H "Origin: http://evil.com" http://localhost:8080/api/chat
```

**Test input validation:**
```bash
# Should fail with 400
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":""}'

# Should fail with 400
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"<script>alert(1)</script>"}'
```

## Security Checklist

- [x] Rate limiting enabled
- [x] CORS configured
- [x] Security headers applied
- [x] Input validation implemented
- [x] Request size limits set
- [x] Error handling sanitized
- [x] HTTPS enforced (via Helmet HSTS)
- [x] Environment variables secured
- [x] Tests written and passing
- [ ] Security audit scheduled
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented

## Incident Response

### If a security issue is discovered:

1. **Assess the impact**
   - What data was exposed?
   - How many users affected?
   - Is the vulnerability still active?

2. **Contain the issue**
   - Deploy a fix immediately
   - Rotate compromised credentials
   - Block malicious IPs if needed

3. **Notify stakeholders**
   - Inform affected users
   - Report to security team
   - Document the incident

4. **Post-mortem**
   - Analyze root cause
   - Update security measures
   - Add tests to prevent recurrence

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## Contact

For security concerns, please contact the security team or open a private security advisory on GitHub.
