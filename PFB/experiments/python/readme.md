Experiments with python.

Starting from https://github.com/davepape/pfb_converter  I was able to obtain a code which properly reads and converts to .obj the ancient NASA files from MER missions:

## Minimal batch script -  conv.bat (Windows):

python pfb2obj.py --verbose 1 -t NASA  --LOD %1 --input C:\Users\cassi\Downloads\pfb\%2.pfb   --output  C:\Users\cassi\Downloads\mymodels\mix\%2-LOD%1-%3.obj -r %3

Usage:
conv LOD filename reference
  LOD: Level of details - 1 = higher
  filename: PFB filename without pfb extension
  reference: specify which axis to invert by prepending and undercore: x_yz will invert y; the order also counts

Note:
- NASA reference system: Z+ pointing to ground
- Typical 3d screen systems: Z+ out of the screen

## Raw python script

usage: 
pfb2obj.py [-h] [-t {NASA,other}] [-i INPUT] [-o OUTPUT] [-of OUTPUT_FOLDER] [-tf TEXTURES_FOLDER] [-bf BASE_FOLDER] [-l LOD] [-tse TEXTURE_SOURCE_EXTENSION] [-tde TEXTURE_DESTINATION_EXTENSION] [-ot ONLY_TEXTURES] [-r REFERENCE] [-v VERBOSE]

PFB 3d converter

options:
  -h, --help            show this help message and exit
  -t, --texture {NASA,other}
                        Options: NASA, other . Specify if texture are standard or for NASA rovers
  -i, --input INPUT     Input PFB file
  -o, --output OUTPUT   Output OBJ file (optional; if not specified, input file will be used as base for the name). Default: "input.OBJ"
  -of, --output-folder OUTPUT_FOLDER
                        Folder for output files (.obj+.mtl) and textures folder. Must be already present. Default: "mymodels\"
  -tf, --textures-folder TEXTURES_FOLDER
                        Folder to store downloaded textures, also referenced in MTL file. Default: "textures\"
  -bf, --base-folder BASE_FOLDER
                        Root folder for output folder Default: ".\"
  -l, --LOD LOD         Level Of Detail (LOD); 0 = higher definition, 6 = minimum definition. Default: "6"
  -tse, --texture-source-extension TEXTURE_SOURCE_EXTENSION
                        Original extension of texture, to be changed into argument of --texture-destination-extension. Default: "rgb"
  -tde, --texture-destination-extension TEXTURE_DESTINATION_EXTENSION
                        Final extension of texture, from original specified in --texture-source-extension. Default: "img.jpg"
  -ot, --only-textures ONLY_TEXTURES
                        Parses PFB file to extract only terxtures names. Default: "False"
  -r, --reference REFERENCE
                        Reference system: x_zy, xzy, xyz Default: "x_zy"
  -v, --verbose VERBOSE
                        Amount of debug messages shown
