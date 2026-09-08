const MODEL = 'openai/gpt-oss-120b'

async function groqChat(messages, { temperature = 0.7, maxTokens = 1024 } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch('/api/ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`AI request failed: ${res.status} ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('AI request timed out. Please try again.')
    throw e
  } finally {
    clearTimeout(timeout)
  }
}

function parseJsonResponse(text) {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    } catch {
      /* fall through to raw text */
    }
  }
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function breakdownGoal(goal) {
  const prompt = `You are a productivity expert. Break down the following goal into actionable tasks. For each task, assign a priority (low/medium/high) and a suggested category (work/personal/health/learning/finance/other). Return ONLY a JSON array with no other text.

Goal: "${goal}"

Format:
[{"text": "task description", "priority": "medium", "category": "work", "dueSuggestion": "in 3 days"}]

dueSuggestion should be a natural phrase like "today", "tomorrow", "in 2 days", "next week", or "none" if no due date is needed. Keep task descriptions concise (under 80 chars). Identify 3-7 tasks.`

  const response = await groqChat([{ role: 'user', content: prompt }], { maxTokens: 2048 })
  return parseJsonResponse(response) || []
}

export async function dailyBriefing(tasks) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const taskSummary = tasks.map((t) =>
    `- [${t.completed ? 'x' : ' '}] ${t.text} (${t.priority} priority${t.dueDate ? ', due ' + t.dueDate : ''}${t.category ? ', ' + t.category : ''})`
  ).join('\n')

  const prompt = `You are a supportive productivity coach. Today is ${today}. Here are the user's current tasks:

${taskSummary || '(No tasks yet)'}

Provide a brief, motivating daily briefing (2-3 sentences). Acknowledge completed tasks, highlight urgent items (high priority or overdue), and offer one actionable suggestion. Be warm and concise. Return plain text only, no markdown.`

  return groqChat([{ role: 'user', content: prompt }], { maxTokens: 300 })
}

export async function suggestTasks(existingTasks) {
  const taskList = existingTasks.map((t) => `- ${t.text} (${t.category || 'uncategorized'}, ${t.priority})`).join('\n')

  const prompt = `Based on these existing tasks, suggest 3 related follow-up tasks the user might want to add. Be practical and specific. Return ONLY a JSON array with no other text.

Existing tasks:
${taskList || '(empty list)'}

Format:
[{"text": "task description", "priority": "medium", "category": "work"}]

Keep descriptions concise.`

  const response = await groqChat([{ role: 'user', content: prompt }], { maxTokens: 1024 })
  return parseJsonResponse(response) || []
}

export async function enhanceTaskNotes(taskText) {
  const prompt = `For this task: "${taskText}", write a brief note (2-3 bullet points) with actionable tips or reminders to help complete it effectively. Return plain text bullet points, one per line starting with "•". Keep it concise.`

  return groqChat([{ role: 'user', content: prompt }], { maxTokens: 400 })
}

export async function prioritizeTasks(tasks) {
  const taskList = tasks.filter((t) => !t.completed).map((t, i) =>
    `${i + 1}. ${t.text} (priority: ${t.priority}${t.dueDate ? ', due: ' + t.dueDate : ''})`
  ).join('\n')

  if (!taskList.trim()) return []

  const prompt = `Review these tasks and return a JSON array of indices (0-based) in the recommended order to tackle them first. Consider urgency (due dates) and importance. Return ONLY a JSON array of numbers.

Tasks:
${taskList}`

  const response = await groqChat([{ role: 'user', content: prompt }], { maxTokens: 512 })
  return parseJsonResponse(response) || []
}

export async function parseNaturalLanguage(text) {
  const today = new Date().toISOString().split('T')[0]
  const prompt = `Parse this task description into structured data. Return ONLY a JSON object with no other text.

Input: "${text}"
Today's date: ${today}

Format:
{
  "text": "cleaned task name",
  "priority": "low" | "medium" | "high",
  "category": "work" | "personal" | "health" | "learning" | "finance" | "other",
  "dueDate": "YYYY-MM-DD" or null,
  "notes": "any additional context" or ""
}

Rules:
- Extract the core task from the description, removing priority/category keywords from the title
- If no priority mentioned, default to "medium"
- If no category mentioned, default to "other"
- For relative dates, calculate from today (${today}):
  - "today" = ${today}
  - "tomorrow" = next day
  - "next monday/tuesday/etc" = next occurrence of that day
  - "in 3 days" = ${today} + 3
  - "next week" = ${today} + 7
  - "next month" = ${today} + 30
- If no date mentioned, dueDate is null
- Preserve any context/notes mentioned`

  const response = await groqChat([{ role: 'user', content: prompt }], { maxTokens: 512 })
  return parseJsonResponse(response)
}
