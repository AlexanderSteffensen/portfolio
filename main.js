import './style.css';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';

let scene, camera, renderer;

let imgs = {
    earth: document.getElementById('earth-img').href,
    star: document.getElementById('star-img').href
}

function init() {

    let  stars, starGeo;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI/2;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    console.log(renderer.domElement);

    starGeo = new THREE.Geometry();
    let star;
    for(let i=0;i<6000;i++) {
        star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );
        star.velocity = 0;
        star.acceleration = 0.0;
        starGeo.vertices.push(star);
    }
    let sprite = new THREE.TextureLoader().load( imgs.star );
    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite
    });

    stars = new THREE.Points(starGeo,starMaterial);
    scene.add(stars);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animateStars() {
        starGeo.vertices.forEach(p => {
            p.velocity += p.acceleration;
            p.y -= p.velocity;

            if (p.y < -200) {
                p.y = 200;
                //p.velocity = 0;
            }
        });
        starGeo.verticesNeedUpdate = true;
        stars.rotation.y +=0.002;

        animate(animateStars, scene, camera)
    }

    function animate(animationFunction, scene, camera) {
        renderer.render(scene, camera);
        requestAnimationFrame(animationFunction);
    }

    window.addEventListener("resize", onWindowResize, false);

    animateStars();

    function takeoff() {
        document.getElementById('takeoff').removeEventListener("click", takeoff);

        starGeo.vertices.forEach(p => p.acceleration = 0.002);
        setTimeout((() => {
            starGeo.vertices.forEach(p => p.acceleration = 0.006);
        }), 1000);
        setTimeout((() => {
            starGeo.vertices.forEach(p => p.acceleration = 0.012);
        }), 2000);

        animateStars();

        let curtain = document.createElement("div");
        curtain.setAttribute("id", "curtain");
        document.getElementById("button-wrapper").appendChild(curtain);

        setTimeout(transition, 5000);
    }

    document.getElementById('takeoff').addEventListener("click", takeoff);
}

init();

function transition() {
    let curtain = document.getElementById("curtain");

    curtain.classList.add("screen-change");

    setTimeout(delFirstScene, 1000);
    setTimeout(initMainScene, 1000);

    setTimeout(() => {
        curtain.classList.remove("screen-change");
    }, 5000);
    setTimeout(delCurtain, 5000);
}

function delFirstScene() {
    let elementIDs = ['takeoff', 'contact', 'first-text', 'second-text'];

    for(let i = 0; i < elementIDs.length; i++) {
        removeElement(elementIDs[i])
    }
}

function removeElement(id) {
    let element = document.getElementById(id);
    element.parentNode.removeChild(element);
}

function delCurtain() {

}

function initMainScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);


    // create earth with small atmosphere
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(5, 50, 50),
        new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                earthTexture: {
                    value: new THREE.TextureLoader().load(imgs.earth)
                }
            }
        }));

    // create bigger atmosphere
    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(5, 50, 50),
        new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        }));

    // makes it 10% bigger than the actual globe
    atmosphere.scale.set(1.2, 1.2, 1.2);

    scene.add(atmosphere);

    const group = new THREE.Group()
    group.add(sphere);
    scene.add(group);

    //adds star background
    const starGeometry = new THREE.Geometry();
    let sprite = new THREE.TextureLoader().load( imgs.star );
    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite
    });

    let star
    for (let i = 0; i < 10000; i++) {
        star = new THREE.Vector3(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            -Math.random() * 2000
        )
        starGeometry.vertices.push(star);
    }

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 15;

    const mouse = {
        x: undefined,
        y: undefined
    }

    /* TEXT ON PAGE
    const text = document.createElement('div');
    text.innerHTML =

    document.body.append(text);

     */

    function mainAnimate() {
        requestAnimationFrame(mainAnimate);
        //controls.update();
        renderer.render(scene, camera);
        sphere.rotation.y += 0.002;
    }
    mainAnimate();

    addEventListener('mousemove', () => {
        mouse.x = (event.clientX / innerWidth) * 2 - 1;
        mouse.y = (event.clientY / innerHeight) * 2 - 1;
    })

}
