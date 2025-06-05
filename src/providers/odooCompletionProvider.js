const vscode = require('vscode');
const odooFieldTypes = require('./data/odooFieldTypes');
const odooDecorators = require('./data/odooDecorators');
const odooFieldAttributes = require('./data/odooFieldAttributes');
const fieldSnippets = require('./data/odooFieldSnippets');
const methodSuggestions = require('./data/odooMethodSnippets');

function registerFieldProviders(context) {
    const fieldTypeProvider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(document, position) {
            const line = document.lineAt(position).text;
            const textBefore = line.substring(0, position.character);

            // Match fields.SomeText, extract "SomeText"
            const match = textBefore.match(/fields\.([a-zA-Z]*)$/);
            if (!match) return undefined;

            const typed = match[1];

            return odooFieldTypes
                .filter(type => type.toLowerCase().startsWith(typed.toLowerCase()))
                .map(type => {
                const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Property);
                item.insertText = new vscode.SnippetString(`${type}(string="$1")`);
                item.detail = 'Odoo Field Type';
                item.documentation = `odoo.fields.${type}`;
                return item;
                });
            }
        },
        "."
    );
    context.subscriptions.push(fieldTypeProvider);

    const methodDecoratorProvider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(document, position) {
                const line = document.lineAt(position);
                const textBefore = line.text.substring(0, position.character);
                if (!textBefore.trim().endsWith("@")) return undefined;
                return odooDecorators.map(type => {
                    const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Keyword);
                    item.insertText = type;
                    item.detail = 'Odoo Method Decorators';
                    item.documentation = `Decorator for Odoo method: ${type}`;
                    return item;
                });
            }
        },
        "@"
    );
    context.subscriptions.push(methodDecoratorProvider);

    const fieldAttributesProvider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(document, position) {
                const line = document.lineAt(position);
                const textBefore = line.text.substring(0, position.character);
                if (!textBefore.includes('fields.')) return undefined;
                
                return odooFieldAttributes.map(attr => {
                    const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
                    item.insertText = `${attr}=`;
                    item.detail = 'Odoo Field Attribute';
                    item.documentation = `Field attribute: ${attr}`;
                    return item;
                });
            }
        },
        "="
    );
    context.subscriptions.push(fieldAttributesProvider);

