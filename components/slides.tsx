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
    time: "0:30",
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
    id: "map",
    steps: 7,
    time: "0:45",
    render: (s) => (
      <Slide>
        <H>The parts I set up, and what each one controls</H>
        <Rows
          size={40}
          active={s}
          rows={[
            "Tips: the habits that keep it reliable",
            "Memory: what the agent knows",
            "Commands and modes: how I steer it",
            "Skills: how it does the work",
            "Context: what it can hold, and what that costs",
            "Agents: who does the work",
            "Voice: how I hand over a task",
          ]}
        />
      </Slide>
    ),
    notes:
      "Here are the parts, and what each one controls. Habits that keep the agent reliable. Memory, which is what it knows. Commands and modes, which is how I steer it. Skills, which is how it does the work. Context, which is what it can hold and what that costs. Agents, who does the work. And voice, how I hand a task over. We go in this order, and at the end it all comes together in one small agent.",
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
    notes:
      "Last topic, and the one that ties it together: voice. Slash voice turns on built-in dictation. Tap mode: tap to record, tap to send. The docs say it is tuned for coding vocabulary, things like regex, OAuth and JSON, and it uses the project name and git branch as hints. It needs a claude.ai login and a local microphone, so no SSH, and it uses no tokens. Hold mode has a warm-up delay, so I bind it to a modifier key in keybindings.json. Third block is the settings file. I could not find a first-person account of dictation errors on code terms, only vendor claims, so say which of those you saw yourself. I speak long prompts with real context. Typing makes me write short ones.",
  },
  {
    id: "modes",
    steps: 4,
    time: "0:45",
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
    steps: 2,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Setup">
        <H>Make answers shorter with an output style</H>
        <Swap k={s}>
          {s === 0 && <Mono size={80}>/output-style concise</Mono>}
          {s === 1 && <Code text={terse} size={28} />}
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
    notes:
      "Seven commands people skip. Slash btw asks a side question while Claude is working. No tools, and it never enters the history, so it costs no context. Rewind, or Escape twice, takes you back to before the mistake. That beats arguing with it, because the wrong turn leaves your context. Fork tries another direction and keeps the original. Goal sets a condition, like all tests pass and lint is clean, and Claude keeps going until it is true. Batch plans a large change, then fans it out to parallel agents in separate worktrees. Code review with fix reviews the diff and applies the findings. Insights builds an HTML report about your own sessions. I run that when I want to see how I really work.",
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
    time: "1:15",
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
    notes:
      "Same one-word prompt, three models, run just now. I asked each one to reply with ok. Every call still wrote around 25 thousand tokens into the cache, because that is the system prompt, tools and skills, before my prompt. Haiku cost five cents. Sonnet eleven. Opus twenty-two. Same question. Then I ran Sonnet a second time within the hour. Part of that prefix was read from cache this time, and the cost dropped from 11 cents to 6. That is prompt caching in a real run. Not everything hit the cache on the second call. About 15 thousand tokens were written again, and I did not dig into why. The lesson holds anyway: your prefix is paid for on every session, and the cache makes the second call cheaper.",
  },
  {
    id: "usage",
    steps: 2,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Context">
        <H>{s === 0 ? "My last 24 hours" : "My last 7 days"}</H>
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
      <Slide chapter="Memory">
        <H>{s === 0 ? "My auto-memory index" : "Only the first 200 lines of the index load at session start"}</H>
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
    id: "which",
    steps: 5,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Skills">
        <H>Where does an instruction belong?</H>
        <Rows
          size={46}
          active={s}
          rows={[
            <span key="a">A rule that always applies: {mono("CLAUDE.md")}</span>,
            <span key="b">A procedure I need sometimes: {mono("skill")}</span>,
            <span key="c">Something that must happen every time: {mono("hook")}</span>,
            <span key="d">A noisy side task: {mono("subagent")}</span>,
            <span key="e">Access to another system: {mono("MCP")}</span>,
          ]}
        />
      </Slide>
    ),
    notes:
      "Where does an instruction go? Rules that always apply, under 200 lines, go in CLAUDE.md. A procedure I need sometimes is a skill. My rule: the third time I paste the same playbook, it becomes a skill. Something that must happen every time, like formatting after an edit, is a hook, because CLAUDE.md is a request and a hook is enforced. A side task that floods the context, like reading logs, goes to a subagent that returns a summary. Access to another system is an MCP server, and a skill can teach Claude how to use it.",
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
    time: "3:00",
    render: (s) => (
      <Slide chapter="Agents">
        <H>{["A tool: a name, a description, and inputs", "A function that runs the tool", "A loop: ask Claude, run the tool it picks", "Send the tool result back to Claude"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={agentTools} size={24} />}
          {s === 1 && <Code text={agentRun} size={32} />}
          {s === 2 && <Code text={agentLoop} size={28} />}
          {s === 3 && <Code text={agentResults} size={32} />}
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
    notes:
      "Now I break it. This is the bad description: gets the stock price for a ticker, and a parameter with no type guidance. Claude chooses a tool only from this text. Next is the version from Anthropic's docs: what it does, which tickers, what it returns, when to use it, and what it will not do. The docs call the description by far the most important factor. Last, the two questions. The first one says Apple, not a ticker. The second needs history the tool does not have. With the bad description it may pass Apple instead of AAPL, call the tool anyway, or retry. I do not know which it picks on the day, and that is the point. Record a few runs ahead of time, and show what Claude sent each time.",
  },
  {
    id: "guardrails",
    steps: 5,
    time: "0:30",
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
    id: "judgement",
    steps: 3,
    time: "0:30",
    render: (s) => (
      <Slide chapter="Judgement">
        <H>What I still do myself</H>
        <Rows size={72} active={s} rows={["I read every diff", "I check the tests Claude wrote", "I decide what to merge"]} />
      </Slide>
    ),
    notes:
      "Even with many agents, someone has to read what comes out. The part no agent does for me: I read every diff. Agents produce plausible code that misses edge cases. I check the tests it wrote, because agents sometimes weaken the assertion to make a test pass. And I press merge. Verification is the best lever I know: give Claude a way to check its own work, like tests, a build or a screenshot, and ask for evidence and not a claim. Claude Code's team says the same, and in my experience it makes the biggest difference.",
  },
  {
    id: "close",
    steps: 4,
    time: "0:30",
    render: (s) => (
      <Slide>
        <Swap k={s}>
          {s < 3 && (
            <>
              <H>Three things to try tomorrow</H>
              <div className="text-[64px] font-bold leading-tight max-w-[1500px]">
                {["Run /context and see what loads before you type", "Switch to /output-style concise", "Write one skill for something you paste every week"][s]}
              </div>
            </>
          )}
          {s === 3 && <Title size={112}>Thank you</Title>}
        </Swap>
      </Slide>
    ),
    notes:
      "Three things to try tomorrow. Run slash context and see what loads before you type. Switch to concise and see how much shorter the answers get. And write one skill for something you paste every week, with a description that says when not to use it. If you ever build something bigger, these small parts are what you control it with. Thank you. The files, the skills and the bot are in four repos on my GitHub, and the links are on the last slide. Questions.",
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
    notes: "This is the idea of the talk. An agent is a role with limited tools. A skill is the procedure it follows. I could run a planner, a worker and a reviewer, each with its own skills. For the talk I show one, the worker. The agent file says: use Sonnet, run in its own git worktree, limit to 30 turns, and preload the ticket-to-pr skill. The docs say the skills field injects the full skill content into the subagent's context at startup, so the agent does not have to find it. The second block is the skill: tests first, smallest change, draft PR only, stop if tests fail twice. Thin skill, checkable steps. One thing to test before the talk: I removed disable-model-invocation from this skill, because I am not sure a preloaded skill can have it. Check on your version.",
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
            "I dictate a message on my phone",
            "It arrives in a Telegram chat with my bot",
            "The bot on my laptop receives it",
            <span key="d">The bot runs {mono("claude -p")} in my repo</span>,
            "The worker agent follows my skill",
            "I get a draft pull request and a reply",
          ]}
        />
      </Slide>
    ),
    notes: "Here is how the voice part works, and it is simple. I dictate a message on my phone, with the dictation button on the keyboard, into a Telegram chat with my own bot. A small script on my laptop receives it and starts a headless Claude Code run in my repo. Claude hands the task to the worker agent, which follows the skill, and I get a draft pull request and a reply in the chat. The laptop must be on, with the script running. I chose a bot and claude dash p over a live session because it needs no session open, and a new run starts for each message. If you ever build a software factory, this is its smallest version: a task goes in from my phone, and a pull request comes out. On your side: check if your organisation allows this on a work login. Mine blocks Remote Control, for example.",
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
    notes: "The whole bot is about 50 lines, and it is not a framework. Block one: the token, the one chat ID that is allowed to send work, the repo directory, a startup check, and a small helper for the Telegram API. Block two: the run function. It starts claude with dash p, JSON output, a one-dollar budget cap per message, and a short list of allowed tools. An append-system-prompt line tells it to work on a branch and open a draft PR. Set dry run to 1 and it prints the command instead of running it, so you can test the Telegram part without any cost. Block three: the loop. Poll Telegram, ignore every chat except mine, run the task, send back the reply. I have not run this script end to end, so run it once before the talk. The allow list is the only access control, so keep the token secret.",
  },
  "bot-setup": {
    id: "bot-setup", steps: 4, time: "0:45",
    render: (s) => (
      <Slide chapter="Voice">
        <H>Set it up in four steps</H>
        <Rows
          size={44}
          active={s}
          rows={[
            <span key="a">In Telegram, message {mono("@BotFather")}, run {mono("/newbot")}, copy the token</span>,
            "Send your bot a message and read your chat ID",
            <span key="c">Run {mono("node bot.mjs")}</span>,
            <span key="d">Check that {mono("gh")} is logged in to the right account</span>,
          ]}
        />
      </Slide>
    ),
    notes: "Setup is four steps. One: message BotFather in Telegram, run newbot, copy the token. Two: send your bot a message, open the getUpdates URL in a browser, and read your chat ID. Three: run the script with the token, the chat ID and the repo path in environment variables. Four: check that the GitHub CLI is logged in as the account that owns the repo. Everything is on your laptop. If you do not want the laptop on all the time, the same script can run on a small server, with the repo checked out there.",
  },
};


