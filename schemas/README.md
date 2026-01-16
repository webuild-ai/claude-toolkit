<div align="center">

# 📋 Schemas

**JSON schemas for validation, structure, and data consistency**

![Schemas](https://img.shields.io/badge/Total-10_Schemas-purple?style=for-the-badge)
![Standard](https://img.shields.io/badge/JSON_Schema-Draft--07-blue?style=for-the-badge)

</div>

---

## 🎯 Purpose

This directory provides:

- ✅ **Validation** - JSON schemas for command inputs/outputs
- 📐 **Structure** - Consistent data definitions
- 🔒 **Contracts** - API and configuration contracts
- 🛡️ **Type Safety** - Schema-driven validation

## 📚 Schema Library

### 🎯 Command Schemas (4)

<table>
<tr>
<td width="50%">

#### [`sanitycheck-result.schema.json`](commands/sanitycheck-result.schema.json)
🔍 **Sanity Check Output**
```json
{
  "checkNumber": 1,
  "name": "Console Cleanup",
  "status": "pass",
  "message": "No console statements"
}
```

#### [`pr-review-result.schema.json`](commands/pr-review-result.schema.json)
👀 **PR Review Results**
```json
{
  "category": "Security",
  "findings": [...],
  "severity": "high"
}
```

</td>
<td width="50%">

#### [`test-coverage-report.schema.json`](commands/test-coverage-report.schema.json)
📊 **Test Coverage Data**
```json
{
  "lines": 85.5,
  "branches": 78.2,
  "functions": 92.1
}
```

#### [`terraform-validation.schema.json`](commands/terraform-validation.schema.json)
☁️ **Terraform Validation**
```json
{
  "module": "vpc",
  "valid": true,
  "issues": []
}
```

</td>
</tr>
</table>

### ✅ Validation Schemas (3)

<table>
<tr>
<td width="33%">

#### [`workflow-spec.schema.json`](validation/workflow-spec.schema.json)
🤖 **AutoGen Workflows**
- Workflow structure
- Agent definitions
- Task validation

</td>
<td width="33%">

#### [`env-config.schema.json`](validation/env-config.schema.json)
🔐 **Environment Config**
- Required variables
- Type validation
- Secret handling

</td>
<td width="33%">

#### [`dockerfile.schema.json`](validation/dockerfile.schema.json)
🐳 **Dockerfile Structure**
- Instruction validation
- Best practices
- Security checks

</td>
</tr>
</table>

### ⚙️ Config Schemas (2)

<table>
<tr>
<td width="50%">

#### [`command-config.schema.json`](config/command-config.schema.json)
🎯 **Command Configuration**
- Command settings
- Option validation
- Default values

</td>
<td width="50%">

#### [`multi-tenant.schema.json`](config/multi-tenant.schema.json)
🏢 **Multi-Tenant Config**
- Tenant definitions
- Resource isolation
- Access controls

</td>
</tr>
</table>

### 📤 Output Schemas (1)

<table>
<tr>
<td>

#### [`check-result.schema.json`](outputs/check-result.schema.json)
✅ **Generic Check Result**

Universal result format for all validation commands:

```json
{
  "status": "pass|fail|warning|skipped",
  "message": "Check description",
  "details": "Additional context",
  "suggestions": ["Action items"]
}
```

</td>
</tr>
</table>

---

## 🚀 Usage

### In Commands

Validate inputs against schemas:

```markdown
# In a command file
1. Read the input file
2. Validate against schemas/commands/analyze.schema.json
3. If validation fails, show errors
4. Proceed with validated data
```

### In Code

Using Ajv (JSON Schema validator):

```javascript
const Ajv = require('ajv');
const schema = require('./schemas/outputs/check-result.schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const data = {
  status: 'pass',
  message: 'All checks passed'
};

if (validate(data)) {
  console.log('Valid!');
} else {
  console.error(validate.errors);
}
```

### In TypeScript

Generate TypeScript types from schemas:

```bash
# Using json-schema-to-typescript
npm install -D json-schema-to-typescript

npx json2ts schemas/**/*.json --output types/
```

---

## 📐 Schema Standards

All schemas follow these conventions:

<table>
<tr>
<td width="50%">

### ✅ Required Elements

- `$schema`: JSON Schema Draft-07
- `$id`: Unique schema identifier
- `title`: Human-readable name
- `description`: Clear purpose
- `type`: Root type definition

</td>
<td width="50%">

### ✅ Best Practices

- 📝 Descriptions for all fields
- ✅ Explicit `required` arrays
- 💡 Examples in descriptions
- 🔢 Version in `$id` (v1, v2)
- 🎯 Single responsibility

</td>
</tr>
</table>

---

## ✏️ Creating New Schemas

### Schema Template

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/schemas/my-schema.v1.json",
  "title": "My Schema",
  "description": "Clear description of purpose",
  "type": "object",
  "properties": {
    "field1": {
      "type": "string",
      "description": "Field description",
      "examples": ["example value"]
    },
    "field2": {
      "type": "number",
      "description": "Another field",
      "minimum": 0,
      "maximum": 100
    }
  },
  "required": ["field1"],
  "additionalProperties": false
}
```

### Validation Checklist

- [ ] Valid JSON syntax
- [ ] Follows Draft-07 spec
- [ ] All properties documented
- [ ] Required fields marked
- [ ] Examples provided
- [ ] Type constraints defined
- [ ] Tested with sample data

---

## 🔗 Tools & Resources

<table>
<tr>
<td width="33%" align="center">

### 🛠️ Validators
- [Ajv](https://ajv.js.org/)
- [jsonschema](https://python-jsonschema.readthedocs.io/)
- [online validator](https://www.jsonschemavalidator.net/)

</td>
<td width="33%" align="center">

### 📚 Documentation
- [JSON Schema Spec](https://json-schema.org/)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
- [Examples](https://json-schema.org/learn/examples.html)

</td>
<td width="33%" align="center">

### 🔧 Generators
- [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript)
- [quicktype](https://quicktype.io/)
- [schema-to-yup](https://github.com/kristianmandrup/schema-to-yup)

</td>
</tr>
</table>

---

<div align="center">

[← Back to Main](../README.md) | [View Commands →](../commands/) | [See Examples →](../examples/)

**Made with ❤️ for type-safe, validated workflows**

</div>
