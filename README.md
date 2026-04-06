# voixa-platform

A premium AI vocal studio that enhances your real voice into professional music.

## OpenCode prompt-pack workflow

Use the Voixa prompt pack sequentially (Prompt 1 through Prompt 20), one prompt at a time.

### Recommended execution rules

- Keep changes incremental and safe.
- Before edits, list the files to be created/modified.
- After edits, summarize what was implemented.
- Preserve modular architecture and premium UX direction.
- Run checks after major milestones and fix errors before continuing.
- Mark placeholders clearly instead of presenting them as complete.

### Quick control prompt

If implementation drifts, reuse this control instruction:

> Stay aligned with the existing Voixa codebase and do not rebuild unnecessarily. Work in small safe steps, avoid overwriting working code without reason, list files before changing code, summarize after changes, keep architecture modular and UI premium, run checks after major changes, fix errors before continuing, and mark placeholders clearly.
