/* eslint-disable @typescript-eslint/no-explicit-any */
import { HomeAssistant, getLovelace } from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Interaction from 'three.interaction/src/interaction/Interaction';
import { loadGLTFModel } from './lib/loadGLTFModel';
import type { BoilerplateCardConfig } from './types';
import { localize } from './localize/localize';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import model from './public/model.glb';
console.log(model);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'smart-motor-home',
  name: 'Smart Motor Home',
  description: 'A template custom card for you to create something awesome',
});

let camera, scene, renderer, controls;

const animation = () => {
  controls.update();
  renderer.render(scene, camera);
};

const toggleHeadlights = () => {
  const importedScene = scene.getObjectByName('Scene');
  const isVisible = importedScene.getObjectByName('leftHeadlight').visible;
  importedScene.getObjectByName('leftHeadlight').visible = !isVisible;
  importedScene.getObjectByName('rightHeadlight').visible = !isVisible;
};

const initHeadlights = () => {
  const leftHeadlight = new THREE.SpotLight(0xffffff, 4, 0, Math.PI / 2, 1);
  leftHeadlight.position.set(-2, 0.85, 0.55);
  leftHeadlight.name = 'leftHeadlight';
  scene.getObjectByName('Scene').add(leftHeadlight);

  const rightHeadlight = new THREE.SpotLight(0xffffff, 4, 0, Math.PI / 2, 1);
  rightHeadlight.position.set(-2, 0.85, -0.55);
  rightHeadlight.name = 'rightHeadlight';
  scene.getObjectByName('Scene').add(rightHeadlight);

  const leftLight = scene.getObjectByName('Scene').getObjectByName('Group_145');
  leftLight.cursor = 'pointer';

  const rightLight = scene.getObjectByName('Scene').getObjectByName('Group_163');
  rightLight.cursor = 'pointer';

  leftLight.on('click', () => {
    toggleHeadlights();
  });
  rightLight.on('click', () => {
    toggleHeadlights();
  });
};

const init = async (parent: HTMLDivElement) => {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.castShadow = true;
  // scene.fog = new THREE.Fog(0xeeeeee, 0, 1000);
  console.log(scene);
  const light = new THREE.AmbientLight(0x404040, 4); // soft white light
  scene.add(light);

  // init camera position
  camera.position.set(-1.9257630398868062, 1.9149436284603054, -2.9225354315979177);
  camera.quaternion.set(-0.2586318915729673, 0.053585350956293056, 0.944430863104808, 0.1956744736530223);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;

  // init controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 3;
  controls.enableZoom = false;
  controls.enablePan = false;

  // start animation loop
  renderer.setAnimationLoop(animation);
  parent.appendChild(renderer.domElement);

  new Interaction(renderer, scene, camera);

  // load model
  const gltf = await loadGLTFModel(model);
  scene.add(gltf.scene);

  // headlights
  initHeadlights();

  (window as any).debug = {
    camera,
    scene,
    renderer,
    controls,
  };
};

type State = {
  headlights: boolean;
};

customElements.define(
  'smart-motor-home',
  class extends HTMLElement {
    public config!: BoilerplateCardConfig;
    public content!: HTMLDivElement;
    public state: State = {
      headlights: false,
    };

    setConfig(config: BoilerplateCardConfig) {
      console.log('config::::::', config);

      if (!config) {
        throw new Error(localize('common.invalid_configuration'));
      }

      if (config.test_gui) {
        getLovelace().setEditMode(true);
      }

      this.config = {
        name: 'Boilerplate',
        ...config,
      };
    }

    set hass(hass: HomeAssistant) {
      console.log('hass', hass);

      // update local state by hass entity
      if (this.config.headlight_entity) {
        const state = hass.states[this.config.headlight_entity].state === 'on';
        this.state.headlights = state;
      }

      console.log('local state', this.state);

      // Initialize the content if it's not there yet.
      if (!this.content) {
        this.innerHTML = `
          <ha-card header="Example-card">
            <div class="card-content" width="100%" height="100%" style="display: inline-block;"></div>
          </ha-card>
        `;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.content = this.querySelector('.card-content')!;
        if (this.content) {
          init(this.content);
        }
      }
      // Update the content based on the latest hass object.
      // ...
    }

    // set webgl size on mount
    connectedCallback() {
      renderer.setSize(this.clientWidth, this.clientWidth);
      camera.aspect = this.clientHeight / this.clientWidth;
    }
  },
);
