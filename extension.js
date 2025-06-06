const vscode = require('vscode');
const { registerModelProviders } = require('./src/providers/odooModelProvider');
const { registerFieldProviders } = require('./src/providers/odooCompletionProvider');
const { registerCommands } = require('./src/commands/commandHandlers');
const { runOdooLint } = require('./src/services/odooLinter');
const modelIndexService = require('./src/services/modelIndexService');
const OdooXmlCompletionProvider = require('./src/providers/xml/xmlCompletionProvider');
const RelationalFieldCompletionProvider = require('./src/providers/completion/relationalFieldProvider');
const ImportCompletionProvider = require('./src/providers/completion/importCompletionProvider');

function activate(context) {
    // Initialize model index service
    modelIndexService.initialize();
    modelIndexService.buildCache();

    // Register model providers
    registerModelProviders(context);

    // Register field providers
    registerFieldProviders(context);

    // Register XML completion provider
    const xmlProvider = new OdooXmlCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'xml' },
            xmlProvider
        )
    );

    // Register relational field completion provider
    const relationalFieldProvider = new RelationalFieldCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'python' },
            relationalFieldProvider
        )
    );


    // Register import completion provider
    const importProvider = new ImportCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'python' },
            importProvider
        )
    );

    // Register commands
    registerCommands(context);

    // 🆕 Odoo Linting Setup
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("odooLint");
    context.subscriptions.push(diagnosticCollection);

    vscode.workspace.textDocuments.forEach(doc => runOdooLint(doc, diagnosticCollection));

    vscode.workspace.onDidOpenTextDocument(
        doc => runOdooLint(doc, diagnosticCollection),
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        e => runOdooLint(e.document, diagnosticCollection),
        null,
        context.subscriptions
    );

    vscode.workspace.onDidSaveTextDocument(
        doc => runOdooLint(doc, diagnosticCollection),
        null,
        context.subscriptions
    );
}

function deactivate() {
    modelIndexService.dispose();
}

module.exports = {
    activate,
    deactivate
};
