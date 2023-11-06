// Define construct options
interface EdjiSDKOptions {
    api_server: String;
    api_key?: String;
    debug?: Boolean;
    token?: String;
}

interface EdjiSDKFetchOptionHeaders {
    "Content-Type": String;
    Authorization?: String;
}

interface EdjiSDKFetchOptions {
    method?: String;
    body?: Object;
    headers: EdjiSDKFetchOptionHeaders;
}

class EdjiSDK {
    _api_server: String;
    _api_key?: String;
    _debug?: Boolean = false;
    _token?: String;

    constructor({api_server, api_key, debug, token}: EdjiSDKOptions) {
        this._api_server = api_server;
        this._api_key = api_key;
        this._debug = debug;
        this._token = token;
        // console.log("EdjiSDK initialized with options: ", {api_server, api_key, token, debug});
    }

    _configParams(opts:any = {}) {
		let parts: String[] = [];
		for (let opt in opts) {
			if (Array.isArray(opts[opt])) {
                for (let val of opts[opt]) {
                    parts.push(opt + "=" + encodeURIComponent(val));
                }
			} else {
				parts.push(opt + "=" + encodeURIComponent(opts[opt]));
			}
		}
		return parts.join("&");
	}

    _url(params: String[], opts = {}, end_point="api") {
		return `${this._api_server}/${end_point}/${params.join("/")}?${this._configParams(opts)}`;
	}

    async fetch(url: string, opts?: RequestInit, body?: Object) {
        try {
            let options: RequestInit = {
                method: opts?.method || "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ReferrerPolicy: "no-referrer"
                },
            };
            if (this._token) {
                options.headers = Object.assign(options.headers || {}, {
                    Authorization: `Bearer ${this._token}`
                });
            }
            if (body) {
                options.method = "POST";
                options.body = JSON.stringify(body);
            }
            console.log(url, options);
            const res = await fetch(url, options);
            console.log(res);
            const json = await res.json();
            if (res.status !== 200) {
                throw json;
            }
            console.log({ json });
            return json;
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    async check_status() {
        try {
            const res = await fetch(`${this._api_server}/status`);
            return await res.json();
        } catch(err) {
            console.error(err);
            throw `Error checking status - API could be down. Host is ${this._api_server}`;
        }
    }

    async get_collections() {
        try {
            const res = await fetch(`${this._api_server}/model`);
            return await res.json();
        } catch(err) {
            console.error(err);
            throw "Error getting collections - API could be down.";
        }
    }

    async get_collection(collection: String) {
        try {
            const res = await fetch(`${this._api_server}/model/${collection}`);
            return await res.json();
        } catch(err) {
            console.error(err);
            throw "Error getting collection - API could be down.";
        }
    }

    async login(username: string, password: string) {
        try {
            const res = await fetch(`${this._api_server}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            });
            const result = await res.json();
            if (result.error) {
                throw result.error;
            }
            this._api_key = result.apikey;
            return result;
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    async getOne(type: string, id: string, opts: Object) {
		const label = `getOne.${type}-${Date.now()}`;
		if (this._debug) console.time(label);
        const url = this._url([type, id], opts);
		try {
			const result = await this.fetch(url);
			if (this._debug) console.timeEnd(label);
            const data = await result.json();
			if (result.status !== 200) {
                throw(result.statusText);
            }
            return data;
		} catch(err: any) {
			if (this._debug) console.timeEnd(label);
			// this._displayError(err);
			throw(err.response ? err.response.data : err);
		}
	}

	async get(type: string, opts: Object) {
        const label = `get.${type}-${Date.now()}`;
        if (this._debug) console.time(label);
        const url = this._url([type], opts);
        try {
            const data = await this.fetch(url);
            if (this._debug) console.timeEnd(label);
            return data;
        } catch(err: any) {
            if (this._debug) console.timeEnd(label);
            // this._displayError(err);
            throw(err.response ? err.response.data : err);
        }
	}

    async create(type: string, data: Object) {
        const label = `create.${type}-${Date.now()}`;
        if (this._debug) console.time(label);
        const url = this._url([type]);
        try {
            const result = await this.fetch(url, {
                method: "POST",
            }, data);
            console.log({result});
            if (this._debug) console.timeEnd(label);
            return result;
        } catch(err: any) {
            console.log(err);
            if (this._debug) console.timeEnd(label);
            // this._displayError(err);
            throw(err.response ? err.response.data : err);
        }
    }

    async table_def(collection: string) {
        const label = `table_def.${collection}-${Date.now()}`;
        if (this._debug) console.time(label);
        try {
            const result = await fetch(`${this._api_server}/table_def/${collection}`);
            if (this._debug) console.timeEnd(label);
            return result.json();
        } catch(err: any) {
            if (this._debug) console.timeEnd(label);
            throw(err.response ? err.response.data : err);
        }
    }

    async form_def(collection: string) {
        const label = `form_def.${collection}-${Date.now()}`;
        if (this._debug) console.time(label);
        try {
            const result = await fetch(`${this._api_server}/form_def/${collection}`);
            if (this._debug) console.timeEnd(label);
            return result.json();
        } catch(err: any) {
            if (this._debug) console.timeEnd(label);
            throw(err.response ? err.response.data : err);
        }
    }

}

export default EdjiSDK;