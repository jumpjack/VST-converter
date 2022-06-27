layers:

- 0: SitePnts (137 sites, only 132 returned)
- 1: antPnts (?)
- 2: 1stSolPnts (660 drives? all 137 sites returned)
- 3: merbTraverse (segments)

Common url (Use "0" for sites, "2" for drives):

https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/2/query?   

- [Drives json](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/2/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2C+firstSol%2C+lastSol%2C+xCorrected%2C+yCorrected&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=json)  ([in this repo](https://github.com/jumpjack/VST-converter/blob/main/rover_location/drives.json))
   	 - geometry=[-1610.4237837504002,-865671.4374110398,1880.4909298295997,-862774.9735818899]
	 - geometryType=esriGeometryEnvelope
	 - spatialRel=esriSpatialRelIntersects
	 - outFields=rmcSite,rmcDrive,rmcPose,+firstSol,+lastSol,+xCorrected,+yCorrected
	 - returnGeometry=true
	 - returnTrueCurves=false
	 - returnIdsOnly=false
	 - returnCountOnly=false
	 - returnZ=false
	 - returnM=false
	 - returnDistinctValues=false
	 - returnExtentOnly=false
	 - featureEncoding=esriDefault
	 - f=**json**
- [Drives geojson](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/2/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2C+firstSol%2C+lastSol%2C+xCorrected%2C+yCorrected&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson) ([in this repo](https://github.com/jumpjack/VST-converter/blob/main/rover_location/drives.geojson))
- [Sites json](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2CfirstSol%2ClastSol%2CxCorrected%2CyCorrected&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=json) ([in this repo](https://github.com/jumpjack/VST-converter/blob/main/rover_location/sites.json)) (only 132 values returned rather than 137)
- [Sites geojson](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2CfirstSol%2ClastSol%2CxCorrected%2CyCorrected&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson) ([in this repo](https://github.com/jumpjack/VST-converter/blob/main/rover_location/sites.geojson))  (only 132 values returned rather than 137)
	 - geometry=[-1610.4237837504002,-865671.4374110398,1880.4909298295997,-862774.9735818899]
	 - geometryType=esriGeometryEnvelope
	 - spatialRel=esriSpatialRelIntersects
	 - outFields=rmcSite,rmcDrive,rmcPose,firstSol,lastSol,xCorrected,yCorrected
	 - returnGeometry=true
	 - returnTrueCurves=false
	 - returnIdsOnly=false
	 - returnCountOnly=false
	 - returnZ=false
	 - returnM=false
	 - returnExtentOnly=false
	 - featureEncoding=esriDefault
	 - f=**geojson**
- [Sites HTML](https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%5B-1610.4237837504002%2C-865671.4374110398%2C1880.4909298295997%2C-862774.9735818899%5D&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=rmcSite%2CrmcDrive%2CrmcPose%2CfirstSol%2ClastSol%2CxCorrected%2CyCorrected&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=html)
    - https://anmap.rsl.wustl.edu/arcgis/rest/services/MER/merApub2/MapServer/0/query?where=
    - geometry=[-1610.4237837504002,-865671.4374110398,1880.4909298295997,-862774.9735818899]
    - geometryType=esriGeometryEnvelope
    - spatialRel=esriSpatialRelIntersects
    - outFields=rmcSite,rmcDrive,rmcPose,firstSol,lastSol,xCorrected,yCorrected
    - returnGeometry=true
    - returnTrueCurves=false
    - returnIdsOnly=false
    - returnCountOnly=false
    - returnZ=false
    - returnM=false
    - returnDistinctValues=false
    - returnExtentOnly=false
    - featureEncoding=esriDefault
    - f=**html**
    
