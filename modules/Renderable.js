

import {projMatrix, cameraMatrix} from './Transformer.js';

//globals
let program;
let gl;


//initializes our renderer with shaders and gl context
function initRenderer(glContext)
{
    gl = glContext
    program = initShaders(gl, "vshader", "fshader");
    glContext.useProgram(program);


}



//class for drawing an object with a  set of vertices and vertex colors
class Renderable {
    //set default values
    constructor(vertices, color, shaderProgram = program) {
        //an array of vertex sets
        this.shaderProgram = shaderProgram;
        this.change(vertices);
        this.drawMode = gl.TRIANGLES;
        this.color = color;

        //Allows shaders to animate with time
        if (this.shaderProgram !== program) {
            this.startTime = performance.now();
        }
    }

    //change vertices of our object with a shape
    change(vertices)
    {
        this.vertices = vertices
        this.setupPoints()
    }


    //reset our transformer(sets model to an identity matrix)


    //what mode are we drawing in?
    setDrawMode(mode)
    {
        this.drawMode = mode;
    }

    //creates buffers, and binds them, as well as setting up attrib array for the vertices
    //vPosition stores our attrib pointer to be enabled
    setupPoints()
    {
        gl.useProgram(this.shaderProgram);

        this.pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        this.vPosition = gl.getAttribLocation(this.shaderProgram,  "vPosition");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
    }




    enablePoints()
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pBuffer);
        gl.enableVertexAttribArray(this.vPosition);
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);

    }




    //draws the lines of teh renderable
    draw(modelMat)
    {

        gl.useProgram(this.shaderProgram);

        //setup uniforms for matrices
        pushUniformMat(projMatrix, "projectionMatrix", this.shaderProgram);
        pushUniformMat(modelMat, "modelMatrix", this.shaderProgram);
        pushUniformMat(cameraMatrix, "cameraMatrix", this.shaderProgram);
        pushUniformVec4(this.color, "color", this.shaderProgram);

        //Allows shaders to animate with time
        if (this.shaderProgram !== program) {
            let time = Math.sin((performance.now() - this.startTime) / 300);
            let timeLoc = gl.getUniformLocation(this.shaderProgram, "time");
            gl.uniform1f(timeLoc, time);
        }

        //enable attrib arrays
        this.enablePoints()
        //draw lines

        gl.drawArrays(this.drawMode, 0, this.vertices.length)
        gl.disableVertexAttribArray(this.vPosition);

    }




}

//gets unifrom location given assumed correct name and passes in teh data to the shader
function pushUniformMat(data, uniformName, shaderProgram) {
    let uniLoc = gl.getUniformLocation(shaderProgram, uniformName);
    gl.uniformMatrix4fv(uniLoc, false, flatten(data));
}

//get uniform for vec4s
function pushUniformVec4(data, uniformName, shaderProgram) {
    let uniLoc = gl.getUniformLocation(shaderProgram, uniformName);
    gl.uniform4fv(uniLoc, data);
}


export {Renderable,initRenderer};