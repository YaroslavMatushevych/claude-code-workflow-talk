# Inside My Real Claude Code Workflow

Slides for the talk "Inside My Real Claude Code Workflow" at CityJS Athens 2026. The deck is a Next.js app with a black theme. It has speaker notes, a timer, and deep links to each slide and step. The slides show real terminal output, real skill files, and short code samples. The deck has 36 slides.

## Run it

```bash
npm install
npm run dev
```

Open the port that the command prints. To make a production build, run `npm run build`.

## Keys

| Key | Action |
| --- | --- |
| Right arrow or Space | Next step or slide |
| Left arrow | Back |
| N | Show or hide speaker notes |
| T | Start or stop the timer |
| F | Fullscreen |

Deep link: add `#14.1` to the URL to open slide 14, step 1. `#14` opens slide 14, step 0.

## How slides are defined

All slides are in `components/slides.tsx`. Each slide is an object of type `SlideDef`:

- `id`: a unique name.
- `steps`: how many steps the slide has. The default is 1.
- `time`: optional time for the slide, shown in the notes panel.
- `render(step)`: returns the slide content for the current step.
- `notes`: the speaker notes.

A slide shows one text block at a time. `render(step)` puts the blocks inside `Swap`, which fades the old block out and the new block in. Blocks do not pile up on the screen.

The `order` array at the end of the file sets the slide order.

`components/ui.tsx` holds the building blocks: `Slide`, `Title`, `Big`, `Mono`, `Cap`, `Code`, `Term`, `Rows` and `Swap`. `components/Presentation.tsx` handles keys, scaling to 1920x1080, notes, timer and deep links.

## Add a slide

1. Open `components/slides.tsx`.
2. Add a `SlideDef` object with an `id`, `steps`, `render` and `notes` to one of the slide records (for example `extraSlides2`).
3. Add the `id` to the `order` array, at the position you want. The `order` array sets the slide order. A missing `id` makes the app throw an error.
4. Open `http://localhost:<port>/#<number>` to check it.

Example:

```tsx
{
  id: "my-slide",
  steps: 2,
  render: (s) => (
    <Slide>
      <Swap k={s}>
        {s === 0 && <Title>First point</Title>}
        {s === 1 && <Big>42</Big>}
      </Swap>
    </Slide>
  ),
  notes: "What I say on this slide.",
}
```

## Talk structure

1. Memory
2. Commands
3. Skills
4. Context
5. Agents
6. Voice and bot

## Links

- Written notes with sources: https://github.com/YaroslavMatushevych/claude-code-workflow-notes
- Skills, agents and hooks: https://github.com/YaroslavMatushevych/claude-code-agent-skills
- Telegram to Claude Code bot: https://github.com/YaroslavMatushevych/claude-telegram-bot

## Honesty

- The slides quote third-party material. The sources are Matt Pocock's skills repo, Jesse Vincent's superpowers, Anthropic docs, Simon Willison, HumanLayer, Cisco, and a BeerCode video. The speaker notes name the source of each quote.
- Some quotes passed through a summarising fetch tool. The speaker notes mark them. Check them against the original page before you reuse them.
- The demo agent, the Telegram bot and the worker agent were not run end to end when the deck was built.
- The terminal output on the context, usage and cost slides comes from one machine on 2026-10-03. Your numbers will differ.
