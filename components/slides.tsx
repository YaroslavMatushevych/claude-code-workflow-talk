"use client";
import { ReactNode } from "react";
import { Big, Cap, Code, Mono, Rows, Slide, Swap, Term, Title, type Line } from "./ui";

export type SlideDef = {
  id: string;
  steps?: number;
  time?: string;
  render: (step: number) => ReactNode;
  notes: string;
};

const L = (t: string, c: Line["c"] = "o"): Line => ({ t, c });

const keybindings = `{
  "bindings": [{
    "context": "Chat",
    "bindings": { "meta+k": "voice:pushToTalk" }
  }]
}`;

const voiceSettings = `{
  "voice": {
    "enabled": true,
    "mode": "tap",
    "autoSubmit": true
  }
}`;

const terse = `---
name: Terse
description: Shortest useful answers
keep-coding-instructions: true
---
Answer first, in the first sentence.
No greeting, no narration, no closing summary.
Simple questions: one to three sentences.
Full detail only for errors, failing tests,
security risk, and destructive actions.`;

const reviewSkill = `---
name: reviewing-prs
description: Reviews a GitHub pull request for correctness
  bugs, missing tests, security issues ... Use when the
  user says "review #123".
argument-hint: [pr-number]
allowed-tools: Bash(gh pr view *) Bash(gh pr diff *) Read Grep
context: fork
---

# Review PR $0

PR metadata: !\`gh pr view $0 --json title,body,files\`
Diff: !\`gh pr diff $0\``;

const badDesc = `description: "Helps with documents"`;

const goodDesc = `description: Reviews a GitHub pull request for
  correctness bugs, missing tests and security issues.
  Use when the user asks to review a PR or says
  "review #123".`;

const rulesFile = `---
paths:
  - "src/components/**/*.tsx"
---
- Named exports only.
- One component per file.
- Props type directly above the component.`;

const claudeMd = `# Project: <name>
<one line: what it is + stack>

## Commands
- Test one file: \`pnpm test <path>\`
- Run typecheck + related tests before saying done.

## Gotchas
- IMPORTANT: never edit \`src/generated/\`.

## Compaction
- Keep modified files and test commands.`;

const ticketSkill = `---
name: ticket-to-pr
description: Turn a ticket description into a draft pull
  request with tests. Use only when asked to implement
  a ticket or task.
argument-hint: [ticket-id] [ticket text or path]
---
1. Restate the goal and acceptance criteria in 5 lines.
2. Write a failing test first. Run it.
3. Implement the smallest change that passes.
4. Commit on claude/<ticket-id>-<slug>. Never push to main.
5. Open a DRAFT pull request.
6. Stop if tests fail twice.`;

const agentTools = `import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const tools: Anthropic.Tool[] = [{
  name: "get_stock_price",
  description:
    "Latest trade price in USD for a ticker on NYSE or NASDAQ. " +
    "Use for current price questions only. No history.",
  input_schema: {
    type: "object",
    properties: { ticker: { type: "string", description: "e.g. AAPL" } },
    required: ["ticker"],
  },
}];`;

const agentRun = `const run = (name: string, input: any) =>
  name === "get_stock_price"
    ? \`\${input.ticker}: $123.45\`
    : \`unknown tool \${name}\`;

const messages: Anthropic.MessageParam[] = [
  { role: "user", content: "What is AAPL trading at?" },
];`;

const agentLoop = `for (let turn = 0; turn < 10; turn++) {
  const res = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1024,
    tools,
    messages,
  });
  messages.push({ role: "assistant", content: res.content });

  if (res.stop_reason !== "tool_use") {
    console.log(res.content.at(-1));
    break;
  }`;

const agentResults = `  const results = res.content
    .filter((b) => b.type === "tool_use")
    .map((b) => ({
      type: "tool_result" as const,
      tool_use_id: b.id,
      content: run(b.name, b.input),
    }));
  messages.push({ role: "user", content: results });
}`;

const badTool = `name: "get_stock_price",
description: "Gets the stock price for a ticker.",
input_schema: {
  properties: { ticker: { type: "string" } },
}`;

const goodTool = `description:
  "Retrieves the current stock price for a given ticker
   symbol. The ticker must be a valid symbol for a publicly
   traded company on a major US exchange. Returns the latest
   trade price in USD. Use when the user asks about the
   current price of a specific stock. It will not provide
   any other information about the stock or company."`;

const swarmSkill = `---
name: swarm-task
description: Turn a spoken or typed task into a ticket and
  run parallel agents on it. Use when the user says "swarm".
argument-hint: [task description]
---
Task: $ARGUMENTS

1. Write the ticket: title, goal, 3 acceptance criteria.
   Create it in Jira.
2. In one message, start in parallel:
   researcher (read only), tester (failing test).
3. Then start implementer in its own worktree.
4. Then start code-reviewer on the diff.
5. Open a DRAFT pull request. Link the ticket.
   Post a 5-line summary back to the chat.`;

const agentFiles = `researcher.md     model: haiku    tools: Read, Grep, Glob
tester.md         model: sonnet
implementer.md    model: sonnet   isolation: worktree
code-reviewer.md  model: haiku    permissionMode: plan`;

