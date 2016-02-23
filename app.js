console.log('Starting password manager application ...');
var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
	.command('create', 'Create a new account.',function(yargs){
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Account name (eg: Twitter, Facebook)',
				type: 'string'
			},
			username: {
				demand: true,
				alias: 'u',
				description: 'Account username or email',
				type:'string'
			},
			password:{
				demand: true,
				alias: 'p',
				description: 'Account password',
				type:'string'
			},
			masterPassword:{
				demand:true,
				alias:'m',
				description:'Master Password',
				type: 'string'
			}
		}).help('help');
	})
	.command('get', 'Gets the user\'s account password',function(yargs){
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Account name (eg: Twitter, Facebook)',
				type: 'string'
			},
			masterPassword:{
				demand:true,
				alias:'m',
				description:'Master Password',
				type: 'string'
			}
		}).help('help');
	})
	.help('help')
	.argv;

var command = argv._[0];


function getAccounts(masterPassword){
	var encryptedAccount = storage.getItemSync('accounts'); //fetch accounts
	var accounts = [];
	if(typeof encryptedAccount !== 'undefined'){
		var bytes = crypto.AES.decrypt(encryptedAccount,masterPassword); //decrypt
		var accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	}	
	return accounts;
}

function saveAccounts (accounts,masterPassword){
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
	storage.setItemSync('accounts',encryptedAccounts.toString());
	return accounts; 
}

function createAccount (account,masterPassword){
	var accounts = getAccounts(masterPassword);
	accounts.push(account);
	saveAccounts(accounts,masterPassword);
	return account;
}

function getAccount (accountName,masterPassword) {
	var accounts = getAccounts(masterPassword);
	var matchedAccount;

	accounts.forEach(function(account) {
		if(account.name === accountName){
			matchedAccount = account;
		}
	});
	return matchedAccount;
}


if(command === 'create'){
	try{
			var createAccount = createAccount({
				name: argv.name,
				username: argv.username,
				password: argv.password
			}, argv.masterPassword);
		console.log('Account Created !');
		console.log(createAccount);
	}catch(e){
		console.log('Unable to create account.'+e)
	}
	
}else if(command==='get'){
	try{
		var fetchedAccount = getAccount(argv.name,argv.masterPassword);
		if(typeof fetchedAccount === 'undefined'){
			console.log('Account not found !');
		}else{
		console.log('Account found !');
		console.log(fetchedAccount);
		}
	}catch(e){
		console.log('Unable to fetch account.')
	}
}


