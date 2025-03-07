import { BlockTypes } from './modules/BlockTypes.js';
import { TerrainGenerator } from './modules/TerrainGenerator.js';
import { Sky } from './modules/Sky.js';
import { Ocean } from './modules/Ocean.js';
import { Creeper } from './modules/Creeper.js';

/**
 * Classe responsável por gerenciar o mundo do jogo
 */
export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map(); // Mapa de blocos usando chaves x,y,z
        this.creepers = []; // Lista de Creepers
        this.playerPosition = { x: 0, y: 1, z: 0 }; // Posição inicial do jogador

        // Inicializar tipos de blocos
        this.blockTypes = new BlockTypes();

        // Geometria compartilhada para todos os blocos
        this.geometry = new THREE.BoxGeometry(1, 1, 1);

        // Criar o céu
        this.sky = new Sky(scene);

        // Criar o oceano
        this.ocean = new Ocean(scene);

        // Criar mundo inicial
        this.createInitialWorld();

        // Inicializar o tempo
        this.time = 0;

        // Spawnar Creepers iniciais
        this.spawnInitialCreepers();

        // Debug flag
        this.debug = true;
    }

    spawnInitialCreepers() {
        // Criar alguns Creepers em posições aleatórias
        const numCreepers = 5; // Número inicial de Creepers
        
        for (let i = 0; i < numCreepers; i++) {
            // Encontrar uma posição válida para o Creeper
            let x, z;
            do {
                x = Math.floor(Math.random() * 36) - 18;
                z = Math.floor(Math.random() * 36) - 18;
            } while (!this.isValidPosition(x, 1, z));

            // Criar o Creeper
            const creeper = new Creeper(this.scene, x, 1, z);
            this.creepers.push(creeper);
            
            if (this.debug) {
                console.log(`Creeper spawned at: x=${x}, z=${z}`);
            }
        }
    }

    update() {
        // Atualizar o tempo
        this.time += 1;

        // Atualizar o céu e as nuvens
        this.sky.update();

        // Atualizar o oceano
        this.ocean.update(this.time);

        // Debug log da posição do jogador
        if (this.debug) {
            console.log(`Player position: x=${this.playerPosition.x.toFixed(2)}, z=${this.playerPosition.z.toFixed(2)}`);
        }

        // Atualizar os Creepers com a posição do jogador
        this.creepers.forEach((creeper, index) => {
            if (this.debug) {
                console.log(`Updating Creeper ${index}:`, {
                    position: creeper.currentPosition,
                    state: creeper.state,
                    distance: creeper.getDistanceToPlayer(this.playerPosition)
                });
            }
            creeper.update(this.time, this.playerPosition);
        });
    }

    createInitialWorld() {
        // Criar chão com padrão mais interessante
        for (let x = -20; x <= 20; x++) {
            for (let z = -20; z <= 20; z++) {
                // Criar padrão de grama com algumas variações
                const rand = Math.random();
                
                if (rand < 0.05) {
                    // 5% de chance de ser terra
                    this.createBlock(x, 0, z, 'dirt');
                } else {
                    // 95% de chance de ser grama
                    this.createBlock(x, 0, z, 'grass');
                    
                    // Adicionar algumas pedras decorativas (2% de chance)
                    if (rand > 0.98) {
                        this.createBlock(x, 1, z, 'stone');
                    }
                }
            }
        }

        // Adicionar algumas árvores aleatórias
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * 36) - 18;
            const z = Math.floor(Math.random() * 36) - 18;
            this.createTree(x, 1, z);
        }
    }

    createTree(x, y, z) {
        // Tronco
        for (let i = 0; i < 4; i++) {
            this.createBlock(x, y + i, z, 'wood');
        }

        // Folhas
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 4; dy <= 6; dy++) {
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                    if (dy === 6 && (Math.abs(dx) > 1 || Math.abs(dz) > 1)) continue;
                    this.createBlock(x + dx, y + dy, z + dz, 'leaves');
                }
            }
        }
    }

    getBlockKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    createBlock(x, y, z, type = 'dirt') {
        const key = this.getBlockKey(x, y, z);
        if (this.blocks.has(key)) return;

        // Criar um novo mesh com os materiais do tipo de bloco
        const mesh = new THREE.Mesh(this.geometry, this.blockTypes[type].material);
        mesh.position.set(Math.round(x), Math.round(y), Math.round(z));
        
        // Habilitar sombras para o bloco
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        this.scene.add(mesh);
        this.blocks.set(key, mesh);
        return mesh;
    }

    removeBlock(x, y, z) {
        const key = this.getBlockKey(x, y, z);
        const block = this.blocks.get(key);
        if (block) {
            this.scene.remove(block);
            this.blocks.delete(key);
        }
    }

    isValidPosition(x, y, z) {
        return !this.blocks.has(this.getBlockKey(x, y, z));
    }

    // Método para atualizar a posição do jogador
    updatePlayerPosition(x, y, z) {
        this.playerPosition.x = x;
        this.playerPosition.y = y;
        this.playerPosition.z = z;
        
        if (this.debug) {
            console.log('Player position updated:', this.playerPosition);
        }
    }
} 