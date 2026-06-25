import Phaser from "phaser";
import "./style.css";

const WIDTH = 960;
const HEIGHT = 640;
const FIELD_HEIGHT = 500;
const UI_HEIGHT = HEIGHT - FIELD_HEIGHT;
const GROUND_Y = 405;
const PLAYER_BASE_X = 860;
const ENEMY_BASE_X = 90;
const UNIT_IMAGE_SIZE = 162;
const UNIT_HIT_RADIUS = 66;

const ASSET_PATHS = {
  background: "/assets/backgrounds/11317783i.png",
  typhoon01: "/assets/enemies/taihu01.png",
  typhoon02: "/assets/enemies/taihu02.png",
  enemyBase: "/assets/enemies/taifu_base.png",
  playerBase: "/assets/bases/miyako.png",
  bgm: "/assets/sounds/bgm/沖縄風BGM.mp3",
};

const CHARACTER_TYPES = [
  {
    id: "guard",
    name: "山田",
    role: "壁役",
    imagePath: "/assets/characters/yamada.png",
    sounds: {
      deploy: {
        key: "yamadaDeploy",
        path: "/assets/sounds/characters/ikuze.m4a",
      },
      attack: {
        key: "yamadaAttack",
        path: "/assets/sounds/characters/ei.m4a",
      },
      hit: {
        key: "yamadaHit",
        path: "/assets/sounds/characters/u.m4a",
      },
    },
    cost: 80,
    cooldown: 1600,
    hp: 190,
    damage: 18,
    range: 34,
    attackRate: 900,
    speed: 38,
    color: 0x38bdf8,
    description: "安い・硬い",
  },
  {
    id: "runner",
    name: "ふき",
    role: "速攻",
    imagePath: "/assets/characters/huki.png",
    cost: 120,
    cooldown: 2200,
    hp: 95,
    damage: 28,
    range: 38,
    attackRate: 620,
    speed: 78,
    color: 0x22c55e,
    description: "速い・手数",
  },
  {
    id: "shooter",
    name: "ゆうた",
    role: "中距離",
    imagePath: "/assets/characters/yuta.png",
    cost: 180,
    cooldown: 3200,
    hp: 115,
    damage: 46,
    range: 112,
    attackRate: 1050,
    speed: 30,
    color: 0xf59e0b,
    projectile: true,
    description: "遠めから攻撃",
  },
  {
    id: "heavy",
    name: "しげ",
    role: "高火力",
    imagePath: "/assets/characters/shige.png",
    sounds: {
      deploy: {
        key: "shigeAction",
        path: "/assets/sounds/characters/shige_action.mp3",
      },
    },
    cost: 280,
    cooldown: 5000,
    hp: 260,
    damage: 94,
    range: 48,
    attackRate: 1550,
    speed: 23,
    color: 0xef4444,
    description: "重い・強打",
  },
  {
    id: "captain",
    name: "かっしー",
    role: "支援",
    imagePath: "/assets/characters/kasshi.png",
    cost: 360,
    cooldown: 7200,
    hp: 150,
    damage: 30,
    range: 96,
    attackRate: 1200,
    speed: 26,
    color: 0xfacc15,
    aura: 115,
    description: "周囲を鼓舞",
  },
  {
    id: "medic",
    name: "十松",
    role: "支援",
    imagePath: "/assets/characters/jumatsu.png",
    sounds: {
      deploy: {
        key: "jumatsuAction",
        path: "/assets/sounds/characters/jumatsu_action.m4a",
      },
      attack: {
        key: "jumatsuAction",
        path: "/assets/sounds/characters/jumatsu_action.m4a",
      },
    },
    cost: 600,
    cooldown: 5200,
    hp: 9999,
    damage: 9999,
    range: 86,
    attackRate: 1350,
    speed: 28,
    color: 0xf9a8d4,
    aura: 90,
    oneShot: true,
    description: "一撃必殺・高耐久",
  },
];

