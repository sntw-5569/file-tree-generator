'use strict';

import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.generateTree', (el) => {
        // Display a Tree text
        let tree = '<bold><span class="t-icon" name="icons">📦</span>' + path.basename(el.fsPath) 
                        + '</bold><br>' + entryTrees(el.fsPath, 0);
        let tree_col = vscode.window.createWebviewPanel('text', 'Generate Tree Text',
            { 
                viewColumn: vscode.ViewColumn.Active 
            },
            {
                enableScripts: true
            });
        tree_col.webview.html = OutputElements.Template.replace('--REP--', tree);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

// directory and file ditective function
export function entryTrees (trgPath: string, deps: number) {
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
        if (fs.lstatSync(fullPath).isDirectory()) {
            paths.push(target);
        } else {
            tmpFiles.push(target);
        }
    });
    paths = paths.concat(tmpFiles);

    paths.forEach(item => {
        let fullPath = path.join(trgPath, item.toString());
        let pipe = paths.indexOf(item) === paths.length - 1 ? '┗ ' : '┣ ';
        
        if (fs.lstatSync(fullPath).isSymbolicLink()) {
            treeText += format(deps, pipe, '<span class="t-icon" name="icons">🔗</span>' + item.toString());
        }
        else if (fs.lstatSync(fullPath).isDirectory()) {
            treeText += format(deps, pipe, '<span class="t-icon" name="icons">📂</span>' + item.toString());
            treeText += entryTrees(fullPath, deps + 1);
        } else {
            treeText += format(deps, pipe, '<span class="t-icon" name="icons">📜</span>' + item.toString());
        }
    });
    return treeText;
}

class OutputElements {
    static Template = `
    <html>
      <head>
      <style>
      .btn-ftg {
        position: relative;
        display: inline-block;
        padding: 0.25em 0.5em;
        text-decoration: none;
        color: #FFF;
        background: #3595fd;
        border-bottom: solid 2px #007dd2;
        border-radius: 4px;
        box-shadow: inset 0 2px 0 rgba(255,255,255,0.2), 0 2px 2px rgba(0, 0, 0, 0.19);
        font-weight: bold;
        -webkit-user-select: none;
        -moz-user-select: none;
         -ms-user-select: none;
             user-select: none;

        &:active {
          border-bottom: solid 2px #3595fd;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.30);
        }
      }
      </style>
      </head>
      <body>
        <div class="head">
          <div id="icon-switch" class="btn-ftg"
           onclick="switchVisibility();">
          icon off
          </div>
        </div>
        <pre id="tree-panel">--REP--</pre>
        <script type="text/javascript">
            function switchVisibility() {
                var mode = document.getElementById("icon-switch").textContent;
                var iconList = document.getElementsByName("icons");
                var visible = "inline";
                if (mode != 'icon on') {
                    document.getElementById("icon-switch").textContent = 'icon on'
                    visible = "none";
                } else {
                    document.getElementById("icon-switch").textContent = 'icon off'
                }
                iconList.forEach(icon => {
                    icon.style.display = visible;
                })
                window.focus();
            }
        </script>
      </body>
    </html>
    `;
}
