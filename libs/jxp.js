const restify = require("restify");
const path = require("path");
const security = require("./security");
const datamunging = require("./datamunging");
const login = require("./login");
const groups = require("./groups");
const setup = require("./setup");
const querystring = require("querystring");
const fs = require("fs");
const morgan = require("morgan");
const Cache = require("./cache");
const ws = require("./ws");

const cache = new Cache();
var models = {};

var model_dir = "";

var ops = 0;

// Middleware
const middlewareModel = (req, res, next) => {
	var modelname = req.params.modelname;
	req.modelname = modelname;
	// console.log("Model", modelname);
	try {
		req.Model = models[modelname];
		return next();
	} catch (err) {
		console.error(new Date, err);
		return res.send(404, { status: "error", error: err, message: `Model ${modelname} not found` });
	}
};

const middlewarePasswords = (req, res, next) => {
	if (req.body && req.body.password && !req.query.password_override) {
		req.body.password = security.encPassword(req.body.password);
	}
	next();
};

const middlewareCheckAdmin = (req, res, next) => {
	//We don't want users to pump up their own permissions
	if (req.modelname !== "user") return next();
	if (res.user.admin) return next();
	req.params.admin = false;
	next();
};

// Outputs whatever is in res.result as JSON
const outputJSON = (req, res) => {
	res.send(res.result);
}

// Outputs whatever is in res.result as CSV
const outputCSV = (req, res) => {
	const json2csv = require('json2csv').parse;
	const opts = { "flatten": true };
	if (!res.result.data) {
		return res.send(500, "Not CSVable data");
	}
	try {
		const data = res.result.data.map(row => row._doc);
		if (!data.length) {
			throw("")
		}
		res.writeHead(200, {
			'Content-Type': 'text/csv',
			'Content-Disposition': 'attachment; filename=export.csv'
		});
		const csv = json2csv(data, opts);
		res.end(csv);
	} catch (err) {
		console.error(err);
		res.send(500, err);
	}
}

// Actions (verbs)
const actionGet = async (req, res, next) => {
	const opname = `get ${req.modelname} ${ops++}`;
	console.time(opname);
	const parseSearch = function(search) {
		let result = {};
		for (let i in search) {
			result[i] = new RegExp(search[i], "i");
		}
		return result;
	};

	var filters = {};
	try {
		filters = parseFilter(req.query.filter);
	} catch (err) {
		console.trace(new Date(), err);
		res.send(500, { status: "error", error: err, message: err.toString() });
		return;
	}
	var search = parseSearch(req.query.search);
	for (var i in search) {
		filters[i] = search[i];
	}
	var qcount = req.Model.find(filters);
	var q = req.Model.find(filters);
	var checkDeleted = [{ _deleted: false }, { _deleted: null }];
	if (!req.query.showDeleted) {
		qcount.or(checkDeleted);
		q.or(checkDeleted);
	}
	if (req.query.search) {
		// console.log({ search: req.query.search });
		q = req.Model.find({ $text: { $search: req.query.search }}, { score : { $meta: "textScore" } }).sort( { score: { $meta : "textScore" } } );
		qcount = req.Model.find({ $text: { $search: req.query.search }});
	}
	try {
		const count = await qcount.countDocuments();
		const result = { count };
		const limit = parseInt(req.query.limit);
		if (limit) {
			q.limit(limit);
			result.limit = limit;
			let page_count = Math.ceil(count / limit);
			result.page_count = page_count;
			let page = parseInt(req.query.page);
			page = page ? page : 1;
			result.page = page;
			if (page < page_count) {
				result.next = changeUrlParams(req, "page", page + 1);
			}
			if (page > 1) {
				result.prev = changeUrlParams(req, "page", page - 1);
				q.skip(limit * (page - 1));
			}
		}
		if (req.query.sort) {
			q.sort(req.query.sort);
			result.sort = req.query.sort;
		}
		if (req.query.populate) {
			if ((typeof req.query.populate === "object") && !Array.isArray(req.query.populate)) {
				for (let i in req.query.populate) {
					q.populate(i, req.query.populate[i].replace(",", " "));
				}
			} else {
				q.populate(req.query.populate);
			}
			result.populate = req.query.populate;	
		}
		if (req.query.autopopulate) {
			for (let key in req.Model.schema.paths) {
				const dirpath = req.Model.schema.paths[key];
				if (dirpath.instance == "ObjectID" && dirpath.options.link) {
					q.populate(String(dirpath.options.map_to || dirpath.options.virtual || dirpath.options.link.toLowerCase()));
				}
			}
			result.autopopulate = true;
		}
		if (req.query.fields) {
			const fields = req.query.fields.split(",");
			const select = {};
			fields.forEach(field => {
				select[field] = 1;
			});
			q.select(select);
		}
		if (req.query.search) {
			result.search = req.query.search;
		}
		result.data = await q.exec();
		res.result = result;
		console.timeEnd(opname);
		next();
	} catch(err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		res.send(500, { status: "error", message: err.toString() });
	}
};

