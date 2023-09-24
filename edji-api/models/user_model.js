/* global JXPSchema */
var friendly = require("mongoose-friendly");

var UserSchema = new JXPSchema({
	name: { type: String },
	urlid: { type: String, unique: true, index: true },
	email: { type: String, unique: true, index: true, set: toLower },
	password: String,
	admin: Boolean,
	temp_hash: String,
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
			"search": true,
			"sort": true,
			"filter": false,
			"sort_dir": 1,
		},
		{
			"label": "Email",
			"name": "email",
			"type": "email",
			"search": true,
			"sort": true,
			"filter": false,
			"sort_dir": 1,
			d: "return `<a href='mailto:${row.email}'>${row.email}</a>`"
		},
		{
			"label": "Admin",
			"name": "admin",
			"type": "boolean",
			"search": false,
			"sort": true,
			"filter": true,
			"sort_dir": 1,
			d: "return row.admin ? 'Yes' : 'No'"
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

function toLower (v) {
	if (v)
		return v.toLowerCase();
	return null;
}

const UserModel = JXPSchema.model('User', UserSchema);
module.exports = UserModel;