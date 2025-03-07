/**
 * Classe responsável por gerenciar o oceano do jogo
 */
export class Ocean {
    constructor(scene) {
        this.scene = scene;
        this.waterBlocks = new Map();
        
        // Criar geometria e material da água
        this.waterGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x004d7f,
            transparent: true,
            opacity: 0.8,
            specular: 0x006994,
            shininess: 50,
            emissive: 0x002b47,
            emissiveIntensity: 0.2
        });

        this.createOcean();
    }

    createOcean() {
        // Criar água em uma área maior que o terreno
        const oceanSize = 50; // Tamanho do oceano em cada direção
        const waterLevel = -1; // Nível da água (um bloco abaixo do terreno)

        for (let x = -oceanSize; x <= oceanSize; x++) {
            for (let z = -oceanSize; z <= oceanSize; z++) {
                // Não criar água onde tem terreno (entre -20 e 20)
                if (x >= -20 && x <= 20 && z >= -20 && z <= 20) {
                    continue;
                }
                this.createWaterBlock(x, waterLevel, z);
            }
        }
    }

    createWaterBlock(x, y, z) {
        const waterBlock = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
        waterBlock.position.set(x, y, z);
        
        // Configurar propriedades visuais
        waterBlock.receiveShadow = true;
        
        this.scene.add(waterBlock);
        this.waterBlocks.set(`${x},${y},${z}`, waterBlock);
    }

    update(time) {
        // Removida a animação para manter o oceano parado
    }
} 