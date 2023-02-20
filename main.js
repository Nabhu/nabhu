import { GUI } from "dat.gui";
import { cursor } from "./cursor.js";

let games_played = 0;

// Three JS
window.addEventListener("load", init, false);

function init() {
  createWorld();
  createPrimitive();
  cursor.init();
  counter();
  // createGUI();
  frontDetection();
  //---
  animation();
}

var Theme = { _darkred: 0xebe9e3 };

//--------------------------------------------------------------------

var scene, camera, renderer, container;
var start = Date.now();
var _width, _height;
function createWorld() {
  _width = window.innerWidth;
  _height = window.innerHeight;
  //---
  scene = new THREE.Scene();
  // scene.fog = new THREE.Fog(Theme._darkred, 8, 20);
  scene.background = new THREE.Color(Theme._darkred);
  //---
  camera = new THREE.PerspectiveCamera(55, _width / _height, 1, 1000);
  camera.position.z = 3;
  //---
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(_width, _height);
  //---
  container = document.getElementById("app");
  container.appendChild(renderer.domElement);
  //---
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  _width = window.innerWidth;
  _height = window.innerHeight;
  renderer.setSize(_width, _height);
  camera.aspect = _width / _height;
  camera.updateProjectionMatrix();
}

//--------------------------------------------------------------------

