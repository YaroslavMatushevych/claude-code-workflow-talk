"use client";
import { ReactNode } from "react";
import { Big, Cap, Code, Mono, Rows, Slide, Swap, Term, Title, type Line } from "./ui";

const styleQ = "Why does my React component's useEffect run twice in development?";
const styleDefault = ["# Why `useEffect` runs twice in development", "", "Your component is probably inside `<React.StrictMode>`. In", "development, StrictMode mounts each component, unmounts it, and", "mounts it again. This is on purpose. It does not occur in", "production builds.", "", "## Why React does this", "", "React wants to find bugs in effects that do not clean up", "correctly. The extra cycle simulates what happens when a …"];
const styleConcise = ["React 18+ Strict Mode causes this. In development only, React", "mounts each component, unmounts it, and mounts it again. This", "checks that your effects clean up correctly. Production builds run", "the effect once.", "", "**To fix it:** add a cleanup function to the effect that reverses", "what the effect did."];
const styleTerse = ["React Strict Mode causes this. In development, React mounts each", "component, unmounts it, and mounts it again. This checks that your", "effects clean up correctly. It does not happen in production", "builds.", "", "**What to do:**", "- Do not remove `<StrictMode>`. It finds real bugs.", "- Add a cleanup function to each effect that sets something up."];
export type SlideDef = {
  id: string;
  steps?: number;
  time?: string;
  render: (step: number) => ReactNode;
  notes: string;
};

