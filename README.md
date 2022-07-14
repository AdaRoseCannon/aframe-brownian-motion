# AFrame-brownian-motion

This is based on:
* https://github.com/keijiro/ProceduralMotion/blob/master/Packages/jp.keijiro.klak.motion/Runtime/BrownianMotion.cs
* https://github.com/josephg/noisejs

## [Demo](https://ada.is/aframe-brownian-motion)
[![Screen Recording of some 3D objects moving in a random pattern](https://user-images.githubusercontent.com/4225330/179013110-9c2c8154-266f-46ce-bb0c-b0c172d09cfc.gif)
](https://ada.is/aframe-brownian-motion)


```html
<!-- in head -->
<script src="https://cdn.jsdelivr.net/npm/aframe-brownian-motion@1.0.0/build/aframe-brownian-motion.min.js"></script>

<!-- in a-scene -->
<a-cylinder shadow position="0 1 -2" radius="0.2" height="0.4" brownian-motion></a-cylinder>
<a-torus-knot shadow position="0 1 -2" radius-tubular="0.03" radius="0.15" height="0.4" brownian-motion="positionVariance:2;rotationVariance:5;"></a-torus-knot>
<a-box shadow position="-0.5 1 -2" width="0.4" depth="0.4" height="0.4" brownian-motion="positionVariance:2;rotationVariance:5;"></a-box>
```

<!--DOCS-->
### brownian-motion component

This component animates an object

| Property         | Type   | Description                    | Default |
| :--------------- | :----- | :----------------------------- | :------ |
| seed             | number | Random seed                    | 0       |
| octaves          | number | How fine grained the motion is | 2       |
| positionVariance | number | How much it should be moved by | 1       |
| rotationVariance | number | How much it should rotate by   | 10      |
| speed            | number | Speed multiplier               | 1       |

<!--DOCS_END-->
