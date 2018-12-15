'use strict';

import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.generateTree', (el) => {
        // directory and file ditective function
        let entryTrees = function (trgPath: string, deps: number) {
            let treeText = '';
            if (!fs.existsSync(trgPath)) { return ''; }

            // string format for tree text
            let format = function (deps: number, pipe: string, name: string) {
                return ' ' + Array(deps + 1).join('┃ ') + pipe + name + '<br>';
            };

            // order by directory > file
            let beforSortFiles: Array<object> = fs.readdirSync(trgPath);
            let paths: Array<object> = [];

            let tmpFiles: Array<object> = [];
            beforSortFiles.forEach(target => {
                let fullPath = path.join(trgPath, target.toString());
                if (fs.statSync(fullPath).isDirectory()) {
                    paths.push(target);
                } else {
                    tmpFiles.push(target);
                }
            });
            paths = paths.concat(tmpFiles);

            paths.forEach(item => {
                let fullPath = path.join(trgPath, item.toString());
                let pipe = paths.indexOf(item) === paths.length - 1 ? '┗ ' : '┣ ';
                
                if (fs.statSync(fullPath).isDirectory()) {
                    treeText += format(deps, pipe, '🗂' + item.toString());
                    treeText += entryTrees(fullPath, deps + 1);
                } else {
                    treeText += format(deps, pipe, '📄' + item.toString());
                }
            });
            return treeText;
        };
        // Display a Tree text
        let tree = '<bold>' + path.basename(el.path) 
                        + '</bold><br>' + entryTrees(el.path, 0);
        let tree_col = vscode.window.createWebviewPanel('text', 'Generate Tree Text',
            { viewColumn: vscode.ViewColumn.Active });
        tree_col.webview.html = OutputElements.Template.replace('--REP--', tree);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}


class OutputElements {
    static Template = `
    <html>
      <body>
        <div class="head">
          <label id="execute-msg" style="display: block;"></label>
        </div>
        <pre id="tree-panel"><br>--REP--</pre>
      </body>
    </html>
    `;
}