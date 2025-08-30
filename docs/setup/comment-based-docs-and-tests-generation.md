# Comment-Based Test Generation Pattern

This document explains how to implement a comment-based test generation system for edge functions, where JSDoc comments in handler files are used to generate both API documentation and comprehensive test placeholders.

## Overview

The pattern consists of three main outputs from JSDoc comments:
1. **Generate OpenAPI specs** from JSDoc `@swagger` comments in handler files
2. **Generate Postman collection** from the OpenAPI specs for API testing
3. **Generate test placeholders** from the OpenAPI specs for automated testing

This ensures 100% test coverage for all documented endpoints and keeps documentation in sync with tests.

## Benefits

- **Zero missed endpoints** - Every documented endpoint automatically gets tests
- **Consistent test coverage** - Same comprehensive test structure for all endpoints  
- **Systematic testing** - Catches edge cases through systematic parameter testing
- **Scales automatically** - New endpoints get tests when docs are regenerated
- **Developer efficiency** - Focus on test logic, not boilerplate
- **Documentation as code** - API docs live with the implementation

## Implementation Guide

### 1. Add JSDoc Comments to Handlers

In your edge function handlers, add `@swagger` comments with OpenAPI specifications:

```typescript
// supabase/functions/organizations/handlers/members.ts

/**
 * @swagger
 * /organizations/{organizationId}/members:
 *   get:
 *     tags:
 *       - Members
 *     summary: List organization members
 *     description: Retrieve all members of a specific organization with optional filtering
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organization ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, student, parent]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of organization members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function listMembers(req: Request, organizationId: string): Promise<Response> {
  // Implementation...
}

/**
 * @swagger
 * /organizations/{organizationId}/members/{userId}:
 *   delete:
 *     tags:
 *       - Members
 *     summary: Remove organization member
 *     description: Remove a member from the organization
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Member removed successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function removeMember(
  req: Request, 
  organizationId: string, 
  userId: string
): Promise<Response> {
  // Implementation...
}
```

### 2. Create OpenAPI Generation Script

Create a script to extract `@swagger` comments and generate OpenAPI specifications:

```javascript
// scripts/generate-openapi.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

class OpenAPIGenerator {
  constructor() {
    this.baseSpec = {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Auto-generated from JSDoc comments'
      },
      servers: [
        { url: 'http://localhost:54321/functions/v1', description: 'Local' },
        { url: 'https://your-project.supabase.co/functions/v1', description: 'Production' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {},
        responses: {
          Unauthorized: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          Forbidden: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          NotFound: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      security: [{ bearerAuth: [] }],
      paths: {}
    };
  }

  extractSwaggerComments(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const swaggerComments = [];
    
    // Match @swagger comments
    const regex = /\/\*\*[\s\S]*?@swagger([\s\S]*?)\*\//g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      swaggerComments.push(match[1].trim());
    }
    
    return swaggerComments;
  }

  parseSwaggerComment(comment) {
    try {
      // Parse YAML-style swagger comment
      const parsed = yaml.load(comment);
      return parsed;
    } catch (error) {
      console.error('Failed to parse swagger comment:', error);
      return null;
    }
  }

  generateForFunction(functionName) {
    const functionPath = path.join(__dirname, '..', 'supabase', 'functions', functionName);
    const spec = JSON.parse(JSON.stringify(this.baseSpec));
    
    // Find all TypeScript files in the function
    const files = glob.sync(`${functionPath}/**/*.ts`);
    
    files.forEach(file => {
      const comments = this.extractSwaggerComments(file);
      
      comments.forEach(comment => {
        const parsed = this.parseSwaggerComment(comment);
        if (parsed) {
          // Merge paths
          Object.entries(parsed).forEach(([path, methods]) => {
            if (!spec.paths[path]) {
              spec.paths[path] = {};
            }
            Object.assign(spec.paths[path], methods);
          });
        }
      });
    });
    
    return spec;
  }

  generateAll() {
    const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
    const outputDir = path.join(__dirname, '..', 'docs', 'api', 'specs');
    
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Get all function directories
    const functions = fs.readdirSync(functionsDir)
      .filter(f => fs.statSync(path.join(functionsDir, f)).isDirectory())
      .filter(f => !f.startsWith('_')); // Exclude _shared
    
    const index = {
      generated: new Date().toISOString(),
      functions: {}
    };
    
    // Generate spec for each function
    functions.forEach(functionName => {
      console.log(`Generating OpenAPI spec for ${functionName}...`);
      
      const spec = this.generateForFunction(functionName);
      
      if (Object.keys(spec.paths).length > 0) {
        const functionOutputDir = path.join(outputDir, functionName);
        fs.mkdirSync(functionOutputDir, { recursive: true });
        
        // Write JSON
        fs.writeFileSync(
          path.join(functionOutputDir, 'openapi.json'),
          JSON.stringify(spec, null, 2)
        );
        
        // Write YAML
        fs.writeFileSync(
          path.join(functionOutputDir, 'openapi.yaml'),
          yaml.dump(spec)
        );
        
        // Add to index
        index.functions[functionName] = {
          paths: Object.keys(spec.paths),
          operationCount: Object.values(spec.paths).reduce(
            (count, path) => count + Object.keys(path).length, 0
          )
        };
      }
    });
    
    // Write index
    fs.writeFileSync(
      path.join(outputDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
    
    console.log('OpenAPI generation complete!');
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new OpenAPIGenerator();
  generator.generateAll();
}

module.exports = OpenAPIGenerator;
```

