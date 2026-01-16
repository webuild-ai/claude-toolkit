# Workflow Validate

Validate AutoGen YAML workflow specifications for AI agent platforms.

## Instructions

### 1. Validate YAML Syntax

```bash
# Check YAML is valid
python -c "import yaml; yaml.safe_load(open('workflow.yaml'))"

# Or use yamllint
yamllint workflow.yaml
```

### 2. Validate Against Schema

```python
import yaml
import jsonschema

# Load workflow
with open('workflow.yaml') as f:
    workflow = yaml.safe_load(f)

# Load schema
with open('schemas/workflow-spec.schema.json') as f:
    schema = json.load(f)

# Validate
try:
    jsonschema.validate(workflow, schema)
    print("✅ Workflow is valid")
except jsonschema.ValidationError as e:
    print(f"❌ Validation error: {e.message}")
```

### 3. Check Required Fields

```yaml
# Valid workflow structure
name: "My Workflow"
version: "1.0.0"
description: "Workflow description"

agents:
  - name: "agent1"
    type: "chat"
    model: "gpt-4"
    system_message: "You are a helpful assistant"

  - name: "agent2"
    type: "user_proxy"

workflow:
  - from: "agent1"
    to: "agent2"
    condition: "always"
```

### 4. Validate Agent Configuration

- Agent names are unique
- Agent types are supported
- Models are available
- System messages are present
- Tools are properly configured

### 5. Validate Workflow Logic

- No circular dependencies
- All agents are reachable
- Conditions are valid
- Termination conditions exist

## Output Format

```markdown
# Workflow Validation Report

## Status: ✅ VALID

## Workflow: customer-support-v1

### Metadata ✅
- Name: "Customer Support Workflow"
- Version: "1.0.0"
- Description: Present

### Agents (3) ✅
1. **support-agent**: chat agent with gpt-4
2. **user-proxy**: user proxy agent
3. **escalation-agent**: chat agent with gpt-4-turbo

### Workflow Logic ✅
- Entry point: support-agent
- Termination: user-proxy
- No circular dependencies
- All agents reachable

### Tools (2) ✅
1. search_kb: Search knowledge base
2. create_ticket: Create support ticket

## Issues: None

## Recommendations
- Consider adding retry logic
- Add timeout configurations
- Document expected inputs/outputs
```

## Best Practices

- Use schema validation
- Test workflows before deployment
- Version workflows
- Document agent responsibilities
- Define clear termination conditions

## Notes

- Validate before deploying
- Test with sample inputs
- Monitor workflow execution
- Keep schemas updated
