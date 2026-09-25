import Phaser from 'phaser';
import {
  type ZoneName, BUILDINGS, NPC_DEFS, ENEMY_SPAWNS,
  CAMPUS_SIGNS, type EnemyDef
} from './gameData';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const TILE = 16;
const COLS = 80;
const ROWS = 60;
const WORLD_W = TILE * COLS;
const WORLD_H = TILE * ROWS;
const SCALE = 3;

const T_GRASS = 0, T_PATH = 1, T_WATER = 2, T_SAND = 3, T_DARK_GRASS = 4, T_FLOWER = 5;

const TILE_COLOURS: Record<number, number> = {
  [T_GRASS]: 0x4CAF50, [T_PATH]: 0xD2B48C, [T_WATER]: 0x1565C0,
  [T_SAND]: 0xF5DEB3, [T_DARK_GRASS]: 0x388E3C, [T_FLOWER]: 0x66BB6A,
};

const PLAYER_PIXELS: Record<string, number[][]> = {
  down: [
    [0,0,0,1,1,1,1,0,0,0],[0,0,1,2,2,2,2,1,0,0],[0,0,1,2,3,3,2,1,0,0],
    [0,0,1,2,3,3,2,1,0,0],[0,0,0,1,2,2,1,0,0,0],[0,1,1,4,4,4,4,1,1,0],
    [0,1,4,4,4,4,4,4,1,0],[0,1,4,4,4,4,4,4,1,0],[0,1,4,5,4,4,5,4,1,0],
    [0,0,1,4,4,4,4,1,0,0],[0,0,1,4,0,0,4,1,0,0],[0,0,1,5,0,0,5,1,0,0],
    [0,0,1,5,0,0,5,1,0,0],
  ],
  up: [
    [0,0,0,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,0,0],
    [0,0,1,2,2,2,2,1,0,0],[0,0,0,1,2,2,1,0,0,0],[0,1,1,4,4,4,4,1,1,0],
    [0,1,4,4,4,4,4,4,1,0],[0,1,4,4,4,4,4,4,1,0],[0,1,4,4,4,4,4,4,1,0],
    [0,0,1,4,4,4,4,1,0,0],[0,0,1,4,0,0,4,1,0,0],[0,0,1,5,0,0,5,1,0,0],
    [0,0,1,5,0,0,5,1,0,0],
  ],
  left: [
    [0,0,0,1,1,1,1,0,0,0],[0,0,1,2,2,2,2,1,0,0],[0,0,1,3,2,2,2,1,0,0],
    [0,0,1,2,2,2,2,1,0,0],[0,0,0,1,2,2,1,0,0,0],[1,1,1,4,4,4,4,1,0,0],
    [1,4,4,4,4,4,4,1,0,0],[1,4,4,4,4,4,4,1,0,0],[0,1,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,1,0,0],[0,0,1,5,0,4,1,0,0,0],[0,0,1,5,0,1,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0],
  ],
  right: [] as number[][],
};
PLAYER_PIXELS.right = PLAYER_PIXELS.left.map(row => [...row].reverse());

const PLAYER_PALETTE = ['#00000000', '#1a1a2e', '#ffcc99', '#ff9966', '#3a86ff', '#1a5cd8'];