### 3. Create Postman Collection Generation

The OpenAPI generation script can also create a Postman collection for easy API testing:

```javascript
// Add this to generate-openapi.js
const Converter = require('openapi-to-postmanv2');

function generatePostmanCollection(openApiSpec) {
  console.log("\n📮 Generating Postman collection...");

  return new Promise((resolve, reject) => {
    Converter.convert(
      {
        type: 'json',
        data: openApiSpec,
      },
      {
        folderStrategy: 'Tags',
        requestParametersResolution: 'Example',
        exampleParametersResolution: 'Example',
        includeAuthInfoInExample: true,
      },
      (err, conversionResult) => {
        if (err) {
          console.error('❌ Error converting OpenAPI to Postman:', err);
          reject(err);
          return;
        }

        if (!conversionResult.result) {
          console.error('❌ Conversion failed:', conversionResult.reason);
          reject(new Error(conversionResult.reason));
          return;
        }

        try {
          const postmanCollection = conversionResult.output[0].data;

          // Enhance collection with metadata
          postmanCollection.info.name = 'API - Generated';
          postmanCollection.info.description = 
            'Auto-generated Postman collection from OpenAPI specification';

          // Add collection-level variables
          postmanCollection.variable = [
            {
              key: 'baseUrl',
              value: 'http://localhost:54321/functions/v1',
              description: 'Base URL for the API',
              type: 'string',
            },
            {
              key: 'bearerToken',
              value: '',
              description: 'JWT Bearer token for authentication',
              type: 'string',
            },
          ];

          // Add authentication
          postmanCollection.auth = {
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: '{{bearerToken}}',
                type: 'string',
              },
            ],
          };

          // Write the Postman collection
          const outputPath = path.join(__dirname, '..', 'docs', 'postman', 'collection.json');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));
          
          console.log(`✅ Generated Postman collection: ${outputPath}`);
          resolve(postmanCollection);
        } catch (writeError) {
          console.error('❌ Error writing Postman collection:', writeError);
          reject(writeError);
        }
      }
    );
  });
}
```

### 4. Create Test Generation Script

Create a script to generate test files from OpenAPI specs:

```javascript
// scripts/generate-tests-from-openapi.js

const fs = require('fs');
const path = require('path');

class TestGenerator {
  constructor() {
    this.roles = ['admin', 'teacher', 'student', 'parent'];
  }

  generateTestFile(functionName, operationId, method, path, spec) {
    const testName = `${method.toLowerCase()}-${path.replace(/[{}\/]/g, '-').replace(/^-|-$/g, '')}.test.ts`;
    
    return `import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '../../../utils/supabase.js';
import { generateTestToken } from '../../../utils/test-auth.js';
import { setupTestOrganization, cleanupTestOrganization } from '../../../utils/test-helpers.js';

