import React, {useRef, useEffect} from 'react'
import * as PIXI from "pixi.js";
import note1_1 from "../assets/img/test.png";
import Stats from "stats.js";
import {GlowFilter} from "@pixi/filter-glow";
import {Stage, ParticleContainer, Container, Sprite} from "@inlet/react-pixi";
const texture = new PIXI.Texture(new PIXI.Texture.from(note1_1))

let sprites = [], renderer = null, app = null
const spritesCount = 100
const glowFilter = new GlowFilter({distance: 6, outerStrength: 1, color: 0x000000})

const Raw = ()=>{
    const canvas = useRef()

    useEffect(()=>{
        app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
            view:canvas.current
        });

        // renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor:0xFFFFFF});
        // stage = new PIXI.Stage(0xFFFFFF);
        // renderer.context.mozImageSmoothingEnabled = false
        // renderer.context.webkitImageSmoothingEnabled = false;

        sprites = [...Array(spritesCount).keys()].map(e=> {
            let sprite = new PIXI.Sprite(texture)
            sprite.x = window.innerWidth/2
            sprite.y = window.innerHeight/2
            sprite.anchor.set(0.5)
            app.stage.addChild(sprite)
            sprite.filters = [glowFilter]
            return sprite
        })

        app.ticker.add(()=>{
            sprites.forEach((sprite, index)=>{
                sprite.position.x += Math.cos(Math.PI*2/100*index) * 0.3
                sprite.position.y += Math.sin(Math.PI*2/100*index) * 0.3
            })
        })

        const stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );

        app.ticker.add(()=>{
            stats.begin();
            stats.end();
        })
    },[])

    // useTick((delta)=>{
    //     sprites.forEach((sprite,index)=> {
    //         sprite.position.x += Math.cos(Math.PI*2/100*index)*5
    //         sprite.position.y += Math.sin(Math.PI*2/100*index)*5
    //     })
    // })

    return (<canvas ref={canvas}></canvas>)
}

const Particle = ()=>{

    return <Stage
        width={window.innerWidth}
          height = {window.innerHeight}
          onMount={app=>{
          console.assert(app.renderer instanceof PIXI.Renderer,'not pixi renderer')
          const pc = new PIXI.ParticleContainer(spritesCount, {
              scale: true,
              position: true,
              rotation: true,
              uvs: true,
              alpha: true,
          });
          app.stage.addChild(pc)

        let sprites = [...Array(spritesCount).keys()].map(e=> {
            let sprite = new PIXI.Sprite(texture)
            sprite.x = window.innerWidth/2
            sprite.y = window.innerHeight/2
            sprite.anchor.set(0.5)
            pc.addChild(sprite)
            // sprite.filters = [glowFilter]
            return sprite
        })

        app.ticker.add(()=>{
            sprites.forEach((sprite, index)=>{
                sprite.position.x += Math.cos(Math.PI*2/100*index) * 0.3
                sprite.position.y += Math.sin(Math.PI*2/100*index) * 0.3
            })
        })

        const stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );

        app.ticker.add(()=>{
            stats.begin();
            stats.end();
        })
    }}>
    </Stage>
}

const Particle2 = ()=>{
    const canvas = useRef(null)
    useEffect(()=>{
    },[])
    return (<Stage
        width={window.innerWidth} height={ window.innerHeight} backgroundColor={0x1099bb} resolution={window.devicePixelRatio || 1}
        onMount={app=>{

        console.assert(app.renderer instanceof PIXI.Renderer,'not pixi renderer')

        const sprites = new PIXI.ParticleContainer(10000, {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true,
        });
        app.stage.addChild(sprites);

// create an array to store all the sprites
        const maggots = [];

        const totalSprites = app.renderer instanceof PIXI.Renderer ? 10000 : 100;

        for (let i = 0; i < totalSprites; i++) {
            // create a new Sprite
            const texture = new PIXI.Texture.from(!i&1?'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png'
                :'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/maggot_tiny.png')
            const dude = PIXI.Sprite.from(texture);

            dude.tint = Math.random() * 0xE8D4CD;

            // set the anchor point so the texture is centerd on the sprite
            dude.anchor.set(0.5);

            // different maggots, different sizes
            dude.scale.set(0.8 + Math.random() * 0.3);

            // scatter them all
            dude.x = Math.random() * app.screen.width;
            dude.y = Math.random() * app.screen.height;

            dude.tint = Math.random() * 0x808080;

            // create a random direction in radians
            dude.direction = Math.random() * Math.PI * 2;

            // this number will be used to modify the direction of the sprite over time
            dude.turningSpeed = Math.random() - 0.8;

            // create a random speed between 0 - 2, and these maggots are slooww
            dude.speed = (2 + Math.random() * 2) * 0.2;

            dude.offset = Math.random() * 100;

            // finally we push the dude into the maggots array so it it can be easily accessed later
            maggots.push(dude);

            sprites.addChild(dude);
        }

// create a bounding box box for the little maggots
        const dudeBoundsPadding = 100;
        const dudeBounds = new PIXI.Rectangle(
            -dudeBoundsPadding,
            -dudeBoundsPadding,
            app.screen.width + dudeBoundsPadding * 2,
            app.screen.height + dudeBoundsPadding * 2,
        );

        let tick = 0;

        app.ticker.add(() => {
            // iterate through the sprites and update their position
            for (let i = 0; i < maggots.length; i++) {
                const dude = maggots[i];
                dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05;
                dude.direction += dude.turningSpeed * 0.01;
                dude.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
                dude.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);
                dude.rotation = -dude.direction + Math.PI;

                // wrap the maggots
                if (dude.x < dudeBounds.x) {
                    dude.x += dudeBounds.width;
                } else if (dude.x > dudeBounds.x + dudeBounds.width) {
                    dude.x -= dudeBounds.width;
                }

                if (dude.y < dudeBounds.y) {
                    dude.y += dudeBounds.height;
                } else if (dude.y > dudeBounds.y + dudeBounds.height) {
                    dude.y -= dudeBounds.height;
                }
            }

            // increment the ticker
            tick += 0.1;
            // console.log(app.ticker.FPS)
        });

        // const stats = new Stats();
        // stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        // document.body.appendChild( stats.dom );
        //
        // app.ticker.add(()=>{
        //     stats.begin();
        //     stats.end();
        // })
    }}>

    </Stage>)
}

const Particle3 = ()=>{
    return (<Stage>
        <ParticleContainer
            properties={{
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                alpha: true,
            }}
        >
            <Sprite
                anchor={0.5}
                x={175}
                y={175}
                image="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png"
            />
            <Sprite
                anchor={0.5}
                x={0}
                y={0}
                image="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/maggot_tiny.png"
            />
            <Sprite
                anchor={0.5}
                x={75}
                y={75}
                image="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png"
            />
        </ParticleContainer>
    </Stage>)
}

export default Particle2