/**
 * Classe responsável por criar e gerenciar os Creepers
 */
export class Creeper {
    constructor(scene, x, y, z) {
        this.scene = scene;
        this.position = { x, y, z };
        
        // Criar texturas procedurais
        this.bodyTexture = this.createBodyTexture();
        this.faceTexture = this.createFaceTexture();
        
        // Material do Creeper com textura procedural
        this.bodyMaterial = new THREE.MeshPhongMaterial({
            map: this.bodyTexture,
            specular: 0x004400,
            shininess: 0
        });

        // Criar o Creeper
        this.mesh = this.createCreeper();
        this.scene.add(this.mesh);

        // Inicializar animação
        this.animationTime = Math.random() * Math.PI * 2;
        this.walkDirection = Math.random() * Math.PI * 2;
        this.isMoving = true;
        
        // Estados do Creeper
        this.state = 'wandering'; // Estados possíveis: 'wandering', 'chasing', 'preparing'
        this.detectionRange = 5; // Distância em blocos para detectar o jogador
        this.explosionRange = 2; // Distância para começar a preparar explosão
        this.prepareTime = 0; // Tempo de preparação para explosão
        this.maxPrepareTime = 30; // Tempo máximo de preparação (30 frames = ~1 segundo)
        this.speed = {
            wandering: 0.05, // Aumentei a velocidade base
            chasing: 0.08    // Aumentei a velocidade de perseguição
        };

        // Cores para animação de explosão
        this.normalColor = new THREE.Color(0x50b54c);
        this.flashColor = new THREE.Color(0xffffff);

        // Posição atual para movimento
        this.currentPosition = {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        };
    }

    createBodyTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Cor base do Creeper
        const baseColor = '#50b54c';
        const darkColor = '#3a8538';
        const darkerColor = '#2d6627';

        // Preencher com a cor base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 32, 32);

        // Criar padrão manchado característico do Creeper
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const rand = Math.random();
                const pixelSize = 4; // Tamanho de cada "pixel" da textura
                
                if (rand < 0.3) {
                    ctx.fillStyle = darkColor;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                } else if (rand < 0.4) {
                    ctx.fillStyle = darkerColor;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        // Adicionar um pouco de ruído para dar mais textura
        for (let i = 0; i < 64; i++) {
            const x = Math.floor(Math.random() * 32);
            const y = Math.floor(Math.random() * 32);
            const size = 1 + Math.floor(Math.random() * 2);
            
            ctx.fillStyle = Math.random() > 0.5 ? darkColor : darkerColor;
            ctx.fillRect(x, y, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    createFaceTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Fundo transparente
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 32, 32);

        // Cor do rosto do Creeper (preto mais suave)
        ctx.fillStyle = '#1a1a1a';

        // Olhos com pixels mais definidos
        // Olho esquerdo
        ctx.fillRect(6, 8, 4, 4);
        ctx.fillRect(10, 8, 2, 4);
        
        // Olho direito
        ctx.fillRect(20, 8, 4, 4);
        ctx.fillRect(24, 8, 2, 4);

        // Boca com pixels mais definidos
        // Centro da boca
        ctx.fillRect(12, 16, 8, 4);
        ctx.fillRect(14, 20, 4, 4);
        
        // Extensões laterais
        ctx.fillRect(8, 18, 4, 4);
        ctx.fillRect(20, 18, 4, 4);

        // Adicionar sombreamento sutil
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < 32; i += 2) {
            ctx.fillRect(0, i, 32, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    createCreeper() {
        const group = new THREE.Group();

        // Corpo principal com textura em todas as faces
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const body = new THREE.Mesh(bodyGeometry, this.bodyMaterial);

        // Ajustar UVs do corpo
        const uvAttribute = bodyGeometry.attributes.uv;
        const uvArray = uvAttribute.array;
        
        // Ajustar cada face do cubo
        for (let i = 0; i < uvArray.length; i += 2) {
            // Escalar e centralizar UVs
            uvArray[i] = uvArray[i] * 0.8 + 0.1;     // x
            uvArray[i + 1] = uvArray[i + 1] * 0.8 + 0.1; // y
        }
        
        uvAttribute.needsUpdate = true;
        group.add(body);

        // Cabeça com textura
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const head = new THREE.Mesh(headGeometry, this.bodyMaterial);
        
        // Ajustar UVs da cabeça
        const headUvAttribute = headGeometry.attributes.uv;
        const headUvArray = headUvAttribute.array;
        
        for (let i = 0; i < headUvArray.length; i += 2) {
            headUvArray[i] = headUvArray[i] * 0.8 + 0.1;
            headUvArray[i + 1] = headUvArray[i + 1] * 0.8 + 0.1;
        }
        
        headUvAttribute.needsUpdate = true;
        head.position.y = 1;
        group.add(head);

        // Pernas com textura
        const legGeometry = new THREE.BoxGeometry(0.25, 0.5, 0.25);
        
        // Ajustar UVs das pernas
        const legUvAttribute = legGeometry.attributes.uv;
        const legUvArray = legUvAttribute.array;
        
        for (let i = 0; i < legUvArray.length; i += 2) {
            legUvArray[i] = legUvArray[i] * 0.8 + 0.1;
            legUvArray[i + 1] = legUvArray[i + 1] * 0.8 + 0.1;
        }
        
        legUvAttribute.needsUpdate = true;

        const legs = [
            { x: 0.2, z: 0.15 },   // Frontal direita
            { x: -0.2, z: 0.15 },  // Frontal esquerda
            { x: 0.2, z: -0.15 },  // Traseira direita
            { x: -0.2, z: -0.15 }  // Traseira esquerda
        ];

        legs.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, this.bodyMaterial);
            leg.position.set(pos.x, -0.75, pos.z);
            group.add(leg);
        });

        // Rosto do Creeper
        const faceGeometry = new THREE.PlaneGeometry(0.4, 0.4);
        const face = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({
            map: this.faceTexture,
            transparent: true,
            alphaTest: 0.5
        }));
        face.position.set(0, 1, 0.26);
        group.add(face);