describe('${method.toUpperCase()} ${path}', () => {
  let supabase: any;
  let testOrg: any;
  let testUsers: any;

  beforeAll(async () => {
    supabase = createClient();
    const setup = await setupTestOrganization(supabase);
    testOrg = setup.organization;
    testUsers = setup.users;
  });

  afterAll(async () => {
    await cleanupTestOrganization(supabase, testOrg.id);
  });

  describe('Basic Functionality', () => {
    it('should ${spec.summary?.toLowerCase() || 'work correctly'}', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }${method !== 'GET' && method !== 'DELETE' ? `,
        body: JSON.stringify({
          // TODO: Add request body
        })` : ''}
      });

      expect(response.status).toBe(${this.getExpectedStatus(method)});
      ${this.generateResponseAssertions(spec.responses)}
    });
  });

  describe('Authentication', () => {
    it('should return 401 without authentication', async () => {
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(401);
    });
  });

  ${this.generateQueryParameterTests(spec.parameters)}

  describe('Permissions', () => {
    ${this.generatePermissionTests(spec)}
  });

  describe('Edge Cases', () => {
    ${this.generateEdgeCaseTests(method, path, spec)}
  });

  describe('Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const token = generateTestToken(testUsers.admin);
      const startTime = Date.now();
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // 3 seconds
    });
  });

  describe('Response Format', () => {
    it('should return correct content type', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    ${this.generateSchemaValidationTests(spec.responses)}
  });
});`;
  }

  generatePath(path) {
    // Convert OpenAPI path to template literal
    return path.replace(/{([^}]+)}/g, '${testOrg.$1 || "test-id"}');
  }

  getExpectedStatus(method) {
    const statusMap = {
      'GET': 200,
      'POST': 201,
      'PUT': 200,
      'PATCH': 200,
      'DELETE': 204
    };
    return statusMap[method] || 200;
  }

  generateResponseAssertions(responses) {
    if (!responses) return '';
    
    const successResponse = responses['200'] || responses['201'] || responses['204'];
    if (!successResponse) return '';

    if (responses['204']) {
      return `// No content expected`;
    }

    return `
      const data = await response.json();
      // TODO: Add specific assertions based on response schema
      expect(data).toBeDefined();`;
  }

  generateQueryParameterTests(parameters) {
    if (!parameters) return '';
    
    const queryParams = parameters.filter(p => p.in === 'query');
    if (queryParams.length === 0) return '';

    return `describe('Query Parameters', () => {
    ${queryParams.map(param => `
    it('should handle ${param.name} parameter correctly', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}?${param.name}=\${${this.getParamExample(param)}}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      // TODO: Verify ${param.name} parameter is applied correctly
    });`).join('\n')}
  });`;
  }

  getParamExample(param) {
    if (param.schema?.enum) {
      return `'${param.schema.enum[0]}'`;
    }
    switch (param.schema?.type) {
      case 'integer':
        return '1';
      case 'boolean':
        return 'true';
      default:
        return "'test-value'";
    }
  }

  generatePermissionTests(spec) {
    return this.roles.map(role => `
    it('should ${this.shouldRoleHaveAccess(role, spec) ? 'allow' : 'deny'} access for ${role}', async () => {
      const token = generateTestToken(testUsers.${role});
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(${this.shouldRoleHaveAccess(role, spec) ? '200' : '403'});
    });`).join('\n');
  }

  shouldRoleHaveAccess(role, spec) {
    // This is a simplified version - you might want to parse spec.security or description
    // to determine actual permissions
    return role === 'admin';
  }

  generateEdgeCaseTests(method, path, spec) {
    const tests = [];

    // Invalid IDs
    if (path.includes('{') && path.includes('}')) {
      tests.push(`
    it('should return 400 for invalid ID format', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${path.replace(/{[^}]+}/g, 'invalid-id')}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(400);
    });`);
    }

    // Non-existent resources
    if (method === 'GET' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      tests.push(`
    it('should return 404 for non-existent resource', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${path.replace(/{[^}]+}/g, '00000000-0000-0000-0000-000000000000')}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(404);
    });`);
    }

    // Empty body for POST/PUT/PATCH
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      tests.push(`
    it('should return 400 for empty request body', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
    });`);
    }

    return tests.join('\n');
  }

  generateSchemaValidationTests(responses) {
    if (!responses || !responses['200']) return '';

    return `
    it('should return data matching the expected schema', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1/${functionName}${this.generatePath(path)}\`, {
        method: '${method}',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      // TODO: Add schema validation based on OpenAPI spec
      expect(data).toMatchObject({
        // Expected structure
      });
    });`;
  }

  generateFromOpenAPISpec(specPath, outputDir) {
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const functionName = path.basename(path.dirname(specPath));
    
    // Create output directory
    const testDir = path.join(outputDir, functionName);
    fs.mkdirSync(testDir, { recursive: true });
    
    // Generate test file for each path/method combination
    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (method === 'parameters') return; // Skip path-level parameters
        
        const testContent = this.generateTestFile(
          functionName,
          operation.operationId,
          method.toUpperCase(),
          path,
          operation
        );
        
        const testFileName = `${method.toLowerCase()}-${path.replace(/[{}\/]/g, '-').replace(/^-|-$/g, '')}.test.ts`;
        fs.writeFileSync(
          path.join(testDir, testFileName),
          testContent
        );
        
        console.log(`Generated test: ${testDir}/${testFileName}`);
      });
    });
  }

  generateAll() {
    const specsDir = path.join(__dirname, '..', 'docs', 'api', 'specs');
    const outputDir = path.join(__dirname, '..', 'tests', 'integration', 'endpoints');
    
    // Read index
    const index = JSON.parse(fs.readFileSync(path.join(specsDir, 'index.json'), 'utf8'));
    
    Object.keys(index.functions).forEach(functionName => {
      const specPath = path.join(specsDir, functionName, 'openapi.json');
      
      if (fs.existsSync(specPath)) {
        console.log(`\nGenerating tests for ${functionName}...`);
        this.generateFromOpenAPISpec(specPath, outputDir);
      }
    });
    
    console.log('\nTest generation complete!');
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new TestGenerator();
  generator.generateAll();
}

