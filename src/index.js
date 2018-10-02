let babylon = require('babylon');
let path = require('path');
let fs = require('fs-extra');
let ncp = require('ncp').ncp;
let traverse = require('babel-traverse').default;
let t = require('babel-types');
let generate = require('babel-generator').default;
let beautify = require('js-beautify').js;
let prettier = require('prettier');
let moment = require('moment');

filePath = process.argv[2];
if (!filePath) {
    throw new Error('No Entry File Specified');
}

outputPath = process.argv[3] ? process.argv[3] : 'output.json';

let code = fs.readFileSync(path.resolve(__dirname, '..', filePath)).toString();

let ast = babylon.parse(code, {
    sourceType: 'module',
    plugins: [
        'jsx',
        'doExpressions',
        'objectRestSpread'
    ]
});

let phaseOutput = [];
let output= [];
let el;
let fillStyle;
let strokeStyle = '#000';
let lineWidth = 1;
let phaseFillStyle;
let phaseStrokeStyle;
let phaseLineWidth;

const extractArgument = (argument) => {

    if (t.isLiteral(argument)) {
        return argument.value;
    } else if (t.isIdentifier(argument)) {
        return argument.name;
    } else if (argument.start != undefined && argument.end != undefined) {
        return code.substring(argument.start, argument.end)
    }
}

const shapeCheck = () => {

    // if (el && el.draws && el.draws.length) {
    //     phaseOutput.push(el);
    // }

    el = {
        draws: []
    }

    phaseOutput.push(el);
    

}

const phaseCheck = () => {

    phaseOutput.forEach(el => {

        if (el && el.draws && el.draws.length) {

            if (el.draws[0].type == 'moveTo') {
    
                if (el.closed || el.fill) {
                    
                    let node = Object.create(null);
    
                    //line
                    if (el.draws.length == 2) {
                        node.type = 'line';
                    }
    
                    if (el.draws.length == 3) {
                        node.type = 'triangle';
                        node.closed = el.closed;
                    }
                    
    
                    if (el.draws.length > 3) {
                        node.type = 'polygon';
                        node.closed = el.closed;
                    }
    
    
                    node.pointsSet = el.draws.map(item => {
                        return item.points;
                    })
    
                    if (el.lineWidth) {
                        node.lineWidth = phaseLineWidth;
                    }
    
                    if (el.fill) {
                        node.fill = phaseFillStyle;
                    }
    
                    if (el.stroke) {
                        node.stroke = phaseStrokeStyle;
                    }
    
                    output.push(node);
                
                } else {
                    // lines not closed, so they are discrete lines 
    
                    el.draws.forEach((item, k) => {
    
                        if (el.draws[k + 1] && el.draws[k + 1].type == 'lineTo') {
    
                            let node = Object.create(null);
    
                            node.type == 'line';
                            
                            node.pointsSet = [
                                item.points,
                                el.draws[k + 1].points
                            ]
    
                            if (el.stroke) {
                                node.stroke = phaseStrokeStyle;
                            }
    
                            if (lineWidth != undefined) {
                                node.lineWidth = phaseLineWidth;
                            }
    
                            output.push(node);
    
                        }
    
    
                    })
                    
                }   
    
            } 

            if (el.draws[0].type == 'rect') {

                let node = Object.create(null);
                node.x = el.draws[0].x;
                node.y = el.draws[0].y;
                node.width = el.draws[0].width;
                node.height = el.draws[0].height;

                if (node.width == node.height) {
                    node.type = 'square';
                } else {
                    node.type = 'rectangle';
                }

                if (el.stroke) {
                    node.stroke = phaseStrokeStyle;
                }

                if (el.lineWidth) {
                    node.lineWidth = phaseLineWidth;
                }

                if (el.fill) {
                    node.fill = phaseFillStyle;
                }

                output.push(node)

            }

            if (el.draws[0].type == 'fillRect') {

                let node = Object.create(null);
                node.x = el.draws[0].x;
                node.y = el.draws[0].y;
                node.width = el.draws[0].width;
                node.height = el.draws[0].height;

                if (node.width == node.height) {
                    node.type = 'square';
                } else {
                    node.type = 'rectangle';
                }

                if (el.fill) {
                    node.fill = el.fill;
                }

                output.push(node)

            }

            if (el.draws[0].type == 'strokeRect') {

                let node = Object.create(null);
                node.x = el.draws[0].x;
                node.y = el.draws[0].y;
                node.width = el.draws[0].width;
                node.height = el.draws[0].height;

                if (node.width == node.height) {
                    node.type = 'square';
                } else {
                    node.type = 'rectangle';
                }

                if (el.stroke) {
                    node.stroke = el.stroke;
                }

                output.push(node)

            }

            if (el.draws[0].type == 'arc') {
                let node = Object.create(null);
                node.x = el.draws[0].x;
                node.y = el.draws[0].y;
                node.radius = el.draws[0].r;
                let startAngle = el.draws[0].startAngle;
                let endAngle = el.draws[0].endAngle;
                let counterclockwise = el.draws[0].counterclockwise;
                let ret;

                eval('ret = (' + endAngle + ') - (' + startAngle + ')');

                if (Math.abs(ret) >= Math.PI*2) {
                    node.type = 'circle';
                } else {
                    node.type = 'arc';
                    node.startAngle = startAngle;
                    node.endAngle = endAngle;
                    node.counterclockwise = counterclockwise;

                    if (el.closed) {
                        node.closed = el.closed;
                    }
                }

                if (el.fill) {
                    node.fill = phaseFillStyle;
                }

                if (el.stroke) {
                    node.stroke = phaseStrokeStyle;
                }

                if (el.lineWidth) {
                    node.lineWidth = phaseLineWidth;
                }

                output.push(node);
                
            }
    
        }



    })

    phaseOutput = [];

}

