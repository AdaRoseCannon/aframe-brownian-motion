# AFrame-brownian-motion

This is based on:
* https://github.com/keijiro/ProceduralMotion/blob/master/Packages/jp.keijiro.klak.motion/Runtime/BrownianMotion.cs
* https://github.com/josephg/noisejs

## Quick Start

Include the script in the head of your page

```html
<!-- in head -->
<script src="https://cdn.jsdelivr.net/npm/aframe-brownian-motion@1.1.0/build/aframe-brownian-motion.min.js"></script>
```
### Basic

```
<!-- in a-scene -->
<a-cylinder shadow position="0 1 -2" radius="0.2" height="0.4" brownian-motion="speed:0.2;"></a-cylinder>
<a-torus-knot shadow position="0 1 -2" radius-tubular="0.03" radius="0.15" height="0.4" brownian-motion="speed:0.5;positionVariance:2 2 2;rotationVariance:5 5 5;"></a-torus-knot>
<a-box shadow position="-0.5 0.2 -2" width="0.4" depth="0.4" height="0.4" brownian-motion="speed:0.9;positionVariance:2 0 2;rotationVariance:5 5 5;"></a-box>
```

### Flocking Behaviour

The space vector component can be used have objects follow similar but divergent over time paths.

It's 6 numbers representing x,y,z and position and x,y,z Euler rotation.
If two numbers are the same then the corresponding values in the animation will remain the same.

These also make animations reproducable. If you set the `spaceVector` to a number it will do the same animation everytime you reload the page.

Similar numbers will behave similarly: 

i.e. 10 and 10 will do the exact same animation. 128 and 128.1 will do very similar but slightly animations.

If you leave any of the numbers undefined then they will be assigned random numbers. So `,,,20,30,40` will do random position motion but fixed rotation motion

```
<a-cylinder   brownian-motion="positionVariance:3,3,3;spaceVector:10.1,20.1,30.1,10.1,20.1,30.1;speed:0.5;" shadow position="0 1 0" radius="0.2" height="0.4" ></a-cylinder>
<a-torus-knot brownian-motion="positionVariance:3,3,3;spaceVector:10.2,20.2,30.2,10.2,20.2,30.2;speed:0.5;" shadow position="0 1 0" radius-tubular="0.03" radius="0.15" height="0.4" ></a-torus-knot>
<a-box        brownian-motion="positionVariance:3,3,3;spaceVector:10.3,20.3,30.3,10.3,20.3,30.3;speed:0.5;" shadow position="0 1 0" width="0.4" depth="0.4" height="0.4" ></a-box>
```

## [Demo](https://ada.is/aframe-brownian-motion)
[![Screen Recording of some 3D objects moving in a random pattern](https://user-images.githubusercontent.com/4225330/179013110-9c2c8154-266f-46ce-bb0c-b0c172d09cfc.gif)
](https://ada.is/aframe-brownian-motion)

## Docs

<!--DOCS-->
### brownian-motion component

This component animates an object

| Property         | Type   | Description                                                                                                                               | Default                |
| :--------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| spaceVector      | array  | Where in the phase space the starts, this should be an array of 6 values where empty spaces become a random number between -1000 and 1000 |                        |
| octaves          | number | How fine grained the motion is                                                                                                            | 2                      |
| positionVariance | vec3   | How much it should be moved by                                                                                                            | {"x":1,"y":1,"z":1}    |
| rotationVariance | vec3   | How much it should rotate by                                                                                                              | {"x":10,"y":10,"z":10} |
| speed            | number | Speed multiplier                                                                                                                          | 1                      |

<!--DOCS_END-->