const actionGetOne = async (req, res) => {
	const opname = `getOne ${req.modelname}/${req.params.item_id} ${ops++}`;
	console.time(opname);
	try {
		const data = await getOne(req.Model, req.params.item_id, req.query);
		res.send({ data });
		console.timeEnd(opname);
	} catch(err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		if (err.msg) {
			res.send(500, { status: "error", message: err.msg });
		} else {
			res.send(500, { status: "error", message: err.toString() });
		}
	}
};

const actionPost = async (req, res, next) => {
	const opname = `post ${req.modelname} ${ops++}`;
	console.time(opname);
	try {
		var item = new req.Model();
		_populateItem(item, datamunging.deserialize(req.body));
		if (res.user) {
			item._owner_id = res.user._id;
			item.__user = res.user;
		}
		const result = await item.save();
		var silence = req.params._silence;
		if (req.body && req.body._silence) silence = true;
		if (!silence) {
			req.config.callbacks.post.call(null, req.modelname, result, res.user);
			ws.postHook.call(null, req.modelname, result, res.user);
		}
		res.json({
			status: "ok",
			message: req.modelname + " created",
			data: item
		});
		console.timeEnd(opname);
		next();
	} catch (err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		res.send(500, { status: "error", message: err.toString() });
	}
};

const actionPut = async (req, res, next) => {
	const opname = `put ${req.modelname}/${req.params.item_id} ${ops++}`;
	console.time(opname);
	try {
		let item = await req.Model.findById(req.params.item_id);
		if (!item) {
			console.error(new Date(), "Document not found");
			res.send(404, { status: "error", message: "Document not found" });
			return;
		}
		_populateItem(item, datamunging.deserialize(req.body));
		_versionItem(item);
		if (res.user) {
			item.__user = res.user;
		}
		const data = await item.save();
		var silence = req.params._silence;
		if (req.body && req.body._silence) silence = true;
		if (!silence) {
			req.config.callbacks.put.call(null, req.modelname, item, res.user );
			ws.putHook.call(null, req.modelname, item, res.user);
		}
		res.json({
			status: "ok",
			message: req.modelname + " updated",
			data: data
		});
		console.timeEnd(opname);
		next();
	} catch (err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		res.send(500, { status: "error", message: err.toString() });
		return;
	}
};

const actionDelete = async (req, res, next) => {
	var silence = req.params._silence;
	if (req.body && req.body._silence) silence = true;
	const opname = `del ${req.modelname}/${req.params.item_id} ${ops++}`;
	console.time(opname);
	try {
		let item = await req.Model.findById(req.params.item_id);
		if (!item) {
			console.error(new Date(), "Couldn't find item for delete");
			res.send(404, "Could not find document");
			return;
		}
		if (res.user) {
			item.__user = res.user;
		}
		if (Object.prototype.hasOwnProperty.call(req.Model.schema.paths, "_deleted")) {
			item._deleted = true;
			_versionItem(item);
			await item.save();
		} else {
			// console.log("Hard deleting");
			await req.Model.deleteOne({ _id: item._id });
		}
		if (!silence) {
			req.config.callbacks.delete.call(
				null,
				req.modelname,
				item,
				res.user,
				{ soft: false }
			);
		}
		res.json({
			status: "ok",
			message: `${req.modelname}/${ req.params.item_id } deleted`
		});
		console.timeEnd(opname);
		next();
	} catch(err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		res.send(500, { status: "error", message: err.toString() });
		return;
	}
};

const actionCall = async (req, res) => {
	// console.log({ action_id: 7, action: "Method called", type: req.modelname, method: req.params.method_name, user: filterLogUser(res.user) });
	req.body = req.body || {};
	req.body.__user = res.user || null;
	try {
		const result = await req.Model[req.params.method_name](req.body);
		res.json(result);
	} catch(err) {
		console.error(new Date(), err);
		res.send(500, { status: "error", message: err.toString() });
	}
};

