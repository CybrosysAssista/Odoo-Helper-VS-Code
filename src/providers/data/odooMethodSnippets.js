const methodSuggestions = [
    {
        label: 'Odoo Create Method',
        insertText: '@api.model_create_multi\n' +
                    'def create(self, vals_list):\n' +
                    '    # Pre-create logic (optional)\n' +
                    '    records = super().create(vals_list)\n' +
                    '    # Post-create logic (optional)\n' +
                    '    return records\n',
        detail: 'Create Method',
        documentation: 'Override the create method for the model.'
    },
    {
        label: 'Odoo Write Method',
        insertText: 'def write(self, values):\n' +
                    '    # Pre-write logic (optional)\n' +
                    '    res = super().write(values)\n' +
                    '    # Post-write logic (optional)\n' +
                    '    return res\n',
        detail: 'Write Method',
        documentation: 'Override the write method for the model.'
    },
    {
        label: 'Odoo Unlink Method',
        insertText: 'def unlink(self):\n' +
                    '    # Pre-unlink logic (optional)\n' +
                    '    res = super().unlink()\n' +
                    '    # Post-unlink logic (optional)\n' +
                    '    return res\n',
        detail: 'Unlink Method',
        documentation: 'Override the unlink (delete) method.'
    },
    {
        label: 'Odoo Onchange Method',
        insertText: '@api.onchange(\'field_name\')\n' +
                    'def _onchange_field_name(self):\n' +
                    '    # Code to execute on field change\n' +
                    '    pass\n',
        detail: 'Onchange Method',
        documentation: 'Define an onchange handler.'
    },
    {
        label: 'Odoo Compute Method',
        insertText: '@api.depends(\'field_name\')\n' +
                    'def _compute_field_name(self):\n' +
                    '    for rec in self:\n' +
                    '        # Compute field value logic\n' +
                    '        rec.field_name = \n',
        detail: 'Compute Method',
        documentation: 'Define a computed field function.'
    },
    {
        label: 'Odoo Constraints Method',
        insertText: '@api.constrains(\'field_name\')\n' +
                    'def _check_field_name(self):\n' +
                    '    for rec in self:\n' +
                    '        if not rec.field_name:\n' +
                    '            raise ValidationError("Field name must be set")\n',
        detail: 'Constraints Method',
        documentation: 'Add Python constraint validation.'
    }
];

module.exports = methodSuggestions;