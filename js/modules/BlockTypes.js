/**
 * Módulo responsável por gerenciar os tipos de blocos e suas texturas
 */
export class BlockTypes {
    constructor() {
        return this.createBlockTypes();
    }

    /**
     * Cria uma textura usando Canvas
     */
    createTexture(config) {
        const canvas = document.createElement('canvas');
        canvas.width = 16;  // Tamanho típico de textura do Minecraft
        canvas.height = 16;
        const ctx = canvas.getContext('2d');

        // Cor de fundo
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, 16, 16);

        // Adicionar detalhes baseado no tipo
        switch (config.type) {
            case 'dirt':
                // Adicionar manchas mais escuras para terra
                ctx.fillStyle = '#654321';
                for (let i = 0; i < 12; i++) {
                    const x = Math.random() * 16;
                    const y = Math.random() * 16;
                    const size = 1 + Math.random() * 2;
                    ctx.fillRect(x, y, size, size);
                }
                // Adicionar algumas pedrinhas
                ctx.fillStyle = '#7c7c7c';
                for (let i = 0; i < 4; i++) {
                    const x = Math.random() * 16;
                    const y = Math.random() * 16;
                    ctx.fillRect(x, y, 1, 1);
                }
                break;

            case 'grass_top':
                // Base de grama
                ctx.fillStyle = '#2d5e1e';
                ctx.fillRect(0, 0, 16, 16);
                
                // Adicionar variações de cor para parecer mais natural
                for (let i = 0; i < 16; i += 2) {
                    for (let j = 0; j < 16; j += 2) {
                        const rand = Math.random();
                        if (rand > 0.7) {
                            ctx.fillStyle = '#367718'; // Grama mais clara
                            ctx.fillRect(i, j, 2, 2);
                        } else if (rand < 0.3) {
                            ctx.fillStyle = '#1f4f0f'; // Grama mais escura
                            ctx.fillRect(i, j, 2, 2);
                        }
                    }
                }
                
                // Adicionar pequenas flores aleatórias
                for (let i = 0; i < 2; i++) {
                    if (Math.random() > 0.7) {
                        const x = Math.random() * 14;
                        const y = Math.random() * 14;
                        ctx.fillStyle = Math.random() > 0.5 ? '#f1f116' : '#e85c5c';
                        ctx.fillRect(x, y, 2, 2);
                    }
                }
                break;

            case 'grass_side':
                // Base de terra
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(0, 4, 16, 12);
                
                // Transição terra-grama mais natural
                ctx.fillStyle = '#2d5e1e';
                ctx.fillRect(0, 0, 16, 4);
                
                // Adicionar alguns pixels de transição
                for (let i = 0; i < 16; i += 2) {
                    if (Math.random() > 0.5) {
                        ctx.fillStyle = '#2d5e1e';
                        ctx.fillRect(i, 4, 2, 1);
                    }
                    if (Math.random() > 0.7) {
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(i, 3, 2, 1);
                    }
                }
                break;

            case 'stone':
                // Textura de pedra com manchas
                for (let i = 0; i < 8; i++) {
                    ctx.fillStyle = `rgba(128, 128, 128, ${Math.random() * 0.3})`;
                    const x = Math.random() * 16;
                    const y = Math.random() * 16;
                    ctx.fillRect(x, y, 4, 4);
                }
                break;

            case 'wood_side':
                // Textura de madeira com listras verticais
                for (let i = 0; i < 16; i += 4) {
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(i, 0, 2, 16);
                }
                break;

            case 'wood_top':
                // Anéis concêntricos para o topo da madeira
                ctx.fillStyle = '#654321';
                ctx.beginPath();
                ctx.arc(8, 8, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(8, 8, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'leaves':
                // Textura de folhas com variações
                for (let i = 0; i < 16; i += 2) {
                    for (let j = 0; j < 16; j += 2) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#228B22' : '#1f8f1f';
                        ctx.fillRect(i, j, 2, 2);
                    }
                }
                break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    /**
     * Cria os diferentes tipos de blocos com suas texturas
     */
    createBlockTypes() {
        // Criar texturas
        const textures = {
            dirt: this.createTexture({ type: 'dirt', backgroundColor: '#8B4513' }),
            grass_top: this.createTexture({ type: 'grass_top', backgroundColor: '#228B22' }),
            grass_side: this.createTexture({ type: 'grass_side', backgroundColor: '#8B4513' }),
            stone: this.createTexture({ type: 'stone', backgroundColor: '#808080' }),
            wood_side: this.createTexture({ type: 'wood_side', backgroundColor: '#8B4513' }),
            wood_top: this.createTexture({ type: 'wood_top', backgroundColor: '#8B4513' }),
            leaves: this.createTexture({ type: 'leaves', backgroundColor: '#228B22' })
        };

        // Criar materiais com texturas
        const materials = {
            dirt: new THREE.MeshLambertMaterial({ 
                map: textures.dirt,
                side: THREE.DoubleSide
            }),
            grass_top: new THREE.MeshLambertMaterial({ 
                map: textures.grass_top,
                side: THREE.DoubleSide
            }),
            grass_side: new THREE.MeshLambertMaterial({ 
                map: textures.grass_side,
                side: THREE.DoubleSide
            }),
            stone: new THREE.MeshLambertMaterial({ 
                map: textures.stone,
                side: THREE.DoubleSide
            }),
            wood_side: new THREE.MeshLambertMaterial({ 
                map: textures.wood_side,
                side: THREE.DoubleSide
            }),
            wood_top: new THREE.MeshLambertMaterial({ 
                map: textures.wood_top,
                side: THREE.DoubleSide
            }),
            leaves: new THREE.MeshLambertMaterial({ 
                map: textures.leaves,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            })
        };

        return {
            dirt: {
                material: Array(6).fill(materials.dirt)
            },
            grass: {
                material: [
                    materials.grass_side, // right
                    materials.grass_side, // left
                    materials.grass_top,  // top
                    materials.dirt,       // bottom
                    materials.grass_side, // front
                    materials.grass_side  // back
                ]
            },
            stone: {
                material: Array(6).fill(materials.stone)
            },
            wood: {
                material: [
                    materials.wood_side, // right
                    materials.wood_side, // left
                    materials.wood_top,  // top
                    materials.wood_top,  // bottom
                    materials.wood_side, // front
                    materials.wood_side  // back
                ]
            },
            leaves: {
                material: Array(6).fill(materials.leaves)
            }
        };
    }
} 