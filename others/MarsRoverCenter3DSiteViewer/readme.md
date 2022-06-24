Taken from here:  http://www.unmannedspaceflight.com/index.php?showtopic=2735&st=1

Author: user "Indian3000"

Several versions of this SW exist. Instructions differ from one version to another.

# Instructions

## MarsRoverCenter3DSiteViewer_ALPHA_1_base (Forum post [#195](http://www.unmannedspaceflight.com/index.php?showtopic=2735&view=findpost&p=85129)):

### Requirements

- MarsRoverCenter3DSiteViewer_ALPHA_1_base.zip 
- MarsRoverCenter3DSiteViewer_ALPHA_1_data.zip
- .NET Framework 2.0.
- sql server 2005 express ( or full version work too )
- DirectX 9.0c

### Installation

- unzip all files in one directory ( *base.zip + *data.zip )
- Start Application and close it.
- The application will have created a standart XML config file in EXE directory,  `%MACHINE_NAME%_config.xml`, looking like this:

![image](https://user-images.githubusercontent.com/1620953/175523761-c23ccf9a-1c19-4692-8138-a1051700fb9e.png)

Edit it and change entry with your PDS directory on your hard drive:

![image](https://user-images.githubusercontent.com/1620953/175523809-cc79f0b6-e14e-495b-af7a-3b3cec3a840f.png)

Notes :

 - you can add file only in panorama tab or 3D terrain or VST.
 - you can mix panorama file with VST or mix 3D terrain and VST ... or all three in a same time

BUT

you can not mix Differentes sites, ou can load only same site files. 

**In Panarama TAB**
add only EFF and [RSD](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/) left-eye product.

**In 3D terrain TAB**
Add only  [XYL](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/) file ( and you need the corresponding [RSL](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/) left-eye product in the same directory )

**In VST TAB**
add Only [.vst](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/) file.

For vst texture  try to find in the same directory the corresponding RSL file or in a pds local structure (config file)
example : 1n136278048vil1600p1980l0m1.vst texture is 1n136278048rsl1600p1980l0m1.img

Note: You can use \*RSL*\.IMG.jpg file in /browse rather than /data directory, but _only RSL_, not XYL in browse directory.

### Control Keys
- Arrows -> Navigation
- Enter -> Rover Mode

in Rover Mode.
- N : Next Frame.
- V : Left rotation
- B : Right rotation

in all mode
- Q : FOV++
- S : FOV--

Mouse Control :
- Left click for pan.
- Middle click for rotation.
- Wheel for zoom.

--------

Example of needed folder structure on local hard disk:

![image](https://user-images.githubusercontent.com/1620953/175525936-4364d299-26e5-43fe-969e-3988ecd14f7c.png)

-----------------

Files:
 - \*RSD\*.img: https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/ -  ([.JPG, browse version](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/))
 - \*RSL\*.img: https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/ - ([.JPG, browse version](https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/browse/sol1869/rdr/))
 - \*XYL\*.img: https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2no_0xxx/data/sol1869/rdr/
 - .VST (VIL products), .RGB (XYL products): https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/
