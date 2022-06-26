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

/* COORDINATE SYSTEM STATE: ROVER */

GROUP                             = ROVER_COORDINATE_SYSTEM
**  COORDINATE_SYSTEM_INDEX         = (137,0,0,13,7)**    // Site n.137, position/drive n.0
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

At this position, pancam orientation is given by:

/* ARTICULATION DEVICE STATE: PANCAM MAST ASSEMBLY */

GROUP                             = PMA_ARTICULATION_STATE
  ARTICULATION_DEVICE_ID          = "PMA"
  ARTICULATION_DEVICE_NAME        = "PANCAM MAST ASSEMBLY"
**  ARTICULATION_DEVICE_ANGLE       = (2.47455 <rad>,-0.503045 <rad>,
                                     2.47456 <rad>,-0.503335 <rad>,
                                     0.123031 <rad>,-0.296701 <rad>)
  ARTICULATION_DEVICE_ANGLE_NAME  = ("AZIMUTH-MEASURED",
                                     "ELEVATION-MEASURED",
                                     "AZIMUTH-REQUESTED",
                                     "ELEVATION-REQUESTED","AZIMUTH-INITIAL"
                                     ,"ELEVATION-INITIAL"**)
  ARTICULATION_DEVICE_MODE        = DEPLOYED
END_GROUP                         = PMA_ARTICULATION_STATE
 
 To know where Pancam is pointed w.r.t Mars coordinates rather than Rover coordinates, we need to know position and orientation of rover at site 137, location 0.
 
 **How to do it?**  (I don't know as of now...)
 

https://pds-geosciences.wustl.edu/mer/mer2-m-eng-6-rmc-ops-v1/mer2rm_0xxx/data/