var mat;
var primitiveElement = function () {
  this.mesh = new THREE.Object3D();
  mat = new THREE.ShaderMaterial({
    wireframe: false,
    // fog: true,
    uniforms: {
      time: {
        type: "f",
        value: 0.0,
      },
      pointscale: {
        type: "f",
        value: 0.0,
      },
      decay: {
        type: "f",
        value: 0.0,
      },
      complex: {
        type: "f",
        value: 0.0,
      },
      waves: {
        type: "f",
        value: 0.0,
      },
      eqcolor: {
        type: "f",
        value: 0.0,
      },
      fragment: {
        type: "i",
        value: true,
      },
      redhell: {
        type: "i",
        value: true,
      },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });
  var geo = new THREE.IcosahedronBufferGeometry(3, 7);
  var mesh = new THREE.Points(geo, mat);

  //---
  this.mesh.add(mesh);
};

var _primitive;
function createPrimitive() {
  _primitive = new primitiveElement();
  scene.add(_primitive.mesh);
}

//--------------------------------------------------------------------

var options = {
  perlin: {
    vel: 0.002,
    speed: 0.0002,
    perlins: 1.0,
    decay: 0,
    complex: 0.3,
    waves: 20.0,
    eqcolor: 11.0,
    fragment: true,
    redhell: true,
  },
  spin: {
    sinVel: 0.0,
    ampVel: 80.0,
  },
};

function createGUI() {
  var gui = new GUI();
  var camGUI = gui.addFolder("Camera");
  camGUI.add(camera.position, "z", 3, 20).name("Zoom").listen();
  camGUI.add(options.perlin, "vel", 0.0, 0.02).name("Velocity").listen();

  var mathGUI = gui.addFolder("Math Options");
  mathGUI.add(options.spin, "sinVel", 0.0, 0.5).name("Sine").listen();
  mathGUI.add(options.spin, "ampVel", 0.0, 90.0).name("Amplitude").listen();

  var perlinGUI = gui.addFolder("Setup Perlin Noise");
  perlinGUI.add(options.perlin, "perlins", 1.0, 5.0).name("Size").step(1);
  perlinGUI.add(options.perlin, "speed", 0.0, 0.0005).name("Speed").listen();
  perlinGUI.add(options.perlin, "decay", 0.0, 1.0).name("Decay").listen();
  perlinGUI.add(options.perlin, "waves", 0.0, 20.0).name("Waves").listen();
  perlinGUI.add(options.perlin, "fragment", true).name("Fragment");
  perlinGUI.add(options.perlin, "complex", 0.1, 1.0).name("Complex").listen();
  perlinGUI.add(options.perlin, "redhell", true).name("Electroflow");
  perlinGUI.add(options.perlin, "eqcolor", 0.0, 15.0).name("Hue").listen();
  perlinGUI.open();
}

function frontDetection() {
  const contact_link = document.querySelector("a");
  if (contact_link) {
    contact_link.addEventListener("mouseleave", () => {
      decrementCameraZoom(camera.position.z, 3);
    });
    contact_link.addEventListener("mouseenter", () => {
      incrementCameraZoom(camera.position.z, 4.4);
    });
  }

  const nabhu = document.querySelector(".container .title");
  if (nabhu) {
    nabhu.addEventListener("mouseleave", () => {
      incrementWaves(options.perlin.waves, 20);
    });
    nabhu.addEventListener("mouseenter", () => {
      decrementWaves(options.perlin.waves, 0);
    });
  }
}

//--------------------------------------------------------------------

function animation() {
  requestAnimationFrame(animation);
  var performance = Date.now() * 0.003;

  _primitive.mesh.rotation.y += options.perlin.vel;
  _primitive.mesh.rotation.x =
    (Math.sin(performance * options.spin.sinVel) *
      options.spin.ampVel *
      Math.PI) /
    180;
  //---
  mat.uniforms["time"].value = options.perlin.speed * (Date.now() - start);
  mat.uniforms["pointscale"].value = options.perlin.perlins;
  mat.uniforms["decay"].value = options.perlin.decay;
  mat.uniforms["complex"].value = options.perlin.complex;
  mat.uniforms["waves"].value = options.perlin.waves;
  mat.uniforms["eqcolor"].value = options.perlin.eqcolor;
  mat.uniforms["fragment"].value = options.perlin.fragment;
  mat.uniforms["redhell"].value = options.perlin.redhell;
  //---
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

function decrementCameraZoom(current_number, number_to_go) {
  if (current_number > number_to_go) {
    camera.position.z = current_number;
    setTimeout(function () {
      decrementCameraZoom(current_number - 0.1, number_to_go);
    }, 10);
  }
}

function incrementCameraZoom(current_number, number_to_go) {
  if (current_number < number_to_go) {
    camera.position.z = current_number;
    setTimeout(function () {
      incrementCameraZoom(current_number + 0.1, number_to_go);
    }, 10);
  }
}

function decrementWaves(current_number, number_to_go) {
  if (current_number > number_to_go) {
    options.perlin.waves = current_number;
    setTimeout(function () {
      decrementWaves(current_number - 0.5, number_to_go);
    }, 10);
  }
}

function incrementWaves(current_number, number_to_go) {
  if (current_number < number_to_go) {
    options.perlin.waves = current_number;
    setTimeout(function () {
      incrementWaves(current_number + 0.5, number_to_go);
    }, 10);
  }
}

const counter = () => {
  const html_counter = document.querySelector("#counter");
  if (html_counter) {
    const counter_number = html_counter.querySelector(".number");
    const counter_sentence = html_counter.querySelector(".sentence");
    counter_number.addEventListener("mouseover", setCount);

    function setCount() {
      switch (html_counter.textContent) {
        case "Youhou":
          html_counter.classList.remove("top");
          html_counter.classList.add("bottom");
          counter_number.textContent = "Raté";
          break;
        case "Raté":
          html_counter.classList.remove("right");
          html_counter.classList.add("left");
          counter_number.textContent = "Ici";
          break;
        case "Ici":
        default:
          html_counter.classList.remove("bottom");
          html_counter.classList.add("top");
          html_counter.classList.add("random-shape");
          counter_number.textContent = "3";
          counter_sentence.textContent = "appuis sur la touche A";
          counter_number.removeEventListener("mouseover", setCount);
          window.addEventListener("keydown", setRandomShape);
          break;
      }
    }

    function setRandomShape(event) {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      if (
        event.key === "a" &&
        (html_counter.classList.contains("random-shape") ||
          html_counter.classList.contains("succeed"))
      ) {
        if (html_counter.classList.contains("random-shape")) {
          switch (parseInt(html_counter.textContent, 10)) {
            case 3:
              counter_number.textContent = "2";
              break;
            case 2:
              counter_number.textContent = "1";
              counter_sentence.textContent = "appui sur la touche A";
              break;
            case 1:
            default:
              counter_number.textContent = "3";
              counter_sentence.textContent = "appuis sur la touche Z";
              html_counter.classList.add("random-color");
              html_counter.classList.remove("random-shape");
              break;
          }
        }
        games_played++;
        camera.position.z = randomIntFromInterval(3, 16);
        options.perlin.decay = randomFloatFromInterval(0, 0.3);
        options.perlin.complex = randomFloatFromInterval(0.1, 1);
        options.perlin.waves = randomIntFromInterval(0, 30);
      }

      if (
        event.key === "z" &&
        (html_counter.classList.contains("random-color") ||
          html_counter.classList.contains("succeed"))
      ) {
        if (html_counter.classList.contains("random-color")) {
          switch (parseInt(html_counter.textContent, 10)) {
            case 3:
              counter_number.textContent = "2";
              break;
            case 2:
              counter_number.textContent = "1";
              counter_sentence.textContent = "appui sur la touche Z";
              break;
            case 1:
            default:
              counter_number.textContent = "0";
              html_counter.classList.remove("random-color");
              html_counter.classList.add("succeed");
              counter_sentence.textContent =
                "Bravo ! Tu peux maintenant combiner les 2 ✌🏻";
              break;
          }
        }
        games_played++;
        scene.remove(scene.children[0]);
        document.getElementById("fragmentShader").textContent = `
        void main() {
          gl_FragColor = vec4(${randomIntFromInterval(
            0,
            255
          )}., ${randomIntFromInterval(0, 255)}., ${randomIntFromInterval(
          0,
          255
        )}., 255.0) / 255.;
        }`;
        createPrimitive();
      }

      if (games_played === 8) {
        const nabhu = document.querySelector(".container .title");
        if (nabhu) {
          nabhu.textContent = "Tu trouves ça cool ?";
        }
        const title = document.querySelector("h1");
        if (title) {
          title.innerHTML = `Fais le moi savoir <span>Ça me fera plaisir ❤️</span>`;
        }
      }
      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    }
  }
};

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloatFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}