const ENEMY_TYPES = {
  drop: {
    name: "雨",
    imagePath: "/assets/enemies/rain.png",
    hp: 80,
    damage: 12,
    range: 30,
    attackRate: 950,
    speed: 32,
    reward: 25,
    color: 0x60a5fa,
    radius: 17,
  },
  gust: {
    name: "突風",
    imagePath: "/assets/enemies/gust.png",
    hp: 62,
    damage: 18,
    range: 28,
    attackRate: 720,
    speed: 63,
    reward: 32,
    color: 0xd9f99d,
    radius: 16,
  },
  cloud: {
    name: "雷",
    imagePath: "/assets/enemies/thunder.png",
    hp: 260,
    damage: 34,
    range: 42,
    attackRate: 1300,
    speed: 21,
    reward: 70,
    color: 0x64748b,
    radius: 23,
  },
  typhoon01: {
    name: "台風01",
    hp: 1100,
    damage: 64,
    range: 58,
    attackRate: 1600,
    speed: 15,
    reward: 260,
    color: 0xc084fc,
    radius: 40,
  },
  typhoon02: {
    name: "台風02",
    hp: 2400,
    damage: 96,
    range: 68,
    attackRate: 1450,
    speed: 12,
    reward: 520,
    color: 0xa855f7,
    radius: 48,
  },
};

const SPAWN_PLAN = [
  { at: 1200, type: "typhoon01" },
  { at: 2600, type: "drop" },
  { at: 6800, type: "gust" },
  { at: 10800, type: "cloud" },
  { at: 12800, type: "drop" },
  { at: 16200, type: "gust" },
  { at: 21800, type: "drop" },
  { at: 25800, type: "gust" },
  { at: 28600, type: "cloud" },
  { at: 38200, type: "cloud" },
  { at: 43000, type: "gust" },
];

class LaneBattleScene extends Phaser.Scene {
  constructor() {
    super("LaneBattleScene");
    this.units = [];
    this.enemies = [];
    this.cards = [];
    this.spawnIndex = 0;
    this.elapsed = 0;
    this.coins = 240;
    this.maxCoins = 900;
    this.playerBaseHp = 2400;
    this.enemyBaseHp = 1900;
    this.typhoon02Spawned = false;
    this.typhoon02Defeated = false;
    this.gameEnded = false;
  }

  preload() {
    this.load.image("background", ASSET_PATHS.background);
    this.load.image("typhoon01", ASSET_PATHS.typhoon01);
    this.load.image("typhoon02", ASSET_PATHS.typhoon02);
    this.load.image("enemyBase", ASSET_PATHS.enemyBase);
    this.load.image("playerBase", ASSET_PATHS.playerBase);
  }

  create() {
    this.createField();
    this.createHud();
    this.loadSmallEnemyImages();
    this.loadCharacterImages();
    this.setupBackgroundMusic();
    this.time.delayedCall(1500, () => {
      if (!this.characterCardsCreated) {
        this.createCards();
      }
    });
    this.showMessage("下のカードをクリックして、守くん風キャラを出撃させよう");
  }

  setupBackgroundMusic() {
    this.bgm = new Audio(ASSET_PATHS.bgm);
    this.bgm.loop = true;
    this.bgm.volume = 0.12;

    const startBgm = () => {
      if (!this.bgm || !this.bgm.paused) {
        return;
      }
      this.bgm.play().catch(() => {
        // BGMファイル未配置やブラウザ制限時はゲーム進行を優先します。
      });
    };

    this.input.once("pointerdown", startBgm);
    this.input.keyboard?.once("keydown", startBgm);
  }

  update(time, delta) {
    if (this.gameEnded) {
      return;
    }

    this.elapsed += delta;
    this.coins = Math.min(this.maxCoins, this.coins + delta * 0.035);
    this.spawnEnemies();
    this.updateActors(this.units, this.enemies, delta, time);
    this.updateActors(this.enemies, this.units, delta, time);
    this.updateCards(time);
    this.updateHud();
    this.checkEndState();
  }

