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

const baseSlides: SlideDef[] = [
  {
    id: "hero",
    time: "0:10",
    render: () => (
      <Slide>
        <Title size={112}>Inside My Real Claude Code Workflow</Title>
        <div className="mt-12 font-mono text-[28px] text-neutral-500">Yaroslav Matushevych · CityJS Athens 2026</div>
      </Slide>
    ),
    notes:
      "Hi, I'm Yaroslav, and I use Claude Code every working day. Everything you will see today comes from my own machine.",
  },
  {
    id: "voice",
    steps: 3,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Voice">
        <H>{["Built-in voice dictation", "A key binding removes the start delay", "Tap mode and auto-submit as the default"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Mono size={110}>/voice tap</Mono>}
          {s === 1 && <Code text={keybindings} size={34} />}
          {s === 2 && <Code text={voiceSettings} size={34} />}
        </Swap>
      </Slide>
    ),
    notes: "Last topic. Slash voice turns on built-in dictation. Tap mode: tap to record, tap to send. The docs say it is tuned for coding words like regex, OAuth and JSON. It needs a claude.ai login and a local microphone, so it does not work over SSH, and it uses no tokens. Hold mode has a warm-up delay, so I bind it to a modifier key. The third block is the settings file. For my phone I use the keyboard's dictation button instead, because slash voice needs a local microphone. I speak long prompts with real context. Typing makes me write short ones.",
  },
  {
    id: "modes",
    steps: 4,
    time: "0:40",
    render: (s) => (
      <Slide chapter="Setup">
        <H>Shift+Tab switches the permission mode</H>
        <Rows
          size={48}
          active={s}
          rows={[
            <span key="a">{mono("default")} asks before it edits files</span>,
            <span key="b">{mono("acceptEdits")} edits files without asking</span>,
            <span key="c">{mono("plan")} only reads, until I approve the plan</span>,
            <span key="d">{mono("auto")} a second model reviews each action</span>,
          ]}
        />
      </Slide>
    ),
    notes:
      "Shift plus Tab cycles permission modes. Default asks before anything beyond reading. Accept edits lets it edit files. Plan mode is read-only until I approve a plan, and I use it for anything that touches several files. Auto mode runs actions with a classifier model reviewing each one, and in the current version it is the starting mode in the terminal. Switching mode keeps the prompt cache, so it costs nothing. There is also bypass permissions behind a launch flag. I only use that in a container.",
  },
  {
    id: "style",
    steps: 4,
    time: "0:50",
    render: (s) => (
      <Slide chapter="Commands">
        <H>{[
          "Make answers shorter with an output style",
          "Default: 420 words, 1,020 output tokens",
          "Concise: 179 words, 576 output tokens",
          "My own Terse style: 158 words, 476 output tokens",
        ][s]}</H>
        <Swap k={s}>
          {s === 0 && <Mono size={80}>/output-style concise</Mono>}
          {s === 1 && <Term size={26} lines={[L(`$ claude -p "${styleQ}"`, "p"), L(""), ...styleDefault.map((t) => L(t))]} />}
          {s === 2 && <Term size={26} lines={[L(`$ claude -p "${styleQ}"`, "p"), L(""), ...styleConcise.map((t) => L(t))]} />}
          {s === 3 && <Term size={26} lines={[L(`$ claude -p "${styleQ}"`, "p"), L(""), ...styleTerse.map((t) => L(t))]} />}
        </Swap>
      </Slide>
    ),
    notes: "Concise is a built-in output style, from version 2.1.237. It puts the answer first and drops preamble and recap. Here is the same question three times, from real runs on my machine, one run each. The default answer is 420 words. Concise is 179, and my own Terse style is 158. Output tokens drop from 1,020 to 476. Runs vary, so one run is not a benchmark, but the difference is large and it is what I see every day. Select a style with slash output-style, or in settings. A custom style is a markdown file in the output-styles folder. Keep coding instructions true, or you lose the built-in coding behaviour.",
  },
  {
    id: "commands",
    steps: 7,
    time: "0:40",
    render: (s) => {
      const items: [string, string][] = [
        ["/btw", "Ask a side question without adding it to the context"],
        ["/rewind", "Go back to before a mistake (Esc Esc)"],
        ["/fork", "Branch the conversation to try another approach"],
        ["/goal", "Keep working until a condition you set is true"],
        ["/batch", "Split a big change across parallel agents"],
        ["/code-review high --fix", "Review the diff and fix what it finds"],
        ["/insights", "A report on how you use Claude Code"],
      ];
      const [cmd, gloss] = items[s];
      return (
        <Slide chapter="Commands">
          <H>Commands worth knowing</H>
          <Swap k={s}>
            <div className="font-mono text-[#d97757]" style={{ fontSize: 88 }}>{cmd}</div>
            <div className="mt-6 text-[48px] text-neutral-300">{gloss}</div>
          </Swap>
        </Slide>
      );
    },
    notes: "Seven commands people skip. Slash btw asks a side question while Claude works. It never enters the history, so it costs no context. Rewind, or Escape twice, goes back to before the mistake, so the wrong turn leaves your context. Fork tries another direction and keeps the original. Goal sets a condition, like all tests pass, and Claude keeps going until it is true. Batch splits a large change across parallel agents in separate worktrees. Code review with fix reviews the diff and applies the findings. Insights builds a report about your own sessions.",
  },
  {
    id: "context",
    steps: 2,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <H>{s === 0 ? "What is in the context before I type" : "Skill descriptions alone take 9.8k tokens"}</H>
        <Term
          size={28}
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
    time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <H>{["One short prompt, run on Haiku", "The same prompt on three models", "A second run on Sonnet costs less"][s]}</H>
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
                L("model    tokens written to cache    cost", "d"),
                L(""),
                L("haiku    24,471                     $0.050"),
                L("sonnet   27,347                     $0.109"),
                L("opus     27,532                     $0.220", "h"),
              ]}
            />
          )}
          {s === 2 && (
            <Term
              size={36}
              lines={[
                L("cache_read      12,529 tokens"),
                L("total_cost_usd  0.0624", "h"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "Same one-word prompt, three models, run just now. Every call wrote around 25 thousand tokens into the cache, because that is the system prompt, tools and skills, before my prompt. Haiku cost five cents. Sonnet eleven. Opus twenty-two. Then I ran Sonnet again within the hour. Part of that prefix was read from cache, and the cost dropped from 11 cents to 6. That is prompt caching in a real run. About 15 thousand tokens were still written again, and I did not find out why. Your prefix is paid for in every session, and the cache makes the second call cheaper.",
  },
  {
    id: "memory",
    steps: 3,
    time: "0:40",
    render: (s) => (
      <Slide chapter="Memory">
        <H>{["Claude reads two kinds of memory at session start", "Auto-memory: MEMORY.md is the index of notes Claude keeps about me", "Only the first 200 lines of MEMORY.md load at session start"][s]}</H>
        <Swap k={s}>
          {s === 0 && (
            <Rows
              size={56}
              active={-1}
              rows={[
                <span key="a"><span className="text-white">CLAUDE.md</span>: I write it</span>,
                <span key="b"><span className="text-white">Auto-memory</span>: Claude writes it</span>,
              ]}
            />
          )}
          {s === 1 && (
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
          {s === 2 && (
            <Term
              size={30}
              lines={[
                L("~/.claude/projects/<project>/memory/", "p"),
                L(""),
                L("  MEMORY.md       the index: first 200 lines or 25KB load", "h"),
                L("  feedback_*.md   topic files with the details"),
                L("  project_*.md"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "Claude reads two kinds of memory at the start of every session. CLAUDE.md, which I write, and auto-memory, which Claude writes. I will not explain CLAUDE.md. Auto-memory lives in a folder per project: an index file called MEMORY.md and one file per fact. This is the index from my setup. The docs say the first 200 lines of MEMORY.md, or the first 25 kilobytes, load at the start of every conversation. Anything beyond that does not load at session start, so Claude keeps the index short and moves details into topic files.",
  },
  {
    id: "agent-decision",
    steps: 3,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Agents">
        <H>Do you need an agent?</H>
        <Rows
          size={44}
          active={s}
          rows={[
            "If you know the steps in advance, write a workflow",
            "If you cannot, and you can check the result, use an agent",
            "An agent uses about 4× the tokens of a chat. A team of agents, about 15×.",
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
    time: "0:45",
    render: (s) => (
      <Slide chapter="Agents">
        <H>{["Build an agent. Step 1: a tool with a name, a description and inputs", "Step 2: a function that runs the tool", "Step 3: a loop that asks Claude and runs the tool it picks", "Step 4: send the tool result back to Claude"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={agentTools} size={24} />}
          {s === 1 && <Code text={agentRun} size={32} />}
          {s === 2 && <Code text={agentLoop} size={28} />}
          {s === 3 && <Code text={agentResults} size={32} />}
        </Swap>
      </Slide>
    ),
    notes: "Now the agent, about 45 lines. I recorded this run beforehand. First, the tool: a name, a description and a schema. That is all Claude ever sees of my code. Second, the function that runs the tool. Third, the loop: call the model and add its answer to the messages. If it did not ask for a tool, we are done. Fourth, if it asked, run the tool and send back a tool result with the matching id. There is a hard cap of ten turns. I record the output before the talk because I have not run this exact file yet.",
  },
  {
    id: "bad-tool",
    steps: 3,
    time: "0:50",
    render: (s) => (
      <Slide chapter="Agents">
        <H>{["A bad tool description", "A good tool description", "Two questions to test both"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={badTool} size={34} />}
          {s === 1 && <Code text={goodTool} size={26} />}
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
    notes: "Now I break it. The bad description says: gets the stock price for a ticker, and the parameter says nothing. Claude chooses a tool only from this text. Next is a good description: what it does, which tickers, what it returns, when to use it, and what it will not do. Last, two questions. The first says Apple, not a ticker. The second needs history the tool does not have. With the bad description Claude may pass Apple instead of AAPL, call the tool anyway, or retry. I do not know which it picks, so I recorded several runs and I show what Claude sent each time.",
  },
  {
    id: "guardrails",
    steps: 5,
    time: "0:25",
    render: (s) => (
      <Slide chapter="Voice">
        <H>Guardrails for work I am not watching</H>
        <Rows
          size={44}
          active={s}
          rows={[
            "Only my chat ID can send work",
            "Claude can only open draft pull requests",
            "Main is protected, so nothing can be pushed there",
            "Task text and tickets are untrusted input",
            "Every run has a budget cap",
          ]}
        />
      </Slide>
    ),
    notes:
      "Five guardrails, because this runs while I am away from the laptop. One chat ID can send work, and the bot ignores everyone else. Draft pull requests only. Branch protection on main, because the allowed git commands could push, and the prompt line is only an instruction. Treat messages and tickets as untrusted text. And a budget cap on every run.",
  },
  {
    id: "close", time: "0:20",
    render: () => (
      <Slide>
        <Title size={120}>Thank you</Title>
        <div className="mt-8 font-mono text-[32px] text-neutral-400">Yaroslav Matushevych</div>
      </Slide>
    ),
    notes: "Even with many agents, I read every diff, I check the tests Claude wrote, and I decide what to merge. These small parts are what you control a software factory with: what Claude remembers, how it is steered, which skills it follows, what it holds in context, and which tools it can touch. Thank you. The files, the skills and the bot are in four repos on my GitHub, and the links are on the next slide. Questions.",
  },
];


const botConfig = `const { TG_TOKEN: TOKEN, TG_CHAT_ID, REPO_DIR: REPO, DRY_RUN } = process.env;
const missing = ["TG_TOKEN", "TG_CHAT_ID", "REPO_DIR"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(\`Missing environment variable: \${missing.join(", ")}. See .env.example.\`);
  process.exit(1);
}
const ALLOWED = Number(TG_CHAT_ID);

const api = (method, body) =>
  fetch(\`https://api.telegram.org/bot\${TOKEN}/\${method}\`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());`;

const botRun = `const run = (task) =>
  new Promise((resolve) => {
    const args = [
      "-p", \`Use the worker agent for this task: \${task}\`,
      "--output-format", "json",
      "--max-budget-usd", "1",
      "--allowedTools", "Read,Edit,Write,Bash(git *),Bash(gh pr *)",
      "--append-system-prompt",
      "Work on a branch named claude/<slug>. Open a DRAFT pull request. Never push to main.",
    ];
    if (DRY_RUN) {
      console.log("claude", JSON.stringify(args));
      return resolve(\`dry run: \${task}\`);
    }
    const p = spawn("claude", args, { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] });
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


const H = ({ children }: { children: ReactNode }) => (
  <div className="mb-10">
    <Title size={52}>{children}</Title>
  </div>
);

const Two = ({ main, fix }: { main: ReactNode; fix: ReactNode }) => (
  <span>
    {main}
    <span className="block mt-1 text-[0.58em] font-normal">{fix}</span>
  </span>
);

const mono = (t: string) => <span className="font-mono text-[#d97757]">{t}</span>;


const styleQ = "Why does my React component's useEffect run twice in development?";
const styleDefault = ["# Why `useEffect` runs twice in development", "", "Your component is probably inside `<React.StrictMode>`. In", "development, StrictMode mounts each component, unmounts it, and", "mounts it again. This is on purpose. It does not occur in", "production builds.", "", "## Why React does this", "", "React wants to find bugs in effects that do not clean up", "correctly. The extra cycle simulates what happens when a …"];
const styleConcise = ["React 18+ Strict Mode causes this. In development only, React", "mounts each component, unmounts it, and mounts it again. This", "checks that your effects clean up correctly. Production builds run", "the effect once.", "", "**To fix it:** add a cleanup function to the effect that reverses", "what the effect did."];
const styleTerse = ["React Strict Mode causes this. In development, React mounts each", "component, unmounts it, and mounts it again. This checks that your", "effects clean up correctly. It does not happen in production", "builds.", "", "**What to do:**", "- Do not remove `<StrictMode>`. It finds real bugs.", "- Add a cleanup function to each effect that sets something up."];
const prsummaryOut = ["## What changed", "`filter()` in `filter.js` now takes a second argument, `saved`. It", "uses the live query `q` first. If `q` is `null` or `undefined`, it", "uses `saved`. If both are missing, it uses an empty string. The", "result is trimmed. I added `demo.js`, which calls", "`filter(undefined, \"SW1A 1AA\")`.", "", "## Why", "After a refresh, the live query is `undefined`. The old code", "called `q.trim()` and threw an error, so the postcode filter …"];
const prsummaryFile = `---
name: pr-summary
description: Draft a pull request description from the current branch diff
argument-hint: [extra focus]
disable-model-invocation: true
---
Commits: !\`git log --oneline main..HEAD\`
Diff stat: !\`git diff main...HEAD --stat\`
Write a PR description: what changed, why, risks, test plan. Max 150 words. Extra focus: $ARGUMENTS`;


const tipPipeCmd = ["$ git diff main...HEAD | claude -p \\", "    \"List the 3 biggest risks in this diff.", "     One line each, no intro.\""];
const tipPipeOut = ["- Whitespace-only `q` (for example `\"  \"`) is not nullish.", "  It wins over `saved`, then `trim()` returns `\"\"`. The", "  saved postcode is lost."];
const tipToyClaudeMd = "# Project\nAlways use tabs for indentation.\nUse 2-space indentation.\nWrite clean code.\nAlways write tests first.\nNever write tests for trivial functions.\nIMPORTANT: ALWAYS follow ALL rules. NEVER break any rule. IMPORTANT.";
const tipAuditOut = ["1. Lines 2 and 3 give opposite rules. One says tabs, the", "  other says 2-space indentation. The model cannot obey", "  both.", "2. Line 7 is pressure language. It is all-caps IMPORTANT,", "  ALWAYS, NEVER, and it repeats the other rules."];


const tipHookScript = "// PreToolUse hook for Bash. Exit code 2 blocks the command and sends stderr to Claude.\nlet input = \"\";\nprocess.stdin.on(\"data\", (d) => (input += d)).on(\"end\", () => {\n  const command = JSON.parse(input).tool_input?.command ?? \"\";\n  if (/git\\s+commit\\b.*--no-verify/.test(command)) {\n    console.error(\"Blocked: do not skip git hooks. Fix the failing check instead.\");\n    process.exit(2);\n  }\n});";
const tipHookSettings = "{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"matcher\": \"Bash\",\n        \"hooks\": [{ \"type\": \"command\", \"command\": \"node .claude/hooks/block-no-verify.mjs\" }]\n      }\n    ]\n  }\n}";
const tipHookOut = ["The command did not run. A PreToolUse hook", "(`.claude/hooks/block-no-verify.mjs`) blocked it before git", "started. The hook rejects any command that uses `--no-verify`.", "Its message was: \"Blocked: do not skip git hooks. Fix the", "failing check instead.\"", "", "No commit was created."];

const dim = (t: string) => <span className="font-mono text-[28px] font-normal text-neutral-600">  {t}</span>;

const extraSlides: Record<string, SlideDef> = {
};

const extraSlides2: Record<string, SlideDef> = {
  links: {
    id: "links", time: "0:30",
    render: () => (
      <Slide>
        <H>Everything from this talk is on GitHub</H>
        <Term
          size={40}
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
    notes: "Everything from this talk is in four repos on my GitHub. Workflow notes: the written version, with sources and examples, for memory, context, commands, skills, agents and cost. Agent skills: the skills, agents, hooks and CI workflow from the slides, ready to copy. Telegram bot: the 50-line script that turns a chat message into a Claude Code run. Workflow talk: these slides. The skills and the bot are drafts I have not run end to end, and the README in each says so. Thank you, and questions.",
  },


  "agent-skill": {
    id: "agent-skill", steps: 3, time: "1:30",
    render: (s) => (
      <Slide chapter="Agents">
        <H>An agent has a role. A skill gives it a procedure.</H>
        <Swap k={s}>
          {s === 0 && (
            <Rows
              size={60}
              active={1}
              rows={[
                "Planner: writes the plan",
                "Worker: writes the code",
                "Reviewer: reads the diff",
              ]}
            />
          )}
          {s === 1 && <Code text={workerAgent} size={26} />}
          {s === 2 && <Code text={ticketSkill} size={24} />}
        </Swap>
      </Slide>
    ),
    notes: "This is the idea of the talk. An agent is a role with limited tools. A skill is the procedure it follows. I could run a planner, a worker and a reviewer. Here I show one, the worker. Its file says: use Sonnet, run in its own worktree, limit to 30 turns, and preload the ticket-to-pr skill. The docs say the skills field injects the full skill into the agent at startup. The skill is short: tests first, smallest change, draft PR only, stop if tests fail twice. One thing to know: a skill with disable-model-invocation cannot be preloaded into an agent, so I removed that flag.",
  },
  "bot-flow": {
    id: "bot-flow", steps: 6, time: "1:00",
    render: (s) => (
      <Slide chapter="Voice">
        <H>From my phone to a draft PR</H>
        <Rows
          size={46}
          active={s}
          rows={[
            "I dictate a message with my phone keyboard",
            "It arrives in a Telegram chat with my bot",
            "The bot on my laptop receives it",
            <span key="d">The bot runs {mono("claude -p")} in my repo</span>,
            "The worker agent follows my skill",
            "I get a draft pull request and a reply",
          ]}
        />
      </Slide>
    ),
    notes: "Here is how the voice part works. I dictate a message with my phone keyboard into a Telegram chat with my own bot. A small script on my laptop receives it and starts a headless Claude Code run in my repo. Claude hands the task to the worker agent, which follows my skill, and I get a draft pull request and a reply in the chat. The laptop must be on, with the script running. This is my small software factory. Setup takes four steps: create a bot with BotFather, read your chat ID, run node bot.mjs, and check that gh is logged in to the right account. Check if your organisation allows this on a work login. Mine blocks Remote Control, for example.",
  },
  "bot-code": {
    id: "bot-code", steps: 3, time: "1:15",
    render: (s) => (
      <Slide chapter="Voice">
        <H>{["Settings and a helper for the Telegram API", "Run Claude Code for each message", "Listen for messages, only from my chat"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={botConfig} size={26} />}
          {s === 1 && <Code text={botRun} size={22} />}
          {s === 2 && <Code text={botLoop} size={28} />}
        </Swap>
      </Slide>
    ),
    notes: "The whole bot is about 50 lines and has no dependencies. Block one: the token, the one chat ID allowed to send work, the repo folder, a startup check, and a helper for the Telegram API. Block two: it starts claude with dash p, JSON output, a one-dollar budget cap, and a short list of allowed tools. With dry run set to 1 it prints the command instead of running it. Block three: the loop. Poll Telegram, ignore every chat except mine, run the task, send back the reply. Test it with dry run first. The allow list is the only access control, so keep the token secret.",
  },
};


const extraSlides3: Record<string, SlideDef> = {
  "mem-lines": {
    id: "mem-lines", steps: 2, time: "0:45",
    render: (s) => (
      <Slide chapter="Memory">
        <H>{["A good CLAUDE.md line is specific enough to check", "Say what to use, not only what to avoid"][s]}</H>
        <Swap k={s}>
          {s === 0 && (
            <Term size={40} lines={[
              L("Bad:   Write clean code", "d"),
              L(""),
              L("Good:  Use named exports.", "h"),
              L("Good:  Run `pnpm test <file>` before saying done.", "h"),
            ]} />
          )}
          {s === 1 && (
            <Term size={40} lines={[
              L("Bad:   Never use moment.js.", "d"),
              L(""),
              L("Good:  Use date-fns. Helpers are in docs/dates.md.", "h"),
            ]} />
          )}
        </Swap>
      </Slide>
    ),
    notes: "How I write a line in CLAUDE.md. A line Claude cannot check does nothing: write clean code means nothing to the model. A line it can check does work: use named exports, or run this test command before you say done. Second: a rule that only says never do X leaves Claude stuck, so say what to use instead, or point to a doc and say when to read it. Do not embed the doc with an at-sign, because imports load at launch and cost context. And if a rule must always hold, a CLAUDE.md line is not enough. That is the hook tip from the start of the talk.",
  },
  "mem-pitfalls": {
    id: "mem-pitfalls", steps: 5, time: "1:00",
    render: (s) => (
      <Slide chapter="Memory">
        <H>How memory goes wrong</H>
        <Rows
          size={44}
          active={s}
          rows={[
            "The more rules you add, the less Claude follows each one",
            "Rules you gave only in chat are lost after /compact",
            "Old notes go stale and mislead Claude",
            "A script can rewrite the memory file, so treat it as untrusted",
            "If a rule must always hold, use a hook",
          ]}
        />
      </Slide>
    ),
    notes: "Five ways memory goes wrong. The more rules you add, the less reliably Claude follows each one, so keep CLAUDE.md under 200 lines. After compact, the project CLAUDE.md is re-read from disk, but rules you gave only in chat are lost. Auto-memory grows without criteria and old notes go stale, so prune it. A script that rewrites the memory file changes what Claude does next session, so treat memory as untrusted input. And if a rule must always hold, use a hook, as in the first tips.",
  },
  "agent-fail": {
    id: "agent-fail", steps: 4, time: "1:00",
    render: (s) => (
      <Slide chapter="Agents">
        <H>What goes wrong with parallel agents</H>
        <Swap k={s}>
          {s === 0 && <div className="text-[72px] font-bold leading-tight">You still have to review every result.</div>}
          {s === 1 && <div className="text-[72px] font-bold leading-tight">Two agents editing the same file overwrite each other.</div>}
          {s === 2 && <div className="text-[72px] font-bold leading-tight">Idle agents keep using tokens until you stop them.</div>}
          {s === 3 && (<><Big size={190}>15×</Big><Mono size={34} dim>the tokens of a normal chat, for a team of agents</Mono></>)}
        </Swap>
      </Slide>
    ),
    notes: "What goes wrong when you run agents in parallel. Review is the bottleneck: I can start five agents, and I still have to read five diffs. Two agents editing the same file overwrite each other, which is why my worker runs in its own worktree. Idle agents keep burning tokens until you stop them. And the cost: Anthropic reports multi-agent systems use about 15 times the tokens of a chat. Start with one agent and a clear task.",
  },
  "smart-zone": {
    id: "smart-zone", steps: 2, time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <H>{s === 0 ? "Answers get worse in a long session" : "Clear or compact before the session gets long"}</H>
        <Swap k={s}>
          {s === 0 && (<><Big size={170}>125K–150K</Big><Mono size={34} dim>tokens of context: where quality starts to drop</Mono></>)}
          {s === 1 && <div className="text-[60px] font-bold leading-tight">One task per session. Hand off with a short summary file.</div>}
        </Swap>
      </Slide>
    ),
    notes: "A rule of thumb I use: on current models, quality starts to drop somewhere around 125 to 150 thousand tokens. The exact number is debated, so check your own sessions with slash context. Look at my own usage for the last week: 74 percent of it was above 150 thousand, and a third came from sessions open for more than eight hours. That is my bad habit. One task per session, and when a task is bigger, split it and hand off with a short summary file.",
  },
};


const extraSlides4: Record<string, SlideDef> = {
  "sk-write": {
    id: "sk-write", steps: 4, time: "0:50",
    render: (s) => (
      <Slide chapter="Skills">
        <H>How to write a skill: four rules</H>
        <Rows
          size={44}
          active={s}
          rows={[
            "Write short instructions, not explanations",
            "If the steps never change, use a script instead",
            "Delete lines that change nothing, like \"be thorough\"",
            "Keep it under 500 lines and move details to other files",
          ]}
        />
      </Slide>
    ),
    notes: "Four rules for writing a skill. The description gets its own slide next. One: write short instructions. Use the payments API if you work on checkout beats a paragraph on why. Two: if the steps never change, write a script and tell Claude to run it. Skills are for judgement. Three: delete lines that change nothing, like be thorough. AI-written skills are full of them. Four: keep the body under 500 lines and move variants into reference files. I write my skills by hand. A talk at AI Engineer 2026 by Philipp Schmid argues that AI-generated skills can make results worse, which matches what I see.",
  },
  "sk-desc": {
    id: "sk-desc", steps: 2, time: "0:45",
    render: (s) => (
      <Slide chapter="Skills">
        <H>{s === 0 ? "A vague description" : "A description that works"}</H>
        <Swap k={s}>
          {s === 0 && <Code text={`description: Helps with documents`} size={46} />}
          {s === 1 && (
            <Code
              size={34}
              text={`description: Reviews a pull request for bugs,
  missing tests and security issues. Use when the
  user asks to review a PR or says "review #123".
  Do not use for writing code.`}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "The description matters most. It sits in context on every request, and it is the only text Claude reads to decide if the skill applies. The first one tells it nothing, so the skill runs too often or never. The second says what it does, when to use it with words I would really say, and when not to. The not-to line stops it from firing on a request to write code. Keep it short, because you pay for it on every call. And describe the trigger, not the steps: if the description summarises the steps, Claude can follow it and skip the body.",
  },
  "sk-issues": {
    id: "sk-issues", steps: 5, time: "1:00",
    render: (s) => (
      <Slide chapter="Skills">
        <H>How skills fail</H>
        <Rows
          size={46}
          active={s}
          rows={[
            "It does not run when it should",
            "It runs when it should not",
            "It works on one model but not on another",
            "It gets worse after a model update",
            "Nobody tested it, because an AI wrote it",
          ]}
        />
      </Slide>
    ),
    notes: "Five ways a skill goes wrong. It does not run: the user prompt is too short for Claude to see that the skill applies. In a talk at AI Engineer 2026, half the failures the speaker's team saw were wrong triggering. It runs too often, because the description is broad, like use for web development. It works on one model and not another, so test on the ones you use. It gets worse after a model update. And the AI-written skill nobody tested. A failure is hard to diagnose because runs vary: the skill, the discovery or the task may be at fault. That is why you need tests.",
  },
  "sk-evals": {
    id: "sk-evals", steps: 4, time: "1:15",
    render: (s) => (
      <Slide chapter="Skills">
        <H>Test a skill before you trust it</H>
        <Swap k={s}>
          <div className="text-[64px] font-bold leading-tight max-w-[1500px]">
            {[
              "Write 10 test prompts: 5 where the skill should run and 5 where it should not",
              "Run each prompt 3 to 6 times, each time in a clean folder",
              "Check the results with simple pattern checks, then add a judge for the rest",
              "Run the same prompts without the skill. Same result? Remove the skill.",
            ][s]}
          </div>
        </Swap>
      </Slide>
    ),
    notes: "How I test a skill, in four steps. One: write ten test prompts, five that should run the skill and five that should not. Real prompts from your own sessions beat invented ones. Two: run each prompt three to six times, in a clean folder each time, because results vary and an agent can cheat by reading earlier chats. Three: check the results with simple pattern checks first. They are cheap. Add a judge with a rubric only for complex results. Four: run the same prompts without the skill. If the result is the same, remove the skill. That saves tokens and upkeep. Keep the prompts, so you notice when results get worse. The source is a talk by Philipp Schmid at AI Engineer 2026, linked in the notes repo.",
  },
};


const extraSlides5: Record<string, SlideDef> = {
  "tip-hook": {
    id: "tip-hook", steps: 3, time: "0:50",
    render: (s) => (
      <Slide chapter="Tips">
        <H>{["When Claude ignores a rule, make it a hook", "Register the hook in .claude/settings.json", "I asked Claude to break the rule"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={tipHookScript} size={26} />}
          {s === 1 && <Code text={tipHookSettings} size={30} />}
          {s === 2 && <Term size={28} lines={[L('$ claude -p "Run this exact command and tell me what happened:', "p"), L('    git commit --allow-empty --no-verify -m test"', "p"), L(""), ...tipHookOut.map((t) => L(t))]} />}
        </Swap>
      </Slide>
    ),
    notes: "A rule in CLAUDE.md is a request. A hook is code, so it enforces. This is the smallest useful one: a PreToolUse hook that blocks git commit with no-verify, so Claude cannot skip your git hooks. It reads the command from standard input. If it matches, it prints a message and exits with code 2, which blocks the command and sends the message back to Claude. The second block registers it for Bash commands. Then I asked Claude to run exactly that command. It did not run. Claude said the hook blocked it, did not try to get around it, and no commit was created. The idea comes from the Everything Claude Code repo, which has hooks like this. I wrote my own eight lines instead of installing it.",
  },

  "tip-skills-cost": {
    id: "tip-skills-cost", steps: 3, time: "0:40",
    render: (s) => (
      <Slide chapter="Tips">
        <H>{["Every skill costs tokens in every session", "One more skill: about 110 more tokens", "Mark a skill manual-only and it costs nothing"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Term size={36} lines={[L('$ claude -p "/context"', "p"), L("Skills                      9.8k", "h"), L("my installed skills: names and descriptions", "d")]} />}
          {s === 1 && <Term size={36} lines={[L("a new skill with a 51-word description", "p"), L("Skills                      9.9k", "h"), L("release-notes    Project    ~110", "h")]} />}
          {s === 2 && <Term size={36} lines={[L("disable-model-invocation: true", "p"), L("Skills                      9.8k", "h"), L("release-notes    not listed", "d")]} />}
        </Swap>
      </Slide>
    ),
    notes: "Every skill that Claude can start on its own puts its name and description into the context of every session, whether you use it or not. I tested it with one new skill with a 51-word description. The skills line in slash context went from 9.8 to 9.9 thousand tokens, and the skill is listed at about 110 tokens. Mine add up to 9.8 thousand before I type a word. If you only call a skill by hand, add disable-model-invocation true to its frontmatter. In my test the line went back to 9.8 and the skill was not listed. The docs say such a skill stays out of the context until you call it.",
  },
  "tip-pipe": {
    id: "tip-pipe", steps: 2, time: "0:40",
    render: (s) => (
      <Slide chapter="Tips">
        <H>{s === 0 ? "Use Claude as a Unix command" : "The first of three risks it printed"}</H>
        <Swap k={s}>
          {s === 0 && <Term size={34} lines={tipPipeCmd.map((t) => L(t, "p"))} />}
          {s === 1 && <Term size={30} lines={tipPipeOut.map((t) => L(t))} />}
        </Swap>
      </Slide>
    ),
    notes: "Claude Code reads standard input, so you can pipe a diff, a log or a failing test into it and get the answer back in your terminal, in a script, or in CI. This is a real run on the small demo repo from before: three risks in three lines. It caught that a value with only spaces is not null, so the saved postcode is lost. My own demo did not test that case. Add dash dash output format json and you also get the tokens and the cost, so a script can track what each run costs.",
  },
  "tip-audit": {
    id: "tip-audit", steps: 3, time: "0:50",
    render: (s) => (
      <Slide chapter="Tips">
        <H>{["A CLAUDE.md with two problems", "Audit your instructions", "What it found"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={tipToyClaudeMd} size={34} />}
          {s === 1 && <Mono size={80}>/doctor prompt-audit</Mono>}
          {s === 2 && <Term size={34} lines={tipAuditOut.map((t) => L(t, "h"))} />}
        </Swap>
      </Slide>
    ),
    notes: "Slash doctor with prompt-audit reads your instruction files and reports problems. I gave it a CLAUDE.md with two planted problems: one line says tabs, another says 2 spaces, and the last line shouts always and never. It found both. It says the two indentation lines cannot both be followed, and that all-caps pressure language adds no information. It also said it cannot tell which of two conflicting lines is newer without git history, so you have to decide. This ran on a toy file. The same command works on your real CLAUDE.md, and it also checks your skills. I did not put my own files on a slide.",
  },


  "sk-run": {
    id: "sk-run", steps: 3, time: "0:50",
    render: (s) => (
      <Slide chapter="Skills">
        <H>{["A real run of my pr-summary skill", "What it wrote", "A limit I set, and what happened"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={prsummaryFile} size={28} />}
          {s === 1 && <Term size={26} lines={[L('$ claude -p "/pr-summary"', "p"), L(""), ...prsummaryOut.map((t) => L(t))]} />}
          {s === 2 && (<><Big size={190}>197 words</Big><Mono size={36} dim>my skill says: Max 150 words</Mono></>)}
        </Swap>
      </Slide>
    ),
    notes: "A real run, from a throwaway repo with a branch and three commits. The skill is five lines. It runs git log and git diff stat before Claude sees the prompt, so the commits are already in context. It worked: the summary is accurate, it spots that an empty string will not fall back to the saved value, and it gives a test plan. But I wrote max 150 words in the skill, and it wrote 197. A skill can look fine and still miss a limit you set. A word count is a check you can run, so write it as a test case, and run it more than once.",
  },

  "d-tips": {
    id: "d-tips", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Tips</Title>
        <div className="mt-8 text-[48px] text-neutral-400">Three things I tested on my own machine</div>
      </Slide>
    ),
    notes: "Three tips, and none of them is the usual advice. Each one comes from a real run on my machine, and I show the output.",
  },
  "d-memory": {
    id: "d-memory", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Memory</Title>
        <div className="mt-8 text-[48px] text-neutral-400">What Claude knows at the start of every session</div>
      </Slide>
    ),
    notes: "Those habits work best when Claude starts each session already knowing the basics about you and your project. That is memory.",
  },
  "d-commands": {
    id: "d-commands", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Commands</Title>
        <div className="mt-8 text-[48px] text-neutral-400">How I steer Claude while it works</div>
      </Slide>
    ),
    notes: "Memory covers what Claude knows. Now how I steer it while it works: modes, output styles and a few commands people skip.",
  },
  "d-skills": {
    id: "d-skills", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Skills</Title>
        <div className="mt-8 text-[48px] text-neutral-400">How Claude does the work the way I want</div>
      </Slide>
    ),
    notes: "Commands steer one session. Skills package the way I want work done, so I do not repeat myself in every prompt.",
  },
  "d-context": {
    id: "d-context", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Context</Title>
        <div className="mt-8 text-[48px] text-neutral-400">What Claude can hold, and what it costs</div>
      </Slide>
    ),
    notes: "Memory, skills and tools all take space in the context window. So let me show you what that looks like on my own machine.",
  },
  "d-agents": {
    id: "d-agents", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Agents</Title>
        <div className="mt-8 text-[48px] text-neutral-400">Claude working on its own</div>
      </Slide>
    ),
    notes: "Once you know what fills the context and what it costs, you can decide when to let Claude work without you watching. That is an agent.",
  },
  "d-voice": {
    id: "d-voice", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Voice</Title>
        <div className="mt-8 text-[48px] text-neutral-400">Handing over a task from my phone</div>
      </Slide>
    ),
    notes: "An agent is only useful if you can reach it. Voice and a chat message are how I reach mine.",
  },

  vision: {
    id: "vision", steps: 4, time: "1:30",
    render: (s) => (
      <Slide>
        <Swap k={s}>
          {s === 0 && <Title size={100}>I use Claude Code and AI agents every working day.</Title>}
          {s === 1 && <Title size={92}>This talk shows how I set them up, and why each part matters.</Title>}
          {s === 2 && <Title size={92}>I also built a small software factory: a task goes in from my phone, and a pull request comes out.</Title>}
          {s === 3 && <Title size={92}>It is made of the same parts. To stay in control, you need to know them.</Title>}
        </Swap>
      </Slide>
    ),
    notes: "Good morning, everyone. I'm Yaroslav. Quick question: who asked an AI to write code this week? Keep your hand up if you let it run without watching. That is where this talk starts. I use Claude Code and AI agents every working day, and I will show how I set them up and why each part matters: what Claude remembers, how I steer it, which skills it follows, what it holds in context, and which tools it can touch. I also built a small software factory. A task goes in from my phone, and a pull request comes out. You will see it at the end. A factory like that is made of the same parts you use by hand. If a skill is vague, every agent runs a vague skill. So the more you automate, the more these details matter. If you want control, this is where you get it, not from a bigger model.",
  },
};

const order = [
  "hero", "vision",
  "d-tips", "tip-skills-cost", "tip-pipe", "tip-audit", "tip-hook",
  "d-memory", "memory", "mem-lines", "mem-pitfalls",
  "d-commands", "modes", "style", "commands",
  "d-skills", "sk-write", "sk-desc", "sk-run", "sk-issues", "sk-evals",
  "d-context", "context", "cost", "smart-zone",
  "d-agents", "agent-decision", "live-agent", "bad-tool", "agent-skill", "agent-fail",
  "d-voice", "voice", "bot-flow", "bot-code", "guardrails",
  "close", "links",
];

const all: Record<string, SlideDef> = { ...Object.fromEntries(baseSlides.map((x) => [x.id, x])), ...extraSlides, ...extraSlides2, ...extraSlides3, ...extraSlides4, ...extraSlides5 };

export const slides: SlideDef[] = order.map((id) => {
  const sl = all[id];
  if (!sl) throw new Error(`Missing slide ${id}`);
  return sl;
});
