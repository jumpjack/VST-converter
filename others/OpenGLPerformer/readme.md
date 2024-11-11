OpenGL Perfomer by SGI (Silicon Graphics Inc.) was the only program able to load an display Performer Fast Binary (.PFB) 3d files. 
It should be possible to download a Windows version of this SW from archive.org, inside this CD iso file:

- [.iso files list](https://ia801603.us.archive.org/view_archive.php?archive=/21/items/twilight-dvd093/TWILIGHT_093_DVD2.iso&)
- Files for Performer are in folder 0047:
    - [Direct link to setup.exe](https://archive.org/download/twilight-dvd093/TWILIGHT_093_DVD2.iso/apps%2F0047%2Fsetup.exe) installer; this will install the free demo version

 
```
FEATURE performer_windows_sgi sgifd 3.2 permanent uncounted \ 7212DBE5A242
        VENDOR_STRING=1234554321 HOSTID=ANY
FEATURE performer_windows sgifd 3.2 permanent uncounted 73CACDBF4D9E \
        VENDOR_STRING=1234554321 HOSTID=ANY
```

Local mirror
- [setup.exe](http://windowsdraw.altervista.org/performer/setup.exe)



Other software to open/import PFB files:

- OpenSceneGraph: it declares compatibility with PFB files, but only if it is compiled against original Performer libraries; a OSG version compatibile with PFB files should probably contain **osgdb_pfb.dll** file in plugins folder, but I can't find this file anywhere.
- [Prefab3d](https://wiki.gamemaker3d.com/tools:prefab3d) declares compatibility with PFB files , nbut probably needs OSG plugin dll
- Worldviz Vizard apparently supports all pòlugins supported by OSG, but distribution does not contain the needed osgb_pfb.dll file
-  https://www.coin3d.org/ is compatible with SGI OpenInventor: possibly compatible with Pefrormer too?


SGI opensource software:
- https://web.archive.org/web/20171012095401/http://oss.sgi.com/cgi-bin/cvsweb.cgi/performer/src/conv/pfconv.c
- libpfdb ?
