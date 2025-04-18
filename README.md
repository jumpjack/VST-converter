# VST-converter
Converter for 3d mesh "VST" (ViSTa) files into modern 3d mesh files.

Created to reconstruct the 3d model of "Troy sandtrap", the final location of NASA [Spirit/MER2/MER-a rover](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JE003633)

![troy](stuck2.png)

(Image credits: https://www.planetary.org/space-images/spirit-a-monument-to-exploration)

![troy](homeplate.png)

![troy](traverse-homeplate.png)

Coordinate system (rover frame):

![image](https://github.com/user-attachments/assets/38c98274-92fd-403f-8ab4-55230ade040b)

![image](https://github.com/user-attachments/assets/ac65172b-860e-4823-af59-94aefff46129)

![image](https://github.com/user-attachments/assets/60872ef0-6bf6-445c-87eb-20d74e8914dc)

Rotation order:

1. Positive rotation ψ about the ZS axis, resulting in the primed system.
2. Positive rotation θ about the y’ axis, resulting in the double primed system.
3. Positive rotation φ about the x’’ axis, resulting in the final unprimed system. 

ZS = unit vector that is normal to the Mars IAU Reference Ellipsoid

 ([source](https://planetarydata.jpl.nasa.gov/img/data/mer2-m-pancam-5-solar-ops-v1.0/mer2po_0xxx/document/mer_pppcs_excerpts.pdf))

 

Try here: [link](https://jumpjack.github.io/VST-converter/MER-experiments.html) 


3 versions of the converter are **under development**:

- VST-converter.html: raw javascript; developed stopped at "patch" level and continued on VST-converter-kaitai.html
- **VST-converter-kaitai.html**: based on VST parsing library created with kaitai-struct; requires VST.js in same folder; this file was  automatically created by [kaitai-struct](https://kaitai.io/) using my [VST.ksy](https://github.com/jumpjack/VST-converter/blob/main/VST.ksy) file. Such file can also be used to automatically create a VST library for other languages (java, c, c++. Perl, PHP, Python...)
- x3d-viewer:based on vst2x3d cpp source, mixed with above versions, enhanced with massive help from AI (Openai ChatGPT, Claude Sonnet and others)
- [others](https://github.com/jumpjack/VST-converter/tree/main/others/VST2something): other tools found around on forum or repositories
    - VST2OBJ: converts to Wavefront .obj format; DOS executable; no source code
    - VST2X3D: converts to X3D format; DOS execxutable; source code available
    
------------------

NASA used for Spirit and Opportunity rovers (MER - Mars Exploration Rovers) some peculiar file formats to store 3d reconstructions of terrain:

- .ht : Heightmap: The file contains 1 to 3 bands, each band representing a depth map; first band contains raw values; second band contains also interpolated values; 3rd band, if present, contains estimated errors. [Example folder](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/).
- .pfb: "Performer Fast Binary", used by ["IRIS Performer" or "OpenGL Performer" from Silicon Graphics ](https://en.wikipedia.org/wiki/OpenGL_Performer)(www.sgi.com), now dead; format details unknown. [Example folder](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/) . See below for further details.
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

### Mesh/3d (.ht, **.vst**, .pfb)
- [Navcam - mer2mw_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/) 
- [Hazcam - mer2mw_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/) (as above)
- [Pancam - mer2mw_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/) (as above)

Query to list all available XYZ products for a specified site:

[query](https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?pds.INSTRUMENT_HOST_ID=MERA/MER2/Spirit&pds.atlas_instrument_name=pancam&identifier=*xyl*&pds.ROVER_MOTION_COUNTER_SITE=137&rows=0&wt=json)

 
Split:

- https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?
- pds.INSTRUMENT_HOST_ID=MERA/MER2/Spirit
- pds.atlas_instrument_name=pancam
- identifier=\*xyl*\ **- product type for XYZ is XYL**
- pds.ROVER_MOTION_COUNTER_SITE=137
- rows=0 **- to get just results count**

Once you get the count of results, use this query to get all of them in CSV format:

[query](https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?identifier=*xyl*&pds.FILTER_NAME=*l*&pds.INSTRUMENT_HOST_ID=MERA/MER2/Spirit&pds.atlas_instrument_name=pancam&mission=mars*exploration*rover&pds.ROVER_MOTION_COUNTER_SITE=137&wt=csv&rows=1000&fl=FILE_NAME&fl=FILTER_NAME&fl=SEQUENCE_ID&fl=INSTRUMENT_HOST_ID) (please use needed number of rows/result)

https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?
identifier=\*xyl\*
pds.FILTER_NAME=\*l\*
pds.INSTRUMENT_HOST_ID=MERA/MER2/Spirit
pds.atlas_instrument_name=pancam
pds.ROVER_MOTION_COUNTER_SITE=137
wt=csv
rows=1000
fl=FILE_NAME
fl=FILTER_NAME
fl=SEQUENCE_ID
fl=INSTRUMENT_HOST_ID

### Mosaics
- [Navcam - mer2om_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2om_0xxx/)
- [Hazcam - mer2om_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2om_0xxx/) (as above)
- [Pancam - mer2om_0xxx](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2om_0xxx/) (as above)

## Textures (FFL) for VST files:

### Navcam
 -    [raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/)
 - [browse](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/)

### Hazcam
 -    [raw](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2ho_0xxx/data/sol1869/rdr/)
 - [browse](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2ho_0xxx/browse/sol1869/rdr/)
 
### API for Queries:
- Basic instructions: https://pds-imaging.jpl.nasa.gov/tools/atlas/api/
- Detailed instructions: https://pds.nasa.gov/services/pds4_pds_search_protocol.pdf (PDF)
- Third party detailed instructions (by apache.org): https://solr.apache.org/guide/8_11/the-standard-query-parser.html

#### Query 1
 To look for available images for texturing,you can use this [query](https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?mission=mars*exploration*rover&product_type=%22edr%22&pds.ROVER_INSTRUMENT_ELEVATION=[-90%20to%205]&pds.ROVER_MOTION_COUNTER_SITE=137&pds.FILTER_NAME=*l7*&pds.eye=left), which can be split in:

- https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search? *  -  base address*
- mission=mars\*exploration\*rover **- mission**
- product_type="mer" **- processed images**
- pds.ROVER_INSTRUMENT_ELEVATION=[-90 to 5] **- elevation of pancam (interval)**
- pds.ROVER_MOTION_COUNTER_SITE=137 **- Site 137 (final position)**
- pds.FILTER_NAME=\*L7\* **- Filters are L2, L3, L4, L5, l6, L7; combine L2 + L5 + L7 to create colore texture**
- pds.eye=left **- left camera**

#### Query 2
A more advanced query allows listing only the filenames corresponding to specified parameter, and allows combining multiple values for filter by "OR" operator:

https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?pds.FILTER_NAME=*l2*&pds.FILTER_NAME=\*l7\*&&spacecraft_name=spirit&atlas_instrument_name=pancam&mission=mars*exploration*rover&pds.ROVER_MOTION_COUNTER_SITE=137&wt=json&fl=FILE_NAME&rows=1000

Split:

- https://pds-imaging.jpl.nasa.gov/solr/pds_archives/search?
- pds.FILTER_NAME=\*l2\* 
- pds.FILTER_NAME=\*l7\* **- Repeating same parameter with different values results in "OR"**
- spacecraft_name=spirit
- atlas_instrument_name=pancam
- mission=mars\*exploration\*rover
- pds.ROVER_MOTION_COUNTER_SITE=137
- wt=json **- output format: default=json; available: xml, csv, ..?**
- fl=FILE_NAME **- fields in output**
- rows=1000 **- output size**

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
- 3d multimesh file - [Silicon Graphics OpenGL Perfomer Fast Binary format (.pfb)](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2mesh_1869_n_137_ffl_0_v1.pfb)  ([label](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/2mesh_1869_n_137_ffl_0_v1.lbl)) (Only **SGI OpenGL Performer** and  **SGI Perfly** can open these files, but they are no more downloadable since Silicon Graphics disappeared from internet years ago. Ancient project [OpenPFB](https://github.com/j3k0/OpenPFB) attempts opening some of these files, but how to display them? I am working to my  own [PFB-converter](https://jumpjack.github.io/VST-converter/PFB-converter-kaitai.html), which currently can only extract from PFB files the list of depth-images and textures to pass to [Blender NAVCAM importer](https://github.com/phaseIV/Blender-Navcam-Importer) or to my enhanced version of Blender importer, now able to import from navcam, pancam and hazcam: [https://github.com/jumpjack/Blender-Navcam-Importer](https://github.com/jumpjack/Blender-Navcam-Importer).)
- Silicon Graphics IRIS Open Inventor (.iv)  (For internal use, not released to public, destroyed after processing) ([Inventors tool for Windows](https://sourceforge.net/p/inventor-tools/wiki/Home/),  [Coin3d](https://en.wikipedia.org/wiki/Coin3D),  [python iv2dae.py converter](https://github.com/li-zhiqi/iv2dae),  [ivconv C source](http://web.archive.org/web/20120104203132/http://people.sc.fsu.edu/~jburkardt/cpp_src/ivcon/ivcon.cpp) )


Visual representation of XYZ product; not technically useful because it mixes X, Y and Z data, but useful for a visual overview:

![image](https://user-images.githubusercontent.com/1620953/175101311-26246539-8c68-4e4b-9f4b-6f2252266d4a.png)  ([Download it from notebook](https://an.rsl.wustl.edu/mera/merxbrowser/an3.aspx?))

Visible image:

![image](https://user-images.githubusercontent.com/1620953/175101558-0c6372cc-2980-463f-b07d-e4e8c83b3cba.png)