module.exports = TestGenerator;
```

### 4. Add NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-openapi.js",
    "tests:generate": "node scripts/generate-tests-from-openapi.js",
    "docs:and:tests": "npm run docs:generate && npm run tests:generate",
    "docs:and:tests:watch": "nodemon --watch 'supabase/functions/**/*.ts' --exec 'npm run docs:and:tests'"
  },
  "devDependencies": {
    "openapi-to-postmanv2": "^4.0.0",
    "swagger-jsdoc": "^6.0.0",
    "js-yaml": "^4.0.0"
  }
}
```

## Workflow

### Initial Setup
1. Add `@swagger` comments to your handler files
2. Run `npm run docs:and:tests` to generate docs, Postman collection, and tests
3. Import the Postman collection from `docs/postman/collection.json`
4. Review generated test files and add specific test logic

### Development Workflow
1. When adding a new endpoint, add `@swagger` comment
2. Run `npm run docs:and:tests` to regenerate everything
3. Test manually with the updated Postman collection
4. Implement test logic in the generated placeholder
5. Run automated tests to ensure everything works

### Using the Postman Collection
1. Import `docs/postman/collection.json` into Postman
2. Set the `baseUrl` variable (defaults to `http://localhost:54321/functions/v1`)
3. Set the `bearerToken` variable with your JWT token
4. All requests automatically use bearer token authentication
5. Requests are organized by tags from your OpenAPI spec

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate docs and tests
        run: npm run docs:and:tests
        
      - name: Check for uncommitted changes
        run: |
          git diff --exit-code || (echo "Generated files are out of sync. Run 'npm run docs:and:tests' and commit changes." && exit 1)
          
      - name: Run tests
        run: npm test
```

## Example: Complete Implementation

Here's a complete example for a user management endpoint:

### 1. Handler with JSDoc

```typescript
// supabase/functions/users/handlers/users.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, teacher, student, parent]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List users
 *     description: Retrieve a paginated list of users with optional filtering
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, student, parent]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function listUsers(req: Request): Promise<Response> {
  // Implementation
}

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a single user by their ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update an existing user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student, parent]
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Permanently delete a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function getUser(req: Request, userId: string): Promise<Response> {
  // Implementation
}

export async function updateUser(req: Request, userId: string): Promise<Response> {
  // Implementation
}

export async function deleteUser(req: Request, userId: string): Promise<Response> {
  // Implementation
}
```

### 2. Generated Test File

Running `npm run docs:and:tests` will generate comprehensive test files like:

```typescript
// tests/integration/endpoints/users/get-users.test.ts

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '../../../utils/supabase.js';
import { generateTestToken } from '../../../utils/test-auth.js';
import { setupTestOrganization, cleanupTestOrganization } from '../../../utils/test-helpers.js';

