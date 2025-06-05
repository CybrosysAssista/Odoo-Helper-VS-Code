const vscode = require('vscode');

class ImportCompletionProvider {
    constructor() {
        this.imports = [
            {
                label: 'odoo_import_fields',
                detail: 'Import Odoo fields',
                insertText: 'from odoo import fields'
            },
            {
                label: 'odoo_import_models',
                detail: 'Import Odoo models',
                insertText: 'from odoo import models'
            },
            {
                label: 'odoo_import_api',
                detail: 'Import Odoo API',
                insertText: 'from odoo import api'
            },
            {
                label: 'odoo_import_tools',
                detail: 'Import Odoo tools',
                insertText: 'from odoo import tools'
            },
            {
                label: 'odoo_import_config',
                detail: 'Import Odoo config',
                insertText: 'from odoo.tools import config'
            },
            {
                label: 'odoo_import_date_utils',
                detail: 'Import Odoo date_utils',
                insertText: 'from odoo.tools import date_utils'
            },
            {
                label: 'odoo_import_common',
                detail: 'Import common Odoo modules',
                insertText: 'from odoo import api, fields, models'
            }
        ];
    }

    provideCompletionItems(document, position) {
        const currentLine = document.lineAt(position).text;
        
        // Check if we're after 'from' or 'import'
        if (currentLine.trim().startsWith('from') || currentLine.trim().startsWith('import')) {
            return this.imports.map(imp => {
                const item = new vscode.CompletionItem(imp.label, vscode.CompletionItemKind.Snippet);
                item.detail = imp.detail;
                item.insertText = new vscode.SnippetString(imp.insertText);
                return item;
            });
        }

        return [];
    }
}

module.exports = ImportCompletionProvider; 