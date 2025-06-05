const vscode = require('vscode');

class ClassTemplateProvider {
    constructor() {
        this.templates = [
            {
                label: 'odoo_model_class',
                detail: 'Create New Odoo Model Class',
                insertText: [
                    'class ${1:ModelName}(models.Model):',
                    '    _name = \'${2:model.name}\'',
                    '    _description = \'${3:Model Description}\'',
                    '',
                    '    name = fields.Char(string=\'Name\', required=True)',
                    '    active = fields.Boolean(default=True)',
                    '    company_id = fields.Many2one(\'res.company\', string=\'Company\', default=lambda self: self.env.company)',
                    '    currency_id = fields.Many2one(\'res.currency\', related=\'company_id.currency_id\', string=\'Currency\')',
                    '',
                    '    @api.model',
                    '    def create(self, vals):',
                    '        return super(${1:ModelName}, self).create(vals)',
                    '',
                    '    def write(self, vals):',
                    '        return super(${1:ModelName}, self).write(vals)',
                    '',
                    '    def unlink(self):',
                    '        return super(${1:ModelName}, self).unlink()'
                ].join('\n')
            },
            {
                label: 'odoo_abstract_class',
                detail: 'Create New Odoo AbstractModel Class',
                insertText: [
                    'class ${1:AbstractName}(models.AbstractModel):',
                    '    _name = \'${2:abstract.name}\'',
                    '    _description = \'${3:Abstract Model Description}\'',
                    '',
                    '    name = fields.Char()'
                ].join('\n')
            },
            {
                label: 'odoo_transient_class',
                detail: 'Create New Odoo TransientModel Class',
                insertText: [
                    'class ${1:TransientName}(models.TransientModel):',
                    '    _name = \'${2:transient.name}\'',
                    '    _description = \'${3:Transient Model Description}\'',
                    '',
                    '    name = fields.Char()'
                ].join('\n')
            }
        ];
    }

    provideCompletionItems(document, position) {
        const currentLine = document.lineAt(position).text;
        
        // Check if we're at the start of a class definition
        if (currentLine.trim().startsWith('class')) {
            return this.templates.map(template => {
                const item = new vscode.CompletionItem(template.label, vscode.CompletionItemKind.Snippet);
                item.detail = template.detail;
                item.insertText = new vscode.SnippetString(template.insertText);
                return item;
            });
        }

        return [];
    }
}

module.exports = ClassTemplateProvider; 