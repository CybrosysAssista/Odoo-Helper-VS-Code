const vscode = require('vscode');

class OdooXmlCompletionProvider {
    constructor() {
        this.xmlTags = [
            'record',
            'field',
            'menuitem',
            'template',
            'xpath',
            'data',
            'odoo',
            'form',
            'tree',
            'search',
            'kanban',
            'calendar',
            'gantt',
            'graph',
            'pivot',
            'action',
            'report',
            'template',
            'view',
            'wizard'
        ];

        this.fieldTypes = [
            'char',
            'text',
            'html',
            'integer',
            'float',
            'boolean',
            'date',
            'datetime',
            'binary',
            'selection',
            'many2one',
            'one2many',
            'many2many',
            'reference',
            'monetary',
            'json'
        ];

        this.attributes = {
            'record': ['id', 'model', 'name'],
            'field': ['name', 'type', 'string', 'required', 'readonly', 'invisible', 'domain', 'context', 'on_change', 'widget', 'options', 'groups', 'help'],
            'menuitem': ['id', 'name', 'parent', 'sequence', 'action', 'web_icon', 'groups'],
            'template': ['id', 'name', 'inherit_id', 'primary', 'priority'],
            'xpath': ['expr', 'position', 'version'],
            'view': ['id', 'name', 'model', 'inherit_id', 'mode', 'create', 'edit', 'delete', 'duplicate', 'multi_edit'],
            'form': ['string', 'create', 'edit', 'delete', 'duplicate', 'multi_edit'],
            'tree': ['string', 'create', 'edit', 'delete', 'duplicate', 'multi_edit', 'decoration-info', 'decoration-success', 'decoration-warning', 'decoration-danger'],
            'search': ['string'],
            'kanban': ['string', 'create', 'edit', 'delete', 'duplicate', 'multi_edit', 'class', 'default_group_by', 'default_order', 'quick_create', 'quick_edit'],
            'calendar': ['string', 'create', 'edit', 'delete', 'duplicate', 'multi_edit', 'date_start', 'date_stop', 'date_delay', 'color', 'form_view_id', 'quick_add', 'all_day', 'mode'],
            'gantt': ['string', 'create', 'edit', 'delete', 'duplicate', 'multi_edit', 'date_start', 'date_stop', 'date_delay', 'color', 'form_view_id', 'quick_add', 'all_day', 'mode'],
            'graph': ['string', 'type', 'stacked'],
            'pivot': ['string', 'display_quantity', 'group_by'],
            'action': ['id', 'name', 'res_model', 'view_mode', 'view_id', 'view_type', 'target', 'context', 'domain', 'limit', 'help', 'binding_model_id', 'binding_type', 'binding_view_types'],
            'report': ['id', 'name', 'model', 'report_type', 'report_name', 'report_file', 'print_report_name', 'attachment', 'attachment_use', 'paperformat_id', 'header', 'groups', 'multi', 'bind_report_type']
        };
    }

    provideCompletionItems(document, position) {
        const textUntilPosition = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const currentLine = document.lineAt(position).text;
        
        // Check if we're inside a tag
        const tagMatch = /<([^>]*)$/.exec(currentLine);
        if (tagMatch) {
            return this.provideTagCompletions(tagMatch[1]);
        }

        // Check if we're inside an attribute
        const attributeMatch = /<[^>]*\s+([^=]*)$/.exec(currentLine);
        if (attributeMatch) {
            const tagName = this.getCurrentTag(textUntilPosition);
            return this.provideAttributeCompletions(tagName, attributeMatch[1]);
        }

        return [];
    }

    provideTagCompletions(partialTag) {
        return this.xmlTags
            .filter(tag => tag.startsWith(partialTag))
            .map(tag => new vscode.CompletionItem(tag, vscode.CompletionItemKind.Class));
    }

    provideAttributeCompletions(tagName, partialAttribute) {
        const attributes = this.attributes[tagName] || [];
        return attributes
            .filter(attr => attr.startsWith(partialAttribute))
            .map(attr => {
                const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
                item.insertText = new vscode.SnippetString(`${attr}="$1"`);
                return item;
            });
    }

    getCurrentTag(text) {
        const tagMatch = /<([^/\s>]+)[^>]*$/.exec(text);
        return tagMatch ? tagMatch[1].toLowerCase() : null;
    }
}

module.exports = OdooXmlCompletionProvider; 