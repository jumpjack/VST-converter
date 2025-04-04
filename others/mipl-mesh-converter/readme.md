See this repo: [https://github.com/jbeansp/mipl-mesh-converter](https://github.com/jbeansp/mipl-mesh-converter)

Supports .pfb (Performer Binary) and .iv (Inventor) files from MER missions.

Docker package to be compiled.

A windows executable is present in the repo, but it does not work due to missing dependencies:
- "MonoPosixHelper", which should be available
[here](https://www.mono-project.com/download/stable/) (200 MB, not tested)
- "pfb2osgx", which is in the parent folder of executable, but it's a linux executable, not windows (???)
