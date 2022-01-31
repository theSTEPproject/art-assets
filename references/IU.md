# Running GEM-STEP

## After a major change / download
Anytime we get new code from Inquirium, it's not a bad idea to do this. 

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

# Art assets
- Merge request with basics: [159](https://gitlab.com/stepsys/gem-step/gsgo/-/merge_requests/159) 
- Merge request for adding art: [177](https://gitlab.com/stepsys/gem-step/gsgo/-/merge_requests/177)

To change or check the location of the art assets, see local-settings (above).

### For basic images:
- Any art can simply be added to the `/gs_assets/art-assets/sprites` folder.
- There is no need to use TexturePacker to create a spritesheet (.json file) if you do not need it.
- There is no need to create an asset manifest file.
- Use the filename to set the costume name, e.g. `featCall Costume setCostume 'bird.jpg'`

### For animations

- Name your graphic files with a number at the end representing the animation frame, e.g. fly1.png, fly2.png, fly3.png.
- Save them in `/gs_assets/art-assets/sprites`.
- Instead of using `setCostume`, call `setAnimatedCostume`.  e.g.
