### Install
`npm i --save github:mitchdzugan/slp-rec`

### Usage
```
Usage:

  slp-rec [OPT]* <slp> 

Options

  -h, --help                                    Display this usage guide.       
  -s, --start-frame <frame>                     First frame to begin recording  
                                                (default GAME_FRAME_START)      
  -t, --total-frames <frames>                   Total frames to record (default 
                                                all remaining)                  
  -q, --quality <qual>                          Quality preset to use for       
                                                recording                       
  -o, --output <mp4>                            The output mp4 filename         
  -i, --iso <iso>                               The melee iso to use while      
                                                recording                       
  -I, --ini <ini_filename>.<property>=<value>   modifications to default INI    
                                                configs                         
  -f, --file <slp>                              The slp file to record          
  -c, --gecko-code <gecko_filename>             gecko code to include           
  -g, --gecko-enable <gecko_codename>           non-default gecko codes to      
                                                enable                          
  -G, --gecko-disable <gecko_codename>          default gecko codes to disable  
  -x, --texture-path <directory>                folder containing textures to   
                                                inject                          
  -T, --temp-root <directory>                   directory to place temporary    
                                                work files                      
  -p, --port-colors <1|2|3|4>=<0|1|2|3|4|5>     color override for port         

  Project home: https://github.com/mitchdzugan/slp-rec
```
