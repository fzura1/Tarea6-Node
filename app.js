var app  = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ip = require("ip");
var clientes = [];
var contador = 1;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  clientes.push(socket);

  socket.on('inicio', function(){
    socket.emit('nombre', "Invitado"+contador);
    clientes[clientes.indexOf(socket)].n = "Invitado"+contador;
    contador++;
    io.emit('lista usuarios',getListaUsuarios());
  });

  socket.on('enviar mensaje chat', function(msg){
    io.emit('mensaje chat', msg);
  });

  socket.on('set nombre', function(nombre){
    io.emit('info', "Usuario nuevo: " + nombre); 
    clientes[clientes.indexOf(socket)].n = nombre; 
    io.emit('lista usuarios', getListaUsuarios()); 
  });

  socket.on('escribiendo', function(){
    io.emit('esta escribiendo', setUsuarioEscribiendo(clientes.indexOf(socket))); 
  });

  socket.on('no escribiendo', function(){
    io.emit('esta escribiendo', getListaUsuarios());
  });

  socket.on('disconnect', function() {
    if( clientes[clientes.indexOf(socket)].n == null ){
      io.emit('info', "Usuario invitado se ha desconectado.");
    }else{
      io.emit('info', "Usuario " + clientes[clientes.indexOf(socket)].n + " desconectado.");
    }
    clientes.splice(clientes.indexOf(socket),1);
    io.emit('lista usuarios', getListaUsuarios());
  });
});

function getListaUsuarios(){
  var listaUsuarios = [];
    for (var i = 0; i < clientes.length; i++){
      listaUsuarios[i] = clientes[i].n;
    }
  return listaUsuarios;
}

function setUsuarioEscribiendo(index){
  var listaUsuarios = [];
    for (var i = 0; i < clientes.length; i++){
      listaUsuarios[i] = clientes[i].n; 
    }
  listaUsuarios[index] = clientes[index].n+" está escribiendo… 💬";
  return listaUsuarios;
}


http.listen(8080, function(){
  console.log("Escuchando en localhost:8080 - IP "+ip.address());
});