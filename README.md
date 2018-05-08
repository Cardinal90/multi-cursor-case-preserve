# Multiple cursor case preserve

## Features

Have you ever tried to change a single word in all variable names, but had your camelCase broken? This extension preserves selection case in these situations. It recognises CAPS, Uppercase and lowercase. Works for typing or copy-pasting.

![Example](images/Example.gif)

## Known Issues

*   ~~Since 1.0.3 undo/redo for changes made by this extension is safe.~~ As of 1.0.4 history for redo still breaks, if you undo a change made by copy/paste. [This issue](https://github.com/Microsoft/vscode/issues/38535) prevents me from solving undo/redo completely.
*   Probably won't properly work for multiline selections, but this scenario doesn't seem likely.

## Release Notes

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
