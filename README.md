### Install

`npm i -g github:mitchdzugan/slp-rec`

### Usage

```
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


Example

  slp-rec \
    -f $SLPS/game.slp \
    -p 1=4 -p 2=0 \
    -x $REPOS/melee-recording-textures/CURRENT \
    -I GFX.Settings.AspectRatio=6 \
    -g Widescreen 16:9 \
    -s 900 \
    -t 180
  
  this will:
    - record the slippi file at "$SLPS/game/slp"
    - change port 1's colorscheme to the one with id 4 and port 2's to 0
    - overwrite default textures with any found at "$REPOS/melee-recording-textures/CURRENT"
    - set the property Settings.AspectRatio to 6 (widescreen value) in GFX.ini
    - enable the "Widescreen 16:9" gecko code
    - start the recording at 900 frames (15s) into the game
        !! 900 frames after the timer starts. you must supply negative frames if you want to record before "GO!"
    - record for a total of 180 frames from that point (3 seconds)
```

### Configuration

Check [/.SAMPLE-CONFIG](https://github.com/mitchdzugan/slp-rec/tree/main/.SAMPLE-CONFIG) for example configuration. OS specific configuration path location can be found by running `slp-rec -h`

