#!/bin/bash

rm  -rf /tmp/out/homick_rpgmaker/www/dev
rm /tmp/out/homick_rpgmaker/www/README.md
rm /tmp/out/homick_rpgmaker/www/translationengine.html

# Linux game executable backup file
rm /tmp/out/homick_rpgmaker/Game.desktop~ 2>/dev/null

# Before running this script make sure that
# none of the following are actually used
rm /tmp/out/homick_rpgmaker/www/img/battlebacks1/*
rm /tmp/out/homick_rpgmaker/www/img/battlebacks2/*
rm /tmp/out/homick_rpgmaker/www/js/plugins/{AltMenuScreen,AltSaveScreen,EnemyBook,ItemBook,MadeWithMv,SimpleMsgSideView,WeaponSkill}.js

cp ../audio/bgm/{2049ers_2,burai_no_tame_no_warabeuta,mikansei_notooriasu_2,mirakuru_max_daakunesu_2,Summer_Adventure,tanyao_2}.* /tmp/out/homick_rpgmaker/www/audio/bgm
cp ../audio/se/{1,2,3,go,Explosion_04,Jump_03,Pickup_04,Collect_Point_01}.* /tmp/out/homick_rpgmaker/www/audio/se
cp ../img/pictures/{tiles,desert,jungle,moon,mars,saturn,sun,alpha_centauri,sirius,black_hole_outskirts,black_hole_plunging_region,black_hole_event_horizon}.png /tmp/out/homick_rpgmaker/www/img/pictures