  createField() {
    if (this.textures.exists("background")) {
      this.add.image(WIDTH / 2, FIELD_HEIGHT / 2, "background").setDisplaySize(WIDTH, FIELD_HEIGHT);
    } else {
      this.add.rectangle(WIDTH / 2, FIELD_HEIGHT / 2, WIDTH, FIELD_HEIGHT, 0x0f766e);
      this.add.rectangle(WIDTH / 2, 118, WIDTH, 236, 0x38bdf8, 0.16);
      this.add.rectangle(WIDTH / 2, GROUND_Y + 36, WIDTH, 112, 0xf59e0b, 0.32);
    }
    this.add.rectangle(WIDTH / 2, GROUND_Y + 8, WIDTH, 12, 0x14532d);

    for (let x = 35; x < WIDTH; x += 85) {
      this.add.circle(x, 88 + (x % 170), 7, 0xffffff, 0.18);
    }

    this.enemyBase = this.add.container(ENEMY_BASE_X, GROUND_Y - 80);
    const enemyBaseImage = this.add.image(0, 0, "enemyBase");
    enemyBaseImage.setDisplaySize(126, 126);
    const swirl = this.add.text(0, -78, "台風7号", {
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      stroke: "#0f172a",
      strokeThickness: 4,
    });
    swirl.setOrigin(0.5);
    this.enemyBase.add([enemyBaseImage, swirl]);

    this.playerBase = this.add.container(PLAYER_BASE_X, GROUND_Y - 88);
    const baseImage = this.add.image(0, 0, "playerBase");
    baseImage.setDisplaySize(136, 112);
    const baseLabel = this.add.text(0, -76, "宮古島", {
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      stroke: "#0f172a",
      strokeThickness: 4,
    });
    baseLabel.setOrigin(0.5);
    this.playerBase.add([baseImage, baseLabel]);

    this.enemyBaseHpBar = this.makeHpBar(ENEMY_BASE_X, GROUND_Y - 148, 150, 10);
    this.playerBaseHpBar = this.makeHpBar(PLAYER_BASE_X, GROUND_Y - 160, 170, 10);
  }

  createHud() {
    this.add.rectangle(WIDTH / 2, 30, WIDTH, 60, 0x0f172a, 0.9);
    this.coinText = this.add.text(20, 12, "", {
      fontSize: "21px",
      color: "#fde68a",
      fontStyle: "bold",
    });
    this.baseText = this.add.text(255, 12, "", {
      fontSize: "19px",
      color: "#f8fafc",
      fontStyle: "bold",
    });
    this.enemyText = this.add.text(575, 12, "", {
      fontSize: "19px",
      color: "#f8fafc",
      fontStyle: "bold",
    });
    this.messageText = this.add.text(WIDTH / 2, 72, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#0f172acc",
      padding: { x: 12, y: 7 },
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setDepth(100);
  }

  createCards() {
    if (this.characterCardsCreated) {
      return;
    }
    this.characterCardsCreated = true;
    this.add.rectangle(WIDTH / 2, FIELD_HEIGHT + UI_HEIGHT / 2, WIDTH, UI_HEIGHT, 0x111827);
    this.add.text(18, FIELD_HEIGHT + 10, "守くん風キャラ出撃メニュー", {
      fontSize: "18px",
      color: "#f8fafc",
      fontStyle: "bold",
    });
    this.add.text(540, FIELD_HEIGHT + 12, "台風は左から右へ進行 / 守くんは右から迎撃", {
      fontSize: "15px",
      color: "#cbd5e1",
    });

    this.cards = CHARACTER_TYPES.map((type, index) => {
      const x = 80 + index * 142;
      const y = FIELD_HEIGHT + 84;
      const card = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 124, 90, 0x1f2937);
      bg.setStrokeStyle(2, type.color);
      const portrait = this.makePortrait(type, 0, -23, 15);
      const menuName = type.id === "medic" ? "??" : type.name;
      const name = this.add.text(0, -2, menuName, {
        fontSize: "14px",
        color: "#f8fafc",
        fontStyle: "bold",
      });
      name.setOrigin(0.5);
      const cost = this.add.text(0, 18, `シマコイン ${type.cost}`, {
        fontSize: "12px",
        color: "#fde68a",
      });
      cost.setOrigin(0.5);
      const role = this.add.text(0, 36, `${type.role} / ${type.description}`, {
        fontSize: "10px",
        color: "#cbd5e1",
      });
      role.setOrigin(0.5);
      const cooldownMask = this.add.rectangle(0, 0, 124, 90, 0x020617, 0.64);
      cooldownMask.setVisible(false);
      const clickLayer = this.add.rectangle(0, 0, 124, 90, 0xffffff, 0.001);
      clickLayer.setInteractive({ useHandCursor: true });
      clickLayer.on("pointerdown", () => this.tryDeployById(type.id));
      card.add([bg, portrait, name, cost, role, cooldownMask, clickLayer]);
      card.setSize(124, 90);
      card.characterId = type.id;
      card.type = type;
      card.clickLayer = clickLayer;
      card.cooldownMask = cooldownMask;
      card.readyAt = 0;
      return card;
    });
  }

