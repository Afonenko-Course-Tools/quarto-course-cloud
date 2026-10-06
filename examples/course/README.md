# Native Cloud demo group

Install pinned dependencies in this directory, then build the complete group:

```sh
quarto add Afonenko-Course-Tools/quarto-course@v3.0.0 --no-prompt
quarto add Afonenko-Course-Tools/quarto-course-cloud@v2.1.0 --no-prompt
quarto run build.ts
```

The full web output is `_book/full`, with `index.html` and `BUILD.json`.
The build validates native metadata and selected full-source lab export.
No Cloud machines or real platform exchange are executed.
