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

UserSchema.table_view = {
	fields: {"name": "string", "email": "email", "admin": "boolean" },
	default_sort_field: "name",
	search_fields: ["name", "email"],
	sort_fields: ["name", "email"],
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