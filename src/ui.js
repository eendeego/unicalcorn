/**********************************
 * Render loop
 */

import deepEqual from 'deep-equal';
import ShallowEquals from 'shallow-equal/dist/index.cjs.js';

const {shallowEqualArrays} = ShallowEquals;

function paint(sceneGraph) {
  console.log('New Scene Graph: ', sceneGraph);
}

let hookIndex = 0;
let hookList = [];

export function useEffect(callback, dependencies) {
  if (hookIndex === hookList.length) {
    hookList.push({
      type: 'effect',
      callback,
      dependencies,
      newDependencies: null,
      cleanup: () => {},
    });
  } else {
    hookList[hookIndex].newDependencies = dependencies;
  }

  hookIndex++;
}

let sceneGraph = [];

export default function uiEventLoop(topComponent, props) {
  hookIndex = 0;
  const newSceneGraph = topComponent(props);

  if (!deepEqual(sceneGraph, newSceneGraph)) {
    sceneGraph = newSceneGraph;
    paint(sceneGraph);
  }

  for (const hook of hookList) {
    if (hook.type === 'effect') {
      if (!shallowEqualArrays(hook.newDependencies, hook.dependencies)) {
        hook.cleanup = hook.callback();
      }
    }
  }
  // Eventually, this will go away and the update cycle will be triggered by
  // something else
  setTimeout(_ => uiEventLoop(topComponent, props), 167);
}
