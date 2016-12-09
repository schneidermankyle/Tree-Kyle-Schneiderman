var express = require ('express'),
    app = express(),
    http = require ('http').Server(app),
    io = require('socket.io')(http),
    mysql = require('mysql'),
    Request = require('./scripts/classes/request.class.js');

// Set up some static links for our clientside
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/scripts', express.static(__dirname + '/scripts'));

// Our main page serve
app.get('/', function(req, res){
    if (req.query.key === 'oEliNL9O4p17oZnUpYKc') {
        res.sendfile(__dirname + '/index.html');
    } else {
        res.send('<h3>Coming Soon</h3>');
    }        
});

// our socket requests
io.on('connection', function(socket){
    // Set up our connection
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'user',
        password: 'password',
        database: 'database'
    });

    connection.connect();

    var request = new Request(connection);
    request.GetStructure('html', function(html){
        io.emit('return', html);
    });
    console.log('User connected: ' + socket.id);

    socket.on('request', function(data){

        // Sanitize data,
        request.Process(data);

        request.GetStructure('html', function(html){
            io.emit('return', html);
        });

    });

    io.on('disconnect', function() {
        connection.end();
    });

});

// Set up express server
http.listen(3000, function(){
    console.log("listening on port 3000");
});