const vscode = require('vscode');
const modelIndexService = require('../../services/modelIndexService');
console.log('1111111111111111trigererrrrrrrrrrr')

class ManifestDependsCompletionProvider {
    constructor() {}

    async provideCompletionItems(document, position) {
        console.log('trigererrrrrrrrrrr')
        const line = document.lineAt(position).text;
        const textBefore = line.substring(0, position.character);

        // Only trigger inside depends list: depends = [ ... ] or depends: [ ... ]
        // Support both JSON and Python dict formats
        const dependsMatch = /depends\s*[:=]\s*\[[^\]]*$/;
        if (!dependsMatch.test(textBefore)) return undefined;

        // Extract the partial module name being typed
        const partialMatch = textBefore.match(/['\"]([a-zA-Z0-9_\-]*)$/);
        const partial = partialMatch ? partialMatch[1] : '';

        // Get all module names in the workspace
        const moduleNames = await modelIndexService.getAllModuleNames();
        return moduleNames
            .filter(name => name.startsWith(partial))
            .map(name => {
                const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Module);
                item.insertText = name;
                item.detail = 'Odoo Module';
                return item;
            });
    }
}

module.exports = ManifestDependsCompletionProvider; 