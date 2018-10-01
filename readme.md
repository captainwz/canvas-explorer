# Canvas-Explorer

A tool that tranforms canvas to stateful structure.

## Steps

```shell
git clone https://github.com/captainwz/canvas-explorer.git
```

```shell
npm install
```

```shell
npm run analyze path/to/js/file path/to/output/file
```

An `output.json` in root directory will be generated by default.

```shell
npm run analyze ./example/main.js
```

## Example

### main.js

```javascript
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

context.rect(300, 300, 100, 100)
context.fill();
context.stroke();

context.strokeRect(500, 500, 60, 30)
context.fill();
context.stroke();

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
```

## output.json
```json
[
    {
        type: "polygon",
        closed: true,
        pointsSet: [[60, 150], [120, 130], [150, 230], [150, 230], [50, 330]],
        lineWidth: 5,
        fill: "blue",
        stroke: "green"
    },
    {
        x: 75,
        y: 75,
        radius: 50,
        type: "circle",
        fill: "yellow",
        stroke: "green",
        lineWidth: "green"
    },
    { x: 200, y: 200, width: 150, height: 75, type: "rectangle", fill: "red" },
    {
        x: 300,
        y: 300,
        width: 100,
        height: 100,
        type: "square",
        stroke: "blue",
        lineWidth: 15,
        fill: "orange"
    },
    {
        x: 500,
        y: 500,
        width: 60,
        height: 30,
        type: "rectangle",
        stroke: "green"
    },
    {
        type: "triangle",
        closed: true,
        pointsSet: [[230, 230], [300, 230], [265, 260]],
        lineWidth: 15,
        fill: "orange",
        stroke: "blue"
    }
];
```

