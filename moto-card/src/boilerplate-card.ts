/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './editor';

import type { BoilerplateCardConfig } from './types';
import { localize } from './localize/localize';

const loader = new GLTFLoader();

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'smart-motor-home',
  name: 'Smart Motor Home',
  description: 'A template custom card for you to create something awesome',
});

let camera, scene, renderer, controls;
let geometry, material, mesh;

const animation = () => {
  controls.update();
  renderer.render(scene, camera);
};

const init = (parent: HTMLDivElement) => {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.z = 50;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0x72645b, 2, 15);

  loader.load(
    // resource URL
    'http://127.0.0.1:5000/public/model.glb',
    // called when resource is loaded
    function (gltf) {
      console.log(gltf);
      scene.add(gltf.scene);
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened', error);
    },
  );

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);
  plane.receiveShadow = true;

  // scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
  const light = new THREE.AmbientLight(0x404040, 3);

  scene.add(light);
  // geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  // material = new THREE.MeshNormalMaterial();

  // mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  controls = new OrbitControls(camera, renderer.domElement);

  renderer.setAnimationLoop(animation);
  parent.appendChild(renderer.domElement);
};

customElements.define(
  'smart-motor-home',
  class extends HTMLElement {
    public config!: BoilerplateCardConfig;
    public content!: HTMLDivElement;
    // public static async getConfigElement(): Promise<LovelaceCardEditor> {
    //   return document.createElement('smart-motor-home-editor');
    // }

    setConfig(config: BoilerplateCardConfig) {
      console.log('config::::::', config, this.hass);

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
      console.log('hass', hass, this.hass);
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
    }

    connectedCallback() {
      renderer.setSize(this.clientWidth, this.clientWidth);
      camera.aspect = this.clientWidth / this.clientHeight;
    }
  },
);
