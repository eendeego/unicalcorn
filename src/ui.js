/**********************************
 * Render loop
 */

const deepEqual = require('deep-equal');
const ShallowEquals = require('shallow-equal');

const {shallowEqualArrays} = ShallowEquals;

let sceneGraph = [];

let hookIndex = -1;
let hookList = [];
let topLevelUpdate;

function useEffect(callback, dependencies) {
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

function useState(initialValue) {
  hookIndex++;

  if (hookIndex === hookList.length) {
    console.log('new hook!');
    const hookInfo = {
      type: 'state',
      value: typeof initialValue == 'function' ? initialValue() : initialValue,
      setter: function setter(newValue) {
        hookInfo.value = newValue;
        topLevelUpdate();
      },
    };

    hookList.push(hookInfo);
  }

  return [hookList[hookIndex].value, hookList[hookIndex].setter];
}

function uiEventLoop(paint, topComponent, props) {
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

module.exports = {
  uiEventLoop,
  useEffect,
  useState,
};
