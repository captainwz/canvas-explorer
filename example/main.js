var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

context.beginPath();
context.moveTo(60, 150); 
context.lineTo(120, 130); 
context.lineTo(150, 230); 
context.lineTo(150, 230); 
context.lineTo(50, 330); 
context.closePath();
context.fillStyle = 'blue';
context.strokeStyle = 'green';
context.lineWidth = 5;
context.stroke();
context.fill();

context.beginPath();
context.fillStyle = 'yellow';
context.arc(75, 75, 50, 0, 2*Math.PI);
context.closePath()
context.stroke();
context.fill();

context.beginPath();
context.fillStyle = 'red';
context.fillRect(200,200,150,75); 
// context.stroke();
// context.fill();

// context.beginPath();
context.rect(300, 300, 100, 100)
context.fill();
context.stroke();

// context.beginPath();
context.strokeRect(500, 500, 60, 30)
context.fill();
context.stroke();

// context.beginPath();
context.moveTo(230, 230);

context.lineTo(300, 230); 
context.lineTo(265, 260); 
context.closePath();
context.strokeStyle = '#108ee9';
context.stroke();
context.fillStyle = 'orange';
context.strokeStyle = 'blue';
context.lineWidth = 15;
context.stroke();
context.fill();
