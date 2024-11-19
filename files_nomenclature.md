For MER missions, the filename has this structure:

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

## scid (SpaceCraft IDentifier)
- Opportunity = 1
- Spirit = 2

## inst (instrument)
   - “P” - Panoramic camera
   - “N” - Navigation camera
   - “F” - Front Hazard Avoidance Camera
   - “R” - Rear Hazard Avoidance Camera
   - “M” - Microscopic Imager
   - “E” - Descent camera

## prod

See table of products below

## site

Position (site) in [traverse map](https://github.com/jumpjack/VST-converter/blob/main/MERA-MER2-Spirit_traverse_path.csv) ;
total sites for Spirit: 138; from site 137 it is visible the final resting position in Troy, i.e. site 138; site 137 is also
visible from above from site 132 (Sols 1363-1371 (see tab "map" in [notebook](https://an.rsl.wustl.edu/mera/AN/an3.aspx?))) 

Use of both integers and alphas allows for a total range of 0 thru 1295.
 
The valid values, in their progression, are as follows: 
- Range 0 thru 99            -  “00”, “01”, “02”… “99” 
- Range 100 thru 1035    -  “A0”, “A1” … “A9”, “AA”, “AB”…“AZ”, “B0”, “B1”… “ZZ”
- Range 1036 thru 1295  -  “0A”, “0B”…”0Z”, “1A”, “1B”…“9Z” 
- Range 1296 or greater -  “##” (2 pound signs) for Operations, or “__” (2 underscores) for Archive


## Position

Position-within-Site count.  Use of both integers and alphas allows for a total range of 0 thru 1295. A value greater than 1295 is denoted by “##“ (2 pound signs) for Operations and by “__“ (2 underscores) for Archive volumes, requiring the user to extract actual value from label. 
 
The valid values, in their progression, are as follows: 
- Range 0 thru 99            -  “00”, “01”, “02”… “99” 
- Range 100 thru 1035    -  “A0”, “A1” … “A9”, “AA”, “AB”…“AZ”, “B0”, “B1”… “ZZ” 
- Range 1036 thru 1295  -  “0A”, “0B”…”0Z”, “1A”, “1B”…“9Z” 
- Range 1296 or greater -  “##” (2 pound signs) for Operations, or “__” (2 underscores) for Archive

# Example

ID: 2n292378085xyxb128f0006r0m1.img

- 2: MER2
- n: Pancam
- 292378085: clock
- xyz : product "XYZ" RDR  (3d, pointcloud)        
- b1: site "B1"  (=137)
- 28: Position "28"
- f0006: sequenze "F0006"
- r: right eye
- 0: filter "0"
- m: author = MIPS
- 1: version = 1




# Javascript decoding algorithm (AI-generated) for Site and Position

```
function decodeAlphaNumeric(code) {
    const firstChar = code[0];
    const secondChar = code[1];

    // Simple number 0..99
    if (!isNaN(firstChar) && !isNaN(secondChar)) {
        return parseInt(code, 10);
    }

    // Alphanumeric couple ("A0" - "ZZ")
    const alphabetOffset = 'A'.charCodeAt(0); // Offset
    const firstValue = firstChar.charCodeAt(0) - alphabetOffset;

    let secondValue;

    if (isNaN(secondChar)) {
        // Second char = letter
        secondValue = secondChar.charCodeAt(0) - alphabetOffset + 10;
    } else {
        // Second char = number
        secondValue = parseInt(secondChar, 10);
    }

    // Final formula
    return 100 + firstValue * 36 + secondValue;
}
```
                                        
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
| XYZ RDR  (3d, pointcloud)                                                                                                                 | XYZ                      | XYL        |
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
| VISTA Terrain RDR   (3d, mesh, ViSTA format)                                                                                                      | VIS                      | VIL        |
| VISTA Terrain RDR (Thumbnail)  (3d, mesh, ViSTA format)                                                                              | VIT                      | VIN        |
| ASD Terrain RDR                                                                                                           | ASD                      | ASL        |
| ASD Terrain RDR (Thumbnail)                                                                                               | AST                      | ASN        |


