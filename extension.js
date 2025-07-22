const vscode = require('vscode');
const { registerModelProviders } = require('./src/providers/odooModelProvider');
const { registerFieldProviders } = require('./src/providers/odooCompletionProvider');
const { registerCommands } = require('./src/commands/commandHandlers');
const { runOdooLint } = require('./src/services/odooLinter');
const modelIndexService = require('./src/services/modelIndexService');
const templateIndexService = require('./src/services/templateIndexService');
const OdooXmlCompletionProvider = require('./src/providers/xml/xmlCompletionProvider');
const RelationalFieldCompletionProvider = require('./src/providers/completion/relationalFieldProvider');
const ImportCompletionProvider = require('./src/providers/completion/importCompletionProvider');
const ManifestDependsCompletionProvider = require('./src/providers/completion/manifestDependsCompletionProvider');
const OdooDefinitionProvider = require('./src/providers/odooDefinitionProvider');

function activate(context) {
    // Initialize index services
    modelIndexService.initialize();
    modelIndexService.buildCache();
    templateIndexService.initialize();

    // Register model providers
    registerModelProviders(context);

    // Register field providers
    registerFieldProviders(context);

    // Register XML completion provider
    const xmlProvider = new OdooXmlCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'xml' },
            xmlProvider,
            '"', "'", '=', ' ', '>'
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

    // ✅ Register import completion provider (was missing in second version)
    const importProvider = new ImportCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'python' },
            importProvider
        )
    );

    // Register manifest depends completion provider
    const manifestDependsProvider = new ManifestDependsCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: '*', pattern: '**/__manifest__.py' },
                { scheme: 'file', language: '*', pattern: '**/__manifest__.json' }
            ],
            manifestDependsProvider,
            "'", '"', ',', '[', ' '
        )
    );

    // Register Odoo definition provider
    const odooDefProvider = new OdooDefinitionProvider();
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'xml' },
            odooDefProvider
        )
    );
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'python' },
            odooDefProvider
        )
    );

    // Register commands
    registerCommands(context);

    // Odoo Linting Setup
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

    // Re-run linting when relevant config changes
    vscode.workspace.onDidChangeConfiguration(
        e => {
            if (e.affectsConfiguration('cybrosys-assista-odoo-helper.enableCodeStandardWarnings')) {
                vscode.workspace.textDocuments.forEach(doc => runOdooLint(doc, diagnosticCollection));
            }
        },
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
