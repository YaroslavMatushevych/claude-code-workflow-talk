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
    steps: 2,
    time: "0:45",
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
        <H>{["Claude reads two kinds of memory at session start", "Auto-memory: the notes Claude keeps about me", "Only the first 200 lines of that index load"][s]}</H>
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
          {s === 2 && <Big>200 lines</Big>}
        </Swap>
      </Slide>
    ),
    notes: "Claude reads two kinds of memory at the start of every session. CLAUDE.md, which I write, and auto-memory, which Claude writes. I will not explain CLAUDE.md, you know it. Auto-memory lives in a folder per project: an index file and one file per fact. This is the index from my setup, 22 files. Each line points to a topic file. Only the first 200 lines or 25 kilobytes of the index load at the start, and topic files load on demand. Memory is context, not enforcement. If something must happen every time, use a hook.",
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
    time: "0:50",
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
    notes: "Now the agent. About 45 lines. I recorded this run beforehand, and the code is on screen in four steps. First, the tool: a name, a description and a schema. That is all Claude ever sees of my code. Second, the function that runs the tool. Third, the loop. Call the model and add its answer to the messages. If it did not ask for a tool, we are done. Fourth, if it asked, run the tool and send back a tool result, as a user message, with the matching id. There is a hard cap of ten turns. I have not run this exact file yet, so I record the output before the talk.",
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
    id: "judgement",
    steps: 3,
    time: "0:45",
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
    time: "0:40",
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
    notes: "This is the idea of the talk. An agent is a role with limited tools. A skill is the procedure it follows. I could run a planner, a worker and a reviewer, each with its own skills. Here I show one, the worker. Its file says: use Sonnet, run in its own worktree, limit to 30 turns, and preload the ticket-to-pr skill. The docs say the skills field injects the full skill into the agent's context at startup. The skill itself is short: tests first, smallest change, draft PR only, stop if tests fail twice. One thing to test: I removed disable-model-invocation from this skill, because a skill with that flag cannot be preloaded into an agent.",
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
    notes: "Here is how the voice part works. I dictate a message with my phone keyboard into a Telegram chat with my own bot. A small script on my laptop receives it and starts a headless Claude Code run in my repo. Claude hands the task to the worker agent, which follows my skill, and I get a draft pull request and a reply in the chat. The laptop must be on, with the script running. If you ever build a software factory, this is its smallest version. Check if your organisation allows this on a work login. Mine blocks Remote Control, for example.",
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
    notes: "The whole bot is about 50 lines, and it is not a framework. Block one: the token, the one chat ID allowed to send work, the repo directory, a startup check, and a small helper for the Telegram API. Block two: the run function. It starts claude with dash p, JSON output, a one-dollar budget cap per message, and a short list of allowed tools. Set dry run to 1 and it prints the command instead of running it. Block three: the loop. Poll Telegram, ignore every chat except mine, run the task, and send back the reply. I have not run this end to end yet, so test it with dry run first. The allow list is the only access control, so keep the token secret.",
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
        <H>{["CLAUDE.md: write lines Claude can check", "CLAUDE.md: say what to use instead", "CLAUDE.md: leave to a linter what a linter can check"][s]}</H>
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
    notes: "A rule of thumb I use: on current models, quality starts to drop somewhere around 125 to 150 thousand tokens. The exact number is debated, so check your own sessions with slash context. Look at my own usage for the last week: 74 percent of it was above 150 thousand, and a third came from sessions open for more than eight hours. That is my bad habit. One task per session, and when a task is bigger, split it and hand off with a short summary file.",
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
    notes: "Five rules for writing a skill. One: the description decides when the skill runs, so say when to use it and when not to. Two: write short instructions. Use the payments API if you work on checkout beats a paragraph on why. Three: if the steps never change, write a script and tell Claude to run it. Skills are for judgement. Four: delete lines that change nothing, like be thorough. AI-written skills are full of them. Five: keep the body under 500 lines and move variants into reference files. I write my skills by hand. A talk at AI Engineer 2026 by Philipp Schmid argues that AI-generated skills can make results worse, which matches what I see.",
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
    notes: "How I test a skill, in four steps. One: write ten test prompts. Each has a prompt, a flag for whether the skill should run, and a check. Five should run the skill and five should not. Real prompts from your own sessions beat invented ones. Two: run each prompt three to six times, in a clean folder each time, because results vary and an agent can cheat by reading earlier chats. Three: check the results with simple pattern checks first. They are cheap, so you can run them often. Add a judge with a rubric only for complex results. Four: run the same prompts without the skill. If the result is the same, remove the skill. That saves tokens and upkeep. Keep the prompts, so you notice if results get worse. The source is a talk by Philipp Schmid at AI Engineer 2026, linked in the notes repo.",
  },
};


const extraSlides5: Record<string, SlideDef> = {
  "d-tips": {
    id: "d-tips", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Tips</Title>
        <div className="mt-8 text-[48px] text-neutral-400">Habits that keep Claude reliable</div>
      </Slide>
    ),
    notes: "First, the habits. They cost nothing to start, and everything later builds on them.",
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
          {s === 2 && <Title size={92}>Some teams aim higher: agents that turn a task into a pull request.</Title>}
          {s === 3 && <Title size={92}>Those agents are built from the same parts. To stay in control, you need to know them.</Title>}
        </Swap>
      </Slide>
    ),
    notes: "Good morning, everyone. I'm Yaroslav. Quick question: who here asked an AI to write code this week? Keep your hand up if you let it run without watching. That is where this talk starts. I use Claude Code and AI agents every working day, and I will show you how I set them up and why each part matters: what Claude remembers, how I steer it, which skills it follows, what it holds in context, and which tools it can touch. Some teams aim higher. They want a task to go in and a pull request to come out, with agents doing the planning, writing, testing and review. People call that a software factory. I will not talk about factories much. I mention them because a factory is built from the same parts you use by hand. If a skill is vague, ten agents run a vague skill. If memory is stale, every agent starts from stale notes. So the more you automate, the more these details matter. If you want control, this is where you get it, not from a bigger model. At the end I show one small agent that I start by voice from my phone.",
  },
};

const order = [
  "hero", "vision",
  "d-tips", "tip-verify", "tip-pitfalls",
  "d-memory", "memory", "mem-lines", "mem-pitfalls",
  "d-commands", "modes", "style", "commands",
  "d-skills", "which", "sk-write", "sk-desc", "sk-issues", "sk-evals",
  "d-context", "context", "cost", "smart-zone",
  "d-agents", "agent-decision", "live-agent", "bad-tool", "agent-skill", "agent-fail",
  "d-voice", "voice", "bot-flow", "bot-code", "bot-setup", "guardrails",
  "judgement", "close", "links",
];

const all: Record<string, SlideDef> = { ...Object.fromEntries(baseSlides.map((x) => [x.id, x])), ...extraSlides, ...extraSlides2, ...extraSlides3, ...extraSlides4, ...extraSlides5 };

export const slides: SlideDef[] = order.map((id) => {
  const sl = all[id];
  if (!sl) throw new Error(`Missing slide ${id}`);
  return sl;
});
