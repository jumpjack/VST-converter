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
 
 ----
https://pds-geosciences.wustl.edu/mer/mer2-m-eng-6-rmc-ops-v1/mer2rm_0xxx/data/