describe('GET /users', () => {
  let supabase: any;
  let testOrg: any;
  let testUsers: any;

  beforeAll(async () => {
    supabase = createClient();
    const setup = await setupTestOrganization(supabase);
    testOrg = setup.organization;
    testUsers = setup.users;
  });

  afterAll(async () => {
    await cleanupTestOrganization(supabase, testOrg.id);
  });

  describe('Basic Functionality', () => {
    it('should list users', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Query Parameters', () => {
    it('should handle role parameter correctly', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/users?role=teacher`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      data.data.forEach((user: any) => {
        expect(user.role).toBe('teacher');
      });
    });

    it('should handle search parameter correctly', async () => {
      const token = generateTestToken(testUsers.admin);
      const searchTerm = 'john';
      
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/users?search=${searchTerm}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      data.data.forEach((user: any) => {
        const matchesSearch = 
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm);
        expect(matchesSearch).toBe(true);
      });
    });

    it('should handle pagination parameters correctly', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/users?page=2&limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(5);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
    });
  });

  describe('Permissions', () => {
    it('should allow access for admin', async () => {
      const token = generateTestToken(testUsers.admin);
      
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
    });

    it('should deny access for teacher', async () => {
      const token = generateTestToken(testUsers.teacher);
      
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(403);
    });

    // Similar tests for student and parent roles...
  });

  // Additional test categories...
});
```

## Best Practices

1. **Keep Comments Updated**: Always update JSDoc comments when changing endpoint behavior
2. **Commit Generated Files**: Include generated OpenAPI specs in version control for documentation
3. **Don't Commit Test Placeholders**: Only commit tests after implementing test logic
4. **Use CI/CD**: Verify docs and tests are in sync in your CI pipeline
5. **Customize Templates**: Modify the generation scripts to match your project's testing patterns
6. **Add Custom Sections**: Extend the test generator to include project-specific test categories

## Troubleshooting

### Common Issues

1. **Parsing Errors**: Ensure your `@swagger` comments contain valid YAML
2. **Missing Tests**: Check that handler files have proper `@swagger` comments
3. **Path Conflicts**: Ensure unique operationIds for each endpoint
4. **Schema References**: Define shared schemas in a central location

### Debugging Tips

- Add console.log statements to generation scripts
- Generate individual function specs first
- Validate OpenAPI specs with online validators
- Start with simple endpoints before complex ones

## Additional Features in Your Implementation

Your ClassHub implementation includes several enhancements:

### Enhanced Postman Collection
- **Local Testing Support**: Pre-request scripts for authentication bypass in development
- **Environment Variables**: Configurable baseUrl, bearerToken, testUserId, enableTestAuth
- **Organization Variables**: Path parameters like `:organizationId` are replaced with `{{organizationId}}`
- **Role Switching**: Change the `testUserId` variable to test different user roles
- **Request Organization**: Requests grouped by OpenAPI tags

### Generated Outputs
When you run `npm run docs:and:tests`, it generates:
- `docs/api/openapi.json` - Combined OpenAPI specification
- `docs/api/openapi.yaml` - YAML version of the spec
- `docs/api/specs/{function}/openapi.json` - Per-function specs
- `docs/postman/ClassHub-AI-API-Generated.postman_collection.json` - Postman collection
- `docs/api/specs/index.json` - Index of all endpoints with metadata
- `tests/integration/endpoints/{function}/*.test.ts` - Test files

### Local Testing with Postman
The generated Postman collection includes special features for local development:
```javascript
// Pre-request script automatically included
if (pm.variables.get('baseUrl').includes('localhost')) {
  pm.request.headers.add({
    key: 'x-test-user-id',
    value: pm.variables.get('testUserId')
  });
  pm.request.headers.add({
    key: 'x-enable-test-auth',
    value: 'true'
  });
}
```

## Conclusion

This pattern ensures comprehensive test coverage and maintains documentation-code synchronization. By embedding OpenAPI specifications directly in your code and generating tests, Postman collections, and documentation from them, you create a self-documenting, thoroughly tested API that scales with your project. The Postman collection makes it easy to manually test endpoints during development, while the generated tests ensure automated coverage.