// ─── CAMPUS SCENE ───────────────────────────────────────────────────────────
export class CampusScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private playerGfx!: Phaser.GameObjects.RenderTexture;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private zoneRects: Array<{ name: ZoneName; rect: Phaser.Geom.Rectangle }> = [];
  private activeZone: ZoneName | null = null;
  private wallGroup!: Phaser.Physics.Arcade.StaticGroup;
  private waterGroup!: Phaser.Physics.Arcade.StaticGroup;
  private treeGroup!: Phaser.Physics.Arcade.StaticGroup;
  private lastDir: string = 'down';
  private animFrame = 0;
  private animTimer = 0;
  private footstepTimer = 0;
  private swordCooldown = 0;
  private swordKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private invincTimer = 0;
  private playerHp = 5;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: number }> = [];
  private particleGfx!: Phaser.GameObjects.Graphics;
  private map: number[][] = [];
  private enemies: Array<{ sprite: Phaser.Physics.Arcade.Image; gfx: Phaser.GameObjects.RenderTexture; dir: number; timer: number; hp: number; maxHp: number; def: EnemyDef; nameText: Phaser.GameObjects.Text }> = [];
  private npcSprites: Array<{ sprite: Phaser.GameObjects.Container; zone: ZoneName; tileX: number; tileY: number }> = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private signTexts: Phaser.GameObjects.Text[] = [];

  // Trees positions
  private trees: [number, number][] = [
    [3,25],[5,35],[3,50],[3,70],[45,2],[48,5],[50,75],[53,72],
    [20,2],[25,6],[57,5],[58,50],[12,30],[15,35],[42,22],[44,25],
    [8,45],[16,55],[22,70],[28,3],[34,72],[38,10],[48,35],[55,15],
    [7,18],[25,50],[33,65],[42,70],[52,25],[56,62],
  ];

  constructor() { super('campus-scene'); }

  create() {
    this.cameras.main.setBackgroundColor('#1a2e1a');
    this.physics.world.setBounds(0, 0, WORLD_W * SCALE, WORLD_H * SCALE);
    this.cameras.main.setBounds(0, 0, WORLD_W * SCALE, WORLD_H * SCALE);

    this.wallGroup = this.physics.add.staticGroup();
    this.waterGroup = this.physics.add.staticGroup();
    this.treeGroup = this.physics.add.staticGroup();

    this.buildMap();
    this.drawMap();
    this.drawBuildings();
    this.drawTrees();
    this.drawDecorations();
    this.createNPCs();
    this.createPlayer();
    this.createEnemies();
    this.createSigns();
    this.particleGfx = this.add.graphics().setDepth(60);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;
    this.swordKey = this.input.keyboard!.addKey('Z');
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.interactKey = this.input.keyboard!.addKey('E');

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.moveTarget = new Phaser.Math.Vector2(wp.x, wp.y);
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.5);

    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.add.collider(this.player, this.waterGroup);
    this.physics.add.collider(this.player, this.treeGroup);
  }

  private buildMap() {
    this.map = Array.from({ length: ROWS }, () => Array(COLS).fill(T_GRASS));
    const m = this.map;

    // Dark grass patches
    [[5,5,15,12],[40,3,18,10],[60,8,12,14],[10,40,20,12],[50,45,16,10],[2,50,14,8]].forEach(([r,c,h,w]) => {
      for (let dr=0;dr<h;dr++) for (let dc=0;dc<w;dc++) { const rr=r+dr,cc=c+dc; if(rr<ROWS&&cc<COLS) m[rr][cc]=T_DARK_GRASS; }
    });

    // Flowers
    [[8,12],[22,18],[35,8],[12,45],[55,30],[45,55],[70,20]].forEach(([r,c]) => {
      for (let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) { const rr=r+dr,cc=c+dc; if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS) m[rr][cc]=T_FLOWER; }
    });

    // Horizontal main path
    for (let c=0;c<COLS;c++) { m[30][c]=T_PATH; m[31][c]=T_PATH; }
    // Vertical main path
    for (let r=0;r<ROWS;r++) { m[r][40]=T_PATH; m[r][41]=T_PATH; }

    // Paths to buildings
    for (let r=8;r<=30;r++) { m[r][10]=T_PATH; m[r][11]=T_PATH; }
    for (let r=8;r<=30;r++) { m[r][58]=T_PATH; m[r][59]=T_PATH; }
    for (let c=41;c<=65;c++) { m[34][c]=T_PATH; m[35][c]=T_PATH; }
    for (let r=31;r<=48;r++) { m[r][18]=T_PATH; m[r][19]=T_PATH; }
    for (let r=31;r<=48;r++) { m[r][56]=T_PATH; m[r][57]=T_PATH; }

    // Water pond
    for (let r=33;r<=40;r++) for (let c=44;c<=53;c++) m[r][c]=T_WATER;
    for (let r=34;r<=39;r++) for (let c=43;c<=54;c++) m[r][c]=T_WATER;
    // Sand beach
    for (let r=32;r<=41;r++) for (let c=42;c<=55;c++) { if (m[r][c]!==T_WATER) m[r][c]=T_SAND; }

    // Building tiles
    BUILDINGS.forEach(b => {
      for (let r=b.row;r<b.row+b.h;r++) for (let c=b.col;c<b.col+b.w;c++) { if(r<ROWS&&c<COLS) m[r][c]=-1; }
    });
  }

  private drawMap() {
    const gfx = this.add.graphics().setDepth(0);
    for (let r=0;r<ROWS;r++) {
      for (let c=0;c<COLS;c++) {
        const tileId = this.map[r][c];
        if (tileId===-1) continue;
        const color = TILE_COLOURS[tileId] ?? 0x4CAF50;
        gfx.fillStyle(color);
        gfx.fillRect(c*TILE*SCALE, r*TILE*SCALE, TILE*SCALE, TILE*SCALE);

        if ((r+c)%2===0 && tileId!==T_WATER && tileId!==T_PATH && tileId!==T_SAND) {
          gfx.fillStyle(0x000000, 0.04);
          gfx.fillRect(c*TILE*SCALE, r*TILE*SCALE, TILE*SCALE, TILE*SCALE);
        }
        if (tileId===T_WATER) { gfx.fillStyle(0x1976D2); gfx.fillRect(c*TILE*SCALE+4, r*TILE*SCALE+4, TILE*SCALE-8, 4); }
        if (tileId===T_FLOWER) { gfx.fillStyle(0xFFEB3B); gfx.fillRect(c*TILE*SCALE+14, r*TILE*SCALE+14, 4, 4); gfx.fillStyle(0xFF80AB); gfx.fillRect(c*TILE*SCALE+24, r*TILE*SCALE+8, 4, 4); }
        if (tileId===T_PATH) { gfx.fillStyle(0xBCAAA4, 0.5); gfx.fillRect(c*TILE*SCALE+2, r*TILE*SCALE+2, 3, 3); }
      }
    }

    // Water collision
    for (let r=32;r<=41;r++) for (let c=42;c<=55;c++) {
      if (this.map[r]?.[c]===T_WATER) {
        const body = this.add.rectangle(c*TILE*SCALE+(TILE*SCALE)/2, r*TILE*SCALE+(TILE*SCALE)/2, TILE*SCALE, TILE*SCALE);
        this.physics.add.existing(body, true);
        this.waterGroup.add(body);
      }
    }
  }

  private drawBuildings() {
    const gfx = this.add.graphics().setDepth(5);
    BUILDINGS.forEach(b => {
      const x=b.col*TILE*SCALE, y=b.row*TILE*SCALE, w=b.w*TILE*SCALE, h=b.h*TILE*SCALE;

      gfx.fillStyle(0x000000, 0.2); gfx.fillRect(x+6, y+6, w, h);
      gfx.fillStyle(b.color); gfx.fillRect(x, y, w, h);
      gfx.fillStyle(b.roofColor); gfx.fillRect(x, y, w, h*0.35);
      gfx.fillStyle(0x000000, 0.15); gfx.fillRect(x, y+h*0.35-3, w, 3);

      const winW=TILE*SCALE-8, winH=TILE*SCALE-8;
      for (let wc=0;wc<3;wc++) {
        const wx=x+16+wc*(winW+12), wy=y+h*0.42;
        gfx.fillStyle(0x000000, 0.3); gfx.fillRect(wx-2, wy-2, winW+4, winH+4);
        gfx.fillStyle(0xFFF9C4); gfx.fillRect(wx, wy, winW, winH);
        gfx.fillStyle(0xCCB300, 0.6); gfx.fillRect(wx+winW/2-1, wy, 2, winH); gfx.fillRect(wx, wy+winH/2-1, winW, 2);
      }

      const doorW=TILE*SCALE+4, doorH=TILE*SCALE+8, doorX=x+w/2-doorW/2, doorY=y+h-doorH;
      gfx.fillStyle(b.doorColor); gfx.fillRect(doorX, doorY, doorW, doorH);
      gfx.fillStyle(0xFFD700); gfx.fillRect(doorX+doorW-10, doorY+doorH/2-4, 6, 8);

      this.add.text(x+w/2, y-14, b.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
        backgroundColor: '#000000cc', padding: { x: 6, y: 4 },
      }).setOrigin(0.5, 1).setDepth(15);

      this.add.text(x+w/2, y+h+8, '▼ Enter', {
        fontFamily: 'monospace', fontSize: '6px', color: '#FFD700',
      }).setOrigin(0.5, 0).setDepth(15);

      const wallBody = this.add.rectangle(x+w/2, y+h/2, w, h);
      this.physics.add.existing(wallBody, true);
      this.wallGroup.add(wallBody);

      this.zoneRects.push({ name: b.name, rect: new Phaser.Geom.Rectangle(x-16, y-16, w+32, h+48) });
    });
  }

  private drawTrees() {
    this.trees.forEach(([tRow, tCol]) => {
      if (tCol >= COLS || tRow >= ROWS) return;
      const x=tCol*TILE*SCALE, y=tRow*TILE*SCALE;
      const gfx = this.add.graphics().setDepth(10);
      gfx.fillStyle(0x000000, 0.2); gfx.fillEllipse(x+24, y+44, 30, 10);
      gfx.fillStyle(0x8B4513); gfx.fillRect(x+18, y+28, 12, 20);
      gfx.fillStyle(0x2E7D32); gfx.fillEllipse(x+24, y+28, 44, 36);
      gfx.fillStyle(0x388E3C); gfx.fillEllipse(x+24, y+18, 36, 28);
      gfx.fillStyle(0x43A047); gfx.fillEllipse(x+24, y+10, 24, 18);

      const treeBody = this.add.rectangle(x+24, y+36, 18, 14);
      this.physics.add.existing(treeBody, true);
      this.treeGroup.add(treeBody);
    });
  }

  private drawDecorations() {
    const gfx = this.add.graphics().setDepth(3);
    const lamps: [number, number][] = [
      [30,8],[30,20],[30,32],[30,50],[30,65],[30,75],
      [10,40],[20,40],[42,40],[50,40],
    ];
    lamps.forEach(([r,c]) => {
      const x=c*TILE*SCALE+8, y=r*TILE*SCALE;
      gfx.fillStyle(0x607D8B); gfx.fillRect(x+4, y+6, 4, 26);
      gfx.fillStyle(0xFFEE58, 0.9); gfx.fillEllipse(x+6, y+4, 14, 10);
      gfx.fillStyle(0xFFFF8D, 0.4); gfx.fillEllipse(x+6, y+4, 24, 20);
    });

    const benches: [number, number][] = [[29,6],[29,35],[31,55],[15,41]];
    benches.forEach(([r,c]) => {
      const x=c*TILE*SCALE, y=r*TILE*SCALE;
      gfx.fillStyle(0x8D6E63); gfx.fillRect(x, y+10, TILE*SCALE, 6);
      gfx.fillStyle(0x6D4C41); gfx.fillRect(x+2, y+16, 4, 10); gfx.fillRect(x+TILE*SCALE-6, y+16, 4, 10);
    });

    this.add.text(48*TILE*SCALE, 37*TILE*SCALE, '~~ Pond ~~', {
      fontFamily: 'monospace', fontSize: '8px', color: '#90CAF9',
    }).setOrigin(0.5).setDepth(4);

    // WiFi-down banner at center
    this.add.text(40*TILE*SCALE, 28*TILE*SCALE, '📵 WiFi: OFFLINE 📵', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#FF5252',
      backgroundColor: '#000000dd', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setDepth(15);
  }

  private createNPCs() {
    NPC_DEFS.forEach(npc => {
      const x = npc.tileX * TILE * SCALE;
      const y = npc.tileY * TILE * SCALE;

      const container = this.add.container(x, y).setDepth(18);

      // NPC body (drawn procedurally)
      const rt = this.add.renderTexture(0, 0, 40, 52);
      const tempGfx = this.add.graphics();
      const S = 4;
      const npcPixels = [
        [0,0,0,1,1,1,1,0,0,0],[0,0,1,2,2,2,2,1,0,0],[0,0,1,2,3,3,2,1,0,0],
        [0,0,1,2,3,3,2,1,0,0],[0,0,0,1,2,2,1,0,0,0],[0,1,1,6,6,6,6,1,1,0],
        [0,1,6,6,6,6,6,6,1,0],[0,1,6,6,6,6,6,6,1,0],[0,1,6,5,6,6,5,6,1,0],
        [0,0,1,6,6,6,6,1,0,0],[0,0,1,6,0,0,6,1,0,0],[0,0,1,5,0,0,5,1,0,0],
        [0,0,1,5,0,0,5,1,0,0],
      ];
      // NPC-specific colors
      const npcColors: Record<string, string[]> = {
        librarian: ['#00000000','#1a1a2e','#d4a76a','#c88b4a','#1a5cd8','#1a5cd8','#8B5E3C'],
        professor: ['#00000000','#1a1a2e','#d4a76a','#c88b4a','#1a5cd8','#1a5cd8','#546E7A'],
        chef:      ['#00000000','#1a1a2e','#8B4513','#6B3A2A','#1a5cd8','#1a5cd8','#ffffff'],
        chad:      ['#00000000','#1a1a2e','#d4a76a','#c88b4a','#1a5cd8','#1a5cd8','#E53935'],
        roommate:  ['#00000000','#1a1a2e','#8B4513','#6B3A2A','#1a5cd8','#1a5cd8','#7B68EE'],
      };
      const palette = npcColors[npc.id] || PLAYER_PALETTE;
      npcPixels.forEach((row, ry) => {
        row.forEach((ci, rx) => {
          if (ci === 0) return;
          tempGfx.fillStyle(parseInt(palette[ci].replace('#', ''), 16));
          tempGfx.fillRect(rx * S, ry * S, S, S);
        });
      });
      rt.draw(tempGfx, 0, 0);
      tempGfx.destroy();
      container.add(rt);

      // NPC name label
      const nameLabel = this.add.text(20, -10, npc.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#FFD700',
        backgroundColor: '#000000aa', padding: { x: 4, y: 2 },
      }).setOrigin(0.5, 1);
      container.add(nameLabel);

      // "E" prompt
      const ePrompt = this.add.text(20, 56, '[E] Talk', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#00E676',
        backgroundColor: '#000000cc', padding: { x: 3, y: 2 },
      }).setOrigin(0.5, 0);
      container.add(ePrompt);

      // NPC collision body
      const body = this.add.rectangle(x + 20, y + 26, 30, 40);
      this.physics.add.existing(body, true);
      this.wallGroup.add(body);

      this.npcSprites.push({ sprite: container, zone: npc.zone, tileX: npc.tileX, tileY: npc.tileY });
    });
  }

  private createPlayer() {
    const px = 41 * TILE * SCALE;
    const py = 31 * TILE * SCALE;
    this.playerGfx = this.add.renderTexture(px, py, 40, 52).setDepth(20);
    this.updatePlayerSprite(false);
    this.player = this.physics.add.image(px, py, '__DEFAULT').setAlpha(0).setDepth(20);
    this.player.setDisplaySize(24, 30);
    this.player.setCollideWorldBounds(true);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(20, 20).setOffset(2, 4);
  }

  private updatePlayerSprite(walking: boolean) {
    const S = 4;
    const pixels = PLAYER_PIXELS[this.lastDir] || PLAYER_PIXELS.down;
    this.playerGfx.clear();
    const tempGfx = this.add.graphics();
    pixels.forEach((row, ry) => {
      row.forEach((ci, rx) => {
        if (ci === 0) return;
        tempGfx.fillStyle(parseInt(PLAYER_PALETTE[ci].replace('#', ''), 16));
        const yOff = walking && ry > 8 ? (this.animFrame % 2 === 0 ? S : 0) : 0;
        tempGfx.fillRect(rx * S, ry * S + yOff, S, S);
      });
    });
    this.playerGfx.draw(tempGfx, 0, 0);
    tempGfx.destroy();
  }

  private createEnemies() {
    ENEMY_SPAWNS.forEach(def => {
      const x = def.x * TILE * SCALE;
      const y = def.y * TILE * SCALE;

      const gfx = this.add.renderTexture(x, y, 32, 32).setDepth(18);
      this.drawEnemy(gfx, def.color, 0);

      const body = this.physics.add.image(x, y, '__DEFAULT').setAlpha(0).setDepth(18);
      body.setDisplaySize(26, 26);
      (body.body as Phaser.Physics.Arcade.Body).setSize(22, 22).setOffset(2, 2);

      const nameText = this.add.text(x, y - 20, def.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#FF5252',
        backgroundColor: '#000000aa', padding: { x: 3, y: 2 },
      }).setOrigin(0.5).setDepth(19);

      this.enemies.push({ sprite: body, gfx, dir: Math.random() * Math.PI * 2, timer: 0, hp: def.hp, maxHp: def.hp, def, nameText });
    });
  }

  private drawEnemy(gfx: Phaser.GameObjects.RenderTexture, color: number, frame: number) {
    gfx.clear();
    const tempGfx = this.add.graphics();
    const S = 4;
    const slimePixels = [
      [0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,2,1,1,2,1,1],
      [1,1,1,1,1,1,1,1],[1,1,3,3,3,3,1,1],[0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],[0,1,0,1,1,0,1,0],
    ];
    const wobble = frame % 2 === 0 ? 0 : S;
    slimePixels.forEach((row, ry) => {
      row.forEach((ci, rx) => {
        if (ci === 0) return;
        if (ci === 1) tempGfx.fillStyle(color);
        else if (ci === 2) tempGfx.fillStyle(0xffffff, 0.9);
        else tempGfx.fillStyle(0x000000, 0.5);
        tempGfx.fillRect(rx * S, ry * S + (ry > 5 ? wobble : 0), S, S);
      });
    });
    gfx.draw(tempGfx, 0, 0);
    tempGfx.destroy();
  }

  private createSigns() {
    const signPositions: [number, number][] = [
      [28, 15], [28, 55], [36, 68], [44, 12], [44, 60], [26, 40], [50, 35], [10, 28],
    ];
    signPositions.forEach(([r, c], i) => {
      if (i >= CAMPUS_SIGNS.length) return;
      const x = c * TILE * SCALE;
      const y = r * TILE * SCALE;

      // Sign post
      const gfx = this.add.graphics().setDepth(8);
      gfx.fillStyle(0x8D6E63); gfx.fillRect(x + 20, y + 10, 6, 30);
      gfx.fillStyle(0xFFF9C4); gfx.fillRect(x, y, 48, 16);
      gfx.fillStyle(0x795548); gfx.lineStyle(1, 0x795548); gfx.strokeRect(x, y, 48, 16);

      // Sign icon
      this.add.text(x + 24, y + 8, '📋', { fontSize: '8px' }).setOrigin(0.5).setDepth(9);

      // Full text (hidden, shown on proximity)
      const text = this.add.text(x + 24, y - 8, CAMPUS_SIGNS[i], {
        fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#ffffff',
        backgroundColor: '#000000dd', padding: { x: 6, y: 4 },
        wordWrap: { width: 180 }, lineSpacing: 4,
      }).setOrigin(0.5, 1).setDepth(50).setAlpha(0);

      this.signTexts.push(text);
    });
  }

  private showSwordEffect() {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.particles.push({
        x: this.player.x, y: this.player.y,
        vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3,
        life: 20, color: 0xFFD700,
      });
    }
  }

  update(_time: number, delta: number) {
    const speed = 90;
    let vx = 0, vy = 0;

    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    if (up) { vy -= speed; this.lastDir = 'up'; }
    if (down) { vy += speed; this.lastDir = 'down'; }
    if (left) { vx -= speed; this.lastDir = 'left'; }
    if (right) { vx += speed; this.lastDir = 'right'; }

    const isMoving = up || down || left || right;

    if (isMoving) {
      this.moveTarget = null;
      this.player.setVelocity(vx, vy);
    } else if (this.moveTarget) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
      if (dist < 6) { this.player.setVelocity(0, 0); this.moveTarget = null; }
      else {
        const dx = this.moveTarget.x - this.player.x, dy = this.moveTarget.y - this.player.y;
        this.lastDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        this.physics.moveTo(this.player, this.moveTarget.x, this.moveTarget.y, speed);
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    const moving = vx !== 0 || vy !== 0 || this.moveTarget !== null;

    // Animate
    this.animTimer += delta;
    if (this.animTimer > 150) { this.animTimer = 0; this.animFrame++; this.updatePlayerSprite(moving); }

    this.playerGfx.setPosition(this.player.x - 20, this.player.y - 24);

    // Footsteps
    if (moving) { this.footstepTimer += delta; if (this.footstepTimer>300) { this.footstepTimer=0; this.particles.push({x:this.player.x, y:this.player.y+12, vx:0, vy:0, life:15, color:0xC8A96E}); } }

    // Sword
    if (this.swordCooldown > 0) this.swordCooldown -= delta;
    if ((Phaser.Input.Keyboard.JustDown(this.swordKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) && this.swordCooldown <= 0) {
      this.swordCooldown = 600;
      this.showSwordEffect();
      const range = 60;
      this.enemies.forEach(enemy => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
        if (dist < range) {
          enemy.hp--;
          for (let i = 0; i < 6; i++) { const a = Math.random() * Math.PI * 2; this.particles.push({x:enemy.sprite.x, y:enemy.sprite.y, vx:Math.cos(a)*4, vy:Math.sin(a)*4, life:18, color:0xFF5252}); }
          if (enemy.hp <= 0) {
            enemy.gfx.destroy(); enemy.sprite.destroy(); enemy.nameText.destroy();
            this.enemies = this.enemies.filter(e => e !== enemy);
            window.dispatchEvent(new CustomEvent<number>('open-campus-hp', { detail: 1 }));
            window.dispatchEvent(new CustomEvent<{ name: string; xp: number }>('open-campus-enemy-killed', { detail: { name: enemy.def.name, xp: 10 } }));
          }
        }
      });
    }

    // NPC interact
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      NPC_DEFS.forEach(npc => {
        const nx = npc.tileX * TILE * SCALE + 20;
        const ny = npc.tileY * TILE * SCALE + 26;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, nx, ny);
        if (dist < 80) {
          window.dispatchEvent(new CustomEvent<ZoneName>('open-campus-npc-interact', { detail: npc.zone }));
        }
      });
    }

    // Enemy AI
    this.enemies.forEach((enemy, _i) => {
      enemy.timer += delta;
      if (enemy.timer > 1200) { enemy.timer = 0; enemy.dir = Math.random() * Math.PI * 2; }
      const eBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
      eBody.setVelocity(Math.cos(enemy.dir) * enemy.def.speed, Math.sin(enemy.dir) * enemy.def.speed);
      enemy.gfx.setPosition(enemy.sprite.x - 16, enemy.sprite.y - 16);
      enemy.nameText.setPosition(enemy.sprite.x, enemy.sprite.y - 22);
      this.drawEnemy(enemy.gfx, enemy.def.color, Math.floor(this.animFrame / 2) % 2);

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
      if (dist < 28 && this.invincTimer <= 0) {
        this.invincTimer = 1500;
        this.playerHp = Math.max(0, this.playerHp - 1);
        window.dispatchEvent(new CustomEvent<number>('open-campus-hp', { detail: -1 }));
        const angle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y);
        this.player.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
      }
    });

    if (this.invincTimer > 0) { this.invincTimer -= delta; this.playerGfx.setAlpha(Math.floor(this.invincTimer / 100) % 2 === 0 ? 0.4 : 1); }
    else { this.playerGfx.setAlpha(1); }

    // Particles
    this.particleGfx.clear();
    this.particles = this.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life--; this.particleGfx.fillStyle(p.color, p.life/20); this.particleGfx.fillRect(p.x-3, p.y-3, 6, 6); return p.life > 0; });

    // Signs proximity
    const signPositions: [number, number][] = [[28,15],[28,55],[36,68],[44,12],[44,60],[26,40],[50,35],[10,28]];
    signPositions.forEach(([r, c], i) => {
      if (i >= this.signTexts.length) return;
      const sx = c * TILE * SCALE + 24, sy = r * TILE * SCALE + 8;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, sx, sy);
      this.signTexts[i].setAlpha(dist < 80 ? 1 : 0);
    });

    // Zone detection
    this.checkZones();
  }

  private checkZones() {
    let touched: ZoneName | null = null;
    for (const z of this.zoneRects) {
      if (Phaser.Geom.Rectangle.Contains(z.rect, this.player.x, this.player.y)) { touched = z.name; break; }
    }
    if (touched && touched !== this.activeZone) {
      this.activeZone = touched;
      window.dispatchEvent(new CustomEvent<ZoneName>('open-campus-zone-enter', { detail: touched }));
    }
    if (!touched) this.activeZone = null;
  }
}

// ─── GAME CONFIG ────────────────────────────────────────────────────────────
export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth || 900,
    height: parent.clientHeight || 540,
    pixelArt: true,
    antialias: false,
    backgroundColor: '#1a2e1a',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [CampusScene],
  };
}