const actionCallItem = (req, res) => {
	req.Model.findById(req.params.item_id, function(err, item) {
		if (!item) {
			res.send(404, "Document not found for " + req.params.method_name);
			return;
		}
		if (err) {
			console.trace(err);
			res.send(500, { status: "error", message: err.toString() });
			return;
		}
		req.params.__user = res.user || null;
		req.Model[req.params.method_name](item).then(
			function(item) {
				// console.log({ action_id: 7, action: "Method called", type: req.modelname, id: item._id, method: req.params.method_name, user: filterLogUser(res.user) });
				res.json(item);
			},
			function(err) {
				console.trace(err);
				res.send(500, { status: "error", message: err.toString() });
			}
		);
	});
};

// Actions (verbs)
const actionQuery = async (req, res) => {
	if (!req.body || !req.body.query || typeof req.body.query !== "object") {
		console.error("query missing or not of type object")
		return res.send(500, { status: "error", message: "query missing or not of type object" });
	}
	const opname = `query ${req.modelname} ${ops++}`;
	console.time(opname);
	let query = [req.body.query];
	let checkDeleted = { "$or": [{ _deleted: false }, { _deleted: null }] };
	if (!req.query.showDeleted) {
		query.push(checkDeleted);
	}
	var qcount = req.Model.find({ "$and": query });
	var q = req.Model.find({ "$and": query });
	try {
		const count = await qcount.countDocuments();
		const result = { count };
		const limit = parseInt(req.query.limit);
		if (limit) {
			q.limit(limit);
			result.limit = limit;
			let page_count = Math.ceil(count / limit);
			result.page_count = page_count;
			let page = parseInt(req.query.page);
			page = page ? page : 1;
			result.page = page;
			if (page < page_count) {
				result.next = changeUrlParams(req, "page", page + 1);
			}
			if (page > 1) {
				result.prev = changeUrlParams(req, "page", page - 1);
				q.skip(limit * (page - 1));
			}
		}
		if (req.query.sort) {
			q.sort(req.query.sort);
			result.sort = req.query.sort;
		}
		if (req.query.populate) {
			if ((typeof req.query.populate === "object") && !Array.isArray(req.query.populate)) {
				for (let i in req.query.populate) {
					q.populate(i, req.query.populate[i].replace(",", " "));
				}
			} else {
				q.populate(req.query.populate);
			}
			result.populate = req.query.populate;	
		}
		if (req.query.autopopulate) {
			for (let key in req.Model.schema.paths) {
				const dirpath = req.Model.schema.paths[key];
				if (dirpath.instance == "ObjectID" && dirpath.options.link) {
					q.populate(String(dirpath.options.map_to || dirpath.options.virtual || dirpath.options.link));
				}
			}
			result.autopopulate = true;
		}
		if (req.query.fields) {
			const fields = req.query.fields.split(",");
			const select = {};
			fields.forEach(field => {
				select[field] = 1;
			});
			q.select(select);
		}
		result.data = await q.exec();
		res.result = result;
		console.timeEnd(opname);
		res.json(result);
	} catch(err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		res.send(500, { status: "error", message: err.toString() });
	}
};

// Actions (verbs)
const actionAggregate = async (req, res) => {
	if (!req.body || !req.body.query || typeof req.body.query !== "object") {
		console.error("query missing or not of type object")
		return res.send(500, { status: "error", message: "query missing or not of type object" });
	}
	const opname = `aggregate ${req.modelname} ${ops++}`;
	console.time(opname);
	let query = req.body.query;
	try {
		let result = {};
		result.data = await req.Model.aggregate(query);
		res.result = result;
		console.timeEnd(opname);
		res.json(result);
	} catch (err) {
		console.error(new Date(), err);
		console.timeEnd(opname);
		res.send(500, { status: "error", message: err.toString() });
	}
};

// var actionBatch = (req, res, next) => {
// 	console.time("BATCH " + req.modelname);
// 	var items = [];
// 	data = JSON.parse(req.params.json);
// 	data.forEach(function(data) {
// 		var item = new req.Model();
// 		if (res.user) {
// 			item.__user = res.user;
// 		}
// 		_populateItem(item, data);
// 		_versionItem(item);
// 		if (res.user) {
// 			item._owner_id = res.user._id;
// 		}
// 		items.push(item);
// 	});
// 	req.Model.create(items, function(err, docs) {
// 		if (err) {
// 			console.error(err);
// 			res.status(500).send(err.toString());
// 		} else {
// 			// websocket.emit(modelname, { method: "post", _id: result._id });
// 			console.log({ action_id: 8, action: "Batch insert", type: req.modelname, count: items.length, user: filterLogUser(res.user) });
// 			res.send({ message: req.modelname + " created ", data: items.length });
// 			console.timeEnd("BATCH " + req.modelname);
// 			return;
// 		}
// 	});
// };

