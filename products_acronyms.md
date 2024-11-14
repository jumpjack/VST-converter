These acronyms are used in filenames to distinguish products, i.e. type of contents of the files, which always have extension ".IMG"; for MER missions, the filename has this structure:

![image](https://github.com/user-attachments/assets/f77f2ead-1cb8-4c26-954d-790b363c4f16)

| Element | Offset | Length | Description                                                                                  |
|---------|--------|--------|----------------------------------------------------------------------------------------------|
| scid    | 1      | 1      | (1 integer) MER rover Spacecraft Identifier.                                                 |
| inst    | 2      | 1      | (1 alpha character) MER science instrument identifier                                        |
| sclk    | 3      | 9      | (9 integers) Starting Spacecraft Clock time.                                                 |
| prod    | 12     | 3      | (3 alpha characters) Product Type identifier of input data                                   |
| site    | 15     | 2      | (2 alphanumeric) Site location count                                                         |
| pos     | 17     | 2      | (2 alphanumeric) Position-within-Site count                                                  |
| seq     | 19     | 5      | (1 alpha character plus 4 integers) Sequence identifier.                                     |
| eye     | 24     | 1      | (1 alpha character) Camera eye (Left/Right)                                                  |
| flt     | 25     | 1      | (1 alphanumeric) Spectral filter position. Valid values are an integer range of 0-8          |
| who     | 26     | 1      | (1 alpha character) Product Creator indicator (“M” - MIPL (OPGS) at JPL)                     |
| ver     | 27     | 1      | (1 alphanumeric) Version identifier                                                          |
| .       | 28     | 1      | "." separator character                                                                      |
| ext     | 29     | 3      | (4 alpha characters) 3-character PDS product type extension following a "." character.       |

- scid: Opportunity = 1, Spirit = 2
- inst:
   - “P” - Panoramic camera
   - “N” - Navigation camera
   - “F” - Front Hazard Avoidance Camera
   - “R” - Rear Hazard Avoidance Camera
   - “M” - Microscopic Imager
   - “E” - Descent camera

- prod: see table of products below
- site: position (site) in [traverse map](https://github.com/jumpjack/VST-converter/blob/main/MERA-MER2-Spirit_traverse_path.csv) ;
total sites for Spirit: 138; from site 137 it is visible the final resting position in Troy, i.e. site 138; site 137 is also
visible from above from site 132 (Sols 1363-1371 (see tab "map" in [notebook](https://an.rsl.wustl.edu/mera/AN/an3.aspx?))) 

**Products table**

| Data Product Description                                                                                                  | Non-linearized (NOMINAL) | Linearized |
|---------------------------------------------------------------------------------------------------------------------------|--------------------------|------------|
| Full frame EDR                                                                                                            | EFF                      | n/a        |
| Sub-frame EDR                                                                                                             | ESF                      | n/a        |
| Downsampled EDR                                                                                                           | EDN                      | n/a        |
| Thumbnail EDR                                                                                                             | ETH                      | n/a        |
| Row Summed EDR                                                                                                            | ERS                      | n/a        |
| Column Summed EDR                                                                                                         | ECS                      | n/a        |
| Reference Pixels EDR                                                                                                      | ERP                      | n/a        |
| Histogram EDR                                                                                                             | EHG                      | n/a        |
| Inverse LUT RDR                                                                                                           | ILF                      | FFL        |
| Inverse LUT RDR (Sub-frame)                                                                                               | ISF                      | SFL        |
| Inverse LUT RDR (Downsampled)                                                                                             | INN                      | DNL        |
| Inverse LUT RDR (Thumbnail)                                                                                               | ITH                      | THN        |
| Radiometrically-corrected RDR calibrated to absolute radiance units                                                       | RAD                      | RAL        |
| Radiometrically-corrected RDR calibrated to absolute radiance units (Thumbnail)                                           | RAT                      | RAN        |
| MIPLRAD Radiometrically-corrected RDR calibrated to absolute radiance units, specific to archived datasets only           | MRD                      | MRL        |
| MIPLRAD Radiometrically-corrected RDR calibrated to absolute radiance units, specific to archived datasets only (Thumbnail)| MRT                      | MRN        |
| Rad-corrected Float (32-bit) RDR                                                                                          | RFD                      | RFL        |
| Rad-corrected Float (32-bit) RDR (Thumbnail)                                                                              | RFT                      | RFN        |
| Radiometrically-corrected RDR calibrated to I/F radiance factor                                                           | IOF                      | IOL        |
| Radiometrically-corrected RDR calibrated to I/F radiance factor (Thumbnail)                                               | IOT                      | ION        |
| Rad-corrected Float (32-bit) RDR calibrated to I/F radiance factor                                                        | IFF                      | IFL        |
| Rad-corrected Float (32-bit) RDR calibrated to I/F radiance factor (Thumbnail)                                            | IFT                      | IFN        |
| Sum of Rad-corrected Float (32-bit) RDR calibrated to I/F radiance factor, produced by MI Athena team                     | IFS                      | n/a        |
| Radiometrically-corrected RDR calibrated for instrument effects only, in DN                                               | CCD                      | CCL        |
| Radiometrically-corrected RDR calibrated for instrument effects only, in DN (Thumbnail)                                   | CCT                      | CCN        |
| Rad-corrected Float (32-bit) RDR calibrated for instrument effects only, in DN                                            | CFD                      | CFL        |
| Rad-corrected Float (32-bit) RDR calibrated for instrument effects only, in DN (Thumbnail)                                | CFT                      | CFN        |
| Disparity RDR                                                                                                             | DIS                      | DIL        |
| Disparity RDR (Thumbnail)                                                                                                 | DIT                      | DIN        |
| Disparity of Samples RDR                                                                                                  | DSS                      | DSL        |
| Disparity of Samples RDR (Thumbnail)                                                                                      | DST                      | DSN        |
| Disparity of Lines RDR                                                                                                    | DLS                      | DLL        |
| Disparity of Lines RDR (Thumbnail)                                                                                        | DLT                      | DLN        |
| XYZ RDR                                                                                                                   | XYZ                      | XYL        |
| XYZ RDR (Thumbnail)                                                                                                       | XYT                      | XYN        |
| XYZ Rover Vol Exclusion Mask RDR                                                                                          | MSK                      | MSL        |
| XYZ Rover Vol Exclusion Mask RDR (Thumbnail)                                                                              | MST                      | MSN        |
| X Component RDR                                                                                                           | XXX                      | XXL        |
| X Component RDR (Thumbnail)                                                                                               | XXT                      | XXN        |
| Y Component RDR                                                                                                           | YYY                      | YYL        |
| Y Component RDR (Thumbnail)                                                                                               | YYT                      | YYN        |
| Z Component RDR                                                                                                           | ZZZ                      | ZZL        |
| Z Component RDR (Thumbnail)                                                                                               | ZZT                      | ZZN        |
| Z Component RDR, produced by Athena MI team as Digital Elevation Model (DEM)                                              | DEM                      | n/a        |
| Range (Distance) RDR                                                                                                      | RNG                      | RNL        |
| Range (Distance) RDR (Thumbnail)                                                                                          | RNT                      | RNN        |
| UVW (XYZ) Surface Normal RDR                                                                                              | UVW                      | UVL        |
| UVW (XYZ) Surface Normal RDR (Thumbnail)                                                                                  | UVT                      | UVN        |
| U (X) Surface Normal RDR                                                                                                  | UUU                      | UUL        |
| U (X) Surface Normal RDR (Thumbnail)                                                                                      | UUT                      | UUN        |
| V (Y) Surface Normal RDR                                                                                                  | VVV                      | VVL        |
| V (Y) Surface Normal RDR (Thumbnail)                                                                                      | VVT                      | VVN        |
| W (Z) Surface Normal RDR                                                                                                  | WWW                      | WWL        |
| W (Z) Surface Normal RDR (Thumbnail)                                                                                      | WWT                      | WWN        |
| Surface Roughness RDR                                                                                                     | RUF                      | RUL        |
| Surface Roughness RDR (Thumbnail)                                                                                         | RUT                      | RUN        |
| Slope RDR                                                                                                                 | SLP                      | SLL        |
| Slope RDR (Thumbnail)                                                                                                     | SLT                      | SLN        |
| Slope Rover Direction RDR                                                                                                 | SRD                      | SRL        |
| Slope Rover Direction RDR (Thumbnail)                                                                                     | SRT                      | SRN        |
| Slope Heading RDR                                                                                                         | SHP                      | SHL        |
| Slope Heading RDR (Thumbnail)                                                                                             | SHT                      | SHN        |
| Slope Magnitude RDR                                                                                                       | SMP                      | SML        |
| Slope Magnitude RDR (Thumbnail)                                                                                           | SMT                      | SMN        |
| Solar Energy Product RDR                                                                                                  | SEP                      | SEL        |
| Solar Energy Product RDR (Thumbnail)                                                                                      | SET                      | SEN        |
| IDD Reachability RDR                                                                                                      | IDD                      | IDL        |
| IDD Reachability RDR (Thumbnail)                                                                                          | IDT                      | IDN        |
| VISTA Terrain RDR                                                                                                         | VIS                      | VIL        |
| VISTA Terrain RDR (Thumbnail)                                                                                             | VIT                      | VIN        |
| ASD Terrain RDR                                                                                                           | ASD                      | ASL        |
| ASD Terrain RDR (Thumbnail)                                                                                               | AST                      | ASN        |


