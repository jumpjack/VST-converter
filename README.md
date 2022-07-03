# VST-converter
Converter for 3d mesh "VST" (ViSTa) files into modern 3d mesh files.

2 versions available:

- VST-converter.html: raw javascript; developed stopped at "patch" level and continued on VST-converter-kaitai.html
- **VST-converter-kaitai.html**: based on VST parsing library created with kaitai-struct; **please use this one**; requires VST.js in same folder; this file was  automatically created by [kaitai-struct](https://kaitai.io/) using my [VST.ksy](https://github.com/jumpjack/VST-converter/blob/main/VST.ksy) file. Such file can also be used to automatically create a VST library for other languages (java, c, c++. Perl, PHP, Python...)
- [others](https://github.com/jumpjack/VST-converter/tree/main/others/VST2something): other tools found around on forum or repositories
    - VST2OBJ: converts to Wavefront .obj format; DOS executable
    - VST2X3D: converts to X3D format; DOS execxutable; source code available
    
------------------

NASA used for Spirit and Opportunity rovers (MER - Mars Exploration Rovers) some peculiar file formats to store 3d reconstructions of terrain:

- .ht : Heightmap: The file contains 1 to 3 bands, each band representing a depth map; first band contains raw values; second band contains also interpolated values; 3rd band, if present, contains estimated errors. [Example folder](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/).
- .pfb: "Performer Fast Binary", used by ["IRIS Performer" or "OpenGL Performer" from Silicon Graphics ](https://en.wikipedia.org/wiki/OpenGL_Performer)(www.sgi.com), now dead; format details unknwon [Example folder](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/)
- .iv: Silicon Graphics "Iris Inventor" format;  not officially documented, but [here](https://github.com/rich-hart/3D_Graphics_File_Conversions/blob/master/ivcon.c) there is C source of **ivconv**, a program able to convert it to other formats, and here there is the python script  [iv2dae.py](https://github.com/li-zhiqi/iv2dae) (requires python collada package); modern software [OpenInventor](https://en.wikipedia.org/wiki/Open_Inventor) should be able to open them
- **.vst: Used by ViSTa commercial software; widely documented in this [PDF](https://trs.jpl.nasa.gov/bitstream/handle/2014/12074/02-0907.pdf?sequence=1), also [stored in this repository](https://github.com/jumpjack/VST-converter/blob/main/VST-format.pdf) for reference** 
    - [Example folder](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/) (also contains greyscale textures in [uncompressed SGI RGB format](http://paulbourke.net/dataformats/sgirgb/) )
    - C source code for SGI RGB format conversion: [readrgb.c](http://paulbourke.net/dataformats/sgirgb/readrgb.c), [readrgb.h](http://paulbourke.net/dataformats/sgirgb/readrgb.h)
    - [kaitai-struct .ksy file](https://github.com/jumpjack/VST-converter/blob/main/SGI_RGB.ksy) for images in SGI RGB format (only greyscale 1024x1024)
    - [kaitai-generated javascript library](https://github.com/jumpjack/VST-converter/blob/main/RGB.js) to read SGI RGB format

## VST format

![immagine](https://user-images.githubusercontent.com/1620953/174308474-c7169af2-da40-4133-8a7d-8a3d718c817e.png)

- A .vst file contains multiple "Levels Of Depth" (LODs), i.e. multiple "3d files", each one with different resolution.
- The higher the index of the LOD in the file, the higher is its resolution (= number of triangles)
- Each LOD can contain 1 ore more "patches".
- Each patch can contain a number of "arrays"
- An array can be interpreted as a "group of faces" (triangles strip) or a "point cloud", depending on a patch flag at offset 0x04 in patch header (0 = face, 1 = point cloud)

In  case the array represents a triangle strip, its values must be read stright or in reverse depending  on position of triplet in the array:

![image](https://user-images.githubusercontent.com/1620953/177045484-c5c8bfa2-60d9-46bf-855e-f239104a5eab.png)


All of this means that each .VST file can be converted to a number of 3d files (one per each LOD) with different resolutions. 

Archive of .vst files for MER Spirit:
https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/

-----------

There were 4 cameras onboard:
 - 1 Pancam
 - 1 Navcam
 - 2 Hazcams (front and rear)
 
 ![image](https://user-images.githubusercontent.com/1620953/174552618-f5ddbe78-a179-49e9-8f00-672e9ca8a38e.png)

Products/images are grouped by "site", i.e. reference points fixed along rover course; at each site 1 ore more "observations" may be associated.
 


-------
# PLY format for reference

```
ply                         magic string
format ascii 1.0            ascii/binary, format version number 
comment made by anonymous   a comment starts by "comment" keyword 
element vertex VVVV         number of vertex in the file 
property float32 x          ok 
property float32 y          ok  
property float32 z          ok  
element face FFFF           number of faces in the file 
property list uint8 int32 vertex_index     each face is a list of int32 pointers to vertex; how many pointers is 
                                           given by an uint8 value before the values
end_header                  delimits the end of the header 
0 0 0                       start of vertex list 
0 0 1
0 1 1
0 1 0
1 0 0
1 0 1
1 1 1
1 1 0
3 0 1 2                   start of face list; in VST format all faces are triangles.
3 7 6 5 
3 0 4 5 
3 1 5 6 
3 2 6 7 
3 3 7 4 
```

# Files repositories

## Naming convention

### Visible images
- [Navcam - mer2no_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/) 
- [Hazcam - mer2ho_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2ho_0xxx/)
- [Pancam - mer2po_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2po_0xxx/) 

### Mesh/3d
- [Navcam - mer2mw_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/) 
- [Hazcam - mer2mw_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/) (as above)
- [Pancam - mer2mw_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/) (as above)

### Mosaics
- [Navcam - mer2om_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2om_0xxx/)
- [Hazcam - mer2om_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2om_0xxx/) (as above)
- [Pancam - mer2om_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2om_0xxx/) (as above)

## Folders

All links refer to navcam images for sol 1869 and site 137, the last site before Spirit got trapped in the "sand trap" of Troy, where its mission ended.

- raw image products: 
    - https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/edr/  (eff = Full Frame, eth = Thumbnails)
- JPG versions of IMG products: 
    - https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/edr/
- 3d products (VIL, in VST format; .HT (height map), .pfb (Silicon Graphics _OpenGL Performer_, or _Iris Performer_):  
    - https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/
    - https://pdsimage2.wr.usgs.gov/archive/mer2mw/mer2mw_0xxx/data/navcam/site0137/ (mirror)

## Focusing on specific product: 2n292280938xxxxxxxxxx

Explanation of generic 2N292280938...B100P0703L0M1 name:

-  2 = MER2
-  N = NAVCAM
-  292280938 = Sol 1869
-  ... = Product type (XYZ, VIL, FFL,...)
-  B1 = Site 137
-  00 = Position 0
-  P = Navcam/Pancam observation
-  0703 = Observation n.0703
-  L = Left camera
-  0 = no filter
-  M = Creator of the file
-  1 = version of the file

### Available 3d products:

- Point cloud - [XYL (XYZ linearized), .img extension, multispectral BSQ image](https://an.rsl.wustl.edu/mera/merxbrowser/downloadFile.aspx?cc=PR&ct=PR&ici=2N292280938XYLB100P0703L0M1)
- Multi-resolution textured mesh - [VIL (ViSTa format, .vst extension)](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2n292280938vilb100p0703l0m1.vst)
- [Height Map(.ht)](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2mesh_1869_n_137_ffl_0_v1.ht) ([label](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2mesh_1869_n_137_ffl_0_v1.lbl))
- ??? - [Silicon Graphics OpenGL Perfomer Fast Binary format (.pfb)](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2mesh_1869_n_137_ffl_0_v1.pfb)  ([label](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2mesh_1869_n_137_ffl_0_v1.lbl)) (**No readers/conveters available**)
- ??? - Silicon Graphics IRIS Inventor (.iv)  (**Where?!?**) ([Inventors tool for Windows](https://sourceforge.net/p/inventor-tools/wiki/Home/),  [Coin3d](https://en.wikipedia.org/wiki/Coin3D),  [python iv2dae.py converter](https://github.com/li-zhiqi/iv2dae),  [ivconv C source](http://web.archive.org/web/20120104203132/http://people.sc.fsu.edu/~jburkardt/cpp_src/ivcon/ivcon.cpp) )


Visual representation of XYZ product; not technically useful because it mixes X, Y and Z data, but useful for a visual overview:

![image](https://user-images.githubusercontent.com/1620953/175101311-26246539-8c68-4e4b-9f4b-6f2252266d4a.png)  ([Download it from notebook](https://an.rsl.wustl.edu/mera/merxbrowser/an3.aspx?))

Visible image:

![image](https://user-images.githubusercontent.com/1620953/175101558-0c6372cc-2980-463f-b07d-e4e8c83b3cba.png)




