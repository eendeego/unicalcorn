/**********************************
 * Render loop
 */

import deepEqual from 'deep-equal';
import ShallowEquals from 'shallow-equal';

const {shallowEqualArrays} = ShallowEquals;

let sceneGraph = null;

let hookIndex = -1;
let hookList = [];
let topLevelUpdate;
let effectQueue = [];

export function useEffect(callback, dependencies) {
  hookIndex++;
  if (hookIndex === hookList.length) {
    hookList.push({
      type: 'effect',
      callback,
      dependencies: null,
      cleanup: () => {},
    });
  }

  if (
    hookList[hookIndex].dependencies == null ||
    hookList[hookIndex].dependencies.some(
      (dependency, i) => !Object.is(dependency, dependencies[i]),
    )
  ) {
    if (!shallowEqualArrays(hookList[hookIndex].dependencies, dependencies)) {
      effectQueue.push({
        effect: hookList[hookIndex],
      });
    }
    hookList[hookIndex].dependencies = dependencies;
  }
}

export function useState(initialValue) {
  hookIndex++;

  if (hookIndex === hookList.length) {
    const hookInfo = {
      type: 'state',
      value: typeof initialValue == 'function' ? initialValue() : initialValue,
      setter: function setter(newValue) {
        hookInfo.value =
          typeof newValue === 'function' ? newValue(hookInfo.value) : newValue;
        topLevelUpdate();
      },
    };

    hookList.push(hookInfo);
  }

  return [hookList[hookIndex].value, hookList[hookIndex].setter];
}

export function uiEventLoop(paint, rootComponent, props) {
  topLevelUpdate = function () {
    hookIndex = -1;
    effectQueue = [];
    const newSceneGraph = rootComponent(props);

    // if (!deepEqual(sceneGraph, newSceneGraph)) {
    sceneGraph = newSceneGraph;
    paint(sceneGraph);
    // }

    for (const queuedEffect of effectQueue) {
      if (queuedEffect.effect.cleanup != null) {
        queuedEffect.effect.cleanup();
      }
      queuedEffect.effect.cleanup =
        queuedEffect.effect.callback() ?? (() => {});
    }
  };

  topLevelUpdate();
}
