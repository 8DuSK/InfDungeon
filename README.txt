Final Project:
Infinity Dungeon

Infinity Dungeon is a interactive rogue-like game. The player navigates procedurally generated rooms and corridors, 
fighting monsters, collecting treasure, and finding stairs to navigate further down the dungeon. The player and monsters
have levels, indicating how strong they are in combat. The player increases their level by defeating monsters and collecting
treaure, while monsters simply level with the current dungeon floor. The further the player progresses, the harder the game is.


How to run:
- Install neccessary dependancies to run the application
	1. Open console inside "Final Project" folder location
	2. Type "npm install --save three" to install THREE.js
	3. Type "npm install --save-dev vite" to install vite for execution

- To run application, open console inside "Final Project" folder location
and type "npx vite"

- If done correctly, the application will open on browser window


Controls:
- Move mouse to turn player

- W, A, S, and D keys to move player in 8 directions

- Left Shift key to fire projectile from in front of player

- Spacebar key to perform melee attack from in front of player

- E key to go to next floor when the player is standing on stair tiles

- P key to pause/unpause the game



Implemented topics:

- Complex and simple movement algorithims (All AI uses these algorithims in the game)
	Includes wander, seek, evade, arrive

- Simple A* Path finding (Some AI use path finding and following)

- Decision Making (The player uses a hierarchial state machine, and AI uses behaviour trees)

- Procedual Content Generation (Procedual Dungeon Generation for each floor)