A couple of programs to convert .VST files in ViSTa format to other formats, by user MaxST on  unmannedspaceflight forum ( http://www.unmannedspaceflight.com/ )

# VST2X3D
- post: http://www.unmannedspaceflight.com/index.php?showtopic=2456&view=findpost&p=46824
- direct .zip download: http://www.unmannedspaceflight.com/index.php?act=attach&type=post&id=4656
- source code: 
    - post: http://www.unmannedspaceflight.com/index.php?showtopic=2735&view=findpost&p=55673
    - .zip: http://www.unmannedspaceflight.com/index.php?act=attach&type=post&id=5859
    - in this repo: link

# VST2OBJ

- post: http://www.unmannedspaceflight.com/index.php?showtopic=2456&view=findpost&p=47156
- direct .zip download: http://www.unmannedspaceflight.com/index.php?act=attach&type=post&id=4682

Syntax:

vst2obj filename.vst

The output .obj files will get the name from the input; one .obj file per each LOD (Level Of Detail) will be generated.

Example output while processing:

![image](https://user-images.githubusercontent.com/1620953/175543027-276a8750-5ada-4747-b340-4f2c958eb1e5.png)


# Files
- Donwload 3d data (XYL products) here:  https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/
- For texture you must download FFL products from here:
    - [Raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/)
    - [Browse (jpg)](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/)
    
 ## Example files
 - XYL (point cloud): https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/2n292280938xylb100p0703l0m1.img
 - FFL (texure) raw: https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/2n292280938fflb100p0703l0m1.img
 - FFL (texture jpg): https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/2n292280938fflb100p0703l0m1.img.jpg


Browse version of texture:

![image](https://user-images.githubusercontent.com/1620953/175541373-1d783c3b-33f6-43b1-a9e2-732009358bf4.png)


Browse version of XYZ data (x, Y, Z bands mized together):

![image](https://user-images.githubusercontent.com/1620953/175541431-d24d22bd-f845-4ce9-b37c-499b92e01b22.png)

Resulting mesh viewed in meshmixer (LOD0, LOD1, LOD2):

![image](https://user-images.githubusercontent.com/1620953/175543720-6eab9735-9ad5-425f-8af8-78336f2a6f42.png)
