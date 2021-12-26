/**********************************
 * Render loop
 */

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

export function useMemo(callback, dependencies) {
  hookIndex++;
  if (hookIndex === hookList.length) {
    const value = callback();
    hookList.push({
      type: 'memo',
      callback,
      value,
      dependencies,
    });
    return value;
  }

  if (
    hookList[hookIndex].dependencies != null ||
    hookList[hookIndex].dependencies.every((dependency, i) =>
      Object.is(dependency, dependencies[i]),
    )
  ) {
    return hookList[hookIndex].value;
  }

  hookList[hookIndex].dependencies = dependencies;
  return (hookList[hookIndex].value = callback());
}

export function useCallback(callback, dependencies) {
  return useMemo(() => callback, dependencies);
}

export function useState(initialValue) {
  hookIndex++;

  if (hookIndex === hookList.length) {
    const hookInfo = {
      type: 'state',
      value: typeof initialValue == 'function' ? initialValue() : initialValue,
      setter: function setter(newValueOrCallback) {
        const newValue =
          typeof newValueOrCallback === 'function'
            ? newValueOrCallback(hookInfo.value)
            : newValueOrCallback;
        const udpate = !Object.is(newValue, hookInfo.value);
        hookInfo.value = newValue;
        if (udpate) {
          topLevelUpdate();
        }
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