const L = (t: string, c: Line["c"] = "o"): Line => ({ t, c });
// Interactive session look: red prompt line, then the answer with a leading bullet.
const ask = (q: string, out: string[]): Line[] => [L(`> ${q}`, "q"), L(""), ...out.map((x, i) => L(i === 0 ? `● ${x}` : x ? `  ${x}` : "", "a"))];

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
          {s === 0 && <Mono size={96}>/voice tap</Mono>}
          {s === 1 && <Code text={keybindings} size={30} />}
          {s === 2 && <Code text={voiceSettings} size={30} />}
        </Swap>
      </Slide>
    ),
    notes: "Last topic. Slash voice turns on built-in dictation. Tap mode: tap to record, tap to send. The docs say it is tuned for coding words like regex, OAuth and JSON. It needs a claude.ai login and a local microphone, so it does not work over SSH, and it uses no tokens. Hold mode has a warm-up delay, so I bind it to a modifier key. The third block is the settings file. For my phone I use the keyboard's dictation button instead, because slash voice needs a local microphone. I speak long prompts with real context. Typing makes me write short ones.",
  },
  {
    id: "modes",
    steps: 5,
    time: "0:40",
    render: (s) => (
      <Slide chapter="Setup">
        <H>{s < 4 ? "Shift+Tab switches the permission mode" : "Least privilege: my code-reviewer agent can only read"}</H>
        {s < 4 ? (
          <Rows
            size={48}
            active={Math.min(s, 3)}
            rows={[
              <span key="a">{mono("default")} asks before it edits files</span>,
              <span key="b">{mono("acceptEdits")} edits files without asking</span>,
              <span key="c">{mono("plan")} only reads, until I approve the plan</span>,
              <span key="d">{mono("auto")} a second model reviews each action</span>,
            ]}
          />
        ) : (
          <Code text={codeReviewerAgent} size={30} />
        )}
      </Slide>
    ),
    notes:
      "Shift plus Tab cycles permission modes. Default asks before anything beyond reading. Accept edits lets it edit files. Plan mode is read-only until I approve a plan, and I use it for anything that touches several files. Auto mode runs actions with a classifier model reviewing each one, and in the current version it is the starting mode in the terminal. Switching mode keeps the prompt cache, so it costs nothing. One real example from my setup: my code-reviewer agent only gets Read, Grep and Glob, so it cannot edit anything. That tool allowlist is the real guard, not a permission mode. I run it on Sonnet, not Haiku: a cheap model is fine for search and summaries, but review is judgment, and a missed bug costs more than a few cents. There is also bypass permissions behind a launch flag. I only use that in a container.",
  },
  {
    id: "style",
    steps: 6,
    time: "0:50",
    render: (s) => (
      <Slide chapter="Commands">
        <H>{[
          "Make answers shorter with an output style",
          "Default: 420 words, 1,020 output tokens",
          "Concise: 179 words, 576 output tokens",
          "My own Terse style: 158 words, 476 output tokens",
          "Output styles do not reach subagents",
          "What I use for which job",
        ][s]}</H>
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={28}
              lines={[
                L("/output-style concise", "p"),
                L(""),
                L("style        use it when", "d"),
                L(""),
                L("Default      standard coding behaviour"),
                L("Concise      answers are longer than you want", "h"),
                L("Explanatory  you are learning a codebase"),
                L("Learning     you want to write some of the code"),
                L("Proactive    routine decisions: stop asking, keep going"),
              ]}
            />
          )}
          {s === 1 && <Term size={28} lines={ask(styleQ, styleDefault)} />}
          {s === 2 && <Term size={28} lines={ask(styleQ, styleConcise)} />}
          {s === 3 && <Term size={28} lines={ask(styleQ, styleTerse)} />}
          {s === 4 && (
            <Term
              size={28}
              lines={[
                L("output style applies to", "d"),
                L("  the main conversation, and forks of it"),
                L(""),
                L("it does not apply to", "d"),
                L("  other subagents: they run their own system prompt", "h"),
                L(""),
                L("so every agent file carries its own cap:", "d"),
                L("  researcher     Return at most 20 lines.", "p"),
                L("  planner        Write a plan of at most 10 lines.", "p"),
                L("  sentry-triage  Return at most 15 lines.", "p"),
                L("  code-reviewer  Return a short summary, not raw file contents.", "p"),
              ]}
            />
          )}
          {s === 5 && (
            <Term
              size={26}
              lines={[
                L("job                        use                model", "d"),
                L(""),
                L("daily questions           Terse style"),
                L("a new codebase            Explanatory style"),
                L("find the code             researcher         haiku"),
                L("plan a multi-file change  planner            haiku"),
                L("write the failing test    tester             sonnet"),
                L("implement it              implementer        sonnet", "h"),
                L("review the diff           code-reviewer      haiku"),
                L("a production error        sentry-triage      sonnet"),
                L("a task from my phone      worker             sonnet"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "Concise is a built-in output style, from version 2.1.237. It puts the answer first and drops preamble and recap. There are five built-in styles including the default. Concise for when answers are longer than you want. Explanatory adds short insight blocks explaining why, good when you are learning a codebase. Learning does the same and also leaves small pieces of code for you to write. Proactive starts work and makes reasonable assumptions instead of asking about routine decisions. And default is the standard behaviour. Here is the same question three times, from real runs on my machine, one run each. The default answer is 420 words. Concise is 179, and my own Terse style is 158. Output tokens drop from 1,020 to 476. Runs vary, so one run is not a benchmark, but the difference is large and it is what I see every day. Select a style with slash output-style. The command saves it in the local project settings. To make it your default everywhere, set output style in your user settings, and the name is case sensitive. A custom style is a markdown file in the output-styles folder. Keep coding instructions true, or you lose the built-in coding behaviour. One limit matters for agents. A style applies to the main conversation and to forks. Other subagents run their own system prompt, so the style does not change how they answer. So every agent file carries its own cap: researcher returns at most 20 lines, planner at most 10, sentry-triage at most 15, code-reviewer a short summary. Last, what I use for which job. Concise for daily questions, Explanatory when I open a codebase I do not know. Then one agent per step of a task. Cheap haiku agents find the code and plan, because that is reading and summarising. Sonnet agents write the test, implement, review and triage, because those are judgment, and a missed bug costs more than a few cents.",
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
    time: "0:45",
    render: () => (
      <Slide chapter="Context">
        <H>What is in the context before I type</H>
        <Term
          size={28}
          lines={[
            L('$ claude -p "/context"', "p"),
            L("Model: claude-sonnet-5-5"),
            L("Tokens: 13.7k / 1m (1%)"),
            L(""),
            L("System prompt            2.1k"),
            L("System tools              427   loaded now"),
            L("System tools (deferred)  13.1k  not loaded: names only", "d"),
            L("Skills                    9.8k"),
            L("Messages                  1.3k"),
            L("Autocompact buffer         33k"),
          ]}
        />
      </Slide>
    ),
    notes:
      "Real output from my machine, from a fresh session where I typed one command. Before I write a word, 13.7 thousand tokens are in use. The one to watch is skills: 9.8 thousand tokens, and that is only the one-line descriptions of every skill I have installed. I cover skills later in the talk. The full skill bodies load only when a skill runs. There are two lines for system tools. The 427 tokens are tools that load at the start. The 13.1 thousand tokens are deferred tools. Only their names are in the context. Claude loads the full schema when it needs the tool. That is why the total is 13.7 thousand and not 27 thousand: the deferred line is not in the total. Run slash context at the start of a session and again after you install a plugin. You will find things you forgot you had.",
  },
  {
    id: "cost",
    steps: 5,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Context">
        <H>{["The same prompt on three models", "A second run on Sonnet costs less", "Cache lifetime: 5 minutes or 1 hour", "Which one you get by default", "Which one to pick"][s]}</H>
        <Swap k={s}>
          {s === 0 && (
            <Term
              size={28}
              lines={[
                L('prompt: "Reply with exactly: ok"', "d"),
                L(""),
                L("model    tokens written to cache    price per 1M    cost", "d"),
                L(""),
                L("haiku    24,471                     $2              $0.050"),
                L("sonnet   27,347                     $4              $0.109"),
                L("opus     27,532                     $8              $0.220", "h"),
                L(""),
                L("24,471 / 1,000,000 x $2 = $0.049", "d"),
              ]}
            />
          )}
          {s === 1 && (
            <Term
              size={28}
              lines={[
                L("                     first run    second run", "d"),
                L(""),
                L("read from cache      0            12,529", "h"),
                L("written to cache     27,347       14,960"),
                L("total                27,347       27,489"),
                L("cost                 $0.109       $0.062", "h"),
                L(""),
                L("only the unchanged start of the prompt is a cache hit", "d"),
                L("12,529 read at $0.20 per 1M, the same tokens cost $4 to write", "d"),
              ]}
            />
          )}
          {s === 2 && (
            <Term
              size={28}
              lines={[
                L("                 5 minutes       1 hour", "d"),
                L(""),
                L("cache write      1.25 x input    2 x input", "h"),
                L("cache read       0.1 x input     0.1 x input"),
                L("expires after    5 min idle      1 hour idle"),
                L(""),
                L("every cache hit resets the timer, at no extra cost", "d"),
                L("my runs above were 1-hour writes: $2, $4, $8 = 2 x input", "d"),
              ]}
            />
          )}
          {s === 3 && (
            <Term
              size={28}
              lines={[
                L("default                                    cache", "d"),
                L(""),
                L("Claude subscription, within plan usage      1 hour"),
                L("API key, usage credits, cloud provider      5 minutes"),
              ]}
            />
          )}
          {s === 4 && (
            <Term
              size={26}
              lines={[
                L("you choose the cache for the whole session", "d"),
                L("the main agent and subagents use the same default", "d"),
                L(""),
                L("keep the default      you work in bursts, with gaps", "h"),
                L("  subscription: 1 hour. A 20 minute gap does not lose the cache.", "d"),
                L(""),
                L("force 5 minutes       you work steadily, no long gaps", "h"),
                L("  FORCE_PROMPT_CACHING_5M=1   writes cost 1.25x, not 2x", "d"),
                L(""),
                L("force 1 hour          API key, and you leave and come back", "h"),
                L("  ENABLE_PROMPT_CACHING_1H=1", "d"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "Same one-word prompt, three models, run just now. Every call wrote around 25 thousand tokens into the cache, because that is the system prompt, tools and skills, before my prompt. The price column is per million tokens written to the cache. I worked it out from the cost divided by the tokens. Haiku: 24 thousand tokens, divided by a million, times two dollars, is about five cents. Sonnet eleven cents, Opus twenty-two. The token counts differ a little because models count the same text differently. Then I ran Sonnet again within the hour. The second run has the same prefix, about 27 and a half thousand tokens in total. But only the first 12 and a half thousand were read from cache. The other 15 thousand were written again. The cache matches the prefix exactly, from the start, so once something differs, everything after that point is recomputed. I did not find out what differed in my run. Reading is cheap and writing is not, so the cost dropped from 11 cents to 6, not to almost nothing. Now why those prices. The API has two cache lifetimes. Five minutes: writing costs one and a quarter times the input price. One hour: writing costs two times the input price. Reading costs a tenth of the input price either way, and every hit resets the timer for free. My runs used the one-hour cache, which is why the price column is exactly twice each model's input price. Which one you get depends on how you log in. On a Claude subscription, inside your plan usage, Claude Code asks for one hour. With an API key, usage credits or a cloud provider, it asks for five minutes. You can change it with the prompt cache TTL setting or an environment variable. How to pick: you choose once for the session, not per agent. The subagents follow the same setting. If you work in bursts and leave for more than five minutes, use the one hour cache. It saves you from reprocessing the whole prefix. If you work steadily, every turn keeps the five minute cache warm and the writes are cheaper. On a subscription the default is already one hour, so most people change nothing. On an API key, the default is five minutes, so turn on the hour only if you take breaks.",
  },
  {
    id: "memory",
    steps: 5,
    time: "0:40",
    render: (s) => (
      <Slide chapter="Memory">
        <H>{["Claude reads two kinds of memory at session start", "Auto-memory is a folder of notes, one fact per file", "Auto-memory files its notes by type, plus one special file: MEMORY.md", "Auto-memory: MEMORY.md is only the index, one line per note", "Turn auto-memory off"][s]}</H>
        <Swap k={s}>
          {s === 0 && (
            <Rows
              size={48}
              active={-1}
              rows={[
                <span key="a"><span className="text-[#d97757]">CLAUDE.md</span>: my instructions, I write it</span>,
                <span key="b"><span className="text-[#d97757]">Auto-memory</span>: Claude's own notes, it writes them</span>,
              ]}
            />
          )}
          {s === 1 && (
            <Code
              size={30}
              text={`---
name: minimize-clarifying-questions
description: stop asking, make the call
type: feedback
---
Once I give autonomy, don't ask. Decide.
Why: I said so in a past session.`}
            />
          )}
          {s === 2 && (
            <Term
              size={28}
              lines={[
                L("auto-memory folder, written by Claude:", "d"),
                L("~/.claude/projects/<project>/memory/", "p"),
                L(""),
                L("  MEMORY.md       the index of all notes, see next", "h"),
                L("  user_*.md       your role and how you work"),
                L("  feedback_*.md   corrections and approaches that worked"),
                L("  project_*.md    ongoing work and decisions"),
                L("  reference_*.md  where to find things outside the repo"),
              ]}
            />
          )}
          {s === 3 && (
            <Term
              size={28}
              lines={[
                L("# Memory Index", "h"),
                L(""),
                L("## Feedback", "d"),
                L("- [Minimize Clarifying Questions](./feedback_questions.md) — stop asking, make the call"),
                L("- [Message Drafting Tone](./feedback_tone.md) — short, direct drafts"),
                L(""),
                L("One line per note. Loaded at session start: first 200 lines or 25KB.", "d"),
                L("Claude opens a note only when the task needs it.", "d"),
              ]}
            />
          )}
          {s === 4 && (
            <Term
              size={28}
              lines={[
                L("/memory", "p"),
                L("  toggle it in a session", "d"),
                L(""),
                L('{ "autoMemoryEnabled": false }', "p"),
                L("  in .claude/settings.json: off for one project", "d"),
                L(""),
                L("CLAUDE_CODE_DISABLE_AUTO_MEMORY=1", "p"),
                L("  environment variable: off everywhere", "d"),
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "Claude reads two kinds of memory at the start of every session. CLAUDE.md, which I write: a file of instructions for the project, like build commands and style rules. And auto-memory, which Claude writes: notes it takes itself, like my corrections and decisions. Claude decides what to save. It saves what a future session would need. A correction: I said stop asking me questions, just decide, and now it does. A decision or ongoing work: the deck is built but the demo has not run. A pointer to something outside the repo: where my prep docs live. It skips anything it can read from the code, like the project being a Next.js app, and anything your CLAUDE.md already says. Neither file outranks the other. Both are just context, so if a rule must hold, use a hook. It does not save every session. You can turn it off: the slash memory toggle, autoMemoryEnabled false in the project settings, or an environment variable. Auto-memory is a folder of small files, one fact per file. This is one note from my setup: a correction I gave once, saved with its reason, so a future session does not ask me again. Claude files notes by type: user, feedback, project and reference. The folder also has one special file, MEMORY.md. It is not the memory itself. It is the index: one line per note, pointing to the file. The docs say the first 200 lines of MEMORY.md, or the first 25 kilobytes, load at the start of every conversation. A note opens only when the task needs it, so Claude keeps the index short and the details in the notes.",
  },
  {
    id: "agent-decision",
    steps: 3,
    time: "0:45",
    render: (s) => (
      <Slide chapter="Agents">
        <H>Do you need an agent?</H>
        <Rows
          size={48}
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
          {s === 0 && <Code text={agentTools} size={30} />}
          {s === 1 && <Code text={agentRun} size={30} />}
          {s === 2 && <Code text={agentLoop} size={30} />}
          {s === 3 && <Code text={agentResults} size={30} />}
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
          {s === 0 && <Code text={badTool} size={30} />}
          {s === 1 && <Code text={goodTool} size={30} />}
          {s === 2 && (
            <Term
              size={28}
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
          size={48}
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
        <div className="flex items-center justify-between gap-16">
          <div>
            <Title size={120}>Thank you</Title>
            <div className="mt-8 text-[48px] font-semibold text-white">Yaroslav Matushevych</div>
            <div className="mt-2 text-[34px] text-neutral-300">Staff Software Engineer, Zoopla</div>
            <div className="mt-8 font-mono text-[28px] leading-relaxed text-neutral-400">
              <div className="text-[#d97757]">github.com/YaroslavMatushevych</div>
              <div className="text-[#d97757]">linkedin.com/in/yaroslav-matushevych</div>
            </div>
          </div>
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/linkedin-qr.svg" alt="QR code for LinkedIn" width={380} height={380} className="rounded-xl bg-white" />
            <div className="mt-4 font-mono text-[24px] text-neutral-400">LinkedIn</div>
          </div>
        </div>
      </Slide>
    ),
    notes: "Even with many agents, I read every diff, I check the tests Claude wrote, and I decide what to merge. These small parts are what you control a software factory with: what Claude remembers, how it is steered, which skills it follows, what it holds in context, and which tools it can touch. Thank you. The files, the skills and the bot are in three public repos on my GitHub, and the links are on the next slide. Questions.",
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

const codeReviewerAgent = `---
name: code-reviewer
description: Reviews code for bugs and security issues.
tools: Read, Grep, Glob
model: sonnet
---
List concrete problems with file:line. Do not edit files.`;
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


const tipToyClaudeMd = "# Project\nAlways use tabs for indentation.\nUse 2-space indentation.\nWrite clean code.\nAlways write tests first.\nNever write tests for trivial functions.\nIMPORTANT: ALWAYS follow ALL rules. NEVER break any rule. IMPORTANT.";
const tipAuditOut = ["1. Lines 2 and 3 give opposite rules. One says tabs, the", "  other says 2-space indentation. The model cannot obey", "  both.", "2. Line 7 is pressure language. It is all-caps IMPORTANT,", "  ALWAYS, NEVER, and it repeats the other rules."];


const tipHookSettings = "// ~/.claude/settings.json\n{\n  \"hooks\": {\n    \"UserPromptSubmit\": [{\n      \"hooks\": [{\n        \"type\": \"command\",\n        \"command\": \"~/.claude/hooks/context-reminder.sh\"\n      }]\n    }]\n  }\n}\n\n// every prompt: read the last tokens count from the transcript.\n// past 100k, tell Claude to suggest /clear or /compact.";
const tipHookBug = "# first version: parse the newest assistant line\nusage_line=$(tail -n 400 \"$transcript\" | grep '\"type\":\"assistant\"' | tail -n 1)\ntotal=$(echo \"$usage_line\" | jq -r '.message.usage ...')\n\n# Bug 1: echo turns a literal \\n in the message into a real newline.\n# Bug 2: a tool result with ANSI colour codes is not valid JSON.\n# jq fails, the hook prints {} and stays silent.\n# It fails when the transcript is busiest.";
const tipHookFix = "# fix: printf, and try the last 20 lines, newest first\ncandidates=$(tail -n 400 \"$transcript\" | grep '\"type\":\"assistant\"' | tail -n 20)\n\nwhile IFS= read -r line; do\n  if printf '%s' \"$line\" | jq -e . > /dev/null 2>&1; then\n    usage_line=\"$line\"; break\n  fi\ndone\n\n# one bad line no longer silences the whole turn";

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
            L("claude-code-workflow-talk", "h"),
          ]}
        />
      </Slide>
    ),
    notes: "Everything from this talk is in three public repos on my GitHub. Workflow notes: the written version, with sources and examples, for memory, context, commands, skills, agents and cost. Agent skills: the skills, agents, hooks and CI workflow from the slides, ready to copy. The Telegram bot repo is private, because it holds my setup. Workflow talk: these slides. The skills are drafts I have not run end to end, and the README says so. Thank you, and questions.",
  },


  "agent-skill": {
    id: "agent-skill", steps: 3, time: "1:30",
    render: (s) => (
      <Slide chapter="Agents">
        <H>An agent has a role. A skill gives it a procedure.</H>
        <Swap k={s}>
          {s === 0 && (
            <Rows
              size={48}
              active={1}
              rows={[
                "Planner: writes the plan",
                "Worker: writes the code",
                "Reviewer: reads the diff",
              ]}
            />
          )}
          {s === 1 && <Code text={workerAgent} size={30} />}
          {s === 2 && <Code text={ticketSkill} size={30} />}
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
          size={48}
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
          {s === 0 && <Code text={botConfig} size={30} />}
          {s === 1 && <Code text={botRun} size={22} />}
          {s === 2 && <Code text={botLoop} size={30} />}
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
            <Term size={28} lines={[
              L("Bad:   Write clean code", "d"),
              L(""),
              L("Good:  Use named exports.", "h"),
              L("Good:  Run `pnpm test <file>` before saying done.", "h"),
            ]} />
          )}
          {s === 1 && (
            <Term size={28} lines={[
              L("Bad:   Never use moment.js.", "d"),
              L(""),
              L("Good:  Use date-fns. Helpers are in docs/dates.md.", "h"),
            ]} />
          )}
        </Swap>
      </Slide>
    ),
    notes: "How I write a line in CLAUDE.md. A line Claude cannot check does nothing: write clean code means nothing to the model. A line it can check does work: use named exports, or run this test command before you say done. Second: a rule that only says never do X leaves Claude stuck, so say what to use instead, or point to a doc and say when to read it. Do not embed the doc with an at-sign, because imports load at launch and cost context. Next I show a command that audits your instruction files.",
  },
  "mem-pitfalls": {
    id: "mem-pitfalls", steps: 3, time: "0:40",
    render: (s) => (
      <Slide chapter="Memory">
        <H>How memory goes wrong</H>
        <Rows
          size={48}
          active={s}
          rows={[
            "The more rules you add, the less Claude follows each one",
            "A rule you gave only in chat is lost after /compact",
            "Old notes go stale and mislead Claude",
          ]}
        />
      </Slide>
    ),
    notes: "Three ways memory goes wrong. One: the more rules you add, the less reliably Claude follows each one, so keep CLAUDE.md short. Two: after compact, Claude re-reads the project CLAUDE.md from disk, but a rule you gave only in chat is gone. The docs say to add such a rule to CLAUDE.md. Three: auto-memory grows and old notes go stale, so prune it with the slash memory command. And if a rule must always hold, CLAUDE.md is not enough. That is the next slide.",
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
          {s === 3 && (<><Big size={180}>15×</Big><Mono size={34} dim>the tokens of a normal chat, for a team of agents</Mono></>)}
        </Swap>
      </Slide>
    ),
    notes: "What goes wrong when you run agents in parallel. Review is the bottleneck: I can start five agents, and I still have to read five diffs. Two agents editing the same file overwrite each other, which is why my worker runs in its own worktree. Idle agents keep burning tokens until you stop them. And the cost: Anthropic reports multi-agent systems use about 15 times the tokens of a chat. Start with one agent and a clear task.",
  },
  "smart-zone": {
    id: "smart-zone", steps: 4, time: "1:15",
    render: (s) => (
      <Slide chapter="Context">
        <H>{["Answers get worse in a long session", "My status line turns amber at 100K and red at 150K", "A hook is a script Claude Code runs on its own. Mine warns me.", "/clear or /compact: which one, when"][s]}</H>
        <Swap k={s}>
          {s === 0 && (<><Big size={180}>125K–150K</Big><Mono size={34} dim>tokens of context: where quality starts to drop</Mono></>)}
          {s === 1 && (
            <div>
              <div className="w-fit rounded-2xl border border-neutral-800 bg-[#0c0c0c] px-12 py-9 font-mono text-[32px] leading-[1.9] text-[#949494]">
                {[
                  ["85k tokens", "#949494", "cache: 41m left", "#949494"],
                  ["120k tokens", "#ffaf00", "cache: 38m left", "#949494"],
                  ["165k tokens", "#ff5f5f", "cache: expired 12m ago", "#ff5f5f"],
                ].map(([tok, tc, cache, cc]) => (
                  <div key={tok} className="whitespace-pre">
                    <span className="text-white">deck</span>{" │ "}git:(<span className="text-[#0087ff]">main</span>){" │ "}
                    <span style={{ color: tc }}>{tok}</span>{" │ "}
                    <span style={{ color: cc }}>{cache}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 font-mono text-[26px] text-neutral-400">grey under 100K · amber from 100K · red from 150K</div>
              <div className="mt-2 font-mono text-[26px] text-[#d97757]">github.com/YaroslavMatushevych/claude-code-skills</div>
            </div>
          )}
          {s === 2 && (
            <Rows
              size={44}
              active={-1}
              rows={[
                <span key="a"><span className="text-[#d97757]">1</span> I send a prompt</span>,
                <span key="b"><span className="text-[#d97757]">2</span> My hook, a small script, runs automatically</span>,
                <span key="c"><span className="text-[#d97757]">3</span> Past 100K or 150K tokens it adds a note for Claude</span>,
                <span key="d"><span className="text-[#d97757]">4</span> Claude tells me: good moment to /clear or /compact</span>,
              ]}
            />
          )}
          {s === 3 && (
            <Rows
              size={48}
              active={-1}
              rows={[
                <span key="a"><span className="text-[#d97757]">/clear</span>: unrelated work next. Free.</span>,
                <span key="b"><span className="text-[#d97757]">/compact</span>: I still need this thread. Cheap while the cache is warm.</span>,
              ]}
            />
          )}
        </Swap>
      </Slide>
    ),
    notes: "A rule of thumb I use: on current models, quality starts to drop somewhere around 125 to 150 thousand tokens. The exact number is debated, so check your own sessions with slash context. Look at my own usage for the last week: 74 percent of it was above 150 thousand, and a third came from sessions open for more than eight hours. That is my bad habit. A status line is passive and easy to stop noticing, so I automated the nudge. My status line is a small script that Claude Code runs to draw the bar at the bottom. It shows the folder, the git branch and the tokens in the window, and the tokens turn amber at 100 thousand and red at 150 thousand. It also shows how long the cache stays warm, and turns red when it expired. The numbers on the slide are an example. It is a plugin I published, the link is on the slide. Second, a hook. A hook is a small script that Claude Code runs by itself at a moment you choose, here every time I send a prompt. Mine reads the size of the conversation from the transcript. Past 100 or 150 thousand tokens it adds a note that Claude sees, so Claude itself tells me this is a good moment to clear or compact. The hook does not run the command for me. I decide. I come back to hooks later in the talk. How I choose: clear when the next task is unrelated, it costs nothing. Compact when I still need the thread, and it is cheap while the cache is warm, because the summary request reads the cached prefix. After a long break the cache is gone, and compact reprocesses everything. And the habit behind all of it: one task per session, and when a task is bigger, split it and hand off with a short summary file.",
  },

};


const extraSlides4: Record<string, SlideDef> = {
  "sk-write": {
    id: "sk-write", steps: 4, time: "0:50",
    render: (s) => (
      <Slide chapter="Skills">
        <H>How to write a skill: four rules</H>
        <Rows
          size={48}
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
          {s === 0 && <Code text={`description: Helps with documents`} size={30} />}
          {s === 1 && (
            <Code
              size={30}
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
          size={48}
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
    notes: "Five ways a skill goes wrong. It does not run: the user prompt is too short for Claude to see that the skill applies. In a talk at AI Engineer 2026, half the failures the speaker's team saw were wrong triggering. It runs too often, because the description is broad, like use for web development. It works on one model and not another, so test on the ones you use. It gets worse after a model update. And the AI-written skill nobody tested. A failure is hard to diagnose because runs vary: the skill, the discovery or the task may be at fault.",
  },
};


const extraSlides5: Record<string, SlideDef> = {
  "model-windows": {
    id: "model-windows", time: "0:35",
    render: () => (
      <Slide chapter="Context">
        <H>Each model has its own context window</H>
        <Term
          size={30}
          lines={[
            L("model               context window", "d"),
            L(""),
            L("Claude Fable 5.1     1M tokens"),
            L("Claude Opus 5.5      1M tokens"),
            L("Claude Sonnet 5.5    1M tokens"),
            L("Claude Haiku 5.5     1M tokens"),
            L("Claude Sonnet 4.5    200K tokens", "h"),
            L("Claude Haiku 4.5     200K tokens", "h"),
          ]}
        />
      </Slide>
    ),
    notes: "The context window is a property of the model, not of Claude Code. Switch the model and you can switch the window. The current models, Fable 5.1, Opus 5.5, Sonnet 5.5 and Haiku 5.5, all have one million tokens. The older Sonnet 4.5 and Haiku 4.5 have two hundred thousand, five times less. So if you pin an agent to an older model, it fills up five times faster. That is the size of the box. In the next slides I show what is already in it before I type a word.",
  },

  "tip-hook": {
    id: "tip-hook", steps: 3, time: "0:50",
    render: (s) => (
      <Slide chapter="Commands">
        <H>{[<>A rule in <span className="text-[#d97757]">CLAUDE.md</span> is a request. A <span className="text-[#d97757]">hook</span> is a <span className="text-[#ff5555]">lock</span>.</>, "My hook went silent when I needed it most", "The fix: printf, and try the last 20 lines"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={tipHookSettings} size={30} />}
          {s === 1 && <Code text={tipHookBug} size={28} />}
          {s === 2 && <Code text={tipHookFix} size={28} />}
        </Swap>
      </Slide>
    ),
    notes: "CLAUDE.md is a request. Claude usually follows it, but nothing forces it. A hook is a script that Claude Code runs for you, so it always runs. This one is mine. I want to know when a session gets big. So I wrote a hook on every prompt submit. It reads the transcript, adds up the tokens from the last assistant message, and past 100 thousand it tells Claude to suggest clear or compact. Then I had a problem. The hook went quiet, and it went quiet when the transcript was busiest. Two causes. First, echo turned a backslash n inside a message into a real newline, so the line was no longer valid JSON. Second, a tool result with colour codes in it. jq failed, and my script returned an empty object for the whole turn. The fix was two changes. Use printf instead of echo. And do not trust only the newest line: take the last 20 assistant lines, newest first, and use the first one that parses. A hook that fails silently is worse than no hook, so now it skips only the bad line. Use a hook for rules that must hold, and test it on a busy session, not a clean one.",
  },

  "tip-skills-cost": {
    id: "tip-skills-cost", steps: 3, time: "0:40",
    render: (s) => (
      <Slide chapter="Skills">
        <H>{["Every skill costs tokens in every session", "One new skill: listed at about 130 tokens", "Mark it manual-only and it is not listed"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Term size={28} lines={[L('$ claude -p "/context"', "p"), L(""), L("| Category | Tokens | Percentage |"), L("|----------|--------|------------|"), L("| System prompt | 2.3k | 0.2% |"), L("| System tools | 379 | 0.0% |"), L("| Skills | 10k | 1.0% |"), L("| Messages | 1.3k | 0.1% |")]} />}
          {s === 1 && <Term size={28} lines={[L('$ claude -p "/context"', "p"), L(""), L("| Skill | Source | Tokens |"), L("|-------|--------|--------|"), L("...", "d"), L("| release-notes | Project | ~130 |"), L("...", "d")]} />}
          {s === 2 && <Term size={28} lines={[L("---", "d"), L("name: release-notes", "d"), L("disable-model-invocation: true", "p"), L("---", "d"), L(""), L('$ claude -p "/context"', "p"), L(""), L("| Skills | 10k | 1.0% |"), L("release-notes is gone from the Skills table", "d")]} />}
        </Swap>
      </Slide>
    ),
    notes: "Every skill that Claude can start on its own puts its name and description into the context of every session, whether you use it or not. This is the real output of slash context in a clean folder: my installed skills cost about 10 thousand tokens before I type a word. I added one skill with a long description, and slash context lists it at about 130 tokens. The total moves by about a hundred tokens up or down between runs, so read the per-skill row, not the total. Then I added disable-model-invocation true to its frontmatter. The skill is gone from the Skills table. If you only call a skill by hand, use that flag. The docs say such a skill stays out of the context until you call it.",
  },
  "tip-audit": {
    id: "tip-audit", steps: 3, time: "0:50",
    render: (s) => (
      <Slide chapter="Memory">
        <H>{["A CLAUDE.md with two problems", "Audit your instructions", "What it found"][s]}</H>
        <Swap k={s}>
          {s === 0 && <Code text={tipToyClaudeMd} size={30} />}
          {s === 1 && <Mono size={96}>/doctor prompt-audit</Mono>}
          {s === 2 && <Term size={28} lines={tipAuditOut.map((t) => L(t, "h"))} />}
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
          {s === 0 && <Code text={prsummaryFile} size={30} />}
          {s === 1 && <Term size={28} lines={[L('$ claude -p "/pr-summary"', "p"), L(""), ...prsummaryOut.map((t) => L(t))]} />}
          {s === 2 && (<><Big size={180}>197 words</Big><Mono size={36} dim>my skill says: Max 150 words</Mono></>)}
        </Swap>
      </Slide>
    ),
    notes: "A real run, from a throwaway repo with a branch and three commits. The skill is five lines. It runs git log and git diff stat before Claude sees the prompt, so the commits are already in context. It worked: the summary is accurate, it spots that an empty string will not fall back to the saved value, and it gives a test plan. But I wrote max 150 words in the skill, and it wrote 197. A skill can look fine and still miss a limit you set. A word count is a check you can run, so write it as a test case, and run it more than once.",
  },

  "d-memory": {
    id: "d-memory", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Memory</Title>
        <div className="mt-8 text-[48px] text-neutral-400">What Claude knows at the start of every session</div>
      </Slide>
    ),
    notes: "We start with memory, because everything else builds on what Claude knows at the start of every session.",
  },
  "d-commands": {
    id: "d-commands", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Commands</Title>
        <div className="mt-8 text-[48px] text-neutral-400">How I steer Claude while it works</div>
      </Slide>
    ),
    notes: "Now you know what fills the window. Next, how I steer Claude while it works: modes, output styles, a few commands people skip, and hooks for rules that must hold.",
  },
  "d-skills": {
    id: "d-skills", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Skills</Title>
        <div className="mt-8 text-[48px] text-neutral-400">How Claude does the work the way I want</div>
      </Slide>
    ),
    notes: "Commands steer one session. Skills package the way I want work done, so I do not repeat myself in every prompt. Remember the 9.8 thousand tokens of skill descriptions from the context slide: this is where they come from.",
  },
  "d-context": {
    id: "d-context", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Context</Title>
        <div className="mt-8 text-[48px] text-neutral-400">What Claude can hold, and what it costs</div>
      </Slide>
    ),
    notes: "Memory is the first thing that fills the context window. So let me show you what the window looks like on my own machine, and what it costs.",
  },
  "d-agents": {
    id: "d-agents", time: "0:10",
    render: () => (
      <Slide>
        <Title size={128}>Agents</Title>
        <div className="mt-8 text-[48px] text-neutral-400">Claude working on its own</div>
      </Slide>
    ),
    notes: "Once you can steer Claude and package how it works, you can decide when to let it work without you watching. That is an agent.",
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
    id: "vision", steps: 2, time: "1:30",
    render: (s) => (
      <Slide>
        <div className="text-center text-balance">
        <Swap k={s}>
          {s === 0 && <Title size={72}>Many of us use AI tools like Claude every day. More and more of that work is done by agents.</Title>}
          {s === 1 && <Title size={112}>Stay in control.</Title>}
        </Swap>
        </div>
      </Slide>
    ),
    notes: "Good morning, everyone. I'm Yaroslav. Quick question: who asked an AI to write code this week? Keep your hand up if you let it run without watching. That is where this talk starts. I use Claude Code and AI agents every working day, and I will show how I set them up and why each part matters: what Claude remembers, how I steer it, which skills it follows, what it holds in context, and which tools it can touch. We even build software factories. But to build a factory or an agent, you need to know the basics. This talk is about those basics, and how you stay in control. I also built a small software factory. A task goes in from my phone, and a pull request comes out. You will see it at the end. A factory like that is made of the same parts you use by hand. If a skill is vague, every agent runs a vague skill. So the more you automate, the more these details matter. If you want control, this is where you get it, not from a bigger model.",
  },
};

const order = [
  "hero", "vision",
  "d-memory", "memory", "tip-hook",
  "d-context", "model-windows", "context", "cost", "smart-zone",
  "d-commands", "modes", "style", "commands",
  "d-skills", "sk-write", "sk-desc", "sk-issues",
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
