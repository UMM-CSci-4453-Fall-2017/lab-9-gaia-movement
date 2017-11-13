var cookieParser = require('cookie-parser');
var express=require('express');
mysql=require('mysql');
var credentials=require('./credentials.json');
Promise = require('bluebird');
var using = Promise.using;

app = express(),
port = process.env.PORT || 1337;

credentials.host='ids.morris.umn.edu'; //setup database credentials

Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var connection = mysql.createConnection(credentials); // setup the connection
var db = "benek020";
var pool = mysql.createPool(credentials);

//connection.connect(function(err){if(err){console.log(error)}});
var getConnection = function(){
	return pool.getConnectionAsync().disposer(
		function(connection){ return connection.release();}
	);
};

var query = function(sql){
	return using(getConnection(), function(connection){
		return connection.queryAsync(sql);
	});
};
var endPool = function(){
	pool.end(function(err){});
};

var getDatabase = function(){
	var toReturn = query("USE " + db + ";")
	console.log(toReturn);
	return toReturn;};

 
var removeCol = function(ip){
	var toReturn = "";
	for(i = 0; i < ip.length; i++){
		if (ip.charAt(i) != ":" && ip.charAt(i) != "."){
			toReturn = toReturn + ip.charAt(i);
		}
	}
	return toReturn;
};

var checkCookie = function(req){
    var sql = "SELECT * FROM " + db + ".cookies WHERE hid=" + req.cookies.creds.id + ";";
    return query("CALL " + db + ".deleteCookies();").then(function(){
        return query(sql);});
    
}

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

app.get("/buttons",function(req,res){
  var sql = 'SELECT * FROM benek020.till_buttons';
//  connection.query(sql,(function(res){return function(err,rows,fields){
//     if(err){console.log("We have an error:");
//             console.log(err);}
//     res.send(rows);
//  }})(res));

  checkCookie(req)
    .then( function(results){
        if (results.length > 0){
            query(sql)
            .then(function(results){ res.send(results); endPool;})
        }else{
            res.send();
            }}
    );
}); 



app.get("/click",function(req,res){
  var id = req.param('id');
  var newIP = removeCol(req.ip);
  var sql = 'INSERT INTO ' + db + ".transaction_" + newIP + " values (" + id + ", 1) on duplicate key update quantity=quantity+1;";
  console.log("Attempting sql ->"+sql+"<-");
  
    checkCookie(req)
    .then( function(results){
        if (results.length > 0){
            query(sql)
            .then(function(results){ res.send(results); endPool;})
        }else{
            res.send();
            }}
    );
});

app.get("/getTrans", function(req, res){
  var ip = req.ip;
  var newIP = removeCol(ip);
  //console.log(ip);
  //console.log(newIP);
  var tableName = db + ".transaction_" + newIP;
  var modelTable = db + ".transaction_model";
  var sqlMake = "CREATE TABLE IF NOT EXISTS " + tableName + " LIKE " + modelTable + ";";
//  var sqlGet = "SELECT * FROM " + tableName + ";";
  var sqlGet = "select inventory.item, inventory.id, " + tableName + ".quantity, " + tableName + ".quantity * prices.prices AS total from benek020.inventory as inventory, " + tableName + ", benek020.prices as prices where inventory.id = " + tableName + ".ID and inventory.id = prices.id;";


    checkCookie(req)
    .then( function(results){
        if (results.length > 0){
            query(sqlMake)
            .then(query(sqlGet)
            .then(function(results){ res.send(results); endPool;}))
        }else{
            res.send();
            }}
    );
    
});

app.get("/removeItem", function(req, res){
    var id = req.param('id');
    var ip = req.ip;
    var newIP = removeCol(ip);
    var tablename = db + ".transaction_" + newIP;
    var updateSql = "update " + tablename + " set quantity = quantity - 1 where ID = " + id + ";";
    var deleteSql = "delete from " + tablename + " where quantity <= 0;";
   // var SQL = updateSql + deleteSql;

    checkCookie(req)
    .then( function(results){
        if (results.length > 0){
            query(updateSql)
            .then(query(deleteSql)
            .then(function(results){ res.send(results); endPool;}))
        } else{
            res.send();
        }}
    );

});

app.get("/login", function(req, res){
    var userID = req.param('user');
    var pass = req.param('pass');
   // var pass = sha256(req.param('pass'));
    var checkPassSql = "SELECT * FROM " + db + ".users WHERE user=\"" + userID + "\" AND passwordHash=SHA2(\""+ pass + "\",256);";
    console.log("Before query");
    console.log(checkPassSql);
    query(checkPassSql).then(
    function(results){
	if(results !== null && results.length > 0){ 
		var hid = Math.floor(Math.random() * 1000000000000000);
		var cookieSql = "INSERT INTO " + db + ".cookies VALUES(\"" + userID + "\", " + hid + ", ADDDATE(NOW(), INTERVAL 1 HOUR));";
		console.log(cookieSql)
		query(cookieSql).then(function(){
			res.cookie("creds", { user: userID, id: hid });
			res.send();
		});

	}
    });
});

// Your other API handlers go here!

app.listen(port);
