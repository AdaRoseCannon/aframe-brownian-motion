# AFrame-brownian-motion

[Demo](https://ada.is/aframe-brownian-motion)

<!--DOCS-->
### brownian-motion component

This component uses instancing to cover one object in another.

| Property        | Type     | Description                                                                                                                                                                                                                                                                                                                               | Default |
| :-------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| object          | selector | Object to place on the surface of this object                                                                                                                                                                                                                                                                                             |         |
| count           | number   | Amount of objects                                                                                                                                                                                                                                                                                                                         | 128     |
| weightAttribute | string   | Specifies a vertex attribute to be used as a weight when sampling from the surface. Faces with higher weights are more likely to be sampled, and those with weights of zero will not be sampled at all. For vector attributes, only .x is used in sampling. If no weight attribute is selected, sampling is randomly distributed by area. | ""      |
| scale           | vec3     | Amount to scale the objects by                                                                                                                                                                                                                                                                                                            | {}      |
| scaleJitter     | vec3     | Add randomness to the scaling                                                                                                                                                                                                                                                                                                             | {}      |
| uniformJitter   | boolean  | Scale x,y,z together (true) or each independently (false)                                                                                                                                                                                                                                                                                 | true    |

<!--DOCS_END-->
