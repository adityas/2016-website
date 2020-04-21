var SCREEN_WIDTH = shapeShotViewerWidth;
var SCREEN_HEIGHT = shapeShotViewerHeight;
var FLOOR = -250;

var container;
var camera;
var scene;
var webglRenderer;
var loader;
var mesh;
var directionalLightLeft;
var directionalLightRight;

var mouseX = 0;
var mouseY = 0;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var isMouseDown = false;
var onMouseDownPosition;
var mouseType;

var camNormalVector, camXVector, camYVector, camXDelta , camYDelta, vectorTemp;

var camVector;

var lastFrameX, lastFrameY, currentX, currentY;
var renderInterval = 1000/60;

var bbox;
var startingZ;

var radius = 8000, onMouseDownRadius = 800, theta = 0, onMouseDownTheta = 0, phi = 0, onMouseDownPhi = 0;

var mouseVelocityX, mouseVelocityY;
var doDecay = false;
var escapeVelocity, decayVelocity, decayTime;

var render_gl = 1;
var has_gl = 0;
var r = 0;

var bReset = document.getElementById("rReset");
var bChangeShader = document.getElementById("rChangeShader");
var bAutoZoom = document.getElementById("rAutoZoom");
var bMoveScale = document.getElementById("rMoveScale");
var bAutoRotate = document.getElementById("rAutoRotate");
var bScreenshot = document.getElementById("rScreenshot");

var autoRotateEnabled = false;

var tempX, tempY;

var myMaterials;
var shaderNum = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var boundingLocation;

document.addEventListener('mousemove', onDocumentMouseMove, false);
// document.addEventListener('mousewheel', onDocumentMouseScroll, false);
document.addEventListener( 'touchstart', onDocumentTouchStart, false );
document.addEventListener( 'touchmove', onDocumentTouchMove, false );


init();
loop();

g_intervalId = window.setInterval(loop, renderInterval);

function init() {
	container = document.getElementById('shapeshot');
	
	// add events for lost context
	container.addEventListener("webglcontextlost", contextLostHandler, false);
  	container.addEventListener("webglcontextrestored", contextRestoredHandler, false);
	
	camera = new THREE.Camera( 10, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
	
	cameraPosition(theta,phi,radius);
	camera.target.position.y = 0;
	camera.updateMatrix();

	scene = new THREE.Scene();

	// create mouseEvent object
	onMouseDownPosition = new THREE.Vector2();
	
	camNormalVector = new THREE.Vector3();
	camXVector = new THREE.Vector3();
	camYVector = new THREE.Vector3();
	camXDelta = new THREE.Vector3();
	camYDelta = new THREE.Vector3();
	vectorTemp = new THREE.Vector3();
	
	escapeVelocity = new THREE.Vector2();
	decayVelocity  = new THREE.Vector2();
	// create Camera Vector
	camVector = new THREE.Vector3;
	
	// LIGHTS
	var ambient = new THREE.AmbientLight( 0x101010 );
	scene.addLight( ambient );
	
	directionalLightLeft = new THREE.DirectionalLight( 0xffffff, .6 );
	directionalLightLeft.position.x = 2;
	directionalLightLeft.position.y = 1;
	directionalLightLeft.position.z = 2;
	directionalLightLeft.position.normalize();
	
	directionalLightRight = new THREE.DirectionalLight( 0xffffff, .6 );
	directionalLightRight.position.x = -2;
	directionalLightRight.position.y = 1;
	directionalLightRight.position.z = 2;
	directionalLightRight.position.normalize();
	
	// create materials list
	myMaterials = [
				   
		{ material: new THREE.MeshFaceMaterial( ) },	   
		{ material: new THREE.MeshBasicMaterial( { color: 0xeeeeee, wireframe: true } ), overdraw: false, doubleSided: true },
		{ material: new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ), overdraw: true, doubleSided: false }
	];
	
	if ( render_gl ) {
		try {
			webglRenderer = new THREE.WebGLRenderer();
			webglRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
			container.appendChild( webglRenderer.domElement );
			has_gl = 1;
		}
		catch (e) {
		}
	}

	var s = (new Date).getTime();
	
	loader = new THREE.Loader( true );
	document.body.appendChild( loader.statusDomElement );
	
    //ssLoad('../assets/' +g_directory+ '/' +g_model+ '.ssa', function( geometry ) { createScene( geometry, s ) }, "assets" );
    
    // Fade original picture
	setTimeout(function(){
        jQuery(function ($) {
			$('#picture').fadeToggle(1500, function () {
			});
		});
		//document.getElementById("loading").style.display = "block";
    },1000);
	
	// Load Model
	setTimeout(function(){
        ssLoad(g_model+ '.ssa', function( geometry ) { createScene( geometry, s ) }, "assets" )
    },100);
    
    // Fade picture and spinner
	// setTimeout(function(){
	//         jQuery(function ($) {
	// 		$('#pictureblur, #loading, #controls, #caption, #note').fadeToggle(500, function () {
	// 		});
	// 	});
	// },7000);
	
	// Fade note
	setTimeout(function(){
        jQuery(function ($) {
			/*$('#note').fadeToggle(500, function () {
			});*/
			$('#note').animate({
			opacity: 0,
			right: "100px"
		}, 500);
		});
	},10000);
	
}

