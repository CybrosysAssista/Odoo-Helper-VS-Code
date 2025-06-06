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
        documentation: 'Overrides the model’s `create` method to customize record creation.\n\n'
                     + 'Example:\n'
                     + '@api.model_create_multi\n'
                     + 'def create(self, vals_list):\n'
                     + '    records = super().create(vals_list)\n'
                     + '    # Custom logic here\n'
                     + '    return records'
    },
    {
        label: 'Odoo Write Method',
        insertText: 'def write(self, values):\n' +
                    '    # Pre-write logic (optional)\n' +
                    '    res = super().write(values)\n' +
                    '    # Post-write logic (optional)\n' +
                    '    return res\n',
        detail: 'Write Method',
        documentation: 'Overrides the model’s `write` method to add custom behavior during updates.\n\n'
                     + 'Example:\n'
                     + 'def write(self, values):\n'
                     + '    res = super().write(values)\n'
                     + '    # Custom logic here\n'
                     + '    return res'
    },
    {
        label: 'Odoo Unlink Method',
        insertText: 'def unlink(self):\n' +
                    '    # Pre-unlink logic (optional)\n' +
                    '    res = super().unlink()\n' +
                    '    # Post-unlink logic (optional)\n' +
                    '    return res\n',
        detail: 'Unlink Method',
        documentation: 'Overrides the model’s `unlink` method to customize deletion behavior.\n\n'
                     + 'Example:\n'
                     + 'def unlink(self):\n'
                     + '    # Check conditions or log deletion\n'
                     + '    return super().unlink()'
    },
    {
        label: 'Odoo Onchange Method',
        insertText: '@api.onchange(\'${1:field_name}\')\n' +
                    'def _onchange_${1:field_name}(self):\n' +
                    '    if self.${1:field_name}:\n' +
                    '        self.${2:target_field} = ${3:value}\n',
        detail: 'Onchange Method',
        documentation: 'Automatically triggers when the given field value changes.\n\n'
                     + 'Example:\n'
                     + '@api.onchange(\'country_id\')\n'
                     + 'def _onchange_country_id(self):\n'
                     + '    if self.country_id:\n'
                     + '        self.state_id = False'
    },
    {
        label: 'Odoo Compute Method',
        insertText: "${1:field_name} = fields.${2:FieldType}(string='${3:Field Label}', compute='_compute_${1:field_name}', store=True)\n" +
                    "\n" +
                    "@api.depends('${4:dependency_field}')\n" +
                    "def _compute_${1:field_name}(self):\n" +
                    "    for rec in self:\n" +
                    "        # Compute logic\n" +
                    "        rec.${1:field_name} = ${5:value}\n",
        detail: 'Compute Method',
        documentation: 'Defines a computed field along with its compute method.\n\n'
                    + 'Example:\n'
                    + "total_price = fields.Float(string='Total Price', compute='_compute_total_price', store=True)\n\n"
                    + "@api.depends('unit_price', 'quantity')\n"
                    + "def _compute_total_price(self):\n"
                    + "    for rec in self:\n"
                    + "        rec.total_price = rec.unit_price * rec.quantity"
    },
    {
        label: 'Odoo Constraints Method',
        insertText: '@api.constrains(\'${1:field_name}\')\n' +
                    'def _check_${1:field_name}(self):\n' +
                    '    for rec in self:\n' +
                    '        if not rec.${1:field_name}:\n' +
                    '            raise ValidationError("${1:field_name} must be set")\n',
        detail: 'Constraints Method',
        documentation: 'Adds server-side validation logic using constraints.\n\n'
                     + 'Example:\n'
                     + '@api.constrains(\'email\')\n'
                     + 'def _check_email(self):\n'
                     + '    for rec in self:\n'
                     + '        if not rec.email:\n'
                     + '            raise ValidationError("Email is required")'
    }
];

module.exports = methodSuggestions;