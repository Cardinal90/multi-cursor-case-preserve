var vscode = require('vscode');

var window = vscode.window;
var Disposable = vscode.Disposable;
var Range = vscode.Range;

class MultiCursorCasePreserve {
    constructor() {
        this.store = new Map();
    }

    createLineArray(args) {
        return args.selections.map(function(selection) {
            return args.textEditor.document.lineAt(selection.start.line);
        });
    }

    createNewEditorState(args) {
        var state = {
            selectionsData: [],
            numberOfSelections: args.selections.length,
            lines: this.createLineArray(args)
        };
        this.store.set(args.textEditor, state);
        return state;
    }

    didLinesChange(args, state) {
        var lines = this.createLineArray(args);
        return lines.some(function(line, index) {
            return state.lines[index].text.toLowerCase() !== line.text.toLowerCase();
        });
    }

    areSelectionsEmpty(args) {
        return args.selections.every(function(selection) {
            return selection.isEmpty;
        });
    }

	areSelectionsEqualOrEmpty(args) {
		var text = '';
        return args.selections.every(function(selection) {
			text = !text && !selection.isEmpty ? args.textEditor.document.getText(selection).toLowerCase() : text;
            return selection.isEmpty || args.textEditor.document.getText(selection).toLowerCase() === text;
        });
	}

    initSelectionsData(args, state) {
        return args.selections.reduce(function(selectionsData, selection, index) {
            var text = args.textEditor.document.getText(selection);
            selectionsData[index] = selectionsData[index] || {};
            selectionsData[index].text = text;
            selectionsData[index].start = selection.start;
            return selectionsData;
        }, state.selectionsData);
    }

    categorizeSelections(state) {
        state.selectionsData.forEach(function(selectionData) {
            if (/^[^a-z]+$/.test(selectionData.text)) {
                selectionData.type = 'caps';
            } else if (/^[a-z].*/.test(selectionData.text)) {
                selectionData.type = 'lower';
            } else if (/^[A-Z].*/.test(selectionData.text)) {
                selectionData.type = 'upper';
            }
        });
    }

    calculateSelectionRanges(args, state) {
        var count = 0;
        var len = 1;
        var line = -1;
        return args.selections.reduce(function(selectionsData, selection, index) {
            selectionsData[index] = selectionsData[index] || {};
            if (selectionsData[index].start.line === line) {
                count++;
            } else {
                count = 0;
                len = selection.end.character - selectionsData[index].start.character;
            }
            line = selectionsData[index].start.line;
            selectionsData[index].range = new Range(selectionsData[index].start.translate(0, count * (len - selectionsData[index].text.length)), selection.end);
            return selectionsData;
        }, state.selectionsData);
    }

    editSelections(args, state) {
        var self = this;
        args.textEditor.edit(function(edit) {
            state.selectionsData.forEach(function(selectionData) {
                var text = args.textEditor.document.getText(selectionData.range);
                var newText = text;
                switch (selectionData.type) {
                    case 'caps':
                        newText = text.toUpperCase();
                        break;
                    case 'lower':
                        newText = text[0].toLowerCase() + text.substring(1);
                        break;
                    case 'upper':
                        newText = text[0].toUpperCase() + text.substring(1);
                        break;
                }
                edit.replace(selectionData.range, newText);
            });
        }, {
            undoStopAfter: false,
            undoStopBefore: false
        }).then(function(result) {
            if (result === true) {
                state.lines = self.createLineArray(args);
            }
        }, function(err) {

        });
    }

	update(args) {
		// Work only with two and more selections, which are either equal or empty
        if (!args || !args.selections || args.selections.length < 2 || !this.areSelectionsEqualOrEmpty(args)) {
            return;
		}

		// Sorting is needed to correctly process multiple selections in the same line
        args.selections.sort(function(a, b) {
            return a.start.compareTo(b.start);
        });

		// For every text editor there is a separate current state
        var state = this.store.get(args.textEditor) || this.createNewEditorState(args);

		// If number of selections is different, it is a clear marker to recalculate everything
        if (args.selections.length !== state.numberOfSelections) {
            state = this.createNewEditorState(args);
        }

		// Compare full lines, where selections occur, with previously known state
        var linesChanged = this.didLinesChange(args, state);

		// Check if all selections are empty
        var selectionIsEmpty = this.areSelectionsEmpty(args);

		// If no lines changed, it is a selection stage
		// !selectionIsEmpty check is needed because after undo lines will be changed and selected
		if (linesChanged === false || !selectionIsEmpty) {
            state.selectionsData = this.initSelectionsData(args, state);
			this.categorizeSelections(state);
			state.lines = this.createLineArray(args);

		// If something changed, user just typed something, so we need to recalculate ranges for replacements
		// (recalculation on every step is needed to correctly handle multiple selections in the same line)
		} else {
            state.selectionsData = this.calculateSelectionRanges(args, state);
			this.editSelections(args, state);
        }
    }

    dispose() {}
}


class multiCursorCasePreserveController {

    constructor(multiCursorCasePreserve) {
        this._multiCursorCasePreserve = multiCursorCasePreserve;

        let subscriptions = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    _onEvent(args) {
        this._multiCursorCasePreserve.update(args);
    }
}


function activate(context) {
	// console.log('activated');
    let multiCursorCasePreserve = new MultiCursorCasePreserve();
    let controller = new multiCursorCasePreserveController(multiCursorCasePreserve);

    context.subscriptions.push(controller);
    context.subscriptions.push(multiCursorCasePreserve);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