const extraSlides3: Record<string, SlideDef> = {
  "tip-verify": {
    id: "tip-verify", steps: 2, time: "0:45",
    render: (s) => (
      <Slide chapter="Tips">
        <H>Give Claude a way to check its own work</H>
        <Swap k={s}>
          {s === 0 && (<><Mono size={58}>/goal all tests in test/auth pass</Mono><Mono size={58}>and the lint step is clean</Mono></>)}
          {s === 1 && <div className="text-[60px] font-bold leading-tight">A Stop hook stops Claude from finishing until the check passes.</div>}
        </Swap>
      </Slide>
    ),
    notes: "First tip: give Claude a way to check its own work. The goal command does it. You state a condition, like all tests in this folder pass and lint is clean, and Claude keeps working until it is true. For a hard guarantee, use a Stop hook: it blocks the turn from ending until your check passes. A hook is code, so it enforces. CLAUDE.md only asks. I ask for evidence in every prompt: run the tests and show me the output.",
  },
  "tip-grill": {
    id: "tip-grill", time: "0:30",
    render: () => (
      <Slide chapter="Tips">
        <H>Ask Claude to question you before it opens a PR</H>
        <Mono size={48}>Grill me on these changes.</Mono>
        <Mono size={48}>Do not open a PR until I pass.</Mono>
      </Slide>
    ),
    notes: "I use a prompt like: grill me on these changes, and do not open a PR until I pass. Claude asks the questions I skipped. It finds the gaps in my own thinking before it writes code, and that is cheaper than finding them in review.",
  },
  "tip-worktree": {
    id: "tip-worktree", steps: 2, time: "0:30",
    render: (s) => (
      <Slide chapter="Tips">
        <H>{s === 0 ? "Run parallel sessions in separate worktrees" : "Give an agent its own worktree"}</H>
        <Swap k={s}>
          {s === 0 && <Term size={42} lines={[L("$ claude --worktree feature-auth", "p"), L("$ claude -w fix-postcode --tmux", "p")]} />}
          {s === 1 && <Code text={"---\nname: worker\nisolation: worktree\n---"} size={44} />}
        </Swap>
      </Slide>
    ),
    notes: "Parallel sessions without collisions. Dash dash worktree gives each session its own checkout. Add tmux for a separate pane. Agents get the same with isolation worktree in their file, as in the second block. More parallel agents means more to review, and I come back to that in the agents part.",
  },
  "tip-pitfalls": {
    id: "tip-pitfalls", steps: 5, time: "0:45",
    render: (s) => (
      <Slide chapter="Tips">
        <H>Five mistakes, and what I do instead</H>
        <Rows
          size={40}
          active={s}
          rows={[
            <Two key="a" main="Many tasks in one session" fix="Start fresh with /clear" />,
            <Two key="b" main="Correcting Claude again and again" fix="After two tries, /clear and write a better prompt" />,
            <Two key="c" main="Telling a reviewer to find problems" fix="It always finds some. Ask only for real bugs." />,
            <Two key="d" main="Code that looks right" fix="Ask for the test output as proof" />,
            <Two key="e" main="Skipping permission prompts on a real machine" fix="Use a container or the sandbox" />,
          ]}
        />
      </Slide>
    ),
    notes: "Five mistakes I see most. Unrelated tasks in one session: clear between them. Correcting over and over: after two misses, clear and rewrite the prompt. A reviewer told to find gaps always finds some, and you end up adding abstractions you did not need, so tell it to flag only correctness problems. Plausible code that misses edge cases: ask for tests or a screenshot as evidence. And skip permissions only inside a container or the sandbox.",
  },
  "mem-lines": {
    id: "mem-lines", steps: 3, time: "0:45",
    render: (s) => (
      <Slide chapter="Memory">
        <H>{["Write lines Claude can check", "Say what to use instead", "Use a linter for what a linter can check"][s]}</H>
        <Swap k={s}>
          {s === 0 && (
            <Term size={40} lines={[L("✗ Write clean code", "d"), L(""), L("✓ Use named exports", "h"), L("✓ Run `pnpm test <file>` before saying done", "h")]} />
          )}
          {s === 1 && (
            <Term size={40} lines={[
              L("✗ Never use moment.js.", "d"),
              L(""),
              L("✓ Use date-fns. Helpers are in docs/dates.md.", "h"),
            ]} />
          )}
          {s === 2 && <div className="text-[64px] font-bold leading-tight">A prompt line only asks. A linter enforces.</div>}
        </Swap>
      </Slide>
    ),
    notes: "How I write a line in CLAUDE.md. Vague lines do nothing: write clean code means nothing to the model. A line it can check does work: use named exports, run this test command before you say done. Second: a rule that only says never do X leaves Claude stuck, so give the alternative, or point to a doc and say when to read it. Do not embed the doc with an at-sign, because imports load at launch and cost context. Third: if a linter or a test can check a rule, use the linter. A prompt line only asks.",
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
    notes: "Five memory pitfalls. One: the more lines you add, the less reliably Claude follows any of them. Keep CLAUDE.md under 200 lines, and shorter is better. Two: after compact, the project-root CLAUDE.md is re-read from disk, but instructions you gave only in chat are lost, so put them in the file. Three: auto-memory grows without criteria and old decisions go stale, so prune it. Four: a script that rewrites the memory file can change what Claude does in the next session, so treat memory as untrusted input and keep it visible in git or in review. Five: if a rule is ignored, it was only a request. If it must happen, use a hook.",
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
    notes: "A rule of thumb I use: on current models, quality starts to drop somewhere around 125 to 150 thousand tokens of context. The exact number is debated and depends on the task, so check your own sessions with slash context. It does not follow the size of the context window. One task per session. When a task is bigger than that, split it and hand off with a short summary file. Compare it with my own usage from the last slides: 74 percent of my usage was above 150 thousand.",
  },
};


