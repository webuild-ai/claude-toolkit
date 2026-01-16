# Agent Debug

Debug AI agent communication and workflow execution issues.

## Instructions

### 1. Enable Debug Logging

```python
# Python: Enable AutoGen debug logs
import logging
logging.basicConfig(level=logging.DEBUG)

# Or specific logger
logger = logging.getLogger("autogen")
logger.setLevel(logging.DEBUG)
```

### 2. Trace Agent Messages

```python
# Log all agent messages
class DebuggableAgent(ConversableAgent):
    def send(self, message, recipient, request_reply=None):
        print(f"[SEND] {self.name} → {recipient.name}: {message}")
        return super().send(message, recipient, request_reply)

    def receive(self, message, sender, request_reply=None):
        print(f"[RECV] {self.name} ← {sender.name}: {message}")
        return super().receive(message, sender, request_reply)
```

### 3. Check Agent Configuration

```python
# Verify agent setup
agent = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4", "api_key": os.getenv("OPENAI_API_KEY")},
    system_message="You are a helpful assistant"
)

# Check configuration
print(f"Agent name: {agent.name}")
print(f"Model: {agent.llm_config.get('model')}")
print(f"System message: {agent.system_message}")
```

### 4. Inspect Workflow State

```python
# Check workflow progress
print(f"Current agent: {workflow.current_agent}")
print(f"Messages exchanged: {len(workflow.messages)}")
print(f"Workflow status: {workflow.status}")

# Inspect last messages
for msg in workflow.messages[-5:]:
    print(f"{msg['role']}: {msg['content'][:100]}...")
```

### 5. Common Issues and Fixes

#### Issue: Agent Not Responding
```python
# Check API key
assert os.getenv("OPENAI_API_KEY"), "API key not set"

# Check model availability
try:
    client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "test"}],
        max_tokens=5
    )
    print("✅ Model accessible")
except Exception as e:
    print(f"❌ Model error: {e}")
```

#### Issue: Infinite Loop
```python
# Add max rounds limit
user_proxy.initiate_chat(
    assistant,
    message="Hello",
    max_consecutive_auto_reply=10  # Prevent infinite loops
)
```

#### Issue: Tool Execution Fails
```python
# Test tool independently
try:
    result = search_tool("test query")
    print(f"✅ Tool works: {result}")
except Exception as e:
    print(f"❌ Tool error: {e}")
    import traceback
    traceback.print_exc()
```

### 6. Monitor Token Usage

```python
# Track token consumption
class TokenTracker:
    def __init__(self):
        self.total_tokens = 0

    def track(self, response):
        tokens = response.usage.total_tokens
        self.total_tokens += tokens
        print(f"Tokens used: {tokens} (total: {self.total_tokens})")

tracker = TokenTracker()
```

### 7. Validate Workflow Logic

```python
# Check workflow graph
def validate_workflow(workflow):
    # Check all agents are reachable
    visited = set()
    def dfs(agent):
        if agent in visited:
            return
        visited.add(agent)
        for next_agent in workflow.get_next_agents(agent):
            dfs(next_agent)

    dfs(workflow.entry_agent)

    unreachable = set(workflow.agents) - visited
    if unreachable:
        print(f"⚠️  Unreachable agents: {unreachable}")
    else:
        print("✅ All agents reachable")
```

## Output Format

```markdown
# Agent Debug Report

## Issue: Workflow stalls after 3 messages

### Diagnosis

**Message Flow**:
1. [SEND] user → assistant: "Analyze this data"
2. [RECV] assistant ← user: Processing...
3. [SEND] assistant → user: "I need more context"
4. **[STALL]** No further messages

**Root Cause**: Assistant waiting for user response, but user_proxy has `human_input_mode="NEVER"`

### Solution

Change user_proxy configuration:
```python
user_proxy = UserProxyAgent(
    name="user",
    human_input_mode="TERMINATE",  # Changed from NEVER
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: "TERMINATE" in x.get("content", "")
)
```

### Test Result ✅
- Workflow completes successfully
- 8 messages exchanged
- Terminated gracefully

## Token Usage
- Total: 1,245 tokens
- Average per message: 156 tokens
- Within budget ✅
```

## Best Practices

- Enable debug logging
- Trace message flow
- Set max rounds limit
- Validate tools independently
- Monitor token usage
- Add termination conditions
- Test workflows thoroughly

## Notes

- Most issues are configuration errors
- Check API keys and model availability first
- Test agents individually before workflows
- Use smaller models for debugging (faster/cheaper)
