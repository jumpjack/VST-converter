KML_HEADER= ''+
'<?xml version="1.0" encoding="UTF-8"?>\n'+
'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom" hint="target=mars">\n'+
'<Folder>\n'+
'	<name>foto</name>\n'+
'	<open>1</open>\n';

KML_FOOTER = '</Folder>\n'+
'</kml>\n';

function KML_PHOTO_TEMPLATE () {
  return '' +
    '<PhotoOverlay>\n'+
    '	<name>#NAME#</name>\n'+
    '	<Camera>\n'+
    '		<longitude>#LON#</longitude>\n'+
    '		<latitude>#LAT#</latitude>\n'+
    '		<altitude>2000</altitude>\n'+
    '		<heading>#HEAD#</heading>\n'+
    '		<tilt>#PITCH#</tilt>\n'+
    '		<roll>#ROLL#</roll>\n'+
    '		<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>\n'+
    '	</Camera>\n'+
    '	<Style>\n'+
    '		<IconStyle>\n'+
    '			<Icon>\n'+
    '				<href>:/camera_mode.png</href>\n'+
    '			</Icon>\n'+
    '		</IconStyle>\n'+
    '		<ListStyle>\n'+
    '			<listItemType>check</listItemType>\n'+
    '			<ItemIcon>\n'+
    '				<state>open closed error fetching0 fetching1 fetching2</state>\n'+
    '				<href>http://maps.google.com/mapfiles/kml/shapes/camera-lv.png</href>\n'+
    '			</ItemIcon>\n'+
    '			<bgColor>00ffffff</bgColor>\n'+
    '			<maxSnippetLines>2</maxSnippetLines>\n'+
    '		</ListStyle>\n'+
    '	</Style>\n'+
    '	<Icon>\n'+
    '		<href>#LINK#</href>\n'+
    '	</Icon>\n'+
    '<ViewVolume>\n'+
    '  <near>1000</near>\n'+
    '  <leftFov>-60</leftFov>\n'+
    '  <rightFov>60</rightFov>\n'+
    '  <bottomFov>-60</bottomFov>\n'+
    '  <topFov>60</topFov>\n'+
    '</ViewVolume>\n'+
    '	<Point>\n'+
    '		<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>\n'+
    '		<coordinates>#LON2#,#LAT2#,1</coordinates>\n'+
    '	</Point>\n'+
    '</PhotoOverlay>\n';


}
