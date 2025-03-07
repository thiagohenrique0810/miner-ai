import { World } from './world.js';

// Configuração básica
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Cor do céu

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Configurar renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controles
const controls = new THREE.PointerLockControls(camera, document.body);

// Criar mundo (que agora inclui o sistema de iluminação dia/noite)
const world = new World(scene);

// Posição inicial da câmera
camera.position.set(0, 3, 0);

// Variáveis de movimento
const moveSpeed = 0.1;
const gravity = 0.015;
const jumpForce = 0.2;
const doubleJumpForce = 0.15;
const floorOffset = 1.8;
const stepHeight = 0.1;
const playerRadius = 0.3;
const collisionPrecision = 4;
const maxBlockDistance = 5;
const maxFallSpeed = -0.4;
let velocity = 0;
let canJump = true;
let doubleJump = true;
let isOnGround = false;
let lastGroundY = 0;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ' ': false
};

// Raycaster para detecção de colisão com blocos
const raycaster = new THREE.Raycaster();
const downRaycaster = new THREE.Raycaster();
const upRaycaster = new THREE.Raycaster();

// Variáveis para o menu de blocos
let selectedBlockIndex = 0;
const blockTypes = ['dirt', 'stone', 'grass', 'wood', 'leaves'];

// Função para obter direção de movimento horizontal
function getMovementDirection(direction) {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Manter movimento no plano horizontal
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const moveDirection = new THREE.Vector3();

    if (direction === 'forward') moveDirection.copy(forward);
    else if (direction === 'backward') moveDirection.copy(forward).negate();
    else if (direction === 'left') moveDirection.copy(right);
    else if (direction === 'right') moveDirection.copy(right).negate();

    return moveDirection;
}

// Função para atualizar a lista de blocos para colisão
function updateBlocksList() {
    return Array.from(world.blocks.values());
}

// Função para obter o bloco que está sendo mirado
function getTargetBlock() {
    // Criar vetor do centro da tela
    const center = new THREE.Vector2(0, 0);
    
    // Atualizar o raycaster com a posição da câmera
    raycaster.setFromCamera(center, camera);
    
    // Verificar interseção apenas com blocos
    const blocks = updateBlocksList();
    const intersects = raycaster.intersectObjects(blocks);
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.distance <= maxBlockDistance) {
            return {
                block: intersect.object,
                face: intersect.face,
                point: intersect.point
            };
        }
    }
    return null;
}

// Função para atualizar a seleção visual do bloco
function updateBlockSelection() {
    const slots = document.querySelectorAll('.block-slot');
    slots.forEach(slot => slot.classList.remove('selected'));
    slots[selectedBlockIndex].classList.add('selected');
}

// Evento de scroll do mouse para trocar blocos
document.addEventListener('wheel', (event) => {
    if (!controls.isLocked) return;

    if (event.deltaY > 0) {
        // Scroll para baixo
        selectedBlockIndex = (selectedBlockIndex + 1) % blockTypes.length;
    } else {
        // Scroll para cima
        selectedBlockIndex = (selectedBlockIndex - 1 + blockTypes.length) % blockTypes.length;
    }

    updateBlockSelection();
});

// Também permitir seleção por números (1-5)
document.addEventListener('keydown', (event) => {
    if (!controls.isLocked) return;

    const num = parseInt(event.key);
    if (num >= 1 && num <= blockTypes.length) {
        selectedBlockIndex = num - 1;
        updateBlockSelection();
    }
});

// Eventos de teclado
document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        // Verificar pulo
        if (event.key === ' ' && !keys[event.key]) {
            if (isOnGround) {
                // Primeiro pulo
                velocity = jumpForce;
                canJump = false;
                isOnGround = false;
            } else if (!canJump && doubleJump) {
                // Pulo duplo
                velocity = doubleJumpForce;
                doubleJump = false;
                
                // Criar efeito visual para o pulo duplo
                const jumpEffect = new THREE.Mesh(
                    new THREE.RingGeometry(0.5, 0.7, 32),
                    new THREE.MeshBasicMaterial({
                        color: 0x00ff00,
                        transparent: true,
                        opacity: 0.5
                    })
                );
                jumpEffect.position.copy(camera.position);
                jumpEffect.position.y -= 0.5;
                jumpEffect.rotation.x = Math.PI / 2;
                scene.add(jumpEffect);

                // Animar e remover o efeito
                const startTime = Date.now();
                function animateJumpEffect() {
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime > 500) {
                        scene.remove(jumpEffect);
                        return;
                    }
                    
                    jumpEffect.scale.x = jumpEffect.scale.y = 1 + (elapsedTime / 500);
                    jumpEffect.material.opacity = 0.5 * (1 - elapsedTime / 500);
                    
                    requestAnimationFrame(animateJumpEffect);
                }
                animateJumpEffect();
            }
        }
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// Evento de clique para iniciar
document.addEventListener('click', () => {
    controls.lock();
});