const odooKeywordProvider = vscode.languages.registerCompletionItemProvider(
    'python',
    {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position);
            line.text.substring(0, position.character);

            const suggestions = [];

            // Add new model class suggestion
            const newModelItem = new vscode.CompletionItem('Odoo New Model Class', vscode.CompletionItemKind.Class);
            newModelItem.sortText = 'odoo new model class';
            newModelItem.insertText = new vscode.SnippetString(
                'from odoo import fields,models \n' +
                '\n' +
                'class ${1:ModelName}(models.Model):\n' +
                '    _name = \'${2:model.name}\'\n' +
                '    _description = \'${3:Model Description}\'\n' +
                '\n' +
                '    name = fields.Char(string=\'${4:Name}\', required=True)\n' +
                '    ${0}'
            );
            newModelItem.detail = 'Create a new Odoo model class';
            newModelItem.documentation = new vscode.MarkdownString(
                '### Odoo Model Class\n\n' +
                'Scaffold a new Odoo model class with a basic structure.\n\n' +
                '**Includes:**\n' +
                '- Import statement\n' +
                '- Model class with `_name` and `_description`\n' +
                '- Example field\n\n' +
                '**Example:**\n' +
                '```python\n' +
                'from odoo import fields,models\n' +
                '\n' +
                'class MyModel(models.Model):\n' +
                '    _name = \'my.model\'\n' +
                '    _description = \'My Model Description\'\n' +
                '\n' +
                '    name = fields.Char(string=\'Name\', required=True)\n' +
                '```'
            );
            suggestions.push(newModelItem);

            // Add inherited model class suggestion
            const inheritedModelItem = new vscode.CompletionItem('Odoo Inherited Model Class', vscode.CompletionItemKind.Class);
            inheritedModelItem.sortText = 'odoo inherited model class';
            inheritedModelItem.insertText = new vscode.SnippetString(
                'from odoo import fields,models\n' +
                '\n' +
                'class ${1:ModelName}(models.Model):\n' +
                '    _inherit = \'${2:model.to.inherit}\'\n' +
                '    _description = \'${3:Model Description}\'\n' +
                '\n' +
                '    ${4:new_field} = fields.Char(string=\'${5:New Field}\')\n' +
                '    ${0}'
            );
            inheritedModelItem.detail = 'Create an inherited Odoo model class';
            inheritedModelItem.documentation = new vscode.MarkdownString(
                '### Inherited Odoo Model\n\n' +
                'Create an inherited Odoo model class to extend an existing model with custom fields or logic.\n\n' +
                '**Includes:**\n' +
                '- `from odoo import fields,models ` import line\n' +
                '- `_inherit` and `_description` setup\n' +
                '- Example of a custom field\n\n' +
                '**Example:**\n' +
                '```python\n' +
                'from odoo import fields,models\n' +
                '\n' +
                'class ResPartner(models.Model):\n' +
                '    _inherit = \'res.partner\'\n' +
                '    _description = \'Extended Partner Model\'\n\n' +
                '    new_field = fields.Char(string=\'New Field\')\n' +
                '```\n\n' +
                'Use this when you need to customize core Odoo models like `res.partner`, `sale.order`, etc.'
            );
            suggestions.push(inheritedModelItem);

            // Add all decorators with enhanced documentation
            odooDecorators.forEach(decorator => {
                const item = new vscode.CompletionItem(`@${decorator}`, vscode.CompletionItemKind.Snippet);
                item.sortText = `odoo_decorator_${String(decorator).toLowerCase()}`;
                
                item.insertText = new vscode.SnippetString(
                    `@${decorator}\n` +
                    `def \${1:method_name}(self):\n` +
                    `    \${0:pass}`
                );

                item.detail = 'Odoo Method Decorator';
                item.documentation = new vscode.MarkdownString(
                    `### \`@${decorator}\`\n\n` +
                    `Odoo method decorator for specific behaviors.\n\n` +
                    `**Usage:**\n` +
                    '```python\n' +
                    `@${decorator}\n` +
                    `def your_method(self):\n` +
                    `    pass\n` +
                    '```\n\n' +
                    (decorator === 'api.model' ? '**Used for methods that don’t need access to a recordset (no `self` loop).**' :
                    decorator === 'api.depends' ? '**Used to specify fields this method depends on.**' :
                    decorator === 'api.onchange' ? '**Used for methods triggered by field changes in forms.**' :
                    decorator === 'api.constrains' ? '**Used for validation constraints on field values.**' :
                    '**Standard Odoo API decorator.**')
                );
                suggestions.push(item);
            });

            // Add all field snippets with enhanced documentation
            fieldSnippets.forEach(snippet => {
                const item = new vscode.CompletionItem(snippet.label, vscode.CompletionItemKind.Field);
                item.sortText = `odoo field ${String(snippet.label).toLowerCase()}`;
                item.insertText = snippet.insertText;
                item.detail = snippet.detail;
                item.documentation = new vscode.MarkdownString(
                    `### ${snippet.label}\n\n` +
                    `${snippet.documentation}`
                );
                suggestions.push(item);
            });

            // Add method suggestions
            methodSuggestions.forEach(method => {
                const item = new vscode.CompletionItem(method.label, vscode.CompletionItemKind.Method);
                item.sortText = `odoo method ${String(method.label).toLowerCase()}`;
                item.insertText = new vscode.SnippetString(method.insertText);
                item.detail = method.detail;
                item.documentation = new vscode.MarkdownString(
                    `### ${method.label}\n\n` +
                    `${method.documentation}`
                );
                suggestions.push(item);
            });

            return suggestions;
        }
    },
    'o'
);
context.subscriptions.push(odooKeywordProvider);
}

module.exports = {  
    registerFieldProviders
}; 