const extraSlides4: Record<string, SlideDef> = {
  "sk-write": {
    id: "sk-write", steps: 5, time: "1:00",
    render: (s) => (
      <Slide chapter="Skills">
        <H>How to write a skill</H>
        <Rows
          size={40}
          active={s}
          rows={[
            "In the description, say when to use the skill and when not to",
            "Write short instructions, not explanations",
            "If the steps never change, use a script instead",
            "Delete lines that change nothing, like \"be thorough\"",
            "Keep it under 500 lines and move details to other files",
          ]}
        />
      </Slide>
    ),
    notes: "Five rules for writing a skill. One: the description decides when the skill runs, so say when to use it and when not to. Two: write directives. Use the payments API if you work on checkout is better than a paragraph on why the payments API is recommended. Three: if the steps are always the same, do not write a skill. Write a script and tell the model to run it. Skills are for judgement. Four: delete lines that change nothing. Be thorough and write clear code do not change behaviour, and AI-written skills are full of them. Five: keep the body under 500 lines and move variants into reference files that load only when needed. I write my skills by hand. A talk at AI Engineer 2026 by Philipp Schmid argues that AI-generated skills can make results worse, and that matches what I see. The talk is linked in the notes repo.",
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
    notes: "The description is the part that matters most. It sits in context on every request, and it is the only thing Claude reads to decide if the skill applies. The first one tells it nothing, so the skill triggers too often or never. The second says what it does, when to use it with words I would really say, and when not to. The not-to line stops it from firing on a request to write code. Write it in the third person. Keep it short, because you pay for it on every call. If the description summarises the steps of the skill, Claude can follow the description and skip the body, so describe the trigger and leave the steps in the body.",
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
    notes: "Five ways a skill goes wrong. It does not trigger: the user prompt is too short for Claude to see that the skill applies. In the AI Engineer talk, half the failures the speaker's team saw were wrong triggering. It triggers too often, because the description is broad, like use for web development. It works on one model or tool and not another, so test on the ones you use. It gets worse after a model update, because the world changed under it. And the AI-written skill that nobody tested: someone skims it, accepts it, and ships it. A failure is hard to diagnose, because agents are non-deterministic. The skill may be bad, the discovery may have failed, or the task may be too hard. That is why you need evals.",
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
    notes: "How I test a skill, in four steps. One: write ten cases. A case is a realistic prompt, a flag for whether the skill should trigger, and a check. Five should trigger, and five should not. Even ten beat nothing, and real prompts from your own sessions beat invented ones. Two: run each case three to six times, because runs vary, and use a clean folder each time, because an agent can cheat by reading earlier chats. Three: check the result with a plain regex first. Did it use the right API, the right model name? That is cheap and you can run it often. For complex skills add a judge with a rubric. Four: run the same cases without the skill. If the model gets the same result without it, remove the skill. That saves tokens and upkeep. Skills that teach the model something it cannot do yet are temporary. Skills for your team's own rules last. Keep the cases after you remove a skill, so you notice if the result gets worse. A change to a skill is only worth merging if the cases improve. The source is the AI Engineer 2026 talk by Philipp Schmid, linked in the notes repo.",
  },
};


