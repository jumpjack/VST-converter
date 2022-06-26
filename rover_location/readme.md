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

  REFERENCE_COORD_SYSTEM_INDEX    = (137,0,0,13,7)
  REFERENCE_COORD_SYSTEM_NAME     = ROVER_FRAME


https://pds-geosciences.wustl.edu/mer/mer2-m-eng-6-rmc-ops-v1/mer2rm_0xxx/data/