// Main Render Loop
function loop() {	
	if (autoRotateEnabled == true){
		// do autorotate stuff every frame
		autoRotateAngle = 85* Math.sin(2*r);
		mesh.rotation.y = Math.PI*(autoRotateAngle/180);
	}
	
	if (doDecay == false){
		calculateVelocity();
	}
	
	if (doDecay){
		velocityDecay();
	}
		
    /*    
	camera.position.x = -( mouseX + camera.position.x ) * .002;
    camera.position.y = -( -mouseY + camera.position.y ) * .002; 
    camera.position.z = startingZ - (Math.abs(mouseX) * .001) - (Math.abs(mouseY) * .001);
    */
    
	//$('.mainright').mouseover(function() {
									   
	if(mesh){
		mesh.rotation.y = ( mouseX + camera.position.x ) * .002;
		mesh.rotation.x = ( mouseY + camera.position.y ) * .002;
		
		mesh.rotation.y =  mesh.rotation.y +=  ( targetRotation - mesh.rotation.y ) * 0.05;//touch events!
		console.log("targetRotation = :" + targetRotation);
	}
		
	if(boundingLocation){
		//camera.position= boundingLocation;
        //camera.position.z = bbox * 8;
        camera.target.position =  boundingLocation;    
	}
	
	camera.updateMatrix();

	r += 0.01;
	
	//});

	if ( render_gl && has_gl ) webglRenderer.render( scene, camera );
	
	// Hide Loading
	//document.getElementById('loading').style.display = 'none';
}

// update camera position based on two angles and radius
function cameraPosition (theta,phi,radius){
	camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
	camera.position.y = radius * Math.sin( phi * Math.PI / 360 );
	camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
	
	startingZ = camera.position.z;
}

// Create Scene
function createScene( geometry, start ) {
	addMesh( geometry, 0.75, 0, 0, 0, 0,0,0, myMaterials[0].material );	
	loader.statusDomElement.style.display = "none";	
	
	bbox = geometry.boundingSphere.radius;
	
	boundingLocation = new THREE.Vector3;
	boundingLocation.x = 0;
    boundingLocation.y = 0;
    boundingLocation.z = 0;
	// zoom in for sslogo since the bounding box is so large
	if (g_model == "sslogo") {
		camera.near = bbox / 300;
		camera.far = bbox * 30;
		radius = bbox * 0.85;
		onMouseDownRadius = bbox * 2;
	} 
	// else use bounding box of model to zoom to extents of model
	else {
		camera.near = bbox / 300;
		camera.far = bbox * 30;
		radius = bbox * 8;
		onMouseDownRadius = bbox * 8;
	}

	camera.updateProjectionMatrix();
	cameraPosition (theta,phi,radius);
	
}

// add Mesh function
function addMesh( geometry, scale, x, y, z, rx, ry, rz, material ) {
	mesh = new THREE.Mesh( geometry, material );
	mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
	mesh.rotation.x = rx;
	mesh.rotation.y = ry;
	mesh.rotation.z = rz;
	mesh.overdraw = true;
	mesh.updateMatrix();
	scene.addObject(mesh);
	
}

function calculateVelocity(){
	
	if (lastFrameX && lastFrameY){
		mouseVelocityX = (currentX -  lastFrameX);
		mouseVelocityY = (currentY -  lastFrameY);
	}
}

function velocityDecay(){
	decayVelocity.x = escapeVelocity.x * Math.pow(Math.E,-10*decayTime);
	decayVelocity.y = escapeVelocity.y * Math.pow(Math.E,-10*decayTime);
	
	tempX = tempX + decayVelocity.x;
	tempY = tempY + decayVelocity.y;
	
	if (mouseType=="left"){
		doRotate(tempX,tempY);
	}
	
	decayTime += .01;
	if (Math.sqrt( decayVelocity.x * decayVelocity.x + decayVelocity.y * decayVelocity.y ) < .1){
		doDecay=false;	
		decayVelocity.x = 0;
		decayVelocity.y = 0;
		escapeVelocity.x = 0;
		escapeVelocity.y = 0;
		lastFrameX = currentX;
		lastFrameY = currentY;
	}
}

function contextLostHandler() {
  // stop rendering.
  window.clearInterval(g_internvalId);
}

function contextRestoredHandler() {
  // Start rendering again.
  g_intervalId = window.setInterval(loop, 1000/60);
}