// Meta

const metaModels = (req, res) => {
	fs.readdir(model_dir, function(err, files) {
		if (err) {
			console.trace(err);
			res.send(500, {
				status: "error",
				message: "Error reading models directory " + model_dir
			});
			return false;
		}
		var models = [];
		files.forEach(function(file) {
			var modelname = path.basename(file, ".js").replace("_model", "");
			try {
				var modelobj = require(path.join(model_dir, file));
				if (
					modelobj.schema &&
					modelobj.schema.get("_perms") &&
					(modelobj.schema.get("_perms").admin ||
						modelobj.schema.get("_perms").user ||
						modelobj.schema.get("_perms").owner ||
						modelobj.schema.get("_perms").all)
				) {
					var model = {
						model: modelname,
						file: file,
						perms: modelobj.schema.get("_perms")
					};
					models.push(model);
				}
			} catch (error) {
				console.error("Error with model " + modelname, error);
			}
		});
		res.send(models);
	});
};

const metaModel = (req, res) => {
	res.send(req.Model.schema.paths);
};

// Utitlities

const getOne = async (Model, item_id, params) => {
	const query = Model.findById(item_id);
	if (params.populate) {
		if ((typeof params.populate === "object")  && !Array.isArray(params.populate)) {
			for (let i in params.populate) {
				query.populate(i, params.populate[i].replace(",", " "));
			}
		} else {
			query.populate(params.populate);
		}
	}
	if (params.autopopulate) {
		for (let key in Model.schema.paths) {
			var dirpath = Model.schema.paths[key];
			if (dirpath.instance == "ObjectID" && dirpath.options.link) {
				query.populate(String(dirpath.options.map_to || dirpath.options.virtual || dirpath.options.link.toLowerCase()));
			}
		}
	}
	try {
		var item = await query.exec();
		if (!item) {
			console.error("Could not find document");
			return Promise.reject({ code: 404, msg: "Could not find document" });
		}
		if (item._deleted && !params.showDeleted) {
			console.error("Document is deleted");
			return Promise.reject({ code: 404, msg: "Document is deleted" });
		}
		item = item.toObject();
		//Don't ever return passwords
		delete item.password;
		return item;
	} catch(err) {
		console.error(err);
		return Promise.reject({ code: 500, msg: err });
	}
};

const parseFilter = (filter) => {
	if (!filter)
		return {};
	if (typeof filter == "object") {
		Object.keys(filter).forEach(function(key) {
			var val = filter[key];
			if (filter[key] === "false") filter[key] = false;
			if (filter[key] === "true") filter[key] = true;
			if (val.indexOf) {
				if (val.indexOf(":") !== -1) {
					var tmp = val.split(":");
					filter[key] = {};
					var tmpkey = tmp.shift();
					let tmpval = tmp.join(":");
					if ((tmpval[0] === "[") && (tmpval[tmpval.length - 1] === "]")) { // Could be an array for a $in or similar
						let arr = tmpval.slice(1, tmpval.length - 1).split(",");
						tmpval = arr;
					}
					filter[key][tmpkey] = tmpval;
				}
				if (typeof val == "object") {
					let result = parseFilter(val);
					filter[key] = {};
					for (var x = 0; x < result.length; x++) {
						filter[key][Object.keys(result[x])[0]] =
							result[x][Object.keys(result[x])[0]];
					}
				}
			}
		});
	}
	return filter;
}