        // Posicionar o Creeper
        group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Adicionar sombras
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return group;
    }

    update(time, playerPosition) {
        if (!this.isMoving) return;

        // Atualizar posição com movimento adequado ao estado
        this.animationTime += 0.05;
        
        // Verificar distância do jogador
        const distanceToPlayer = this.getDistanceToPlayer(playerPosition);
        
        // Atualizar estado baseado na distância do jogador
        if (distanceToPlayer <= this.explosionRange) {
            if (this.state !== 'preparing') {
                this.state = 'preparing';
                this.prepareTime = 0;
            }
        } else if (distanceToPlayer <= this.detectionRange) {
            if (this.state !== 'chasing' && this.state !== 'preparing') {
                this.state = 'chasing';
                this.bodyMaterial.color.copy(this.normalColor);
            }
        } else if (this.state !== 'wandering') {
            this.state = 'wandering';
            this.bodyMaterial.color.copy(this.normalColor);
            this.walkDirection = Math.random() * Math.PI * 2;
        }

        let moveX = 0;
        let moveZ = 0;

        // Atualizar movimento baseado no estado
        switch (this.state) {
            case 'wandering':
                // Mudar direção aleatoriamente
                if (Math.random() < 0.02) {
                    this.walkDirection += (Math.random() - 0.5) * Math.PI / 2;
                }
                
                // Calcular movimento na direção atual
                moveX = Math.cos(this.walkDirection) * this.speed.wandering;
                moveZ = Math.sin(this.walkDirection) * this.speed.wandering;
                break;

            case 'chasing':
                // Calcular direção para o jogador
                const dx = playerPosition.x - this.currentPosition.x;
                const dz = playerPosition.z - this.currentPosition.z;
                const angle = Math.atan2(dz, dx);
                
                // Calcular movimento em direção ao jogador
                moveX = Math.cos(angle) * this.speed.chasing;
                moveZ = Math.sin(angle) * this.speed.chasing;
                
                // Atualizar direção do Creeper
                this.walkDirection = angle;
                break;

            case 'preparing':
                this.prepareTime++;
                // Alternar cores para efeito de piscar
                const flashIntensity = Math.sin(this.prepareTime * 0.3) * 0.5 + 0.5;
                this.bodyMaterial.color.lerpColors(this.normalColor, this.flashColor, flashIntensity);
                
                // Efeito de tremor
                const shakeAmount = 0.05;
                moveX = (Math.random() - 0.5) * shakeAmount;
                moveZ = (Math.random() - 0.5) * shakeAmount;
                
                // Resetar após tempo máximo
                if (this.prepareTime >= this.maxPrepareTime) {
                    this.state = 'wandering';
                    this.prepareTime = 0;
                    this.bodyMaterial.color.copy(this.normalColor);
                }
                break;
        }

        // Verificar limites do mapa
        const mapLimit = 19;
        const nextX = this.currentPosition.x + moveX;
        const nextZ = this.currentPosition.z + moveZ;

        // Se vai bater nos limites, inverter direção
        if (Math.abs(nextX) > mapLimit || Math.abs(nextZ) > mapLimit) {
            if (this.state === 'wandering') {
                this.walkDirection += Math.PI;
                moveX = -moveX;
                moveZ = -moveZ;
            } else {
                moveX = 0;
                moveZ = 0;
            }
        }

        // Atualizar posição
        this.currentPosition.x = Math.max(-mapLimit, Math.min(mapLimit, nextX));
        this.currentPosition.z = Math.max(-mapLimit, Math.min(mapLimit, nextZ));

        // Atualizar posição e rotação do mesh
        this.mesh.position.set(
            this.currentPosition.x,
            this.currentPosition.y,
            this.currentPosition.z
        );

        // Rotação suave do corpo
        const targetRotation = this.walkDirection;
        const currentRotation = this.mesh.rotation.y;
        const rotationDiff = targetRotation - currentRotation;
        
        // Normalizar a diferença de rotação para o caminho mais curto
        if (rotationDiff > Math.PI) {
            this.mesh.rotation.y += (rotationDiff - 2 * Math.PI) * 0.1;
        } else if (rotationDiff < -Math.PI) {
            this.mesh.rotation.y += (rotationDiff + 2 * Math.PI) * 0.1;
        } else {
            this.mesh.rotation.y += rotationDiff * 0.1;
        }

        // Animar pernas
        this.mesh.children.slice(2).forEach((leg, index) => {
            const offset = index * Math.PI / 2;
            leg.position.y = -0.75 + Math.sin(this.animationTime + offset) * 0.1;
        });
    }

    getDistanceToPlayer(playerPosition) {
        const dx = playerPosition.x - this.currentPosition.x;
        const dz = playerPosition.z - this.currentPosition.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    animateLegs() {
        // Encontrar as pernas no grupo
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child !== this.mesh) {
                if (child.position.y < 0) { // Identificar pernas pela posição Y
                    // Animar pernas com movimento pendular
                    const legSwing = Math.sin(this.animationTime * 2) * 0.2;
                    if (child.position.z > 0) { // Pernas frontais
                        child.rotation.x = legSwing;
                    } else { // Pernas traseiras
                        child.rotation.x = -legSwing;
                    }
                }
            }
        });
    }

    prepareExplosion() {
        // Aumentar o tempo de preparação
        this.prepareTime++;

        // Piscar branco e verde rapidamente
        const flashSpeed = this.prepareTime / this.maxPrepareTime; // Aumenta a velocidade conforme prepara
        const flash = Math.sin(this.prepareTime * flashSpeed * 0.5) * 0.5 + 0.5;
        this.bodyMaterial.color.copy(this.normalColor).lerp(this.flashColor, flash);

        // Parar de se mover e tremer levemente
        const shake = Math.sin(this.prepareTime * 0.5) * 0.05;
        this.mesh.position.x += Math.random() * shake;
        this.mesh.position.z += Math.random() * shake;

        // Se atingir o tempo máximo de preparação, resetar
        if (this.prepareTime >= this.maxPrepareTime) {
            // Aqui você pode adicionar a lógica de explosão
            this.state = 'wandering';
            this.prepareTime = 0;
            this.bodyMaterial.color.copy(this.normalColor);
        }
    }
} 