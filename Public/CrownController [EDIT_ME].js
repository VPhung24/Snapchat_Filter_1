/***************************************************
INPUTS
Inputs expose various parameters to Lens Studio
allowing you to tune them in the Inspector panel
****************************************************/

//@input bool crownEnabled
//@input Asset.Texture[] textures
//@input int numberOfSprites = 4
//@input float rotationSpeed = 1 {"widget":"slider", "min":-3.0, "max":3.0, "step":0.1}
//@input float crownRadius = 3.0 {"widget":"slider", "min":2.0, "max":5.0, "step":0.1}
//@input float crownHeight = 15.0 {"widget":"slider", "min":0.0, "max":25.0, "step":0.1}
//@input float minSpriteSize = 1.0
//@input float maxSpriteSize = 1.5

//@ui {"widget":"group_start", "label":"ADVANCED"}
//@input SceneObject crownParent
//@input Asset.Material spriteMaterial
//@input Component.Camera camera
//@ui {"widget":"group_end"}

var sprites = [];

/***************************************************
MODIFY BELOW
The following functions control the sprite's bounce
(y position) and color every frame. Modify these
to change the functionality of your Lens!
****************************************************/

// This function updates the bounce of each sprite in the crown. It's called every
// frame (30 times per second) and incrementally modifies the y position of each
// sprite in the crown
function updateSpriteBounce( spriteNumber )
{
	// MODIFY ME!
	// The bounce speed determines how fast the sprites bounce up and down and 
	// is used below to calculate the y position of the sprite
	var bounceSpeed = 1.0;

	// MODIFY ME!
	// The bounce height determines how high the sprites bounce up and down and
	// is used below to calculate the y position of the sprite
	var bounceHeight = 1;

	// MODIFY ME!
	// The bounce offset determines how offset the bounce is from other sprites
	// If the bounce offset is 0, all sprites will bounce together
	var bounceOffset = 1;

	// MODIFY ME!
	// Calculate the y position. You can set yPosition to be any number. Try different 
	// ways to calculate the y. For example, try replacing Math.sin with Math.tan
	var yPosition = Math.tan(bounceSpeed * getTime() + (spriteNumber * bounceOffset)) * bounceHeight;
	
	// Return the calculated y position which is used
	// to set the position of the sprite on the crown
	return yPosition;
}

// This function updates the color of each sprite of the crown. It modifies the 
// red, green, blue and transparency. It's called every frame (30 times per second)
function updateSpriteColor( spriteNumber )
{
	// BONUS EXERCISE: Try modifying the color to factor in time similar to how we are
	// modifying the yPosition of the sprite in the above updateSpriteBounce function
	var red = 1.0;
	var green = 1.0;
	var blue = 1.0;
	var transparency = 1.0;
	
	// Return a new color which is used to set
	// the color of the sprite on the crown
	return new vec4( red, green, blue, transparency );
}

/*************************************************
ADVANCED BELOW
The rest of the code in this script actually
creates the sprites and places them around the user's
head. Feel free to follow the logic below! 
**************************************************/

// Called when the Lens is turned on
function onTurnOn(eventData)
{
	// Create the sprites that will surround the user's head
	createSprites();
}
var turnOnEvent = script.createEvent("TurnOnEvent");
turnOnEvent.bind(onTurnOn);

// Called every single update frame
// Frames are updated at 30 frames per second (aka 30 FPS)
function onUpdate(eventData)
{
	// Turn on or off crown based on crownEnabled checkbox
	script.crownParent.enabled = script.crownEnabled;

	// Rotate the parent so the crown spins
	updateCrownRotate();

	// Bounce each sprite
	updateCrownBounce();

	// Color each sprite
	updateCrownColor();
}
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Loops through every sprite in the crown and updates
// the color of the sprite
function updateCrownColor()
{
	// Loop through every sprite in the crown
	for(var i = 0; i < sprites.length; i++)
	{
		// Get the object material's pass
		var spritePass = sprites[i].getFirstComponent("Component.SpriteVisual").mainPass;
		
		// Update the color of the sprite
		spritePass.baseColor = updateSpriteColor(i);
	}
}

// Loops through every sprite in the crown and updates
// the bounce by modifying the y position of each sprite
function updateCrownBounce()
{
	// Loop through every sprite in the crown
	for(var i = 0; i < sprites.length; i++)
	{
		// Get the current local position
		var localPosition = sprites[i].getTransform().getLocalPosition();

		// Calculate the y position for the bounce
		localPosition.y = updateSpriteBounce( i );
		
		// Set the sprites position to the position we've calculated 
		sprites[i].getTransform().setLocalPosition(localPosition);
	}
}

