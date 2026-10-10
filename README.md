# Crimson Singularity

*One void. Infinite identities.*

A static, dependency-free profile universe built around `IMG_20261010_184609.jpg`.

## Deploy to GitHub Pages
Put all five files in the repo root (or `/docs`), then enable Pages for that branch. Paths are relative, so no build step is needed.

## How the infinity works
- Each identity is computed from its number alone (a 64-bit splitmix-style hash folded over BigInt limbs), so any identifier of any length reconstructs the same profile: name, planet illustration, class, atmosphere, size, orbit, moons, region and description.
- Nothing is stored. The feed creates one batch of 24 as you approach the end, with no final page or cap.
- Batches far from the viewport are unmounted and rebuilt from their numbers on return, so the DOM stays small.
- Open any profile directly with `?profile=<number>`.

## Honest limits
- Planets are small procedural SVG illustrations, not photographs or real astronomical objects, and not hand-made art per planet. They are visually varied but drawn from a finite set of parts.
- "Infinite" is in the sense of an unbounded addressable sequence. Name collisions between very distant identities are possible.
- Name search covers only planets already discovered (first 5,000). Exact-identifier lookup is unlimited.
- Only the intro preference and last position are saved, in localStorage on that device. There is no sync, login or backend.
