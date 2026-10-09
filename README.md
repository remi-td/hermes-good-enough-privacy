# Good-enough privacy with Hermes Agent

The public site for [Good-enough privacy with Hermes Agent](https://remi-td.github.io/hermes-good-enough-privacy/).

The article source is [`article.md`](article.md). GitHub Pages serves the generated files in `docs/` from the `main` branch. The three Mermaid diagrams are bundled locally, so readers do not need a third-party script service.

## Build locally

```sh
npm ci
npm run build
npm run check
```

Commit changes to both `article.md` and the generated `docs/` files. The build uses the architecture image at `docs/assets/architecture.png`; replace that file if the published image changes.