  loadCharacterImages() {
    const unloadedTypes = CHARACTER_TYPES.filter((type) => !this.textures.exists(type.id));
    if (unloadedTypes.length === 0) {
      this.createCards();
      return;
    }

    this.load.once("complete", () => {
      if (!this.characterCardsCreated) {
        this.createCards();
      }
    });
    for (const type of unloadedTypes) {
      this.load.image(type.id, type.imagePath);
    }
    this.load.start();
  }

  loadSmallEnemyImages() {
    for (const [typeId, type] of Object.entries(ENEMY_TYPES)) {
      if (!type.imagePath || this.textures.exists(typeId)) {
        continue;
      }
      const image = new Image();
      image.onload = () => {
        if (!this.textures.exists(typeId)) {
          this.textures.addImage(typeId, image);
        }
      };
      image.src = type.imagePath;
    }
  }

  makePortrait(type, x, y, radius) {
    if (this.textures.exists(type.id)) {
      const image = this.add.image(x, y, type.id);
      image.setDisplaySize(radius * 2.4, radius * 2.4);
      return image;
    }
    const container = this.add.container(x, y);
    const head = this.add.circle(0, 0, radius, type.color);
    head.setStrokeStyle(2, 0xffffff);
    const text = this.add.text(0, -7, type.name.slice(0, 2), {
      fontSize: `${Math.max(10, radius - 2)}px`,
      color: "#0f172a",
      fontStyle: "bold",
    });
    text.setOrigin(0.5, 0);
    container.add([head, text]);
    return container;
  }

  makeHpBar(x, y, width, height) {
    const back = this.add.rectangle(x, y, width, height, 0x111827);
    back.setStrokeStyle(1, 0xffffff, 0.5);
    const fill = this.add.rectangle(x - width / 2, y, width, height, 0x22c55e);
    fill.setOrigin(0, 0.5);
    return { back, fill, width };
  }

  spawnEnemies() {
    while (this.spawnIndex < SPAWN_PLAN.length && this.elapsed >= SPAWN_PLAN[this.spawnIndex].at) {
      this.spawnEnemy(SPAWN_PLAN[this.spawnIndex].type);
      this.spawnIndex += 1;
    }
  }

  spawnEnemy(typeId) {
    const type = ENEMY_TYPES[typeId];
    const actor = this.createActor({
      ...type,
      side: "enemy",
      x: ENEMY_BASE_X + 58,
      direction: 1,
      baseTargetX: PLAYER_BASE_X - 72,
      imageKey:
        typeId === "typhoon01" || typeId === "typhoon02" || this.textures.exists(typeId)
          ? typeId
          : null,
      displayName: type.name,
      typeId,
    });
    this.enemies.push(actor);
  }

  tryDeployById(characterId) {
    const type = CHARACTER_TYPES.find((character) => character.id === characterId);
    if (!type) {
      return;
    }
    this.tryDeploy(type);
  }

  tryDeploy(type) {
    const card = this.cards.find((item) => item.type.id === type.id);
    if (this.time.now < card.readyAt) {
      this.showMessage(`${type.name} は準備中です`);
      return;
    }
    if (this.coins < type.cost) {
      this.showMessage(`シマコインが足りません（必要: ${type.cost}）`);
      return;
    }
    this.coins -= type.cost;
    card.readyAt = this.time.now + type.cooldown;
    this.deployUnit(type);
  }

