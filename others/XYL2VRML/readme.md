Converts raw XYZ img files into Digital Elevation Model in VRML format.

- Found [here](http://www.unmannedspaceflight.com/index.php?showtopic=2380&hl=vrml+xyz)
- Author: user [MaxSt](http://www.unmannedspaceflight.com/index.php?showuser=566)
- Source: not available

If you have corresponding .png file in the same folder (with the label FFL), the converter will try to "colorize" the points.


## XYZ data (product "XYL") and textures (product "FFL") - Don't foget to convert textures to .png!
### Navcam
 -    [raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/)
 - [browse](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/)

### Hazcam
 -    [raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2ho_0xxx/data/sol1869/rdr/)
 - [browse](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2ho_0xxx/browse/sol1869/rdr/)


-----------

![image](https://user-images.githubusercontent.com/1620953/177048641-6f388e57-c3e2-4ae1-b920-09db68de0866.png)


Example from Spirit sol 1869, looking at sand trap on Troy:

XYZ data:
 - [raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/2n292280989xylb100p0703l0m1.img)
 - [browse](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/2n292280989xylb100p0703l0m1.img.jpg)

Texture:
- [Raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/2n292280989fflb100p0703l0m1.img)
- [Browse](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/2n292280989fflb100p0703l0m1.img.jpg)
- [png](https://github.com/jumpjack/VST-converter/blob/main/others/XYL2VRML/2n292280989fflb100p0703l0m1.png)


Resulting point cloud viewed in Meshlab:

![image](https://user-images.githubusercontent.com/1620953/177049187-107b4c38-a312-4062-9b20-a68650eb2f33.png)

Context in texture image:

![image](https://user-images.githubusercontent.com/1620953/177049405-9ef4f25f-e483-4eaa-ac1c-f75e37fc00ed.png)

Note: the hole visible in the model is the low gain antenna, visible only in right-eye image of this navcam stereo pair.