const baseSlides: SlideDef[] = [
  {
    id: "hero",
    time: "0:30",
    render: () => (
      <Slide>
        <Title size={112}>Inside My Real Claude Code Workflow</Title>
        <div className="mt-12 font-mono text-[28px] text-neutral-500">Yaroslav Matushevych · CityJS Athens 2026</div>
      </Slide>
    ),
    notes:
      "Hi, I'm Yaroslav. I'm a staff engineer, and I use Claude Code every working day. This is the setup I actually run, with real terminal output from my own machine. I'll show you commands, how context and memory work, how I write skills, and then how I put agents to work for me through a chat message. Near the end we build a small agent from an empty file, and I break it on purpose.",
  },
  {
    id: "map",
    steps: 7,
    time: "0:45",
    render: (s) => (
      <Slide>
        <Rows
          size={76}
          active={s}
          rows={["Tips", "Memory", "Commands", "Skills", "Context", "Agents", "Voice"]}
        />
      </Slide>
    ),
    notes:
      "This is the order of the talk, and the order I build my workflow in. Tips first: what works across every source I read. Then memory and its pitfalls. Commands and modes. Skills: how to write them, with real examples from people who write them well. Context, with real numbers from my own machine. Then agents, and last, voice: I dictate a task to a chat, and a swarm of agents does the work. Click through the seven quickly, then move on.",
  },
  {
    id: "voice",
    steps: 3,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Setup">
        <Swap k={s}>
          {s === 0 && <Mono size={120}>/voice tap</Mono>}
          {s === 1 && <Code text={keybindings} size={36} />}
          {s === 2 && <Code text={voiceSettings} size={36} />}
        </Swap>
      </Slide>
    ),
    notes:
      "Last topic, and the one that ties it together: voice. Slash voice turns on built-in dictation. Tap mode: tap to record, tap to send. The docs say it is tuned for coding vocabulary, things like regex, OAuth and JSON, and it uses the project name and git branch as hints. It needs a claude.ai login and a local microphone, so no SSH, and it uses no tokens. Hold mode has a warm-up delay, so I bind it to a modifier key in keybindings.json. Third block is the settings file. I could not find a first-person account of dictation errors on code terms, only vendor claims, so say which of those you saw yourself. I speak long prompts with real context. Typing makes me write short ones.",
  },
  {
    id: "modes",
    steps: 4,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Setup">
        <Rows
          size={64}
          active={s}
          rows={[
            <span key="a"><span className="font-mono text-[#d97757]">default</span> asks before it edits</span>,
            <span key="b"><span className="font-mono text-[#d97757]">acceptEdits</span> edits without asking</span>,
            <span key="c"><span className="font-mono text-[#d97757]">plan</span> read-only until I approve</span>,
            <span key="d"><span className="font-mono text-[#d97757]">auto</span> a classifier reviews each action</span>,
          ]}
        />
      </Slide>
    ),
    notes:
      "Shift plus Tab cycles permission modes. Default asks before anything beyond reading. Accept edits lets it edit files. Plan mode is read-only until I approve a plan, and I use it for anything that touches several files. Auto mode runs actions with a classifier model reviewing each one, and in the current version it is the starting mode in the terminal. Switching mode keeps the prompt cache, so it costs nothing. There is also bypass permissions behind a launch flag. I only use that in a container.",
  },
  {
    id: "style",
    steps: 2,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Setup">
        <Swap k={s}>
          {s === 0 && <Mono size={96}>/output-style concise</Mono>}
          {s === 1 && <Code text={terse} size={30} />}
        </Swap>
      </Slide>
    ),
    notes:
      "Concise is a built-in output style. It needs version 2.1.237 or later. It puts the answer in the first sentence and drops preamble, step narration and the closing recap. It keeps full detail for errors, failing tests and security warnings. The value in settings is case sensitive, so write Concise with a capital C. Second block is my own custom version. A custom style is a markdown file in the output-styles folder. Keep coding instructions true, or you lose the built-in coding behaviour. It is an instruction, so Claude can still drift. Restart after you edit the file.",
  },
  {
    id: "commands",
    steps: 7,
    time: "1:15",
    render: (s) => {
      const items: [string, string][] = [
        ["/btw", "side question, never enters history"],
        ["/rewind", "Esc Esc. back to before the mistake"],
        ["/fork", "try another direction"],
        ["/goal", "keep going until the condition is true"],
        ["/batch", "plan once, fan out to worktrees"],
        ["/code-review high --fix", "review the diff, apply the findings"],
        ["/insights", "an HTML report on my own sessions"],
      ];
      const [cmd, gloss] = items[s];
      return (
        <Slide chapter="Setup">
          <Swap k={s}>
            <div className="font-mono text-[#d97757]" style={{ fontSize: 96 }}>{cmd}</div>
            <div className="mt-6 text-[44px] text-neutral-300">{gloss}</div>
          </Swap>
        </Slide>
      );
    },
    notes:
      "Seven commands people skip. Slash btw asks a side question while Claude is working. No tools, and it never enters the history, so it costs no context. Rewind, or Escape twice, takes you back to before the mistake. That beats arguing with it, because the wrong turn leaves your context. Fork tries another direction and keeps the original. Goal sets a condition, like all tests pass and lint is clean, and Claude keeps going until it is true. Batch plans a large change, then fans it out to parallel agents in separate worktrees. Code review with fix reviews the diff and applies the findings. Insights builds an HTML report about your own sessions. I run that when I want to see how I really work.",
  },
  {
    id: "context",
    steps: 2,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <Term
          size={30}
          lines={[
            L('$ claude -p "/context"', "p"),
            L("Model: claude-sonnet-5-5"),
            L("Tokens: 13.7k / 1m (1%)"),
            L(""),
            L("System prompt            2.1k"),
            L("System tools              427"),
            L("System tools (deferred)  13.1k"),
            L("Skills                    9.8k", s === 1 ? "h" : "o"),
            L("Messages                  1.3k"),
            L("Autocompact buffer         33k"),
          ]}
        />
      </Slide>
    ),
    notes:
      "Real output from my machine, from a fresh session where I typed one command. Before I write a word, 13.7 thousand tokens are in use. The one to watch is skills: 9.8 thousand tokens, and that is only the one-line descriptions of every skill I have installed. The full skill bodies load only when a skill runs. Tool schemas from MCP servers are deferred, so only their names load until Claude needs them. Run slash context at the start of a session and again after you install a plugin. You will find things you forgot you had.",
  },
  {
    id: "cost",
    steps: 3,
    time: "1:15",
    render: (s) => (
      <Slide chapter="Context">
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={30}
              lines={[
                L('$ claude -p "Reply with exactly: ok" \\', "p"),
                L("    --model haiku --output-format json", "p"),
                L(""),
                L('"total_cost_usd": 0.0498'),
                L('"cache_creation_input_tokens": 24471', "h"),
                L('"output_tokens": 179'),
              ]}
            />
          )}
          {s === 1 && (
            <Term
              size={36}
              lines={[
                L("same prompt, cold cache", "d"),
                L(""),
                L("haiku    24,471 tokens    $0.050"),
                L("sonnet   27,347 tokens    $0.109"),
                L("opus     27,532 tokens    $0.220", "h"),
              ]}
            />
          )}
          {s === 2 && (
            <Term
              size={36}
              lines={[
                L("sonnet, second run", "d"),
                L(""),
                L("cache_read      12,529 tokens"),
                L("total_cost_usd  0.0624", "h"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes:
      "Same one-word prompt, three models, run just now. I asked each one to reply with ok. Every call still wrote around 25 thousand tokens into the cache, because that is the system prompt, tools and skills, before my prompt. Haiku cost five cents. Sonnet eleven. Opus twenty-two. Same question. Then I ran Sonnet a second time within the hour. Part of that prefix was read from cache this time, and the cost dropped from 11 cents to 6. That is prompt caching in a real run. Not everything hit the cache on the second call. About 15 thousand tokens were written again, and I did not dig into why. The lesson holds anyway: your prefix is paid for on every session, and the cache makes the second call cheaper.",
  },
  {
    id: "usage",
    steps: 2,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Context">
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={32}
              lines={[
                L('$ claude -p "/usage"', "p"),
                L("Last 24h · 112 requests · 2 sessions"),
                L("  86% of your usage came from", "h"),
                L("  subagent-heavy sessions", "h"),
              ]}
            />
          )}
          {s === 1 && (
            <Term
              size={32}
              lines={[
                L("Last 7d · 1463 requests · 14 sessions"),
                L("  74% of your usage was at >150k context", "h"),
                L("  33% came from sessions active for 8+ hours"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes:
      "Slash usage shows where your limits go, based on local sessions on this laptop. Last 24 hours is mostly the research I did to prepare this talk, with subagents: 86 percent. The seven-day view is the honest one. Seventy-four percent of my usage happened above 150 thousand tokens of context, and a third came from sessions that stayed open more than eight hours. That is my bad habit. Long sessions are where context gets noisy and cost goes up. It is why the next slides are about clearing context.",
  },
  {
    id: "memory",
    steps: 2,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={26}
              lines={[
                L("# Memory Index", "h"),
                L(""),
                L("## Feedback", "d"),
                L("- [Minimize Clarifying Questions](./feedback_minimize_clarifying_questions.md)"),
                L("  Once he's granted autonomy, stop asking and make a judgment call"),
                L("- [Message Drafting Tone](./feedback_message_drafting_tone.md)"),
                L("  Draft Slack/email messages short, direct, senior-toned"),
              ]}
            />
          )}
          {s === 1 && <Big>200 lines</Big>}
        </Swap>
      </Slide>
    ),
    notes:
      "Auto memory is Claude writing notes for itself. It lives in a memory folder per project, with an index file and one file per fact. This is the index from my own setup, 22 files. Each line is a pointer, and the detail sits in the topic file. Two rules matter. Only the first 200 lines or 25 kilobytes of the index load at session start, so keep it an index. And topic files load on demand. CLAUDE.md is the other half: that one I write, and it loads in full. Memory is context, not enforcement. If something must happen every time, that is a hook.",
  },
  {
    id: "clear",
    steps: 4,
    time: "0:45",
    render: (s) => {
      const items: [string, string][] = [
        ["/clear", "new task"],
        ["/compact <focus>", "same task, long history"],
        ["Esc Esc, Summarize from here", "one noisy detour"],
        ["/btw", "quick question"],
      ];
      return (
        <Slide chapter="Context">
          <Rows
            size={64}
            active={s}
            rows={items.map(([a, b], i) => (
              <span key={i}>
                <span className="font-mono">{a}</span>
                <span className="font-normal">  {b}</span>
              </span>
            ))}
          />
        </Slide>
      );
    },
    notes:
      "Four ways to deal with a growing session. Clear for a new, unrelated task. It is free. Compact with a focus for the same task with a long history. Compacting a big context is itself a big request, so do it early. Rewind and Summarize from here when only one part of the history is noise, like a long debugging detour. And btw for questions that should never enter history. After two failed corrections in a row, I clear and write a better prompt. A fresh session with a good prompt beats a long one full of failed attempts.",
  },
  {
    id: "economics",
    steps: 3,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={36}
              lines={[
                L("USD per million tokens    in    out", "d"),
                L(""),
                L("Haiku 4.5                  1      5"),
                L("Sonnet 5.5                 2     10"),
                L("Opus 5.5                   4     20"),
              ]}
            />
          )}
          {s === 1 && (
            <>
              <Big size={260}>0.1×</Big>
              <Mono size={40} dim>cache read price</Mono>
            </>
          )}
          {s === 2 && <Title size={88}>Lower effort first. Switch model second.</Title>}
        </Swap>
      </Slide>
    ),
    notes:
      "Prices from the official pricing page, checked this week. Haiku for exploration, log reading and summaries. Sonnet for daily scoped coding. Opus for ambiguous bugs and architecture. The cache changes the math. A cache read costs about a tenth of normal input, and a bit less on Opus. In a worked example I did, a forty-turn session on Opus cost about two dollars with caching and about eleven without. With caching the gap between Sonnet and Opus is small. And one rule: before you switch model, lower the effort setting. Changing effort keeps the cache. Changing model throws it away, because each model has its own cache.",
  },
  {
    id: "skill-anatomy",
    steps: 4,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s === 0 ? "file" : "levels"}>
          {s === 0 ? (
            <Code text={reviewSkill} size={26} />
          ) : (
            <Rows
              size={72}
              active={s - 1}
              rows={[
                <span key="a"><span className="font-mono">description</span> every request</span>,
                <span key="b"><span className="font-mono">body</span> when it runs</span>,
                <span key="c"><span className="font-mono">files</span> only when read</span>,
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes:
      "A skill is a folder with a SKILL.md. Frontmatter on top, instructions below. This is my PR review skill. Three details. The bang and backtick syntax runs a shell command and injects the output before Claude sees the prompt, so the diff is already in context. Context fork runs it in its own context, so the diff does not fill my main session. And allowed tools limits it to read-only git commands. Then the three levels. The description loads on every request. That is the 9.8 thousand tokens you saw earlier. The body loads only when the skill runs. Bundled scripts cost nothing until they run, and then only their output.",
  },
  {
    id: "description",
    steps: 2,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s}>
          {s === 0 && <Code text={badDesc} size={44} />}
          {s === 1 && <Code text={goodDesc} size={36} />}
        </Swap>
      </Slide>
    ),
    notes:
      "The description is the part that matters. Claude decides whether to use a skill from that text alone. Helps with documents tells it nothing. The second one says what it does, and when to use it, with the words I would actually say, like review hash 123. Write it in the third person. Include trigger words. If the YAML is broken, the skill silently never triggers, so check with the doctor command. And for anything with side effects, like deploy or push, set disable model invocation so only I can start it.",
  },
  {
    id: "which",
    steps: 5,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Skills">
        <Rows
          size={60}
          active={s}
          rows={[
            <span key="a">Always <span className="font-normal text-neutral-400">→</span> <span className="font-mono">CLAUDE.md</span></span>,
            <span key="b">Sometimes <span className="font-normal text-neutral-400">→</span> <span className="font-mono">skill</span></span>,
            <span key="c">Every time <span className="font-normal text-neutral-400">→</span> <span className="font-mono">hook</span></span>,
            <span key="d">Noisy side task <span className="font-normal text-neutral-400">→</span> <span className="font-mono">subagent</span></span>,
            <span key="e">External system <span className="font-mono">→ MCP</span></span>,
          ]}
        />
      </Slide>
    ),
    notes:
      "Where does an instruction go? Rules that always apply, under 200 lines, go in CLAUDE.md. A procedure I need sometimes is a skill. My rule: the third time I paste the same playbook, it becomes a skill. Something that must happen every time, like formatting after an edit, is a hook, because CLAUDE.md is a request and a hook is enforced. A side task that floods the context, like reading logs, goes to a subagent that returns a summary. Access to another system is an MCP server, and a skill can teach Claude how to use it.",
  },
  {
    id: "rules",
    steps: 2,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s}>
          {s === 0 && <Code text={rulesFile} size={34} />}
          {s === 1 && <Code text={claudeMd} size={30} />}
        </Swap>
      </Slide>
    ),
    notes:
      "Two kinds of rules. First, a rules file with a paths glob. It loads only when Claude touches a matching file, so React component rules cost nothing while it edits a server file. Second, my CLAUDE.md template. Commands Claude cannot guess, gotchas, and a compaction hint. For every line I ask one question: would removing this cause a mistake? If not, I cut it. When Claude makes the same mistake twice, I add a line. Keep it under 200 lines. Check the paths syntax against the docs before you copy it, I have not run this exact file.",
  },
  {
    id: "my-skills",
    steps: 2,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={34}
              lines={[
                L("$ ls .claude/skills", "p"),
                L("fix-issue  pr-summary  reviewing-prs"),
                L("swarm-task  ticket-to-pr  tidy-context"),
              ]}
            />
          )}
          {s === 1 && <Code text={ticketSkill} size={26} />}
        </Swap>
      </Slide>
    ),
    notes:
      "These are the six skills I start every repo with. Before the talk, install them from the setup folder so this listing is real on your own machine. Reviewing PRs, summarizing a branch, fixing an issue by number, ticket to PR, tidying context before a long session, and the swarm one, which I will show in a minute. Ticket to PR: tests first, smallest change, draft PR only, stop if tests fail twice. Notice what is in it: what to do, and when to stop.",
  },
  {
    id: "agent-decision",
    steps: 3,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Agents">
        <Rows
          size={68}
          active={s}
          rows={[
            "Steps known in advance → workflow",
            "Success is checkable → agent",
            "Agents cost 4×. Teams of agents 15×.",
          ]}
        />
      </Slide>
    ),
    notes:
      "Before you build an agent, ask whether you need one. If you can write the steps in advance, that is a workflow: code decides the path, the model fills in steps. Use an agent only when the steps cannot be set in advance and you can check success, with tests for example. The numbers are from Anthropic's own write-up: agents use about four times the tokens of chat, and multi-agent systems about fifteen times. That is fine for broad parallel research. It is a poor fit for most coding tasks. Give every agent a turn cap, a tool allowlist, and read-only tools by default.",
  },
  {
    id: "live-agent",
    steps: 4,
    time: "3:00",
    render: (s) => (
      <Slide chapter="Agents">
        <Swap k={s}>
          {s === 0 && <Code text={agentTools} size={25} />}
          {s === 1 && <Code text={agentRun} size={34} />}
          {s === 2 && <Code text={agentLoop} size={30} />}
          {s === 3 && <Code text={agentResults} size={34} />}
        </Swap>
      </Slide>
    ),
    notes:
      "Now the agent. About 45 lines. I recorded this run beforehand, and the code is on screen in four chunks. First, the tool definition: a name, a description and a schema. That is all Claude ever sees of my code. Second, the function that runs the tool, and the first message. Third, the loop. Call the model, push its answer onto the messages. If it did not ask for a tool, we are done. Fourth, if it asked, run the tool and send back a tool result, as a user message, with the matching id. Hard cap of ten turns, so a confused agent cannot loop forever. The SDK needs an API key. I have not run this exact file yet, so run it and record the output before the talk.",
  },
  {
    id: "bad-tool",
    steps: 3,
    time: "1:15",
    render: (s) => (
      <Slide chapter="Agents">
        <Swap k={s}>
          {s === 0 && <Code text={badTool} size={36} />}
          {s === 1 && <Code text={goodTool} size={28} />}
          {s === 2 && (
            <Term
              size={44}
              lines={[
                L('"What is Apple trading at?"', "p"),
                L(""),
                L('"How is Tesla doing this year?"', "p"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes:
      "Now I break it. This is the bad description: gets the stock price for a ticker, and a parameter with no type guidance. Claude chooses a tool only from this text. Next is the version from Anthropic's docs: what it does, which tickers, what it returns, when to use it, and what it will not do. The docs call the description by far the most important factor. Last, the two questions. The first one says Apple, not a ticker. The second needs history the tool does not have. With the bad description it may pass Apple instead of AAPL, call the tool anyway, or retry. I do not know which it picks on the day, and that is the point. Record a few runs ahead of time, and show what Claude sent each time.",
  },
  {
    id: "swarm-flow",
    steps: 5,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Swarm">
        <Rows
          size={64}
          active={s}
          rows={[
            "Dictate on my phone",
            "Message in the chat",
            <span key="c" className="font-mono">/swarm-task</span>,
            "researcher · tester · implementer · reviewer",
            "Draft PR and a ticket",
          ]}
        />
      </Slide>
    ),
    notes:
      "Now the part I use most. I dictate a task on my phone into a chat message, for example: the postcode filter loses its value on refresh, fix it. The chat is wired to Claude Code. Options from the docs: Claude in Slack, a Telegram channel plugin to my own laptop, or Remote Control from the Claude mobile app. The message triggers one skill, swarm task. It writes the ticket, starts agents in parallel, and sends me a summary. I come back to a draft pull request. Be honest about setup: Claude in Slack needs a workspace admin on a Team or Enterprise plan. The Telegram route runs on my laptop, so it must stay awake. Say which route you use.",
  },
  {
    id: "swarm-skill",
    steps: 2,
    time: "1:00",
    render: (s) => (
      <Slide chapter="Swarm">
        <Swap k={s}>
          {s === 0 && <Code text={swarmSkill} size={26} />}
          {s === 1 && <Code text={agentFiles} size={30} />}
        </Swap>
      </Slide>
    ),
    notes:
      "This is the orchestrator, and I wrote this one myself, so judge it as my design and not as a community skill. I borrowed the shape from Pocock: a thin skill that calls other agents and has checkable steps. Write the ticket, then start the researcher and the tester in parallel in one message, because that is what makes them run at the same time. The implementer waits for both. Then review, then a draft PR. Next block, the four agents. The researcher is Haiku, because reading files is cheap work. The implementer is Sonnet and runs in its own git worktree. I have not run this swarm end to end. Run it on a throwaway repo before the talk, and show the real ticket and PR if it works. And remember the earlier slide: the bottleneck is how fast you review.",
  },
  {
    id: "guardrails",
    steps: 5,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Swarm">
        <Rows
          size={64}
          active={s}
          rows={[
            "One chat ID can send work",
            "Draft PRs only",
            "Branch protection on main",
            "Messages and tickets are untrusted text",
            "Budget cap on every run",
          ]}
        />
      </Slide>
    ),
    notes:
      "Five guardrails, because this runs while I am away from the laptop. One chat ID can send work, and the bot ignores everyone else. Draft pull requests only. Branch protection on main, because the allowed git commands could push, and the prompt line is only an instruction. Treat messages and tickets as untrusted text. And a budget cap on every run.",
  },
  {
    id: "judgement",
    steps: 3,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Judgement">
        <Rows size={96} active={s} rows={["Read every diff", "Check the tests it wrote", "I press merge"]} />
      </Slide>
    ),
    notes:
      "The part no agent does for me. I read every diff. Agents produce plausible code that misses edge cases. I check the tests it wrote, because agents sometimes weaken the assertion to make a test pass. And I press merge. Verification is the best lever I know: give Claude a way to check its own work, like tests, a build or a screenshot, and ask for evidence and not a claim. Claude Code's team says the same, and in my experience it makes the biggest difference.",
  },
  {
    id: "close",
    steps: 4,
    time: "0:30",
    render: (s) => (
      <Slide>
        <Swap k={s}>
          {s === 0 && <Mono size={96}>/context</Mono>}
          {s === 1 && <Mono size={96}>/output-style concise</Mono>}
          {s === 2 && <Mono size={96}>one skill</Mono>}
          {s === 3 && <Title size={112}>Thank you</Title>}
        </Swap>
      </Slide>
    ),
    notes:
      "Three things to do tomorrow. Run slash context and see what you load before you type. Switch to concise and see how much shorter the answers get. And write one skill for something you paste every week. Then add a second one. Thank you. Files, skills and the research are in the repo, and I will share the link. Questions.",
  },
];

const grillMe = `---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".`;

const grillingTop = `Interview the user relentlessly until you reach a
shared understanding. Map this as a design tree:
every decision branches into the decisions that
hang off it.

Ask the whole frontier in one round: number each
question and give your recommended answer. Then
wait for the user's answers before the next round.`;

const grillingEnd = `Finding facts is your job, never the user's.

The session is done when the frontier is empty:
every branch of the design tree visited, nothing
left silently assumed. Do not act on it until the
user confirms you have reached a shared
understanding.`;

const badDescSummary = `# summarizes the workflow
description: Use when executing plans - dispatches
  subagent per task with code review between tasks`;

const goodDescTrigger = `# triggering conditions only
description: Use when executing implementation
  plans with independent tasks in the current session`;

const implementSkill = `---
name: implement
description: "Implement a piece of work based on a spec
  or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec
or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files
regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.`;


const botConfig = `const TOKEN = process.env.TG_TOKEN;
const ALLOWED = Number(process.env.TG_CHAT_ID);
const REPO = process.env.REPO_DIR;

const api = (method, body) =>
  fetch(\`https://api.telegram.org/bot\${TOKEN}/\${method}\`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());`;

const botRun = `const run = (task) =>
  new Promise((resolve) => {
    const p = spawn("claude", [
      "-p", \`Use the worker agent for this task: \${task}\`,
      "--output-format", "json",
      "--max-budget-usd", "1",
      "--allowedTools", "Read,Edit,Write,Bash(git *),Bash(gh pr *)",
      "--append-system-prompt",
      "Work on a branch named claude/<slug>. " +
        "Open a DRAFT pull request. Never push to main.",
    ], { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("close", () => {
      try { resolve(JSON.parse(out).result); } catch { resolve(out || "no output"); }
    });
  });`;

const botLoop = `let offset = 0;
while (true) {
  const { result = [] } = await api("getUpdates", { offset, timeout: 30 });
  for (const u of result) {
    offset = u.update_id + 1;
    const m = u.message;
    if (!m?.text || m.chat.id !== ALLOWED) continue;
    await api("sendMessage", { chat_id: ALLOWED, text: "Working on it." });
    const reply = await run(m.text);
    await api("sendMessage", { chat_id: ALLOWED, text: String(reply).slice(0, 3900) });
  }
}`;

const workerAgent = `---
name: worker
description: Implements one task end to end and opens a
  draft pull request. Use for any coding task sent
  from chat.
tools: Read, Edit, Write, Grep, Glob, Bash
model: sonnet
isolation: worktree
maxTurns: 30
skills:
  - ticket-to-pr
---
Follow the preloaded ticket-to-pr skill.
Report the pull request link and a 3-line summary.`;

const dim = (t: string) => <span className="font-mono text-[28px] font-normal text-neutral-600">  {t}</span>;

const extraSlides: Record<string, SlideDef> = {
  "tip-verify": {
    id: "tip-verify", steps: 2, time: "0:45",
    render: (s) => (
      <Slide chapter="Tips">
        <Swap k={s}>
          {s === 0 && (<><Mono size={64}>/goal all tests in test/auth pass</Mono><Mono size={64}>and the lint step is clean</Mono></>)}
          {s === 1 && <Title size={80}>A Stop hook blocks the turn until the check passes</Title>}
        </Swap>
      </Slide>
    ),
    notes: "First tip, and the one every source agrees on: give Claude a way to check its own work. Anthropic's best-practices page puts it first. Boris Cherny's team calls verification the most important tip. The goal command from the ClaudeDevs account is the built-in version: you state a condition, like all tests in this folder pass and lint is clean, and Claude keeps working until it is true. For a hard guarantee, a Stop hook blocks the turn from ending until your check passes. A hook is code, so it enforces. CLAUDE.md only asks. Sources: Anthropic best practices, ClaudeDevs post 12 May 2026. Slack and the Boris site are secondary, I did not open the X posts.",
  },
  "tip-grill": {
    id: "tip-grill", time: "0:30",
    render: () => (
      <Slide chapter="Tips">
        <Title size={76}>Grill me on these changes and don't make a PR until I pass</Title>
        <Cap>Boris Cherny, 31 Jan 2026</Cap>
      </Slide>
    ),
    notes: "A prompt from Boris Cherny's January thread. Instead of letting Claude open a PR, you make it interview you about the change first. I read it on a secondary site that links the X post, so check the original before you quote it. Matt Pocock turned the same idea into a skill, which is two slides down the track, in the skills section. The point is the same: alignment before code.",
  },
  "tip-worktree": {
    id: "tip-worktree", steps: 2, time: "0:30",
    render: (s) => (
      <Slide chapter="Tips">
        <Swap k={s}>
          {s === 0 && <Term size={44} lines={[L("$ claude --worktree feature-auth", "p"), L("$ claude -w fix-postcode --tmux", "p")]} />}
          {s === 1 && <Code text={"---\nname: implementer\nisolation: worktree\n---"} size={48} />}
        </Swap>
      </Slide>
    ),
    notes: "Parallel sessions without collisions. Dash dash worktree gives each session its own checkout. Add tmux if you want a separate pane. Subagents get the same with isolation worktree in their frontmatter, as in the second block. Sources: Anthropic's common-workflows page and a Boris Cherny thread from February 2026. The limit I will come back to later: more parallel agents means more to review.",
  },
  "tip-pitfalls": {
    id: "tip-pitfalls", steps: 5, time: "0:45",
    render: (s) => (
      <Slide chapter="Tips">
        <Rows
          size={52}
          active={s}
          rows={[
            <span key="a">One session, many tasks{dim("/clear")}</span>,
            <span key="b">Correcting again and again{dim("/clear after two")}</span>,
            <span key="c">A reviewer told to find gaps{dim("it always finds some")}</span>,
            <span key="d">Plausible code{dim("ask for evidence")}</span>,
            <span key="e">Skip permissions on a real machine{dim("container or sandbox")}</span>,
          ]}
        />
      </Slide>
    ),
    notes: "Five pitfalls from Anthropic's own best-practices page, plus one from the tips repo by ykdojo. Kitchen-sink sessions: unrelated tasks in one context, so clear between them. Correcting over and over: after two misses, clear and rewrite the prompt. A reviewer told to find gaps will always find some, and you end up adding abstractions you did not need, so tell it to flag only correctness and requirement gaps. Plausible code that misses edge cases: give it tests or screenshots and ask for evidence. And dangerously skip permissions only inside a container or the sandbox.",
  },
  "mem-lines": {
    id: "mem-lines", steps: 3, time: "0:45",
    render: (s) => (
      <Slide chapter="Memory">
        <Swap k={s}>
          {s === 0 && (
            <Term size={44} lines={[L("✗ Format code properly", "d"), L(""), L("✓ Use 2-space indentation", "h"), L("✓ Run `npm test` before committing", "h")]} />
          )}
          {s === 1 && (
            <Term size={34} lines={[
              L("✗ Never use the `--foo-bar` flag.", "d"),
              L(""),
              L("✓ For complex usage or if you encounter a", "h"),
              L("  `FooBarError`, see `path/to/docs.md`", "h"),
            ]} />
          )}
          {s === 2 && <Title size={84}>"Never send an LLM to do a linter's job."</Title>}
        </Swap>
      </Slide>
    ),
    notes: "How to write a line in CLAUDE.md. First block: examples straight from Anthropic's memory docs. Format code properly is vague, use 2-space indentation is checkable. Second block is from Shrivu Shankar's blog post on how he uses every Claude Code feature: a rule that only says never do X leaves the agent stuck, so always give an alternative, or point to a doc and say when to read it. Do not embed the doc with an at-sign, because imports load at launch and cost context. Third: HumanLayer's blog post on writing a good CLAUDE.md. If a linter can check it, use the linter, not a prompt.",
  },
  "mem-pitfalls": {
    id: "mem-pitfalls", steps: 5, time: "1:00",
    render: (s) => (
      <Slide chapter="Memory">
        <Rows
          size={50}
          active={s}
          rows={[
            <span key="a">More instructions, less adherence{dim("HumanLayer")}</span>,
            <span key="b">Lost after /compact{dim("issue #11545")}</span>,
            <span key="c">Stale memory piles up{dim("dev.to, Apr 2026")}</span>,
            <span key="d">Poisoned memory{dim("Cisco, Apr 2026")}</span>,
            <span key="e">Ignored?{dim("make it a hook")}</span>,
          ]}
        />
      </Slide>
    ),
    notes: "Five memory pitfalls from real sources. One: HumanLayer says as the instruction count goes up, adherence drops across all of them, and their root file is under 60 lines. Anthropic's target is under 200. Two: GitHub issue 11545 reports CLAUDE.md being ignored after compact. The docs now say the project-root file is re-read from disk after compact, but instructions you gave only in chat are lost, so put them in the file. Three: auto-memory grows without criteria and old decisions go stale, a dev.to post from April 2026 says it ends up as useless as a 300-line CLAUDE.md. Four: Cisco showed an npm postinstall script that rewrites the memory file, so treat memory as untrusted input. Five: the docs say there is no guarantee of strict compliance. If it must happen, use a hook. I could not find a source on secrets in memory, so keep them out as a precaution.",
  },
  "mem-quote": {
    id: "mem-quote", time: "0:30",
    render: () => (
      <Slide chapter="Memory">
        <Title size={92}>"I saw it, I read it, and I still ignored it."</Title>
        <Cap>Claude, in GitHub issue #11545</Cap>
      </Slide>
    ),
    notes: "This is Claude's own reply in a real bug report, after it ignored a CLAUDE.md rule following compaction. I read it through a fetch tool summary, so open the issue and check the exact wording before you keep this slide. The lesson: memory is context, not enforcement.",
  },
  "sk-grill-me": {
    id: "sk-grill-me", steps: 3, time: "1:15",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s}>
          {s === 0 && <Code text={grillMe} size={40} />}
          {s === 1 && <Code text={grillingTop} size={34} />}
          {s === 2 && <Code text={grillingEnd} size={34} />}
        </Swap>
      </Slide>
    ),
    notes: "A real skill from Matt Pocock's skills repo, copied from GitHub today. Grill me is six lines, and the body is one line: call the grilling skill. It is user-invoked, with disable model invocation, so it adds nothing to your context until you type it. The logic lives in a shared grilling skill. Notice what it does. It asks the whole frontier of questions in one round, and each question comes with a recommended answer, so you can just agree. And there is a checkable done condition: the session is over when every branch of the design tree is visited and nothing is silently assumed. Pocock's README says the problem this fixes is misalignment between you and the agent.",
  },
  "sk-desc": {
    id: "sk-desc", steps: 3, time: "1:00",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s}>
          {s === 0 && <Code text={badDescSummary} size={36} />}
          {s === 1 && <Code text={goodDescTrigger} size={36} />}
          {s === 2 && (<><Big size={200}>1 review</Big><Mono size={36} dim>the skill specified 2</Mono></>)}
        </Swap>
      </Slide>
    ),
    notes: "The most useful finding about skill descriptions, from Jesse Vincent's superpowers repo, in the writing-skills skill. The first block is a description that summarises the workflow. The second one only says when to use it. He tested both. When the description summarised the workflow, the agent followed the description and skipped the body. The description said code review between tasks, so the agent did one review, though the skill's flowchart had two. With a trigger-only description, it read the flowchart and did both. So: a description says when, not how. Anthropic's skill-creator says the opposite problem exists too, that Claude undertriggers, so make the trigger conditions specific and a bit pushy. Write in the third person.",
  },
  "sk-write": {
    id: "sk-write", steps: 5, time: "1:00",
    render: (s) => (
      <Slide chapter="Skills">
        <Rows
          size={50}
          active={s}
          rows={[
            <span key="a">Every step ends on a completion criterion{dim("Pocock")}</span>,
            <span key="b">Prompt the positive{dim("Pocock")}</span>,
            <span key="c">Delete sentences that change nothing{dim("Pocock")}</span>,
            <span key="d">Test with and without the skill{dim("Anthropic, Vincent")}</span>,
            <span key="e">Under 500 lines{dim("Anthropic")}</span>,
          ]}
        />
      </Slide>
    ),
    notes: "Five rules from people who write skills for a living. From Matt Pocock's writing-for-agents skill: every step ends on a completion criterion, and the strongest ones are checkable and exhaustive. Prompt the positive, because negation backfires. Delete sentences that do not change the default behaviour: be thorough is a no-op, relentless is stronger. From Anthropic's best-practices and Jesse Vincent: build your evaluations first and compare against a baseline without the skill. Jesse calls it TDD for skills and repeats each pressure test five times or more. Anthropic says test on Haiku, Sonnet and Opus. Keep SKILL.md under 500 lines, and move reference material one level deep. Thariq's article adds that the gotchas section is the highest-signal part.",
  },
  "sk-pipeline": {
    id: "sk-pipeline", steps: 6, time: "1:00",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s === 5 ? "file" : "rows"}>
          {s < 5 ? (
            <Rows
              size={56}
              active={s}
              rows={[
                <span key="a" className="font-mono">/grill-with-docs</span>,
                <span key="b" className="font-mono">/to-spec</span>,
                <span key="c" className="font-mono">/to-tickets</span>,
                <span key="d"><span className="font-mono">/implement</span>{dim("then /clear")}</span>,
                <span key="e" className="font-mono">/code-review</span>,
              ]}
            />
          ) : (
            <Code text={implementSkill} size={28} />
          )}
        </Swap>
      </Slide>
    ),
    notes: "Pocock's whole flow, from his ask-matt router skill. Grill with docs, to-spec turns the conversation into a spec, to-tickets splits it into vertical slices where each slice is sized to fit in one fresh context window, then implement per ticket with a clear between them, then code review. The last block is the real implement skill, 15 lines. Small, composable skills, each one user-invoked. His README says other frameworks own the process and take away your control, and he wants the opposite. That is the shape I want for my own: thin skills that I call.",
  },
  "smart-zone": {
    id: "smart-zone", steps: 2, time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <Swap k={s}>
          {s === 0 && (<><Big size={180}>125K–150K</Big><Mono size={36} dim>where the dumb zone commonly begins</Mono></>)}
          {s === 1 && <Title size={80}>Clear or compact when the session bloats. Don't push through.</Title>}
        </Swap>
      </Slide>
    ),
    notes: "Matt Pocock's rule of thumb, from his dictionary of AI coding: on frontier models the dumb zone commonly begins around 125 to 150 thousand tokens, though it is debated. It does not follow the context window size. One task per session, and when a task is bigger than one smart zone, split it and hand off. Compare it with my own usage from earlier: 74 percent of my usage was above 150 thousand. His X posts on this are snippets I did not open. The Anthropic engineering post calls the same effect context rot.",
  },
  "agent-fail": {
    id: "agent-fail", steps: 4, time: "1:00",
    render: (s) => (
      <Slide chapter="Agents">
        <Swap k={s}>
          {s === 0 && (<><Title size={64}>"The natural bottleneck on all of this is how fast I can review the results."</Title><Cap>Simon Willison, 5 Oct 2025</Cap></>)}
          {s === 1 && <Title size={72}>Two teammates editing the same file leads to overwrites.</Title>}
          {s === 2 && <Title size={72}>Idle teammates keep burning tokens until shut down.</Title>}
          {s === 3 && (<><Big size={200}>15×</Big><Mono size={36} dim>tokens, multi-agent vs chat</Mono></>)}
        </Swap>
      </Slide>
    ),
    notes: "What goes wrong when you run agents in parallel, from real sources. Simon Willison runs several agents in worktrees, and says the bottleneck is how fast he can review. Armin Ronacher, in February 2026, describes the same effect as PR queues that grow and go stale. Claude Code's own agent teams docs, which are experimental, list their failures: two teammates editing the same file overwrite each other, idle teammates burn tokens until you shut them down, and the lead sometimes declares done early. Anthropic's multi-agent research post puts multi-agent systems at about 15 times the tokens of chat. Start with three to five teammates, per the docs. Quotes came through a fetch tool, so check each one against its page.",
  },
};

