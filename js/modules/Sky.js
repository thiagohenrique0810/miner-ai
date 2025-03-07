/**
 * Classe responsável por gerenciar o céu, sol, lua e ciclo dia/noite
 */
export class Sky {
    constructor(scene) {
        this.scene = scene;
        
        // Configurações do ciclo dia/noite
        this.dayDuration = 10 * 60 * 1000; // 10 minutos em milissegundos
        this.startTime = Date.now();
        this.timeOfDay = 0; // 0 = meio-dia, 0.5 = meia-noite
        
        // Cores do céu
        this.skyColors = {
            day: new THREE.Color(0x87CEEB),      // Azul céu bem claro ao meio-dia
            sunset: new THREE.Color(0xFF7E47),    // Laranja avermelhado para pôr do sol
            night: new THREE.Color(0x000010),     // Quase preto para meia-noite
            nightMoon: new THREE.Color(0x0B1942), // Azul muito escuro para noite com lua
            sunrise: new THREE.Color(0xFF9933),   // Laranja suave para nascer do sol
            dawn: new THREE.Color(0xADD8E6)       // Azul bem clarinho para aurora
        };
        
        // Cores da luz ambiente
        this.ambientColors = {
            day: new THREE.Color(0xFFFFFF),      // Luz branca durante o dia
            sunset: new THREE.Color(0xFFB366),    // Luz alaranjada no pôr do sol
            night: new THREE.Color(0x0A0A1F)     // Luz muito escura à noite
        };

        // Inicializar coleções
        this.clouds = new Map();
        this.stars = new Map();
        
        // Criar elementos do céu
        this.createLights();
        this.createSunAndMoon();
        this.createClouds();
        this.createStars();
    }

