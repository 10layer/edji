/* global JXPSchema */
var friendly = require("mongoose-friendly");

var UserSchema = new JXPSchema({
	name: { type: String, index: true, required: true },
	urlid: { type: String, unique: true, index: true },
	email: { type: String, unique: true, index: true, set: toLowerTrim, required: true },
	password: { type: String, required: true },
	admin: Boolean
},
{
	perms: {
		admin: "crud",
		owner: "cru",
		user: "r",
		member: "r",
		api: "r",
		all: ""
	}
});

UserSchema.table_def = {
	fields: [
		{
			"label": "Name",
			"name": "name",
			"type": "text",
			"link": {
				"collection": "user",
				"field": "urlid"
			},
			"required": true,
			"search": true,
			"sort": true,
			"filter": false,
			"sort_dir": 1,
			"views": ["list", "edit", "create"]
		},
		{
			"label": "Email",
			"name": "email",
			"type": "email",
			"required": true,
			"search": true,
			"sort": true,
			"filter": false,
			"sort_dir": 1,
			d: "return `<a href='mailto:${row.email}'>${row.email}</a>`",
			"views": ["list", "edit", "create"]
		},
		{
			"label": "Admin",
			"name": "admin",
			"type": "boolean",
			"search": false,
			"sort": true,
			"filter": true,
			"sort_dir": 1,
			d: "return row.admin ? 'Yes' : 'No'",
			"views": ["list", "edit", "create"]
		},
		{
			"label": "Password",
			"name": "password",
			"type": "password",
			"required": true,
			"search": false,
			"sort": false,
			"filter": false,
			d: "return '**********'",
			"views": ["create"]
		}
	],
	singular: "user",
	plural: "users",
}

UserSchema.path('name').validate(function (v) {
	return (v) && (v.length > 0);
}, 'Name cannot be empty');

UserSchema.plugin(friendly, {
	source: 'name',
	friendly: 'urlid'
});

function toLowerTrim (v) {
	if (!v) return null;
	if (typeof v === 'string')
		return v.toLowerCase().trim();
	return v;
}

const UserModel = JXPSchema.model('User', UserSchema);
module.exports = UserModel;