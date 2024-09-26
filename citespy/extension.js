const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.log('.env file not found at:', envPath);
}

function activate(context) {
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
                            const S2_API_KEY = process.env.S2_API_KEY;
                            const result_limit = 10;

                            if (!S2_API_KEY) {
                                throw new Error('S2_API_KEY is not set in the environment.');
                            }

                            const response = await fetch('https://api.semanticscholar.org/graph/v1/paper/search?' + new URLSearchParams({
                                query: message.text,
                                limit: result_limit,
                                fields: 'title,url,venue,year,authors,abstract,citationCount,publicationTypes,citationStyles,externalIds'
                            }), {
                                headers: { 'X-API-KEY': S2_API_KEY }
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const data = await response.json();
                            console.log(data);
                            webview.postMessage({ command: 'results', data: data.data });
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