const extraSlides5: Record<string, SlideDef> = {
  vision: {
    id: "vision", steps: 4, time: "1:30",
    render: (s) => (
      <Slide>
        <Swap k={s}>
          {s === 0 && <Title size={100}>I use Claude Code and AI agents every working day.</Title>}
          {s === 1 && <Title size={92}>This talk shows how I set them up, and why each part matters.</Title>}
          {s === 2 && <Title size={92}>Some teams aim higher: agents that turn a task into a pull request.</Title>}
          {s === 3 && <Title size={92}>Those agents are built from the same parts. To stay in control, you need to know them.</Title>}
        </Swap>
      </Slide>
    ),
    notes: "Good morning, everyone. I'm Yaroslav. Quick question first: who here asked an AI to write code this week? Keep your hand up if you let it run without watching. That second hand is where this talk starts. I use Claude Code and AI agents every working day, and this talk shows how I set them up and why each part matters: what the agent remembers, how I steer it, which skills it follows, what it holds in context, and which tools it can touch. Some teams aim higher. They want a task to go in and a pull request to come out, with agents doing the planning, writing, testing and review in between. People call that a software factory. I will not talk about factories much. I mention them because a factory is built from the same parts you use by hand. If a skill is vague, ten agents run a vague skill. If memory is stale, every agent starts from the same stale notes. If a tool description is bad, every agent picks the wrong tool. So the more you automate, the more these small details matter, and if you want control over cost, quality and what gets merged, this is where you get it. It does not come from a bigger model. It comes from how you set the agent up. At the end I show one small agent, a worker that follows a skill, which I start by voice from a chat message on my phone. Everything before it is the setup that makes it work.",
  },
};

const order = [
  "hero", "vision", "map",
  "tip-verify", "tip-grill", "tip-worktree", "tip-pitfalls",
  "memory", "mem-lines", "mem-pitfalls",
  "modes", "style", "commands",
  "which", "sk-write", "sk-desc", "sk-issues", "sk-evals",
  "context", "cost", "usage", "smart-zone",
  "agent-decision", "agent-fail", "live-agent", "bad-tool", "agent-skill",
  "voice", "bot-flow", "bot-code", "bot-setup", "guardrails",
  "judgement", "close", "links",
];

const all: Record<string, SlideDef> = { ...Object.fromEntries(baseSlides.map((x) => [x.id, x])), ...extraSlides, ...extraSlides2, ...extraSlides3, ...extraSlides4, ...extraSlides5 };

export const slides: SlideDef[] = order.map((id) => {
  const sl = all[id];
  if (!sl) throw new Error(`Missing slide ${id}`);
  return sl;
});
