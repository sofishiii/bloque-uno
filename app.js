///////// SCAFFOLD.
// 1. Importar librerías.
console.log(THREE);
console.log(gsap);

// 2. Configurar canvas.
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("#000000");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// 3.1 Configurar mesh.
//const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
const geo = new THREE.IcosahedronGeometry(1.5, 2);
const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    //wireframe: true,
});
const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
mesh.position.z = -7;


// 3.2 Crear luces.
const frontLight = new THREE.PointLight("#FFDDA1", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("#9DB5B2", 50, 100);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);



///////// EN CLASE.

//// A) Cargar múltiples texturas.
// 1. "Loading manager".
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
  // console.log(⁠ Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal}) ⁠);
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   //console.log(⁠ Cargando: ${url} (${itemsLoaded}/${itemsTotal}) ⁠);
};

manager.onLoad = function () {
   console.log('✅ ¡Todas las texturas cargadas!');
   createMaterial();
};

manager.onError = function (url) {
   //console.error(⁠  Error al cargar : ${url} ⁠
    
  // );
};

// 2. "Texture loader" para nuestros assets.
const loader = new THREE.TextureLoader(manager);

// 3. Cargamos texturas guardadas en el folder del proyecto.
const carpetTexture = {
   albedo: loader.load('./assets/texturas/carpet/albedo.png'),
   ao: loader.load('./assets/texturas/carpet/ao.png'),
   metalness: loader.load('./assets/texturas/carpet/metallic.png'),
   normal: loader.load('./assets/texturas/carpet/normal.png'),
   roughness: loader.load('./assets/texturas/carpet/roughness.png'),
   displacement: loader.load('./assets/texturas/carpet/height.png'),
};

const bricksTexture = {
   albedo: loader.load('./assets/texturas/bricks/albedo.png'),
   ao: loader.load('./assets/texturas/bricks/ao.png'),
   metalness: loader.load('./assets/texturas/bricks/metallic.png'),
   normal: loader.load('./assets/texturas/bricks/normal.png'),
   roughness: loader.load('./assets/texturas/bricks/roughness.png'),
   displacement: loader.load('./assets/texturas/bricks/displacement.png'),
};

const rustedTextures = {
   albedo: loader.load('./assets/texturas/rusted/albedo.png'),
   metalness: loader.load('./assets/texturas/rusted/metallic.png'),
   normal: loader.load('./assets/texturas/rusted/normal.png'),
   roughness: loader.load('./assets/texturas/rusted/roughness.png'),
};



// 4. Definimos variables y la función que va a crear el material al cargar las texturas.
var carpetMaterial;
function createMaterial() {
   carpetMaterial = new THREE.MeshStandardMaterial({
       map: carpetTexture.albedo,
       aoMap: carpetTexture.ao,
       metalnessMap: carpetTexture.metalness,
       normalMap: carpetTexture.normal,
       roughnessMap: carpetTexture.roughness,
       displacementMap: carpetTexture.displacement,
       displacementScale: 0.15,
       side: THREE.FrontSide,
       // wireframe: true,
   });

   mesh.material = pbrMaterial;
}

var bricksMaterial;
function createMaterial() {
   bricksMaterial = new THREE.MeshStandardMaterial({
       map: brickTexture.albedo,
       aoMap: brickTexture.ao,
       metalnessMap: brickTexture.metalness,
       normalMap: brickTexture.normal,
       roughnessMap: brickTexture.roughness,
       displacementMap: brickTexture.displacement,
   });
   mesh.material = bricksMaterial;
}

 var  rustedMaterial = new THREE.MeshStandardMaterial({
       map: rustedTextures.albedo,
       metalnessMap: rustedTextures.metalness,
       normalMap: rustedTextures.normal,
       roughnessMap: rustedTextures.roughness,
       metalness: 1,
       roughness: 1,
       side: THREE.DoubleSide,
       // wireframe: true,
   });

mesh.material = rustedMaterial;


let isWireframeActive = false;

window.addEventListener("keydown", function (event) {
    if (event.key === "w" || event.key === "W") {
        isWireframeActive = !isWireframeActive;

        if (mesh.material) {
            mesh.material.wireframe = isWireframeActive;
            console.log(`Wireframe: ${isWireframeActive ? "Activado" : "Desactivado"}`);
        }
    }
});

//// B) Rotación al scrollear.
// 1. Crear un objeto con la data referente al SCROLL para ocuparla en todos lados.
var scroll = {
    y: 0,
    lerpedY: 0,
    speed: 0.01,
    cof: 0.07
 };
 
 // 2. Escuchar el evento scroll y actualizar el valor del scroll.
 function updateScrollData(eventData) {
    scroll.y += eventData.deltaX * scroll.speed;
 }
 
 window.addEventListener("wheel", updateScrollData);
 function updateMeshRotation() {
    mesh.rotation.y = scroll.lerpedY;
 }
 

 // 5. Vamos a suavizar un poco el valor de rotación para que los cambios de dirección sean menos bruscos.
function lerpScrollY() {
    scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
 }
 

//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".
var mouse = {
    x: 0,
    y: 0,
    normalOffset: {
        x: 0,
        y: 0
    },
    lerpNormalOffset: {
        x: 0,
        y: 0
    },
 
    cof: 0.07,
    gazeRange: {
        x: 70,
        y: 30
    }


 }
 function updateMouseData(eventData) {
    updateMousePosition(eventData);
    calculateNormalOffset();
 }
 function updateMousePosition(eventData) {
    mouse.x = eventData.clientX;
    mouse.y = eventData.clientY;
 }
 function calculateNormalOffset() {
    let windowCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    }
    mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
    mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
 }
 
 // a) Suavizar movimiento de cámara.
// 1. Incrementar gradualmente el valor de la distancia que vamos a usar para animar y lo guardamos en otro atributo. (en el loop de animación)

function lerpDistanceToCenter() {
   mouse.lerpNormalOffset.x += (mouse.normalOffset.x - mouse.lerpNormalOffset.x) * mouse.cof;
   mouse.lerpNormalOffset.y += (mouse.normalOffset.y - mouse.lerpNormalOffset.y) * mouse.cof;
}


 window.addEventListener("mousemove", updateMouseData);


 function updateCameraPosition() {
    camera.position.x = mouse.lerpNormalOffset.x * mouse.gazeRange.x;
    camera.position.y = -mouse.lerpNormalOffset.y * mouse.gazeRange.y;
 }
  

///////// FIN DE LA CLASE.

///////// D) Interacción con click para escalar el mesh.

// 1. Contador de escala (inicial en 1).
let currentScale = 1;

// 2. Agrega un event listener al canvas, no a la ventana.
canvas.addEventListener("click", () => {
    currentScale += 0.2; // Aumenta el tamaño un 20% en cada clic

    gsap.to(mesh.scale, {
        x: currentScale,
        y: currentScale,
        z: currentScale,
        duration: 1,
        ease: "bounce.out"
    });
});



/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);
    lerpScrollY()
   // mesh.rotation.x -= 0.005;
    updateMeshRotation();
    lerpDistanceToCenter();
    updateCameraPosition();
    camera.lookAt(mesh.position);
    renderer.render(scene, camera);
}

animate()