// Eventos de mouse para interação com blocos
document.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    const targetBlock = getTargetBlock();
    if (!targetBlock) return;

    if (event.button === 0) { // Clique esquerdo - quebrar bloco
        const position = targetBlock.block.position;
        world.removeBlock(position.x, position.y, position.z);
    } else if (event.button === 2) { // Clique direito - colocar bloco
        const normal = targetBlock.face.normal;
        const position = targetBlock.block.position;
        const newX = position.x + normal.x;
        const newY = position.y + normal.y;
        const newZ = position.z + normal.z;
        
        // Verificar se o novo bloco não colide com o jogador
        const playerPos = camera.position.clone();
        if (Math.abs(newX - playerPos.x) > playerRadius ||
            Math.abs(newY - playerPos.y) > floorOffset ||
            Math.abs(newZ - playerPos.z) > playerRadius) {
            world.createBlock(newX, newY, newZ, blockTypes[selectedBlockIndex]);
        }
    }
});

// Prevenir menu de contexto do clique direito
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Verifica colisão com o chão
function checkGround() {
    const positions = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(playerRadius, 0, playerRadius),
        new THREE.Vector3(-playerRadius, 0, playerRadius),
        new THREE.Vector3(playerRadius, 0, -playerRadius),
        new THREE.Vector3(-playerRadius, 0, -playerRadius)
    ];

    let minDistance = Infinity;
    let closestPoint = null;
    const blocks = updateBlocksList();

    for (const pos of positions) {
        const origin = camera.position.clone().add(pos);
        origin.y -= floorOffset - 0.1; // Ajustado para melhor detecção do chão

        downRaycaster.ray.origin.copy(origin);
        downRaycaster.ray.direction.set(0, -1, 0);
        
        const intersects = downRaycaster.intersectObjects(blocks);
        if (intersects.length > 0) {
            const distance = intersects[0].distance;
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = intersects[0].point;
            }
        }
    }

    return {
        collision: minDistance <= 0.5, // Aumentado para melhor detecção
        point: closestPoint,
        distance: minDistance
    };
}

// Verifica colisão com o teto
function checkCeilingCollision() {
    upRaycaster.ray.origin.copy(camera.position);
    upRaycaster.ray.direction.set(0, 1, 0);
    const blocks = updateBlocksList();
    const intersects = upRaycaster.intersectObjects(blocks);
    return intersects.length > 0 && intersects[0].distance < 1;
}

// Verifica colisão lateral em uma direção específica
function checkWallCollision(direction) {
    const moveDirection = getMovementDirection(direction);
    
    // Verificar colisão em diferentes alturas e posições
    const heights = [-1.0, -0.5, 0, 0.5, 1.0];
    const offsets = [-playerRadius, 0, playerRadius];
    const blocks = updateBlocksList();

    for (const height of heights) {
        for (const offset of offsets) {
            const origin = camera.position.clone();
            origin.y += height;
            
            // Adicionar offset perpendicular à direção do movimento
            const perpendicular = new THREE.Vector3(-moveDirection.z, 0, moveDirection.x).normalize();
            origin.add(perpendicular.multiplyScalar(offset));

            raycaster.ray.origin.copy(origin);
            raycaster.ray.direction.copy(moveDirection);

            const intersects = raycaster.intersectObjects(blocks);
            if (intersects.length > 0 && intersects[0].distance < playerRadius) {
                return true;
            }
        }
    }
    return false;
}

// Loop principal
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        // Atualizar posição do jogador no mundo
        world.updatePlayerPosition(
            camera.position.x,
            camera.position.y,
            camera.position.z
        );

        // Aplicar gravidade
        velocity -= gravity;
        if (velocity < maxFallSpeed) velocity = maxFallSpeed;

        // Verificar colisão com o chão
        const groundInfo = checkGround();
        if (groundInfo.collision) {
            if (velocity <= 0) {
                camera.position.y = groundInfo.point.y + floorOffset;
                velocity = 0;
                isOnGround = true;
                canJump = true;
                doubleJump = true;
                lastGroundY = groundInfo.point.y;
            }
        } else {
            isOnGround = false;
        }

        // Verificar colisão com o teto
        if (checkCeilingCollision() && velocity > 0) {
            velocity = 0;
        }

        // Aplicar movimento vertical
        camera.position.y += velocity;

        // Movimento horizontal
        if (keys.w) {
            const direction = getMovementDirection('forward');
            if (!checkWallCollision(direction)) {
                camera.position.add(direction.multiplyScalar(moveSpeed));
            }
        }
        if (keys.s) {
            const direction = getMovementDirection('backward');
            if (!checkWallCollision(direction)) {
                camera.position.add(direction.multiplyScalar(moveSpeed));
            }
        }
        if (keys.a) {
            const direction = getMovementDirection('left');
            if (!checkWallCollision(direction)) {
                camera.position.add(direction.multiplyScalar(moveSpeed));
            }
        }
        if (keys.d) {
            const direction = getMovementDirection('right');
            if (!checkWallCollision(direction)) {
                camera.position.add(direction.multiplyScalar(moveSpeed));
            }
        }
    }

    // Atualizar o mundo
    world.update();

    renderer.render(scene, camera);
}

// Ajuste de tela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar animação
animate(); 