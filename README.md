# Multiple cursor case preserve

## Features

Have you ever tried to change a single word in all variable names, but had your camelCase broken? This extension preserves selection case in these situations. It recognises CAPS, Uppercase and lowercase. Works for typing or pasting.

![Example](images/Example.gif)

## Known Issues

*   History for redo breaks when you undo a change made by the extension after pasting into multiple selections. [This issue](https://github.com/Microsoft/vscode/issues/38535) prevents me from solving undo/redo completely.
*   Undo/redo works one change at a time, which for CAPS usually means a **ctrl+z** for every symbol.

## Release Notes

### 1.0.5

Fix a rare exception

### 1.0.4

More work on undo/redo

### 1.0.3

Improves undo/redo behavior

### 1.0.2

Fixes bugs introduced in 1.0.1

### 1.0.1

Now it doesn't changing anything, if case was equal in the first place - prevents some annoying false positives.

### 1.0.0

Initial release