const _deSerialize = (data) => {
	function assign(obj, keyPath, value) {
		// http://stackoverflow.com/questions/5484673/javascript-how-to-dynamically-create-nested-objects-using-object-names-given-by
		const lastKeyIndex = keyPath.length - 1;
		for (let i = 0; i < lastKeyIndex; ++i) {
			let key = keyPath[i];
			if (!(key in obj)) obj[key] = {};
			obj = obj[key];
		}
		obj[keyPath[lastKeyIndex]] = value;
	}
	for (var datum in data) {
		var matches = datum.match(/\[(.+?)\]/g);
		if (matches) {
			var params = matches.map(function(match) {
				return match.replace(/[[\]]/g, "");
			});
			if (isNaN(params[0])) {
				params.unshift(datum.match(/(.+?)\[/)[1]);
				assign(data, params, data[datum]);
			}
		}
	}
};

const _populateItem = (item, data) => {
	_deSerialize(data);
	for (let prop in item) {
		if (typeof data[prop] != "undefined") {
			item[prop] = data[prop];
			// Unset any blank values - essentially 'deleting' values on editing
			if (data[prop] === "") {
				item[prop] = null;
			}
		}
		//Check for arrays that come in like param[1]=blah, param[2]=yack
		if (data[prop + "[0]"]) {
			var x = 0;
			var tmp = [];
			while (data[prop + "[" + x + "]"]) {
				tmp.push(data[prop + "[" + x + "]"]);
				x++;
			}
			item[prop] = tmp;
		}
	}
};

const _versionItem = (item) => {
	if (item._version || item._version === 0) {
		item._version++;
	} else {
		item._version = 0;
	}
};

const _fixArrays = (req, res, next) => {
	if (req.body) {
		for (var i in req.body) {
			if (i.search(/\[\d+\]/) > -1) {
				var parts = i.match(/(^[A-Za-z]+)(\[)/);
				var el = parts[1];
				if (!req.body[el]) {
					req.body[el] = [];
				}
				req.body[el].push(req.body[i]);
			}
		}
	}
	next();
};

const changeUrlParams = (req, key, val) => {
	var q = req.query;
	q[key] = val;
	return req.config.url + req.path() + "?" + querystring.stringify(q);
};

global.JXPSchema = require("./schema");

const JXP = function(options) {
	const server = restify.createServer();

	//Set up config with default
	var config = {
		model_dir: path.join(path.dirname(process.argv[1]), "../models"),
		mongo: {
			server: "localhost",
			db: "openmembers"
		},
		url: "http://localhost:3001",
		callbacks: {
			put: function() {},
			post: function() {},
			delete: function() {},
			get: function() {},
			getOne: function() {}
		},
		log: "access.log",
		pre_hooks: {
			get: (req, res, next) => {
				next();
			},
			getOne: (req, res, next) => {
				next();
			},
			post: (req, res, next) => {
				next();
			},
			put: (req, res, next) => {
				next();
			},
			delete: (req, res, next) => {
				next();
			}
		},
		post_hooks: {
			// eslint-disable-next-line no-unused-vars
			get: (modelname, result) => {},
			// eslint-disable-next-line no-unused-vars
			getOne: (modelname, id, result) => {},
			// eslint-disable-next-line no-unused-vars
			post: (modelname, id, data, result) => {},
			// eslint-disable-next-line no-unused-vars
			put: (modelname, id, data, result) => {},
			// eslint-disable-next-line no-unused-vars
			delete: (modelname, id, data, result) => {}
		}
	};

	//Override config with passed in options

	for (let i in options) {
		if (typeof config[i] === "object" && !Array.isArray(config[i])) {
			if (typeof options[i] === "object" && !Array.isArray(options[i])) {
				for (let j in options[i]) {
					config[i][j] = options[i][j]; // Second level object copy
				}
			}
		} else {
			config[i] = options[i];
		}
		if (i === "model_dir" || i === "log") {
			// Decide whether it's absolute or relative
			if (config.model_dir.charAt(0) === "/") {
				config[i] = options[i];
			} else {
				config[i] = path.join(
					path.dirname(process.argv[1]),
					options[i]
				);
			}
		}
	}

	model_dir = config.model_dir;

	// Pre-load models
	var files = fs.readdirSync(config.model_dir);
	let modelnames = files.filter(function(fname) {
		return fname.indexOf("_model.js") !== -1;
	});
	modelnames.forEach(function(fname) {
		var modelname = fname.replace("_model.js", "");
		models[modelname] = require(path.join(config.model_dir, fname));
	});

	security.init(config);
	login.init(config);
	groups.init(config);
	ws.init({models});

	// Set up our API server

	// Rate limitting
	if (config.throttle) {
		server.use(restify.plugins.throttle(config.throttle));
	}

	// Logging
	console.log("Logging to", config.log);

	var accessLogStream = fs.createWriteStream(config.log, { flags: "a" });
	server.use(morgan("combined", { stream: accessLogStream }));

	// CORS
	const corsMiddleware = require('restify-cors-middleware');

	const cors = corsMiddleware({
		preflightMaxAge: 5, //Optional
		origins: ['*'],
		allowHeaders: ['X-Requested-With','Authorization'],
		exposeHeaders: ['Authorization']
	});

	server.pre(cors.preflight);
	server.use(cors.actual);

	// Parse data
	server.use(restify.plugins.queryParser());
	server.use(restify.plugins.bodyParser());

	// Bind our config to req.config
	server.use((req, res, next) => {
		req.config = config;
		next();
	});

	// Define our endpoints

	/* Our API endpoints */
	server.get(
		"/api/:modelname",
		middlewareModel,
		security.login,
		security.auth,
		config.pre_hooks.get,
		cache.read.bind(cache),
		actionGet,
		outputJSON
	);
	server.get(
		"/api/:modelname/:item_id",
		middlewareModel,
		security.login,
		security.auth,
		config.pre_hooks.getOne,
		cache.read.bind(cache),
		actionGetOne
	);
	server.post(
		"/api/:modelname",
		middlewareModel,
		security.login,
		security.auth,
		middlewarePasswords,
		config.pre_hooks.post,
		actionPost,
		(req, res, next) => {
			console.log("Yo");
			next();
		},
		cache.flush.bind(cache)
	);
	server.put(
		"/api/:modelname/:item_id",
		middlewareModel,
		security.login,
		security.auth,
		middlewarePasswords,
		middlewareCheckAdmin,
		config.pre_hooks.put,
		actionPut,
		cache.flush.bind(cache)
	);
	server.del(
		"/api/:modelname/:item_id",
		middlewareModel,
		security.login,
		security.auth,
		config.pre_hooks.delete,
		actionDelete,
		cache.flush.bind(cache)
	);

	// CSV endpoints
	server.get(
		"/csv/:modelname",
		middlewareModel,
		security.login,
		security.auth,
		config.pre_hooks.get,
		cache.read.bind(cache),
		actionGet,
		outputCSV
	);

	// Query endpoints
	server.post(
		"/query/:modelname",
		middlewareModel,
		security.login,
		security.auth,
		config.pre_hooks.get,
		cache.read.bind(cache),
		actionQuery,
	);

	server.post(
		"/aggregate/:modelname",
		middlewareModel,
		security.login,
		security.auth,
		config.pre_hooks.get,
		cache.read.bind(cache),
		actionAggregate
	)

	/* Batch routes - ROLLED BACK FOR NOW */
	// server.post('/batch/create/:modelname', middlewareModel, security.login, security.auth, actionBatch);

	/* Call Methods in our models */
	server.get(
		"/call/:modelname/:method_name",
		middlewareModel,
		security.login,
		security.auth,
		actionCall
	);
	server.post(
		"/call/:modelname/:method_name",
		middlewareModel,
		security.login,
		security.auth,
		actionCall
	);
	server.get(
		"/call/:modelname/:item_id/:method_name",
		middlewareModel,
		security.login,
		security.auth,
		actionCallItem
	);

	/* Login and authentication */
	server.post("/login/recover", login.recover);
	server.post("/login/getjwt", security.login, login.getJWT);
	server.get("/login/logout", security.login, login.logout);
	server.get("/logout", security.login, login.logout);
	server.get("/login/oauth/:provider", login.oauth);
	server.get("/login/oauth/callback/:provider", login.oauth_callback);
	server.post("/login", login.login);
	server.post("/refresh", security.refresh);
	server.post("/login/refresh", security.refresh);

	/* Groups */
	server.put(
		"/groups/:user_id",
		security.login,
		security.admin_only,
		_fixArrays,
		groups.actionPut,
		cache.flush.bind(cache)
	);
	server.post(
		"/groups/:user_id",
		security.login,
		security.admin_only,
		_fixArrays,
		groups.actionPost,
		cache.flush.bind(cache)
	);
	server.get("/groups/:user_id", security.login, groups.actionGet);
	server.del("/groups/:user_id", security.login, security.admin_only, groups.actionDelete, cache.flush.bind(cache));

	/* Meta */
	server.get("/model/:modelname", middlewareModel, metaModel);
	server.get("/model", metaModels);

	/* Setup */
	server.get("/setup", setup.checkUserDoesNotExist, setup.setup);
	server.post("/setup", setup.checkUserDoesNotExist, setup.setup, cache.flush.bind(cache));

	/* Cache */
	server.get("/cache", (req, res) => {
		res.send(cache.status());
	})

	/* Websocket */
	server.on("upgrade", ws.upgrade)
	return server;
};

module.exports = JXP;