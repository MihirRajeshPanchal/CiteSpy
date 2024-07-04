const vscode = require('vscode');
const fetch = require('node-fetch');

function activate(context) {
    console.log('Congratulations, your extension "CiteSpy" is now active!');

    const provider = new CiteSpyViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CiteSpyViewProvider.viewType, provider)
    );

    let disposable = vscode.commands.registerCommand('CiteSpy.openSidebar', () => {
        vscode.commands.executeCommand('workbench.view.extension.citeSpy');
    });

    context.subscriptions.push(disposable);
}

class CiteSpyViewProvider {
    static viewType = 'citeSpyView';

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = undefined;
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        this._setWebviewMessageListener(webviewView.webview);
    }

    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
    
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <title>CiteSpy</title>
            </head>
            <body>
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Enter search query" />
                    <button id="searchButton">Search</button>
                </div>
                <div id="results"></div>
                <div id="loader" class="loader" style="display: none;">
                    <div class="spinner"></div>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    async _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'search':
                        try {
                            const response = await fetch('https://citespy.onrender.com/search', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ query: message.text }),
                            });
                            const data = await response.json();
                            webview.postMessage({ command: 'results', data: data });
                        } catch (error) {
                            vscode.window.showErrorMessage('Error fetching search results: ' + error.message);
                            webview.postMessage({ command: 'error' });
                        }
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};