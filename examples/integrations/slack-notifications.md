# Slack Notifications Integration

Example of integrating `/summarise-for-pr` with Slack for team notifications.

## Scenario

Automatically post PR summaries to Slack channel when PRs are created.

## GitHub Actions Integration

```yaml
# .github/workflows/pr-notification.yml
name: PR Slack Notification

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  notify-slack:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Need full history for diff

      - name: Get PR Info
        id: pr-info
        run: |
          # Get PR details
          PR_TITLE="${{ github.event.pull_request.title }}"
          PR_URL="${{ github.event.pull_request.html_url }}"
          PR_AUTHOR="${{ github.event.pull_request.user.login }}"
          BASE_BRANCH="${{ github.event.pull_request.base.ref }}"
          HEAD_BRANCH="${{ github.event.pull_request.head.ref }}"

          # Calculate stats (similar to summarise-for-pr command)
          COMMITS=$(git rev-list --count origin/$BASE_BRANCH..origin/$HEAD_BRANCH)

          # Exclude lock files
          LOCK_FILES='package-lock\.json|yarn\.lock|pnpm-lock\.yaml'
          FILES=$(git diff origin/$BASE_BRANCH...origin/$HEAD_BRANCH --numstat | grep -v -E "$LOCK_FILES" | wc -l)
          INSERTIONS=$(git diff origin/$BASE_BRANCH...origin/$HEAD_BRANCH --numstat | grep -v -E "$LOCK_FILES" | awk '{add+=$1} END {print add+0}')
          DELETIONS=$(git diff origin/$BASE_BRANCH...origin/$HEAD_BRANCH --numstat | grep -v -E "$LOCK_FILES" | awk '{del+=$2} END {print del+0}')

          # Output for next step
          echo "title=$PR_TITLE" >> $GITHUB_OUTPUT
          echo "url=$PR_URL" >> $GITHUB_OUTPUT
          echo "author=$PR_AUTHOR" >> $GITHUB_OUTPUT
          echo "commits=$COMMITS" >> $GITHUB_OUTPUT
          echo "files=$FILES" >> $GITHUB_OUTPUT
          echo "insertions=$INSERTIONS" >> $GITHUB_OUTPUT
          echo "deletions=$DELETIONS" >> $GITHUB_OUTPUT

      - name: Send to Slack
        uses: slackapi/slack-github-action@v1.24.0
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          payload: |
            {
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "🔔 New Pull Request",
                    "emoji": true
                  }
                },
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*${{ steps.pr-info.outputs.title }}*\n<${{ steps.pr-info.outputs.url }}|View PR>"
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {
                      "type": "mrkdwn",
                      "text": "*Author:*\n${{ steps.pr-info.outputs.author }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*Commits:*\n${{ steps.pr-info.outputs.commits }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*Files Changed:*\n${{ steps.pr-info.outputs.files }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*Changes:*\n+${{ steps.pr-info.outputs.insertions }} / -${{ steps.pr-info.outputs.deletions }}"
                    }
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {
                        "type": "plain_text",
                        "text": "Review PR",
                        "emoji": true
                      },
                      "url": "${{ steps.pr-info.outputs.url }}",
                      "style": "primary"
                    }
                  ]
                }
              ]
            }
```

## Example Slack Message

```
🔔 New Pull Request

feat: Add Stripe payment integration
View PR

Author: @johnsmith
Commits: 8

Files Changed: 12
Changes: +450 / -20

[Review PR] (button)
```

## Advanced: Include CI Status

```yaml
      - name: Wait for CI
        run: sleep 60  # Wait for CI to complete

      - name: Get CI Status
        id: ci-status
        run: |
          STATUS=$(gh pr checks ${{ github.event.pull_request.number }} --json state -q '.[0].state')
          echo "status=$STATUS" >> $GITHUB_OUTPUT

      - name: Send to Slack with CI Status
        uses: slackapi/slack-github-action@v1.24.0
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          payload: |
            {
              "text": "[NEW PR] - ${{ steps.pr-info.outputs.title }}",
              "attachments": [
                {
                  "color": "${{ steps.ci-status.outputs.status == 'SUCCESS' && 'good' || 'danger' }}",
                  "fields": [
                    {
                      "title": "Commits",
                      "value": "${{ steps.pr-info.outputs.commits }}",
                      "short": true
                    },
                    {
                      "title": "Files",
                      "value": "${{ steps.pr-info.outputs.files }}",
                      "short": true
                    },
                    {
                      "title": "Changes",
                      "value": "+${{ steps.pr-info.outputs.insertions }} / -${{ steps.pr-info.outputs.deletions }}",
                      "short": true
                    },
                    {
                      "title": "CI Status",
                      "value": "${{ steps.ci-status.outputs.status == 'SUCCESS' && '✅ Passing' || '❌ Failing' }}",
                      "short": true
                    }
                  ],
                  "actions": [
                    {
                      "type": "button",
                      "text": "Review PR",
                      "url": "${{ steps.pr-info.outputs.url }}"
                    }
                  ]
                }
              ]
            }
```

## Setup Instructions

### 1. Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Create new app
3. Enable Incoming Webhooks
4. Add webhook to channel
5. Copy webhook URL

### 2. Add Secret to GitHub

1. Go to repository Settings → Secrets
2. Add new secret: `SLACK_WEBHOOK_URL`
3. Paste webhook URL

### 3. Customize Message

Edit workflow to include:
- Custom PR labels
- Code review requirements
- Test coverage status
- Deployment status

## Benefits

1. **Team Awareness**: Everyone knows about new PRs instantly
2. **Quick Context**: Summary provides key info at a glance
3. **Easy Access**: One-click to review PR
4. **Status Updates**: See CI results in real-time
5. **Thread Discussion**: Team can discuss in Slack thread

## Customizations

### Filter by Label
Only notify for PRs with specific labels:
```yaml
if: contains(github.event.pull_request.labels.*.name, 'ready-for-review')
```

### Different Channels for Different Types
- `#frontend-prs` for UI changes
- `#backend-prs` for API changes
- `#infra-prs` for infrastructure changes

### Include Reviewers
Mention specific team members based on changed files

## Notes

- Rate limit: Slack has rate limits for webhooks
- Customize message format to match team preferences
- Consider using Slack app for bidirectional integration
- Add emoji reactions for PR status (✅ approved, 🔄 changes requested)
