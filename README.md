# Pattern Password Recovery

**[Try it live](https://raaaghavv.github.io/Pattern-Recovery/)**

## Why I Built This

I got locked out of my own Android phone. I knew my pattern lock was somewhere in muscle memory — my fingers could almost feel it — but I couldn't consciously remember the exact sequence. Android gives you limited attempts before locking you out entirely, so blindly guessing wasn't an option.

I searched for tools to help but found nothing that let me visually draw patterns and systematically eliminate ones I'd tried. So I built this.

## What It Does

An interactive web app that helps you recover a forgotten Android pattern lock through visual trial and elimination.

- **Draw patterns** on a 3x3 grid just like your phone, and the app tracks every pattern you've tried so you never repeat one.
- **Filter the search space** — if you vaguely remember something ("it started from a corner", "it was about 6 nodes long", "it only used adjacent dots"), apply those filters and the app generates only the matching patterns for you to browse visually.
- **389,112 valid patterns** exist on Android. With the right filters, you can narrow that down to dozens. Visual recognition does the rest — when you see your pattern drawn out, your brain (or your fingers) will remember.

## Who It's For

- Anyone who forgot their Android pattern lock and wants to jog their memory before resorting to a factory reset
- People who set a pattern once and haven't consciously thought about it since — it's somewhere in muscle memory but won't surface on demand
- Anyone locked out who still has some attempts left and wants to use them strategically instead of guessing randomly

## Did It Work?

Yes. I applied filters based on what I thought I remembered (start from top row, adjacent only, no vertical moves, passes through center). Narrowed it to ~170 patterns. Tried a bunch. Then while drawing one... my hand just did the right pattern automatically. Muscle memory kicked in.

## Author

[@raaaghavvvvv](https://x.com/raaaghavvvvv)
