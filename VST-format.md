From the PDF file

# VSTHeader
| Type              | Value                                                                                                                |
|-------------------|----------------------------------------------------------------------------------------------------------------------|
| byte              | 'V'                                                                                                                 |
| byte              | 'S'                                                                                                                 |
| byte              | 'T'                                                                                                                 |
| byte              | '\0'                                                                                                                |
| byte[4]           | Byte order identifier. {3, 2, 1, 0} for big-endian; {0, 1, 2, 3} for little-endian.                               |
| int               | Binary major version number (0 for ViSTa files as described in this document).                                     |
| int               | Binary minor version number (8 for ViSTa files as described in this document).                                     |
| byte[4]           | Implementation Identifier (see Section 4).                                                                          |
| byte[8]           | Reserved for future use.                                                                                            |
| int               | Number of TextureRef listed in the file (≥ 1).                                                                     |
| int               | Number of Vertex listed in the file (≥ 1).                                                                          |
| int               | Number of LOD listed in the file (≥ 1).                                                                            |

# BoundingBox
| Type   | Value                  |
|--------|------------------------|
| float  | xmin    |
| float  | ymin       |
| float  | zmin     |
| float  | xmax       |
| float  | ymax      |
| float  | zmax       |


#  TextureRef: 
| Type        | Value                                                                                                                                               |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| byte[2048]  | An implementation-dependent persistent reference to the rectified version of an image acquired by the left camera of the stereo hardware  |


# CoordinateSystem: 
| Type        | Value                                                              |
|-------------|--------------------------------------------------------------------|
| byte[4096]  | Coordinate system specification (implementation-dependent).        |

# Vertex: 
| Type        | Value                                                           |
|-------------|-----------------------------------------------------------------|
| float       | (LSB first) texture coordinate s (see Section 7 for numeric limits). |
| float       | (LSB first) texture coordinate t (see Section 7 for numeric limits). |
| float       | (LSB first) spatial coordinate x.                               |
| float       | (LSB first) spatial coordinate y.                               |
| float       | (LSB first) spatial coordinate z.                               |

# LODHeader: 
| Type        | Value                                                                                                       |
|-------------|-------------------------------------------------------------------------------------------------------------|
| int         | Total size of this LOD, including LODHeader (bytes).                                                      |
| byte[8]     | Reserved for future use.                                                                                    |
| int         | Total number of distinct Vertex referenced in this LOD (≥ 1).                                            |
| float       | Eyepoint distance to terrain bounding box centroid (as specified directly after VSTHeader); threshold below which to consider switching to the next higher-resolution LOD (≥ 0; see below). |
| int         | Number of Patches listed in this LOD (≥ 1).                                                                |
| int         | Highest Vertex index referenced in this LOD (≥ 0).                                                        |


# PatchHeader: 
| Type        | Value                                                                                                                    |
|-------------|--------------------------------------------------------------------------------------------------------------------------|
| byte[8]     | Reserved for future use.                                                                                                 |
| int         | 0 if this is a triangle strip Patch, 1 if this is a point cloud Patch.                                                  |
| int         | ViSTa file index of the TextureRef that identifies the texture image to use for geometry in this patch (≥ 0).           |
| int         | Number of Index arrays in the patch (≥ 1).                                                                               |
| int         | Total number of Index listed in the patch (≥ 3 for triangle strip patches, ≥ 1 for point cloud patches).                |


# IndexArrayLength: 
| Type | Value                                                                                                                   |
|------|-------------------------------------------------------------------------------------------------------------------------|
| int  | The number of Index fields in the corresponding Index array (≥ 3 for Index arrays in triangle strip Patches; ≥ 1 for Index arrays in point cloud Patches). |


Struttura di Index: 
Type Value
int An index into the array of Vertex (≥ 0)