  deployUnit(type) {
    const actor = this.createActor({
      ...type,
      side: "unit",
      x: PLAYER_BASE_X - 64,
      direction: -1,
      baseTargetX: ENEMY_BASE_X + 66,
      imageKey: type.id,
      displayName: type.name,
    });
    this.units.push(actor);
    this.playActorSound(actor, "deploy");
    this.showMessage(`${type.name} 出撃！`);
  }

  createActor(config) {
    const y = GROUND_Y - Phaser.Math.Between(0, 16);
    const sprite = this.makeActorVisual(config);
    const hitRadius = config.side === "unit" ? UNIT_HIT_RADIUS : config.radius || 22;
    const isLargeEnemy = config.side === "enemy" && config.radius >= 40;
    const shouldShowName = !(config.typeId === "typhoon01" || config.typeId === "typhoon02");
    const hpBarY = config.side === "unit" ? -UNIT_IMAGE_SIZE - 10 : isLargeEnemy ? -88 : -43;
    const hpBarWidth = config.side === "unit" ? 132 : isLargeEnemy ? 110 : 48;
    const hpBar = this.makeHpBar(0, hpBarY, hpBarWidth, 6);
    const actorParts = [sprite, hpBar.back, hpBar.fill];
    if (shouldShowName) {
      const nameText = this.add.text(0, hpBarY - 26, config.displayName, {
        fontSize: config.side === "unit" ? "20px" : isLargeEnemy ? "18px" : "13px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#0f172a",
        strokeThickness: 4,
      });
      nameText.setOrigin(0.5);
      actorParts.splice(1, 0, nameText);
    }
    const container = this.add.container(config.x, y, actorParts);
    container.setDepth(20 + Math.round(y));

    return {
      ...config,
      y,
      hp: config.hp,
      maxHp: config.hp,
      nextAttackAt: 0,
      target: null,
      alive: true,
      hitRadius,
      damageBoostUntil: 0,
      container,
      hpBar,
    };
  }

  makeActorVisual(config) {
    if (config.imageKey && this.textures.exists(config.imageKey)) {
      const isTyphoon = config.typeId === "typhoon01" || config.typeId === "typhoon02";
      const displaySize = config.side === "unit" ? UNIT_IMAGE_SIZE : isTyphoon ? 128 : 72;
      const imageY = config.side === "unit" ? -UNIT_IMAGE_SIZE / 2 + 8 : isTyphoon ? -48 : -24;
      const image = this.add.image(0, imageY, config.imageKey);
      image.setDisplaySize(displaySize, displaySize);
      image.setFlipX(config.side === "unit");
      return image;
    }

    const isUnit = config.side === "unit";
    const radius = isUnit ? UNIT_HIT_RADIUS : config.radius || 22;
    const container = this.add.container(0, isUnit ? -UNIT_IMAGE_SIZE / 2 + 8 : -18);
    const body = this.add.circle(0, 0, radius, config.color);
    body.setStrokeStyle(3, 0xffffff, 0.75);
    const label = this.add.text(0, -9, config.displayName.slice(0, 2), {
      fontSize: isUnit ? "30px" : config.side === "enemy" && config.radius > 30 ? "15px" : "12px",
      color: "#0f172a",
      fontStyle: "bold",
    });
    label.setOrigin(0.5, 0);
    container.add([body, label]);
    return container;
  }

  updateActors(actors, opponents, delta, time) {
    for (const actor of [...actors]) {
      if (!actor.alive) {
        continue;
      }

      actor.target = this.findTarget(actor, opponents);
      const baseInRange = this.isBaseInRange(actor);

      if (actor.target || baseInRange) {
        if (time >= actor.nextAttackAt) {
          actor.nextAttackAt = time + actor.attackRate;
          this.attack(actor, actor.target);
        }
        continue;
      }

      actor.container.x += (actor.speed * actor.direction * delta) / 1000;
      this.animateWalk(actor);
    }
  }

