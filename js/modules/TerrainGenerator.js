/**
 * Módulo responsável por gerar o terreno e estruturas do mundo
 */
export class TerrainGenerator {
    constructor(world) {
        this.world = world;
    }

    /**
     * Gera o terreno inicial do jogo
     */
    generateTerrain() {
        // Criar chão básico com grama
        for (let x = -this.world.worldSize; x < this.world.worldSize; x++) {
            for (let z = -this.world.worldSize; z < this.world.worldSize; z++) {
                // Camada superior de grama
                this.world.createBlock(x, -1, z, 'grass');
                
                // Algumas camadas de terra abaixo da grama
                for (let y = -2; y > -4; y--) {
                    this.world.createBlock(x, y, z, 'dirt');
                }

                // Camada de pedra no fundo
                this.world.createBlock(x, -4, z, 'stone');
            }
        }

        // Adicionar algumas paredes de pedra
        for (let y = 0; y < 5; y++) {
            for (let x = -5; x < 5; x++) {
                this.world.createBlock(x, y, -5, 'stone');
                this.world.createBlock(x, y, 5, 'stone');
                this.world.createBlock(-5, y, x, 'stone');
                this.world.createBlock(5, y, x, 'stone');
            }
        }

        // Adicionar algumas árvores
        this.createTree(2, 0, 2);
        this.createTree(-3, 0, -3);
    }

    /**
     * Cria uma árvore na posição especificada
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} z - Posição Z
     */
    createTree(x, y, z) {
        // Tronco
        for (let i = 0; i < 4; i++) {
            this.world.createBlock(x, y + i, z, 'wood');
        }

        // Folhas
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 4; dy <= 6; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) <= 3) {
                        this.world.createBlock(x + dx, y + dy, z + dz, 'leaves');
                    }
                }
            }
        }
    }
} 