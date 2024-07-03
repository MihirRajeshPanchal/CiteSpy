const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    console.log('Congratulations, your extension "CiteSpy" is now active!');

    const helloWorldCommand = vscode.commands.registerCommand('CiteSpy.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from CiteSpy!');
    });

    const openSidebarCommand = vscode.commands.registerCommand('CiteSpy.openSidebar', function () {
        vscode.commands.executeCommand('workbench.view.extension.citeSpyView');
    });

    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(openSidebarCommand);

    const provider = new CiteSpyViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CiteSpyViewProvider.viewType, provider)
    );
}

class CiteSpyViewProvider {
    static viewType = 'citeSpyView';

    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getWebviewContent();
    }

    getWebviewContent() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CiteSpy</title>
</head>
<body>
    <h1>CiteSpy Input</h1>
    <input type="text" id="input" placeholder="Enter text here">
</body>
</html>`;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