  findTarget(actor, opponents) {
    return opponents
      .filter((opponent) => opponent.alive)
      .filter((opponent) => {
        const reach = actor.range + actor.hitRadius + opponent.hitRadius;
        return Math.abs(opponent.container.x - actor.container.x) <= reach;
      })
      .sort((a, b) => {
        if (actor.side === "unit") {
          return a.container.x - b.container.x;
        }
        return b.container.x - a.container.x;
      })[0];
  }

  isBaseInRange(actor) {
    if (actor.side === "unit") {
      return actor.container.x <= actor.baseTargetX + actor.range + actor.hitRadius;
    }
    return actor.container.x >= actor.baseTargetX - actor.range - actor.hitRadius;
  }

  attack(actor, target) {
    this.playActorSound(actor, "attack");
    this.tweens.add({
      targets: actor.container,
      x: actor.container.x + actor.direction * 10,
      yoyo: true,
      duration: 80,
    });

    if (target) {
      if (actor.projectile) {
        this.fireProjectile(actor, target);
        return;
      }
      this.damageActor(target, this.getActorDamage(actor));
      this.applyCaptainAura(actor);
      return;
    }

    if (actor.side === "unit") {
      this.enemyBaseHp = Math.max(0, this.enemyBaseHp - this.getActorDamage(actor));
      this.flashBase(this.enemyBase);
    } else {
      this.playerBaseHp = Math.max(0, this.playerBaseHp - this.getActorDamage(actor));
      this.flashBase(this.playerBase);
    }
    this.applyCaptainAura(actor);
  }

  fireProjectile(actor, target) {
    const bullet = this.add.circle(actor.container.x, actor.container.y - 20, 5, actor.color);
    bullet.setDepth(999);
    this.tweens.add({
      targets: bullet,
      x: target.container.x,
      y: target.container.y - 20,
      duration: 170,
      onComplete: () => {
        bullet.destroy();
        if (target.alive) {
          this.damageActor(target, this.getActorDamage(actor));
        }
        this.applyCaptainAura(actor);
      },
    });
  }

  getActorDamage(actor) {
    if (actor.oneShot && actor.target?.alive) {
      return actor.target.hp;
    }
    const boosted = actor.side === "unit" && this.time.now < actor.damageBoostUntil;
    return boosted ? Math.round(actor.damage * 1.35) : actor.damage;
  }

  playActorSound(actor, eventName) {
    const soundConfig = actor.sounds?.[eventName];
    if (!soundConfig) {
      return;
    }
    const audio = new Audio(soundConfig.path);
    audio.volume = eventName === "hit" ? 0.65 : 0.8;
    audio.play().catch(() => {
      // Browser autoplay policies can reject playback before the first user gesture.
    });
  }

  applyCaptainAura(actor) {
    if (actor.side !== "unit" || !actor.aura) {
      return;
    }
    for (const unit of this.units) {
      const distance = Math.abs(unit.container.x - actor.container.x);
      if (unit.alive && unit !== actor && distance <= actor.aura) {
        unit.damageBoostUntil = this.time.now + 2200;
        unit.container.setAlpha(0.82);
        this.time.delayedCall(2200, () => {
          if (unit.alive) {
            unit.container.setAlpha(1);
          }
        });
      }
    }
  }

  damageActor(actor, amount) {
    this.playActorSound(actor, "hit");
    actor.hp -= amount;
    actor.hpBar.fill.width = Math.max(0, (actor.hp / actor.maxHp) * actor.hpBar.width);
    if (actor.hp <= 0) {
      this.killActor(actor);
    }
  }

