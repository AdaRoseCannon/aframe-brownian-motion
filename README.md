# AFrame-brownian-motion

This is based on:
* https://github.com/keijiro/ProceduralMotion/blob/master/Packages/jp.keijiro.klak.motion/Runtime/BrownianMotion.cs
* https://github.com/josephg/noisejs

## [Demo](https://ada.is/aframe-brownian-motion)
[![image](https://user-images.githubusercontent.com/4225330/178984929-f0d90485-613e-4d87-835c-912cff9aad1e.png)](https://ada.is/aframe-brownian-motion)


```html
<a-cylinder shadow position="0 1 -2" radius="0.2" height="0.4" brownian-motion></a-cylinder>
<a-torus-knot shadow position="0 1 -2" radius-tubular="0.03" radius="0.15" height="0.4" brownian-motion="positionVariance:2;rotationVariance:5;"></a-torus-knot>
<a-box shadow position="-0.5 1 -2" width="0.4" depth="0.4" height="0.4" brownian-motion="positionVariance:2;rotationVariance:5;"></a-box>
```

<!--DOCS-->
## brownian-motion component

This component animates an object

| Property         | Type   | Description                    | Default |
| :--------------- | :----- | :----------------------------- | :------ |
| seed             | number | Random seed                    | 0       |
| octaves          | number | How fine grained the motion is | 2       |
| positionVariance | number | How much it should be moved by | 1       |
| rotationVariance | number | How much it should rotate by   | 10      |

<!--DOCS_END-->