const extraSlides2: Record<string, SlideDef> = {
  links: {
    id: "links", time: "0:30",
    render: () => (
      <Slide>
        <Term
          size={44}
          lines={[
            L("github.com/YaroslavMatushevych/", "d"),
            L(""),
            L("claude-code-workflow-notes", "h"),
            L("claude-code-agent-skills", "h"),
            L("claude-telegram-bot", "h"),
            L("claude-code-workflow-talk", "h"),
          ]}
        />
      </Slide>
    ),
    notes: "Everything from this talk is in four repos on my GitHub. Workflow notes: the written version, with sources and examples, for memory, context, commands, skills, agents and cost. Agent skills: the skills, agents, hooks and CI workflow from the slides, ready to copy. Telegram bot: the 40-line script that turns a chat message into a Claude Code run. Workflow talk: these slides. The skills and the bot are drafts I have not run end to end, and the README in each says so. Thank you, and questions.",
  },

  "sk-levels": {
    id: "sk-levels", steps: 7, time: "1:15",
    render: (s) => (
      <Slide chapter="Skills">
        <Rows
          size={46}
          active={s}
          rows={[
            <span key="1">1  Bare SKILL.md{dim("adjectives change nothing")}</span>,
            <span key="2">2  Fixed process{dim("no cause, no fix")}</span>,
            <span key="3">3  Description{dim("when, signals, when not")}</span>,
            <span key="4">4  Split into files{dim("every link has a condition")}</span>,
            <span key="5">5  Limits in the environment{dim("a prompt rule is a request")}</span>,
            <span key="6">6  Evals{dim("10–20 cases, 3–5 runs")}</span>,
            <span key="7">7  Plugin{dim("evals ship with it")}</span>,
          ]}
        />
      </Slide>
    ),
    notes: "Seven levels of a skill, from a Ukrainian talk by Kyrylo on the BeerCode channel, published 9 August 2026. I read the auto-generated captions, so treat the quotes as close and check them before you rely on them. Level one: a bare SKILL.md. Adding words like analyze carefully does nothing: the text grows and the behaviour stays the same. Two: a fixed process in the body, with a hard gate, like if there is no confirmed cause, there is no fix, and a failing test that must fail before the fix. Three: the description. He calls it the most important line, a router, with three parts: which tasks trigger it, signals, and where it must not interfere. Four: split into files, but every link in the body needs a condition, and do not split a skill you can read in a minute. Five: a rule in a prompt is a request, so enforce limits in the environment, with allowed tools and a model per skill. Six: evals. Seven: package it as a plugin with the evals next to it. This agrees with Anthropic on descriptions and with Pocock on checkable steps. He does not mention Jesse Vincent's finding about workflow summaries.",
  },
  "sk-evals": {
    id: "sk-evals", steps: 3, time: "1:00",
    render: (s) => (
      <Slide chapter="Skills">
        <Swap k={s}>
          {s === 0 && <Title size={84}>5 cases that should trigger. 5 that should not.</Title>}
          {s === 1 && (<><Title size={84}>Run each case 3 to 5 times.</Title><Cap>"You cannot trust a single passed or failed test."</Cap></>)}
          {s === 2 && <Title size={84}>A separate judge scores it. The agent does not grade itself.</Title>}
        </Swap>
      </Slide>
    ),
    notes: "How to test a skill, from the same BeerCode talk. A case is a realistic prompt, a flag for whether the skill should trigger, and a list of checks. Start with 10 to 20 cases: about five that should trigger and five that should not. Run each case in a clean directory, because agents cheat by reading earlier chats. Run each case three to five times, because you cannot trust a single pass or fail. Run deterministic checks first, then a separate judge sub-agent with a rubric. An agent that grades itself will almost always pass itself. Anthropic and Jesse Vincent say the same thing in different words: test with and without the skill. I have not checked his SkillsBench numbers, so I left them out.",
  },

  "agent-skill": {
    id: "agent-skill", steps: 3, time: "1:30",
    render: (s) => (
      <Slide chapter="Agents">
        <Swap k={s}>
          {s === 0 && (
            <Rows
              size={72}
              active={1}
              rows={[
                <span key="a">planner{dim("writes the plan")}</span>,
                <span key="b">worker{dim("writes the code")}</span>,
                <span key="c">reviewer{dim("reads the diff")}</span>,
              ]}
            />
          )}
          {s === 1 && <Code text={workerAgent} size={30} />}
          {s === 2 && <Code text={ticketSkill} size={26} />}
        </Swap>
      </Slide>
    ),
    notes: "This is the idea of the talk. An agent is a role with limited tools. A skill is the procedure it follows. I could run a planner, a worker and a reviewer, each with its own skills. For the talk I show one, the worker. The agent file says: use Sonnet, run in its own git worktree, limit to 30 turns, and preload the ticket-to-pr skill. The docs say the skills field injects the full skill content into the subagent's context at startup, so the agent does not have to find it. The second block is the skill: tests first, smallest change, draft PR only, stop if tests fail twice. Same pattern as Pocock's skills earlier, thin and with checkable steps. One thing to test before the talk: I removed disable-model-invocation from this skill, because I am not sure a preloaded skill can have it. Check on your version.",
  },
  "bot-flow": {
    id: "bot-flow", steps: 6, time: "1:00",
    render: (s) => (
      <Slide chapter="Voice">
        <Rows
          size={60}
          active={s}
          rows={[
            "Dictate on my phone",
            "Telegram message",
            "Bot on my laptop",
            <span key="d"><span className="font-mono">claude -p</span> in my repo</span>,
            "Worker agent with my skill",
            "Draft PR and a reply",
          ]}
        />
      </Slide>
    ),
    notes: "Here is how the voice part works, and it is simple. I dictate a message on my phone, with the dictation button on the keyboard, into a Telegram chat with my own bot. A small script on my laptop receives it and starts a headless Claude Code run in my repo. Claude hands the task to the worker agent, which follows the skill, and I get a draft pull request and a reply in the chat. The laptop must be on, with the script running. I chose a bot and claude dash p over a live session because it needs no session open, and a new run starts for each message. On your side: check if your organisation allows this on a work login. Mine blocks Remote Control, for example.",
  },
  "bot-code": {
    id: "bot-code", steps: 3, time: "1:15",
    render: (s) => (
      <Slide chapter="Voice">
        <Swap k={s}>
          {s === 0 && <Code text={botConfig} size={28} />}
          {s === 1 && <Code text={botRun} size={26} />}
          {s === 2 && <Code text={botLoop} size={30} />}
        </Swap>
      </Slide>
    ),
    notes: "The whole bot is about 40 lines, and it is not a framework. Block one: the token, the one chat ID that is allowed to send work, the repo directory, and a small helper for the Telegram API. Block two: the run function. It starts claude with dash p, JSON output, a one-dollar budget cap per message, and a short list of allowed tools. An append-system-prompt line tells it to work on a branch and open a draft PR. Block three: the loop. Poll Telegram, ignore every chat except mine, run the task, send back the reply. I have not run this script end to end, so run it once before the talk. The allow list is the only access control, so keep the token secret.",
  },
  "bot-setup": {
    id: "bot-setup", steps: 4, time: "0:45",
    render: (s) => (
      <Slide chapter="Voice">
        <Rows
          size={52}
          active={s}
          rows={[
            <span key="a"><span className="font-mono">@BotFather</span>{dim("/newbot, copy the token")}</span>,
            <span key="b">Message your bot{dim("read your chat ID")}</span>,
            <span key="c"><span className="font-mono">node bot.mjs</span></span>,
            <span key="d"><span className="font-mono">gh auth status</span>{dim("the right account")}</span>,
          ]}
        />
      </Slide>
    ),
    notes: "Setup is four steps. One: message BotFather in Telegram, run newbot, copy the token. Two: send your bot a message, open the getUpdates URL in a browser, and read your chat ID. Three: run the script with the token, the chat ID and the repo path in environment variables. Four: check that the GitHub CLI is logged in as the account that owns the repo. Everything is on your laptop. If you do not want the laptop on all the time, the same script can run on a small server, with the repo checked out there.",
  },
};

const order = [
  "hero", "map",
  "tip-verify", "tip-grill", "tip-worktree", "tip-pitfalls",
  "memory", "mem-lines", "mem-pitfalls", "mem-quote",
  "modes", "style", "commands",
  "sk-grill-me", "sk-desc", "sk-write", "sk-levels", "sk-evals", "which", "sk-pipeline",
  "context", "cost", "usage", "smart-zone",
  "agent-decision", "agent-fail", "live-agent", "bad-tool", "agent-skill",
  "voice", "bot-flow", "bot-code", "bot-setup", "guardrails",
  "judgement", "close", "links",
];

const all: Record<string, SlideDef> = { ...Object.fromEntries(baseSlides.map((x) => [x.id, x])), ...extraSlides, ...extraSlides2 };

export const slides: SlideDef[] = order.map((id) => {
  const sl = all[id];
  if (!sl) throw new Error(`Missing slide ${id}`);
  return sl;
});
