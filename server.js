var express = require('express')
  ,	stylus = require('stylus')
  , logger = require('morgan')
  , parser = require('body-parser')
  , nano = require('nano')('http://localhost:5984')
  , uuid = require('uuid/v1')
  , app = express()
  , hompage = require('jade').compileFile(__dirname + '/source/templates/homepage.jade')
  , ideas = require('jade').compileFile(__dirname + '/source/templates/ideas.jade')
  , list = require('jade').compileFile(__dirname + '/source/templates/list.jade')
  , contact = require('jade').compileFile(__dirname + '/source/templates/contact.jade')
  , confirmation = require('jade').compileFile(__dirname + '/source/templates/confirmation.jade')
  , errpage = require('jade').compileFile(__dirname + '/source/templates/error.jade')
  , details = require('jade').compileFile(__dirname + '/source/templates/details.jade') 


app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.use(stylus.middleware({
    src: __dirname + "/source",
    dest: __dirname + "/static",
    debug: true,
    force: true,
}));
app.use(parser.urlencoded({
  extended: true
}));
app.use(parser.json());

var hackaton_db = nano.db.use('hackaton');

app.get('/', function (req, res, next) {
  try {
    var html = hompage({ title: 'Home' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/ideas', function (req, res, next) {
  try {
    var html = ideas({ title: 'Dodaj nowy projekt' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.post('/ideas', function (req, res, next) {
	
	var data = { 
		reporter: req.body.name, 
		title: req.body.title, 
		type: req.body.description
	};
	
	hackaton_db.insert(data, uuid(), function(err, body){
	  if(err){
		var html = errpage({ title: 'Error' })
		res.send(html)
	  }else{
	  	var html = confirmation({ title: 'Confirmation' })
		res.send(html)
	  }
	});
})

app.get('/list', function (req, res, next) {
	
	console.log(req.query.id);
	
	if(req.query.id == undefined){
		hackaton_db.list({include_docs: true}, function(err, body){
			if(!err){			
				var rows = body.rows;//the rows returned
				try {
					var html = list({ title: 'List', data: rows })
					res.send(html)
				} catch (e) {
					next(e)
				}
			}else{
				try {
					var html = errpage({ title: 'Error' })
					res.send(html)
				} catch (e) {
					next(e)
				}
			}
		});
	}else{
		hackaton_db.get(req.query.id, { revs_info: false, include_docs: true }, function(err, body) {
		  if (!err){
			try {
				var html = details({ title: 'Details', doc: body })
				res.send(html)
			} catch (e) {
				next(e)
			}
		  }
		});
	}
})

app.get('/contact', function (req, res, next) {
  try {
    var html = contact({ title: 'Contact' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})



app.listen(process.env.PORT || 3000, function () {
  console.log('localhost:' + (process.env.PORT || 3000))
})