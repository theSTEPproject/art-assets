# Running GEM-STEP

## After a major change / download
**NOTE**: This refers to updates from  the gem-step repo in gitlab / sourcetree. These aare usually due  to a change / new feature implemented  by Inquirium, and we'll let you know if this is needed. Though note  that it never hurts to do this, so feel free if you are unsure.

`npm ci`

`npm run bootstrap`

`npm run start`

## After a minor change
If we have only changed art assets, or ran this yesterday, just use this version.

`npm run start`

# Settings
- Merge request with expkanation: [171](https://gitlab.com/stepsys/gem-step/gsgo/-/merge_requests/171) 

To change the MQTT server and / or local assets location simply edit:

`gem-step/gs-packages/gem-srv/config/local-settings.json`

The current settings should be updated to:


    {
      "_INFO": [
        "Override constants defined gsgo-settings.js and gem-settings.js in this file",
        "Settings added here can be set for your gsgo installation, and will not be",
        "committed to the gsgo repo"
      ],
      "MQTT_URL": "10.0.0.254",
      "GS_ASSETS_PROJECT_ROOT": "art-assets"
    }


# Art assets
**NOTE**: The art assets, which are divided into references (documents like this), projects, and sprites are all stored in the art-assets repo. I've setup the lab mac to place this inside of gem-step, otherwise you'd have to downoad then copy by hand.

To change or check the location of the art assets, see local-settings (above).

- Merge request with basics: [159](https://gitlab.com/stepsys/gem-step/gsgo/-/merge_requests/159) 
- Merge request for adding art: [177](https://gitlab.com/stepsys/gem-step/gsgo/-/merge_requests/177)

### For basic images
- Any art can simply be added to the `gem-step/gs_assets/art-assets/sprites` folder.
- There is no need to use TexturePacker to create a spritesheet (.json file) if you do not need it.
- There is no need to create an asset manifest file.
- Use the filename to set the costume name, e.g. `featCall Costume setCostume 'bird.jpg'`

### For animations

- Name your graphic files with a number at the end representing the animation frame, e.g. fly1.png, fly2.png, fly3.png.
- Save them in `gem-step/gs_assets/art-assets/sprites`.
- Instead of using `setCostume`, call `setAnimatedCostume`.  e.g.

### Using the iPad

I found a free iPad app, Sketchbook, which supports layers, transparency, and resizing canvas.  The steps for a kid to make a character --- sketching a few frames of an animation (using layers as a guide) and then export and use airdrop to send to a computer with TexturePacker --- are manageable. 
 
So, if you only want a static character or scene element, you don’t need the layers idea.
 
But if you want to make “ant1” “ant2” … etc to make an animated character, you would
 
1. Start from a starter file that is the right canvas size
2. Make sure you’re pointing the character in the way you will need to (facing to the right for overhead perspectives)
3. Sketch image1
4. Add a layer, sketch image 2
5. Make the image 1 layer invisible
6. Add a layer, sketch image 3
7. Etc
8. Then, export each of the frames as images.
9. Then, send to the laptop via airdrop and put them in the sprites folder.
10. Then modift the code to reference them.
