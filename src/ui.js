/**********************************
 * Render loop
 */

import deepEqual from 'deep-equal';

function paint(sceneGraph) {
  console.log('New Scene Graph: ', sceneGraph);
}

let sceneGraph = [];

export default function uiEventLoop(topComponent, props) {
  const newSceneGraph = topComponent(props);

  if (!deepEqual(sceneGraph, newSceneGraph)) {
    sceneGraph = newSceneGraph;
    paint(sceneGraph);
  }

  // Eventually, this will go away and the update cycle will be triggered by
  // something else
  setTimeout(_ => uiEventLoop(topComponent, props), 167);
}
