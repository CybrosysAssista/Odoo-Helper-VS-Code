const vscode = require('vscode');

class ApiDecoratorCompletionProvider {
    constructor() {
        this.decorators = [
            {
                name: 'api.depends',
                snippet: '@api.depends(\'${1:field_name}\')',
                documentation: 'Decorator for computed fields that depend on other fields'
            },
            {
                name: 'api.onchange',
                snippet: '@api.onchange(\'${1:field_name}\')',
                documentation: 'Decorator for onchange methods that are triggered when a field changes'
            },
            {
                name: 'api.constrains',
                snippet: '@api.constrains(\'${1:field_name}\')',
                documentation: 'Decorator for constraint methods that validate field values'
            },
            {
                name: 'api.model',
                snippet: '@api.model',
                documentation: 'Decorator for model methods that don\'t need a recordset'
            },
            {
                name: 'api.multi',
                snippet: '@api.multi',
                documentation: 'Decorator for methods that work on a recordset'
            },
            {
                name: 'api.one',
                snippet: '@api.one',
                documentation: 'Decorator for methods that work on a single record'
            },
            {
                name: 'api.returns',
                snippet: '@api.returns(\'${1:model_name}\')',
                documentation: 'Decorator that specifies the return type of a method'
            }
        ];
    }

    provideCompletionItems(document, position) {
        const currentLine = document.lineAt(position).text;
        
        // Check if we're after @api.
        const apiMatch = /@api\.([^)]*)$/.exec(currentLine);
        if (apiMatch) {
            const partialDecorator = apiMatch[1];
            return this.provideDecoratorCompletions(partialDecorator);
        }

        // Check if we're after @api.depends( or @api.onchange( or @api.constrains(
        const decoratorMatch = /@api\.(depends|onchange|constrains)\(['"]([^'"]*)$/.exec(currentLine);
        if (decoratorMatch) {
            const decoratorType = decoratorMatch[1];
            const partialField = decoratorMatch[2];
            return this.provideFieldCompletions(document, partialField);
        }

        return [];
    }

    provideDecoratorCompletions(partialDecorator) {
        return this.decorators
            .filter(decorator => decorator.name.startsWith('api.' + partialDecorator))
            .map(decorator => {
                const item = new vscode.CompletionItem(decorator.name, vscode.CompletionItemKind.Snippet);
                item.insertText = new vscode.SnippetString(decorator.snippet);
                item.documentation = new vscode.MarkdownString(decorator.documentation);
                return item;
            });
    }

    provideFieldCompletions(document, partialField) {
        const text = document.getText();
        const classMatch = /class\s+(\w+)\s*\([^)]*Model[^)]*\)[^{]*{([^}]*)}/gs.exec(text);
        if (!classMatch) return [];

        const classContent = classMatch[2];
        const fieldRegex = /(\w+)\s*=\s*fields\./g;
        let fieldMatch;
        const fields = [];

        while ((fieldMatch = fieldRegex.exec(classContent)) !== null) {
            fields.push(fieldMatch[1]);
        }

        return fields
            .filter(field => field.startsWith(partialField))
            .map(field => {
                const item = new vscode.CompletionItem(field, vscode.CompletionItemKind.Field);
                item.detail = 'Field';
                return item;
            });
    }
}

module.exports = ApiDecoratorCompletionProvider; 