// This function updates the rotation of the entire crown. It's called every frame
// (30 times per second) and incrementally modifies the rotation of the crown
function updateCrownRotate()
{
	// Get the current rotation of the crown
	var transform = script.crownParent.getTransform();
	var rotation = transform.getLocalRotation();

	// The rotation speed is applied to the crown, rotating it by a tiny amount
	// every frame (30 times per second)
	var rotateBy = quat.angleAxis(Math.PI * getDeltaTime() * script.rotationSpeed, vec3.up());
	rotation = rotation.multiply(rotateBy);

	// Set the crown's rotation with our newly calculated rotation
	transform.setLocalRotation(rotation);	
}

// Loops through the number of sprites you intend to create
// and creates each one. Additionally, the function positions
// the sprite at the right place in the circle
function createSprites()
{
	// Loop through the number of sprites you want to create
	for(var i = 0; i < script.numberOfSprites; i++)
	{
		// Creates a new sprite object via the below helper function
		var spriteObject = createSpriteObject("sprite_" + i);

		// Divide a circle by the number of sprites being created to 
		// get back an angle. This angle will help inform where
		// the sprite is placed
		var angle = (2.0 * Math.PI) * (i / script.numberOfSprites);

		// Calculate the position of sprite based on the above angle. We'll 
		// use trigonometry here to calculate the X and Z position
		var spritePosition = new vec3(Math.cos(angle), 0.0, Math.sin(angle));

		// We'll adjust the position by how large the user wants the crown to be
		spritePosition = spritePosition.uniformScale(script.crownRadius);

		// Next, we'll get the current scale of the sprite
		var spriteScale = spriteObject.getTransform().getLocalScale();

		// And then scale it by a random scalar defined by the maxSize and minSize params
		spriteScale = spriteScale.uniformScale(script.minSpriteSize + Math.random() * (script.maxSpriteSize - script.minSpriteSize));

		// Finally we'll set our calculated scale and position
		spriteObject.getTransform().setLocalScale(spriteScale);
		spriteObject.getTransform().setLocalPosition(spritePosition);
	}

	// Set the crown parent to the crown height
	script.crownParent.getTransform().setLocalPosition(new vec3(0, script.crownHeight, 0));
}

// This helper function creates a new sprite object and then returns it to
// the createSprites function above which then sets its position and scale
function createSpriteObject(name)
{
	// Create a new scene object with the passed in object name
	var newSceneObject = global.scene.createSceneObject(name);

	// Set the parent of the object to be the crownParent. This way when
	// we spin the crown parent, all children spin
	newSceneObject.setParent(script.crownParent);

	// For now, we'll set the position to (0, 0, 0). We'll change this later
	newSceneObject.getTransform().setLocalPosition(new vec3(0, 0, 0));

	// Add a Sprite Visual component to the newly created object which adds
	// functionality to show a 2D plane in 3D space
	var spriteVisual = newSceneObject.createComponent("Component.SpriteVisual");

	// Sprite visual needs a material to render the 2D visual so we are passing
	// in a material that we will simply duplicate and apply it to the sprite
	var spriteMaterial = script.spriteMaterial.clone();
	spriteVisual.addMaterial(spriteMaterial);

	// By adding a Look At Component, we are adding functionality to the object
	// that forces the 2D plane to always look at the camera
	var lookAt = newSceneObject.createComponent("Component.LookAtComponent");
	lookAt.target = script.camera.getSceneObject();
	lookAt.aimVectors = LookAtComponent.AimVectors.ZAimYUp;
	lookAt.worldUpVector = LookAtComponent.WorldUpVector.SceneY;

	// Only apply a texture if textures are supplied in the Inspector panel
	if(script.textures.length > 0)
	{
		// Randomly select a texture from the ones supplied and then assign
		// it to the sprite's material. The sprite will now be displaying
		// your custom image
		var textureToUse = Math.floor(Math.random() * script.textures.length);
		spriteMaterial.getPass(0).baseTex = script.textures[textureToUse];
	}

	// Add the sprite sceneObject to an array so that we can modify its
	// position and scale later
	sprites.push(newSceneObject);

	// Return the scene object so that createSprites can set the position
	return newSceneObject;
}