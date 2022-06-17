# VST-converter
Converter for 3d mesh "VST" (ViSTa) files into modern 3d mesh files.

NASA used for Spirit and Opportunity rovers (MER - Mars Exploration Rovers) some peculiar file formats to store 3d reconstructions of terrain:

- .ht : Heightmap: The file contains 1 to 3 bands, each band representing a depth map; first band contains raw values; second band contains also interpolated values; 3rd band, if present, contains estimated errors
- .pfb: "Performer Fast Binary", used by "IRIS Performer" or "OpenGL Performer" from Silicon Grpahics (www.sgi.com), now dead; format details unknwon
- .iv: "Inventor" format; only for internal NASA use, not released to public
- **.vst: Used by ViSTa commercial software; widely documented in https://www-mipl.jpl.nasa.gov/external/VICAR_file_fmt.pdf , the document used to write source in this repository.**

# VST format

- A .vst file contains multiple "Levels Of Depth" (LODs), i.e. multiple "3d files", each one with different resolution.
- Each LOD contains 1 ore more "patches".
- Each patch contains a number of "arrays"
- An array can be a "face" (triangle) or a "point cloud", depending on a patch flag at offset 0x04 in patch header (0 = face, 1 = point cloud)

The higher the index of the LOD in the file, the higher is its resolution.

All of this means that each .VST file can be converted to a number of 3d files (one per each LOD) with different resolutions. 

Archive of .vst files for MER Spirit:
https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/

There were 4 cameras onboard:
 - 1 Pancam
 - 1 Navcam
 - 2 Hazcams (front and rear)
 
 Data are grouped by "site", i.e. reference points fixed along rover course; at each site 1 ore more "observations" may be associated.
 
Explanation of 2N292280938XYLB100P0703L0M1 name:

-  2 = MER2
-  N = NAVCAM
-  292280938 = Timestamp
-  XYL = Product type
-  B1 = Site 137
-  00 = Position 0
-  P0703 = Navcam Observation n.0703
-  L = Left camera
-  0 = no filter
-  M = Creator of the file
-  1 = version of the file

-------
# PLY format for reference

```
ply
format ascii 1.0           { ascii/binary, format version number }
comment made by anonymous  { comments keyword specified, like all lines }
element vertex VVVV        { number of vertex in the LOD }
property float32 x         { ok }
property float32 y         { ok  }
property float32 z         { ok  }
element face FFFF          { number of faces in the LOD }
property list uint8 int32 vertex_index    { each face is a list of int32 pointers to vertex; how many pointers is 
                                           given by an uint8 value before the values}
end_header                 { delimits the end of the header }
0 0 0                      { start of vertex list }
0 0 1
0 1 1
0 1 0
1 0 0
1 0 1
1 1 1
1 1 0
3 0 1 2                   { start of face list; in VST all faces are triangles }
3 7 6 5 
3 0 4 5 
3 1 5 6 
3 2 6 7 
3 3 7 4 
```