    createLights() {
        // Luz ambiente mais forte durante a noite
        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        this.scene.add(this.ambientLight);

        // Luz direcional (sol)
        this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.sunLight.position.set(50, 100, 50);
        this.sunLight.castShadow = true;

        // Configurar sombras do sol
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.sunLight.shadow.camera.near = 1;
        this.sunLight.shadow.camera.far = 200;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.bias = -0.001;

        this.scene.add(this.sunLight);

        // Luz da lua (mais forte e menos azulada)
        this.moonLight = new THREE.DirectionalLight(0xCCCCFF, 0.5);
        this.moonLight.position.set(-50, 100, -50);
        this.moonLight.castShadow = true;
        
        // Configurar sombras da lua
        this.moonLight.shadow.camera.left = -50;
        this.moonLight.shadow.camera.right = 50;
        this.moonLight.shadow.camera.top = 50;
        this.moonLight.shadow.camera.bottom = -50;
        this.moonLight.shadow.camera.near = 1;
        this.moonLight.shadow.camera.far = 200;
        this.moonLight.shadow.mapSize.width = 1024;
        this.moonLight.shadow.mapSize.height = 1024;
        this.moonLight.shadow.bias = -0.001;

        this.scene.add(this.moonLight);

        // Adicionar luz hemisférica para melhorar iluminação geral
        this.hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x444477, 0.5);
        this.scene.add(this.hemiLight);
    }

    createSunAndMoon() {
        // Criar sol (cubo)
        const sunGeometry = new THREE.BoxGeometry(8, 8, 8);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            emissive: 0xFFAA00,
            emissiveIntensity: 1
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        
        // Adicionar brilho ao sol
        const sunGlow = new THREE.PointLight(0xFFFF00, 2, 50);
        this.sun.add(sunGlow);
        this.scene.add(this.sun);

        // Criar lua (cubo)
        const moonGeometry = new THREE.BoxGeometry(6, 6, 6);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFEE,
            emissive: 0xAAAAFF,
            emissiveIntensity: 0.5
        });
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        // Adicionar brilho à lua
        const moonGlow = new THREE.PointLight(0x8888FF, 1, 30);
        this.moon.add(moonGlow);
        this.scene.add(this.moon);
    }

    createClouds() {
        // Geometria e material das nuvens
        this.cloudGeometry = new THREE.BoxGeometry(4, 1, 4);
        this.cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });

        // Criar várias nuvens em posições aleatórias
        for (let i = 0; i < 15; i++) {
            const cloudGroup = new THREE.Group();
            
            // Padrão de blocos para formar uma nuvem
            const cloudPattern = [
                { x: 0, z: 0 },
                { x: 1, z: 0 },
                { x: -1, z: 0 },
                { x: 0, z: 1 },
                { x: 0, z: -1 },
                { x: 1, z: 1 },
                { x: -1, z: -1 }
            ];

            cloudPattern.forEach(offset => {
                const cloudBlock = new THREE.Mesh(this.cloudGeometry, this.cloudMaterial);
                cloudBlock.position.set(
                    offset.x * 4,
                    0,
                    offset.z * 4
                );
                cloudGroup.add(cloudBlock);
            });

            // Posicionar a nuvem aleatoriamente
            const x = Math.random() * 200 - 100;
            const y = 50 + Math.random() * 20;
            const z = Math.random() * 200 - 100;
            cloudGroup.position.set(x, y, z);

            this.scene.add(cloudGroup);
            this.clouds.set(cloudGroup, {
                speed: Math.random() * 0.02 + 0.01,
                originalX: x
            });
        }
    }

    createStars() {
        const starGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0
        });

        // Criar 200 estrelas em posições aleatórias
        for (let i = 0; i < 200; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial.clone());
            
            // Posicionar estrela em uma esfera ao redor da cena
            const radius = 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            star.position.x = radius * Math.sin(phi) * Math.cos(theta);
            star.position.y = Math.abs(radius * Math.cos(phi)) + 20; // Manter acima do horizonte
            star.position.z = radius * Math.sin(phi) * Math.sin(theta);

            this.scene.add(star);
            this.stars.set(star, {
                twinkleSpeed: Math.random() * 0.1 + 0.05,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        // Calcular tempo do dia (0 a 1)
        const elapsed = (Date.now() - this.startTime) % this.dayDuration;
        this.timeOfDay = elapsed / this.dayDuration;

        // Calcular ângulo para rotação
        const angle = this.timeOfDay * Math.PI * 2;
        const radius = 150;
        const height = 100;

        // Calcular posição do sol em um arco mais realista
        const sunX = Math.cos(angle) * radius;
        const sunY = Math.sin(angle) * height;
        this.sun.position.set(sunX, Math.max(0, sunY), 0);
        
        // Calcular ângulo do sol em relação ao horizonte (em graus)
        const sunAngle = (Math.atan2(sunY, Math.abs(sunX)) * 180) / Math.PI;
        
        // Sol só visível quando acima do horizonte
        this.sun.visible = sunAngle > 0;

        // Calcular posição da lua em um arco oposto ao sol
        const moonX = -Math.cos(angle) * radius;
        const moonY = -Math.sin(angle) * height;
        this.moon.position.set(moonX, Math.max(0, moonY), 0);
        
        // Calcular ângulo da lua em relação ao horizonte (em graus)
        const moonAngle = (Math.atan2(moonY, Math.abs(moonX)) * 180) / Math.PI;
        
        // Lua só visível quando acima do horizonte e sol abaixo de -5 graus
        this.moon.visible = moonAngle > 0 && sunAngle < -5;

        // Manter sol e lua sempre olhando para o centro
        if (this.sun.visible) {
            this.sun.lookAt(0, 0, 0);
        }
        if (this.moon.visible) {
            this.moon.lookAt(0, 0, 0);
        }

        // Atualizar posições das luzes direcionais
        this.sunLight.position.copy(this.sun.position);
        this.moonLight.position.copy(this.moon.position);

        // Calcular intensidade da luz baseada no ângulo do sol/lua
        const sunIntensity = Math.max(0, Math.sin(sunAngle * Math.PI / 180));
        const moonIntensity = Math.max(0, Math.sin(moonAngle * Math.PI / 180)) * 0.3;

        // Ajustar intensidades das luzes
        this.sunLight.intensity = this.sun.visible ? sunIntensity * 1.2 : 0;
        this.moonLight.intensity = this.moon.visible ? moonIntensity : 0;
        
        // Ajustar intensidade da luz hemisférica
        this.hemiLight.intensity = 0.2 + (sunAngle > 0 ? sunIntensity * 0.3 : moonIntensity * 0.1);

        // Atualizar nuvens
        this.clouds.forEach((data, cloud) => {
            cloud.position.x += data.speed;
            
            // Se a nuvem sair do mapa, resetar sua posição
            if (cloud.position.x > 100) {
                cloud.position.x = -100;
            }

            // Ajustar opacidade das nuvens baseado no ângulo do sol
            cloud.children.forEach(block => {
                block.material.opacity = 0.8 * (0.3 + Math.max(0, sunAngle/90) * 0.7);
            });
        });

        // Atualizar estrelas com base no ângulo do sol
        this.stars.forEach((data, star) => {
            // Estrelas começam a sumir quando o sol está a -5 graus e somem completamente a +5 graus
            let starVisibility = 0;
            if (sunAngle <= -5) {
                // Noite total
                starVisibility = 1;
            } else if (sunAngle <= 5) {
                // Transição suave durante o crepúsculo
                starVisibility = (5 - sunAngle) / 10;
            }
            
            // Aplicar efeito de cintilação apenas quando visível
            const twinkle = Math.sin(Date.now() * data.twinkleSpeed + data.twinkleOffset) * 0.2 + 0.8;
            star.material.opacity = starVisibility * 0.9 * twinkle;
        });

        // Atualizar cor do céu com transições mais suaves baseadas no ângulo do sol
        let skyColor = new THREE.Color();
        
        if (sunAngle < -5) {
            // Noite
            if (moonAngle > 0) {
                skyColor.lerpColors(this.skyColors.night, this.skyColors.nightMoon, Math.sin(moonAngle * Math.PI / 180));
            } else {
                skyColor = this.skyColors.night;
            }
        } else if (sunAngle < 5) {
            // Aurora/Crepúsculo
            const t = (sunAngle + 5) / 10;
            skyColor.lerpColors(this.skyColors.nightMoon, this.skyColors.dawn, t);
        } else if (sunAngle < 30) {
            // Nascer/Pôr do sol
            const t = (sunAngle - 5) / 25;
            skyColor.lerpColors(this.skyColors.dawn, this.skyColors.sunrise, t);
        } else if (sunAngle < 60) {
            // Transição para meio-dia
            const t = (sunAngle - 30) / 30;
            skyColor.lerpColors(this.skyColors.sunrise, this.skyColors.day, t);
        } else {
            // Meio-dia
            skyColor = this.skyColors.day;
        }

        // Atualizar cor do ambiente com mais suavidade
        let ambientColor = new THREE.Color();
        if (sunAngle > 0) {
            // Durante o dia
            ambientColor.lerpColors(this.ambientColors.sunset, this.ambientColors.day, Math.sin(sunAngle * Math.PI / 180));
        } else {
            // Durante a noite
            ambientColor.lerpColors(this.ambientColors.night, this.ambientColors.sunset, Math.sin(moonAngle * Math.PI / 180));
        }
        
        this.ambientLight.color = ambientColor;
        this.ambientLight.intensity = sunAngle > 0 ? 
            (0.5 + sunIntensity * 0.5) : 
            (0.1 + moonIntensity * 0.2);

        // Atualizar cor de fundo da cena
        this.scene.background = skyColor;
    }
} 