# Spirit

## Landing site position

There are various valuse for latitude and longitude of landing site, depending on source.

From [MER Analyst Notebook:](https://an.rsl.wustl.edu/help/Content/About%20the%20mission/MER/MER%20mission.htm) 

- In MOLA IAU 2000 frame (1): 
     - Latitude:  -14.571892 N  
     - Longitude: 175.478480 E 
     
- With respect to surface features in maps produced in the MOLA IAU 2000 cartographic reference frame:
     - Latitude:   -14.5690 N  
     - Longitude:  175.4729 E     
     
## Troy (final resting site) in Hirise images

 - [ESP_021925_1650](https://www.uahirise.org/ESP_021925_1650)
 - [ESP_013499_1650](http://hirise.lpl.arizona.edu/ESP_013499_1650) ([page](https://www.jpl.nasa.gov/images/pia12205-orbital-view-of-spirit-at-troy))

Context images
- Traverse map:

![image](https://user-images.githubusercontent.com/1620953/182660442-890e1fd5-61d1-4f2e-8164-1a4642929641.png)

- ESP_021925_1650 ([page](https://www.uahirise.org/ESP_021925_1650)) ([online viewer](http://viewer.mars.asu.edu/planetview/inst/hirise/ESP_021925_1650_COLOR#P=ESP_021925_1650_COLOR&T=2))

![image](https://user-images.githubusercontent.com/1620953/182660839-fd321502-4781-4afd-ad5d-e05fe7eb2216.png)

Hirise images interactive map: http://global-data.mars.asu.edu/bin/hirise.pl?res=32&clat=-14.57&clon=175.47&ids=PSP_002391_1995_COLOR&day_night=2&rel=0
     
## Digital elevation models
![image](https://user-images.githubusercontent.com/1620953/182662355-cf6cdd2d-5894-44d4-8ae0-f477ea92c4bd.png)

This folder contains digital elevation models (DEM), aka Digital Terrain Models (DTM) associated to some Hirise images; folders are grouped by orbit number, the first number in image name (e.g. ESP_021925_1650 would be in folder [ESP_021900](https://hirise-pds.lpl.arizona.edu/PDS/EXTRAS/DTM/ESP/ORB_021900_021999/):
https://hirise-pds.lpl.arizona.edu/PDS/EXTRAS/DTM/ESP/

DEMs/DTMs are grayscale images; you can view a depthmap, associating a visible map to it, using these online viewers:

 - https://depthmapviewer.ugocapeto.com/
 - http://win98.altervista.org/space/exploration/depthviewer-master ([source](https://github.com/kmgill/depthviewer))

Try with [this depthmap](https://hirise-pds.lpl.arizona.edu/PDS/EXTRAS/DTM/ESP/ORB_021900_021999/ESP_021914_1475_ESP_022336_1475/DTEEC_021914_1475_022336_1475_U01.br.jpg) associated to [this image](https://hirise-pds.lpl.arizona.edu/PDS/EXTRAS/DTM/ESP/ORB_021900_021999/ESP_021914_1475_ESP_022336_1475/ESP_021914_1475_RED_C_01_ORTHO.br.jpg).


## Traverse map

### Resources in KML format for Google Earth  
 - [MOLA basemap](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/Abasemap/MapServer/generateKml)
 - [Route map v.1](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/generateKml)
 - [Route map v.2](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merATraverse4/MapServer/generateKml)
 
 Parameters:
- docName=MER2_traverse_map
- l:0=on
- l:1=on
- l:2=on
- l:3=on
- layers=0,1,2,3
- layerOptions=nonComposite

Layers names:
- Layer 0: **SitePnts**       (sites points; not working? (no data in KML))
- Layer 1: **antPnts**        (???; not working? (no data in KML))
- Layer 2: **1stSolPnts**     (sol points)
- Layer 3: **merbTraverse**   (path lines)

My reverse-engineered urls:
 
 - [Route map to json](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/2/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2CfirstSol%2ClastSol%2CxCorrected%2CyCorrected&returnGeometry=true&returnTrueCurves=true&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson)
 - [Route map to geojson](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/2/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2CfirstSol%2ClastSol%2CxCorrected%2CyCorrected&returnGeometry=true&returnTrueCurves=true&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson
)

Beware of location/feature 545, probably it contains wrong data:

![immagine](https://user-images.githubusercontent.com/1620953/175960221-5cab14a5-9d28-4c16-b106-b01e266b985d.png)


### MOLA basemap url to download of PNG image

![immagine](https://user-images.githubusercontent.com/1620953/175939644-d2edaeb7-3282-419c-9a4f-a7b29c021f2a.png)


 - [Raw](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/Abasemap/MapServer/export?bbox=-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899&bboxSR=&layers=all&layerDefs=&size=12288%2C9216&imageSR=&historicMoment=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=html)
 - Exploded/cleaned:
     - bbox=-1610.4237837504002,-865671.4374110398,1880.4909298295997,-862774.9735818899
     - layers=all
     - size=12288,9216
     - format=png
     - transparent=false
     - f=html
 - Explained:
     - bbox= [bboxWest],[bboxSouth],[bboxEast],[bboxNorth]   or  [XMin],[YMin],[XMax],[YMax]
     - layers=all
     - size= Width, Height (in pixel)
     - format=png  
     - transparent=false
     - f=html // (html, json, image, kmz; json to see some metadata, reported here below; kmz contains only link to image, not image data)

### JSON metatdata for basemap

````
PROJCS["Equirectangular_MARS",
	GEOGCS["GCS_MARS",
		DATUM["D_Mars_2000",
			SPHEROID[
				"Mars_2000_IAU_IAG",
				3396190.0, 169.8944472236118
			]
		],
		PRIMEM["Reference_Meridian",0.0],
		UNIT["Degree",0.0174532925199433]
	],
	PROJECTION["Plate_Carree"],
	PARAMETER["false_easting",0.0],
	PARAMETER["false_northing",0.0],
	PARAMETER["central_meridian",175.5],
	PARAMETER["scale_factor",1.0],
	UNIT["Meter",1.0]
]
````

### Image corners (in meters)

- Xmin : -1610.4237837504002
- Ymin : -865671.4374110398
- Xmax : 1880.4909298295997
- Ymax : -862774.9735818899

### Image size (in meters)
- Width : -3490.9147135799999
- Height: -2896.4638291499000 
 
   

# Opportunity:

- In MOLA IAU 2000 frame (1): 
  - Latitude:   -1.948282 N  
  - Longitude: 354.474170 E 
- With respect to surface features in maps produced in the MOLA IAU 2000 cartographic reference frame:
     - Latitude:     1.946200 N   
     - Longitude:  354.473400 E 
  
--------

To locate each image in its correction position on Mars, it is needed to know where the rover was located while taking the image: this is defined in field "ROVER_MOTION_COUNTER" of PDS label of each image.
ROVER_MOTION_COUNTER is made of 5 values (see [documentation](https://pds-geosciences.wustl.edu/mer/mer2-m-eng-6-rmc-ops-v1/mer2rm_0xxx/document/rmc_sis.pdf)):
 - Site
 - Position or drive
 - IDD move (robotic arm)
 - PMA move (pancam)
 - HGA move (High Gain Antenna)

To know where on Mars a picture was taken, we need only first two values: "Site" and "Position" (position is sometimes called "drive"). 
"Position" is calculated w.r.t "site"; "site" is calculated w.r.t landing site.

For MER-2/Spirit, 138 sites were assigned along the mission.

Excerpts from PDS label:
````
/* COORDINATE SYSTEM STATE: ROVER */

GROUP                             = ROVER_COORDINATE_SYSTEM
  COORDINATE_SYSTEM_INDEX         = (137,0,0,13,7)    // Site n.137, position/drive n.0
  COORDINATE_SYSTEM_INDEX_NAME    = (SITE,DRIVE,IDD,PMA,HGA)
  COORDINATE_SYSTEM_NAME          = ROVER_FRAME
  ORIGIN_OFFSET_VECTOR            = (0.0,0.0,0.0)
  ORIGIN_ROTATION_QUATERNION      = (0.994261,-0.095668,-0.0233068,0.0418276)
  POSITIVE_AZIMUTH_DIRECTION      = CLOCKWISE
  POSITIVE_ELEVATION_DIRECTION    = UP
  QUATERNION_MEASUREMENT_METHOD   = FINE
  REFERENCE_COORD_SYSTEM_INDEX    = 137
  REFERENCE_COORD_SYSTEM_NAME     = SITE_FRAME
END_GROUP                         = ROVER_COORDINATE_SYSTEM
````

At this position, pancam orientation is given by:

````
/* ARTICULATION DEVICE STATE: PANCAM MAST ASSEMBLY */

GROUP                             = PMA_ARTICULATION_STATE
  ARTICULATION_DEVICE_ID          = "PMA"
  ARTICULATION_DEVICE_NAME        = "PANCAM MAST ASSEMBLY"
  ARTICULATION_DEVICE_ANGLE       = (2.47455 <rad>,-0.503045 <rad>,
                                     2.47456 <rad>,-0.503335 <rad>,
                                     0.123031 <rad>,-0.296701 <rad>)
  ARTICULATION_DEVICE_ANGLE_NAME  = ("AZIMUTH-MEASURED",
                                     "ELEVATION-MEASURED",
                                     "AZIMUTH-REQUESTED",
                                     "ELEVATION-REQUESTED","AZIMUTH-INITIAL"
                                     ,"ELEVATION-INITIAL")
  ARTICULATION_DEVICE_MODE        = DEPLOYED
END_GROUP                         = PMA_ARTICULATION_STATE
 ````
 
 To know where Pancam is pointed w.r.t Mars coordinates rather than Rover coordinates, we need to know position and orientation of rover at site 137, location 0.
 
 **How to do it?**  (I don't know as of now...)
 
---------
 Notes
 ````
 <solution solution_id="rmc_master_000" name="ROVER_FRAME" add_date="2004-01-04T07:30:56Z" index1="0" index2="0" index3="1" index4="14" index5="0">
        <reference_frame name="SITE_FRAME" index1="0"/>
        <offset x="-0.06" y="0.0" z="0.3"/>
        <orientation s="0.114944" v1="0.0183351" v2="-0.0117768" v3="0.993133"/>
        <derivation solution_id="mipl_hbm_pre-sunfind-quat-fix_1"/>
    </solution>
 ````
 
Each coordinate frame instance is specified by an **orientation** and an **offset**:
 
**Offset**: 3-space vector between the origin of the reference frame and the origin of the frame being defined (current = reference + origin).
 
**Orientation**: quaternion representing the rotation of the current frame with respect
to the reference frame (reference = current * orientation). The scalar part of the quaternion is listed first.
 - s = scalar
 - v = vector 1
 - v2 = vector 2
 - v3 = vector 3
 
For MER, a Site frame will always have an orientation of identity (1,0,0,0); thus **all Site frames are
assumed to be parallel**.
 
When a Rover frame is defined with a Site as its reference (the normal case), then the orientation
quaternion is the **orientation of the rover with respect to North/Nadir**.
 
--------------
 
 # Quaternion to Euler angles

 Yaw, pitch, roll may be referred to as heading, attitude and bank respectively in some literature.
 

- float roll  = atan2(2 * (v3 * v2 + s * v1) , 1 - 2 * (v1 * v1 + v2 * v2));
- float pitch = asin(2 * (v2 * s - v3 * v1));
- float yaw   = atan2(2 * (v3 * s + v1 * v2) , - 1 + 2 * (s * s + v1 * v1));

 Source: https://stackoverflow.com/a/37560411/1635670
 
 - Heading/yaw/azimuth
 - Attitude/pitch/elevation
 - Bank/roll
 
Navcam example:

  ORIGIN_ROTATION_QUATERNION     = (0.317432, 0.21062, -0.0725336, 0.921746)



- Heading/yaw/azimuth = 2.47455 <rad>
- Attitude/pitch/elevation = -0.503045 <rad>,
- Bank/roll = 0
 
 HGA:
 
 ARTICULATION_DEVICE_ANGLE       = (2.87999 <rad>,0.0198351 <rad>)
 
 -------
 
 Download sites offsets in webgeocalc:
 
 ![image](https://user-images.githubusercontent.com/1620953/175817835-cad1e5b1-6ff5-4405-82db-caa5c4604cce.png)

 
 - Site 1: 0.00027372 -0.00013544 1.82981479E-05
 - Site 2: 0 0 0
 - Site 3: 0.00108620 0.00215135 0.00157696
 - Site 4:-0.00810873 -0.01363858 0.00211876
 - Site 5: -0.01995905 -0.03136190 0.01249671
 - Site 137: -0.88704783 -2.89441062 -1.97389476


 ----
 
https://pds-geosciences.wustl.edu/mer/mer2-m-eng-6-rmc-ops-v1/mer2rm_0xxx/data/



# References
 -  (1)
**Report of the IAU/IAG working group on cartographic coordinates and rotational elements of the planets and satellites**
    - Year: [2000](https://link.springer.com/article/10.1023/A:1013939327465) (Updated every 3 years)
    - Cel. Mech. Dyn. Astron., 82, 83- 110, 2002.
    - Authors: 
        - Seidelmann, P.K.
        - V.K. Abalakin
        - M. Bursa
        - M.E. Davies
        - C. de Bergh
        - J.H. Lieske
        - J. Oberst
        - J.L. Simon
        - E.M. Standish
        - P. Stooke
        - P.C. Thomas