traverse(ast, {
    enter (p) {

        if (t.isExpressionStatement(p.node) &&
            t.isCallExpression(p.node.expression) &&
            t.isMemberExpression(p.node.expression.callee) &&
            t.isIdentifier(p.node.expression.callee.property)
        ) {
            
            if (p.node.expression.callee.property.name == 'beginPath') {
                phaseCheck();
            }

            
            if (
                p.node.expression.callee.property.name == 'moveTo' ||
                p.node.expression.callee.property.name == 'rect' ||
                p.node.expression.callee.property.name == 'strokeRect' ||
                p.node.expression.callee.property.name == 'fillRect' ||
                p.node.expression.callee.property.name == 'arc'
            ) {
               
                shapeCheck();
                
            }

            if (p.node.expression.callee.property.name == 'moveTo') {
                el.draws.push({
                    type: 'moveTo',
                    points: [
                        extractArgument(p.node.expression.arguments[0]), 
                        extractArgument(p.node.expression.arguments[1])
                    ]
                })
            }

            if (p.node.expression.callee.property.name == 'lineTo') {
                el.draws.push({
                    type: 'lineTo',
                    points: [
                        extractArgument(p.node.expression.arguments[0]), 
                        extractArgument(p.node.expression.arguments[1])
                    ]
                })
            }

            if (p.node.expression.callee.property.name == 'closePath') {
                el.closed = true;
            }

            if (p.node.expression.callee.property.name == 'stroke') {
                el.stroke = strokeStyle;
                el.lineWidth = lineWidth;

                phaseLineWidth = lineWidth;
                phaseStrokeStyle = strokeStyle;
            }

            if (p.node.expression.callee.property.name == 'fill') {
                el.fill = fillStyle;

                phaseFillStyle = fillStyle;
            }

            if (p.node.expression.callee.property.name == 'rect') {
                
                el.draws.push({
                    type: 'rect',
                    x: extractArgument(p.node.expression.arguments[0]),
                    y: extractArgument(p.node.expression.arguments[1]),
                    width: extractArgument(p.node.expression.arguments[2]),
                    height: extractArgument(p.node.expression.arguments[3])
                })
                
            }

            if (p.node.expression.callee.property.name == 'strokeRect') {
                
                el.draws.push({
                    type: 'strokeRect',
                    x: extractArgument(p.node.expression.arguments[0]),
                    y: extractArgument(p.node.expression.arguments[1]),
                    width: extractArgument(p.node.expression.arguments[2]),
                    height: extractArgument(p.node.expression.arguments[3])
                });

                el.stroke = strokeStyle;
                
            }

            if (p.node.expression.callee.property.name == 'fillRect') {
                
                el.draws.push({
                    type: 'fillRect',
                    x: extractArgument(p.node.expression.arguments[0]),
                    y: extractArgument(p.node.expression.arguments[1]),
                    width: extractArgument(p.node.expression.arguments[2]),
                    height: extractArgument(p.node.expression.arguments[3])
                })

                el.fill = fillStyle;
                
            }

            if (p.node.expression.callee.property.name == 'arc') {
                
                el.draws.push({
                    type: 'arc',
                    x: extractArgument(p.node.expression.arguments[0]),
                    y: extractArgument(p.node.expression.arguments[1]),
                    r: extractArgument(p.node.expression.arguments[2]),
                    startAngle: extractArgument(p.node.expression.arguments[3]),
                    endAngle: extractArgument(p.node.expression.arguments[4]),
                    counterclockwise: p.node.expression.arguments.length > 5 ? extractArgument(p.node.expression.arguments[5]) : false
                });

            }


        }

        if (t.isExpressionStatement(p.node) &&
            t.isAssignmentExpression(p.node.expression) &&
            t.isMemberExpression(p.node.expression.left) &&
            t.isIdentifier(p.node.expression.left.property)
        ) {

            if (p.node.expression.left.property.name == 'fillStyle') {
                fillStyle = extractArgument(p.node.expression.right)
            }

            if (p.node.expression.left.property.name == 'strokeStyle') {
                strokeStyle = extractArgument(p.node.expression.right)
            }

            if (p.node.expression.left.property.name == 'lineWidth') {
                lineWidth = extractArgument(p.node.expression.right)
            }

        }

    }
})

phaseCheck();

fs.writeFileSync(path.resolve(__dirname, '..', outputPath), prettier.format(JSON.stringify(output), {tabWidth: 4}))


// console.log(JSON.stringify(output))