  killActor(actor) {
    actor.alive = false;
    if (actor.side === "enemy") {
      this.coins = Math.min(this.maxCoins, this.coins + actor.reward);
      this.enemies = this.enemies.filter((enemy) => enemy !== actor);
      if (actor.typeId === "typhoon01" && !this.typhoon02Spawned) {
        this.typhoon02Spawned = true;
        this.showMessage("台風01を撃破！ さらに強い台風02が接近中！");
        this.time.delayedCall(1300, () => {
          if (!this.gameEnded) {
            this.spawnEnemy("typhoon02");
            this.showMessage("台風02 出現！ 体力が大幅に増えています");
          }
        });
      }
      if (actor.typeId === "typhoon02") {
        this.typhoon02Defeated = true;
      }
    } else {
      this.units = this.units.filter((unit) => unit !== actor);
    }
    this.tweens.add({
      targets: actor.container,
      alpha: 0,
      scale: 1.25,
      duration: 180,
      onComplete: () => actor.container.destroy(),
    });
  }

  animateWalk(actor) {
    actor.container.rotation = Math.sin(this.time.now / 120) * 0.025;
  }

  flashBase(base) {
    this.tweens.add({
      targets: base,
      alpha: 0.55,
      yoyo: true,
      duration: 80,
    });
  }

  updateCards(time) {
    for (const card of this.cards) {
      const coolingDown = time < card.readyAt;
      card.cooldownMask.setVisible(coolingDown || this.coins < card.type.cost);
      card.setAlpha(this.coins >= card.type.cost ? 1 : 0.62);
      if (coolingDown) {
        const progress = Phaser.Math.Clamp((card.readyAt - time) / card.type.cooldown, 0, 1);
        card.cooldownMask.height = 90 * progress;
        card.cooldownMask.y = 45 - card.cooldownMask.height / 2;
      } else {
        card.cooldownMask.height = 90;
        card.cooldownMask.y = 0;
      }
    }
  }

  updateHud() {
    this.coinText.setText(`シマコイン: ${Math.floor(this.coins)}/${this.maxCoins}`);
    this.baseText.setText(`宮古島HP: ${Math.ceil(this.playerBaseHp)}/2400`);
    this.enemyText.setText(`台風発生源HP: ${Math.ceil(this.enemyBaseHp)}/1900`);
    this.playerBaseHpBar.fill.width = Math.max(0, (this.playerBaseHp / 2400) * this.playerBaseHpBar.width);
    this.enemyBaseHpBar.fill.width = Math.max(0, (this.enemyBaseHp / 1900) * this.enemyBaseHpBar.width);
  }

  showMessage(message) {
    this.messageText.setText(message);
    this.messageText.setAlpha(1);
    this.tweens.killTweensOf(this.messageText);
    this.tweens.add({
      targets: this.messageText,
      alpha: 0,
      delay: 2600,
      duration: 600,
    });
  }

  checkEndState() {
    if (this.playerBaseHp <= 0) {
      this.endGame("GAME OVER", "宮古島が台風軍団に突破されました", 0xef4444);
      return;
    }
    const noMoreEnemies =
      this.spawnIndex >= SPAWN_PLAN.length &&
      this.enemies.length === 0 &&
      this.typhoon02Defeated;
    if (this.enemyBaseHp <= 0 || noMoreEnemies) {
      this.endGame("STAGE CLEAR", "守くんたちが宮古島を守り抜きました！", 0x22c55e);
    }
  }

  endGame(title, subtitle, color) {
    this.gameEnded = true;
    const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x020617, 0.78);
    overlay.setDepth(1000);
    const heading = this.add.text(WIDTH / 2, HEIGHT / 2 - 46, title, {
      fontSize: "54px",
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontStyle: "bold",
    });
    heading.setOrigin(0.5);
    heading.setDepth(1001);
    const body = this.add.text(WIDTH / 2, HEIGHT / 2 + 18, subtitle, {
      fontSize: "23px",
      color: "#f8fafc",
    });
    body.setOrigin(0.5);
    body.setDepth(1001);
    const restart = this.add.text(WIDTH / 2, HEIGHT / 2 + 76, "クリックで再挑戦", {
      fontSize: "20px",
      color: "#fde68a",
      backgroundColor: "#334155",
      padding: { x: 18, y: 10 },
    });
    restart.setOrigin(0.5);
    restart.setDepth(1001);
    restart.setInteractive({ useHandCursor: true });
    restart.on("pointerdown", () => this.scene.restart());
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "app",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#06223a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: LaneBattleScene,
};

new Phaser.Game(config);
