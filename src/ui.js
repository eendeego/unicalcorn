/**********************************
 * Render loop
 */

import deepEqual from 'deep-equal';
import ShallowEquals from 'shallow-equal/dist/index.cjs.js';

const {shallowEqualArrays} = ShallowEquals;

let sceneGraph = [];

function paint(sceneGraph) {
  console.log('New Scene Graph: ', sceneGraph);
}

let hookIndex = -1;
let hookList = [];
let topLevelUpdate;

export function useEffect(callback, dependencies) {
  hookIndex++;
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
}

export function useState(initialValue) {
  hookIndex++;

  if (hookIndex === hookList.length) {
    console.log('new hook!');
    const hookInfo = {
      type: 'state',
      value: initialValue,
      setter: function setter(newValue) {
        hookInfo.value = newValue;
        topLevelUpdate();
      },
    };

    hookList.push(hookInfo);
  }

  return [hookList[hookIndex].value, hookList[hookIndex].setter];
}

export default function uiEventLoop(topComponent, props) {
  topLevelUpdate = function () {
    console.log('topLevelUpdate');

    hookIndex = -1;
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
  };

  topLevelUpdate();
}
