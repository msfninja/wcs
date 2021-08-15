const
	http = require('http'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	qs = require('querystring'),
	ip = require('ip'),
	colors = require('colors'),
	{ exec } = require('child_process'),
	crypto = require('crypto'),
	{
		v1: uuidv1,
		v4: uuidv4
	} = require('uuid'),
	readline = require('readline'),
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

const
	algorithm = 'aes-256-ctr',
	iv = crypto.randomBytes(16);

const dir = `${__dirname}/..`;

const
	ex = h => { return fs.existsSync(h); },
	rd = h => { return ex(h) ? fs.readFileSync(h).toString() : ''; },
	wr = (h,c) => { fs.writeFile(h,c,(err) => { if (err) throw err; }); };

const
	log = t => {
		console.log(`\n\t${t.replace(/\n/g,'\n\t')}`);
	},
	clear = () => { console.clear(); },
	error = t => {
		console.error(`\n\tERROR!\n\n\t${t.replace(/\n/g,'\n\t')}`);
		process.exit(0);
	};

const config = JSON.parse(rd(`${dir}/config.json`));

const cli = () => {
	let root = new Root(); clear();
	if (!root.exists()) {
		log(`Welcome to ${config.app.name}. This appears to be your first time using ${config.app.name}.\nProvide a PIN-code to protect the control panel (4 to 8 digits).\n`);
		rl.question('\tPIN-code: ',pin => {
			if (!isNaN(pin) && pin.split('').length >= 4 && pin.split('').length <= 8) {
				root.newcred(pin);
				clear();
				log(`Enter a port ${config.app.name} will run on (a number from 0 to 64738, use 80 for no port).\n`);
				rl.question('\tPort: ',port => {
					if (!isNaN(port) && parseInt(port) >= 0 && parseInt(port) <= 64738) {
						config.port = port;
						config.sec.init = true;
						wr(`${dir}/config.json`,JSON.stringify(config,null,4));
						start(port);
						rl.close();
					}
					else {
						log('Invalid port.');
						rl.close();
						process.exit();
					}
				});
			}
			else {
				log('Invalid PIN.');
				rl.close();
				process.exit();
			}
		});
	}
	else start(config.port);
};

const
	t = (res,s,h,c) => {
		res.writeHead(s,h);
		if (c) res.write(c);
		res.end();
	},
	render = (res,h,m) => {
		var
			modes = m ? m.split('') : [],
			html = '';
		if (compare(['r','a'],modes,1)) {
			html = rd(h).replace(/\{component\.meta\}/g,rd(`${dir}/server/client/component/meta.html`)).replace(/\{component\.links\}/g,rd(`${dir}/server/client/component/links.html`)).replace(/\{component\.scripts\}/g,rd(`${dir}/server/client/component/scripts.html`));
			if (modes.includes('a')) {
				html = html.replace(/\{categories\}/g,gethtml());
				html = html.replace(/\{token\}/g,token);
			}
			html = html.replace(/\{app\.name\}/g,config.app.name).replace(/\{app\.namelong\}/g,config.app.name_long);
		}
		return html;
	},
	compare = (a,b,n) => {
		var arr = [];
		for (var i = a.length - 1; i >= 0; i--) for (var j = b.length - 1; j >= 0; j--) if (a[i] === b[j]) arr.push(a);
		if (arr.length >= n) return true;
		return false;
	},
	cookies = r => {
		var
			obj = {},
			rc = r.headers.cookie;
		rc && rc.split(';').forEach(e => {
			var parts = e.split('=');
			obj[parts.shift().trim()] = decodeURI(parts.join('='));
		});
		return obj;
	},
	check = () => {
		var arr = [
			'/server/root/dat/uuid.asc',
			'/server/root/dat/key.hash',
			'/public/index.html',
			'/server/root/index.html'
		];
		arr.forEach(e => { if (!ex(`${dir}${e}`)) return false; });
		return true;
	};

const
	gettree = h => { return fs.readdirSync(h); },
	getcom = p => {
		var arr = [];
		const getlist = p => {
			gettree(p).forEach(e => {
				if (fs.lstatSync(path.join(p,e)).isDirectory()) getlist(path.join(p,e));
				else arr.push({
					name: e.split('.')[0],
					path: path.join(p,e)
				});
			});
		};
		getlist(p);
		return arr;
	},
	getcat = p => {
		var arr = [];
		gettree(p).forEach(e => { if (fs.lstatSync(path.join(p,e)).isDirectory()) arr.push(e); });
		return arr;
	},
	execute = (a,b) => {
		var obj = getcom(`${dir}/server/batch`).find(e => e.name === a);
		if (obj) {
			if (b) exec(`${obj.path} ${decodeURIComponent(b)}`);
			else exec(obj.path);
		}
	};

const gethtml = () => {
	var html = '';
	getcat(`${dir}/server/batch`).forEach(cat => {
		html += `
			<section>
				<div class="h4">${formatcat(cat)}</div>
				<div class="ws50"></div>
				<div class="row-around">
		`;
		getcom(`${dir}/server/batch`).forEach(com => {
			if (com.path.split(path.sep)[com.path.split(path.sep).length - 2] === 'file-system') {
				html += `
					<script type="application/ecmascript" defer="defer">
						const f${com.name} = () => {
							var c = prompt('${com.name}: Enter a pathname');
							if (c) ajax(\`/{token}/${com.name}/\${encodeURIComponent(c)}\`);
						};
					</script>
					<div title="Send ${com.name} command to your PC" onclick="f${com.name}();" class="btn">
						<div>${com.name}</div>
					</div>
				`;
			}
			else if (com.path.split(path.sep)[com.path.split(path.sep).length - 2] === cat) {
				html += `
					<div title="Send ${com.name} command to your PC" onclick="ajax('/{token}/${com.name}'); msg('${formatcom(com.name)} command sent');" class="btn">
						<div>${formatcom(com.name)}</div>
					</div>
				`;
			}
		});
		html += `
				</div>
			</section>
		`;
	});
	return html;
};

const
	formatcat = str => {
		var arr = [];
		str.split('-').forEach(e => { arr.push(e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()); });
		return arr.join(' ');
	},
	formatcom = str => { return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); };

