import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

export const loadGLTFModel = (modelUrl: string): Promise<GLTF> => {
  return new Promise((resolve, reject) => {
    loader.load(
      // resource URL
      modelUrl,
      // called when resource is loaded
      function (gltf) {
        gltf.scene.castShadow = true;
        gltf.scene.children.forEach((child) => {
          child.castShadow = true;
        });

        resolve(gltf);
      },
      // called when loading is in progresses
      function () {
        return;
      },
      // called when loading has errors
      function (error) {
        reject(error);
      },
    );
  });
};