function Root(res) {
	this.access = c => {
		if (c) t(res,200,{'Content-Type':'text/html'},render(res,`${dir}/server/root/index.html`,'ra'));
		else t(res,200,{'Content-Type':'text/html'},render(res,`${dir}/public/index.html`,'r'));
	}
	this.exists = () => {
		return (config.sec.init && rd(`${dir}/server/root/dat/uuid.asc`).split('').length === 32);
	};
	this.verify = p => {
		if (cred() && pinuuid()) {
			if (p === decrypt(cred().pin,(`${p}${pinuuid()}`).slice(0,32))) return true;
			return false;
		}
	};
	this.newcred = p => {
		if (pinuuid()) wr(`${dir}/server/root/dat/key.hash`,JSON.stringify({ pin: encrypt(p,(`${p}${pinuuid()}`).slice(0,32)) }));
		else error(`The uuid.asc file seems to be misconfigured or missing. Cannot create new credentials.\npinuuid() response:\n\n${pinuuid()}`);
	};
}

const start = port => {
	http.createServer((req,res) => {
		var
			q = url.parse(req.url,true),
			p = q.pathname,
			cookie = cookies(req);
		let
			root = new Root(res);
		if (['/'].includes(p)) {
			if (req.method === 'POST') {
				let body;
				req.on('data',chunk => body = chunk.toString());
				req.on('end',() => {
					let post = qs.parse(body);
					if (post.pin && root.verify(post.pin)) root.access(true);
					else root.access(false);
				});
			}
			else t(res,200,{'Content-Type':'text/html'},render(res,`${dir}/public/index.html`,'r'));
		}
		else if ([token].includes(p.split('/')[1])) execute(p.split('/')[2],p.split('/')[3]);
		else {
			const h = path.resolve(dir,p.replace(/^\/*/,`${dir}/public/`));
			if (ex(h)) {
				fs.readFile(h,(err,dat) => {
					if (err) t(res,404,{'Content-Type':'text/html'},render(res,`${__dirname}/client/err/404.html`,'r'));
					res.statusCode = 200;
					return res.end(dat);
				});
			}
			else t(res,404,{'Content-Type':'text/html'},render(res,`${__dirname}/client/err/404.html`,'r'));
		}
	}).listen(port);
	clear();
	log(`${config.app.name} is running at the following address:\nhttp://${ip.address()}${(port == 80) ? '' : (':' + port)}\n\nPress ^C any time to shut the server down.`);
};

const
	encrypt = (t,k) => {
		const
			cipher = crypto.createCipheriv(algorithm,k,iv),
			encrypted = Buffer.concat([cipher.update(t),cipher.final()]);
		return {
			iv: iv.toString('hex'),
			content: encrypted.toString('hex')
		};
	},
	decrypt = (h,k) => {
		const
			decipher = crypto.createDecipheriv(algorithm,k,Buffer.from(h.iv,'hex')),
			decrpyted = Buffer.concat([decipher.update(Buffer.from(h.content,'hex')),decipher.final()]);
		return decrpyted.toString();
	};

const
	cred = () => {
		try { return JSON.parse(rd(`${dir}/server/root/dat/key.hash`)); }
		catch (err) { return false; }
	},
	pinuuid = () => {
		try {
			if (rd(`${dir}/server/root/dat/uuid.asc`).split('').length == 32) {
				return rd(`${dir}/server/root/dat/uuid.asc`);
			}
			else {
				let key = getuuid(1);
				wr(`${dir}/server/root/dat/uuid.asc`,key);
				return key;
			}
		}
		catch (err) { return false; }
	};

const getuuid = n => {
	var str = '';
	for (var i = 0; i < n; i++) str += uuidv4().toString().replace(/\-/g,'');
	return str;
};

let token = getuuid(3);

if(check()) {
	try { cli(); }
	catch (err) { error(`Failed to initiate the commandline interface with the following error:\n\n${err}`); }
}
else error(`It appears that crucial files are missing. Cannot initiate server.\n\nTry reinstalling ${config.app.name} or contacting the creator for help.`);