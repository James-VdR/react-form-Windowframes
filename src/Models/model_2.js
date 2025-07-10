import { verticalParts, horizontalParts, glassParts, moduleParts} from '../Scene.js';
import * as THREE from 'three';



export function applyModel2_1Scaling() {
  
  // Keep height fixed at 1000mm
  const targetHeight = 1000;
  const baseHeight = 2000;
  const scaleY = targetHeight / baseHeight;

  verticalParts.forEach((mesh) => {
    mesh.scale.y = scaleY;
  });

  const topFrame = horizontalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'top_frame'
  );

  if (topFrame) {
    const minHeight = 1000;
    const maxHeight = 2000;
    const normalizedValue = (targetHeight - minHeight) / (maxHeight - minHeight);
    topFrame.position.y = normalizedValue;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });


  // Width at 0.75 of base
  const baseWidth = 2000;
  const targetWidth = baseWidth * 0.50;
  const scaleZ = targetWidth / baseWidth;

  horizontalParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });

  const rightFrame = verticalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'right_frame'
  );

  if (rightFrame) {
    const minWidth = 500;
    const maxWidth = 2000;
    const normalizedValue = (targetWidth - minWidth) / (maxWidth - minWidth);
    rightFrame.position.x = normalizedValue * 1.5;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });


const partsToRemove = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === 'top_mid3' || name === 'bottom_mid3' || name === 'top_mid2' || name === 'bottom_mid2' || name === 'horiz_beam4' || name === 'horiz_beam3' || name === 'horiz_beam2' || name === 'horiz_beam1';
  });

  partsToRemove.forEach((mesh) => {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    const index = moduleParts.indexOf(mesh);
    if (index > -1) {
      moduleParts.splice(index, 1);
    }
});


}


export function applyModel2_2Scaling() {
  
  // Keep height fixed at 1000mm
  const targetHeight = 1000;
  const baseHeight = 2000;
  const scaleY = targetHeight / baseHeight;

  verticalParts.forEach((mesh) => {
    mesh.scale.y = scaleY;
  });

  const topFrame = horizontalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'top_frame'
  );

  if (topFrame) {
    const minHeight = 1000;
    const maxHeight = 2000;
    const normalizedValue = (targetHeight - minHeight) / (maxHeight - minHeight);
    topFrame.position.y = normalizedValue;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });


  // Width at 0.75 of base
  const baseWidth = 2000;
  const targetWidth = baseWidth * 0.50;
  const scaleZ = targetWidth / baseWidth;

  horizontalParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });

  const rightFrame = verticalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'right_frame'
  );

  if (rightFrame) {
    const minWidth = 500;
    const maxWidth = 2000;
    const normalizedValue = (targetWidth - minWidth) / (maxWidth - minWidth);
    rightFrame.position.x = normalizedValue * 1.5;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });

const midPart = moduleParts.find((mesh) =>{
  const name = mesh.name.toLowerCase();
  return name === 'bottom_mid1'
});
if(midPart){
midPart.scale.y -= 0.25;
}

// Adjust bottom_mid1 to dynamically stretch to the horizontal beam
const horizBeams = moduleParts.filter(mesh => {
  const name = mesh.name.toLowerCase();
  return name === 'horizbeam1' || name === 'horizbeam2';
});

const verticalBeam = moduleParts.find(mesh => mesh.name.toLowerCase() === 'bottom_mid1');

if (horizBeams.length > 0 && verticalBeam) {
  // Average Y position of both horizontal beam parts
  const avgY = horizBeams.reduce((sum, beam) => sum + beam.position.y, 0) / horizBeams.length;

  // Assume the bottom of the frame is at y = 0
  const targetHeight = avgY;

  // Set scale.y based on how long it needs to be
  const baseBeamHeight = 1.0; // Original Y-scale when beam height was matching 2000
  const minY = -0.75;
  const maxY = 0.75;
  const startY = -0.25;

  // Map targetHeight to scale.y within known constraints
  const scaleY = THREE.MathUtils.clamp((targetHeight - minY) / (maxY - minY), 0, 1.5);
  verticalBeam.scale.y = scaleY;

  // Position it so it's centered between bottom and horizontal bar
  verticalBeam.position.y = targetHeight / 2;
}

const partsToRemove = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === 'top_mid3' || name === 'bottom_mid3' || name === 'top_mid2' || name === 'bottom_mid2' || name === 'top_mid1' || name === 'horiz_beam4' || name === 'horiz_beam3';
  });

  partsToRemove.forEach((mesh) => {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    const index = moduleParts.indexOf(mesh);
    if (index > -1) {
      moduleParts.splice(index, 1);
    }
});


}

export function applyModel2_3Scaling() {
  
  // Keep height fixed at 1000mm
  const targetHeight = 1000;
  const baseHeight = 2000;
  const scaleY = targetHeight / baseHeight;

  verticalParts.forEach((mesh) => {
    mesh.scale.y = scaleY;
  });

  const topFrame = horizontalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'top_frame'
  );

  if (topFrame) {
    const minHeight = 1000;
    const maxHeight = 2000;
    const normalizedValue = (targetHeight - minHeight) / (maxHeight - minHeight);
    topFrame.position.y = normalizedValue;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });


  // Width at 0.75 of base
  const baseWidth = 2000;
  const targetWidth = baseWidth * 0.50;
  const scaleZ = targetWidth / baseWidth;

  horizontalParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });

  const rightFrame = verticalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'right_frame'
  );

  if (rightFrame) {
    const minWidth = 500;
    const maxWidth = 2000;
    const normalizedValue = (targetWidth - minWidth) / (maxWidth - minWidth);
    rightFrame.position.x = normalizedValue * 1.5;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });


const partsToRemove = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === 'top_mid3' || name === 'bottom_mid3' || name === 'top_mid2' || name === 'bottom_mid2'|| name === 'horiz_beam4' || name === 'horiz_beam3' || name === 'horiz_beam2';
  });

  partsToRemove.forEach((mesh) => {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    const index = moduleParts.indexOf(mesh);
    if (index > -1) {
      moduleParts.splice(index, 1);
    }
});


}

export function applyModel2_4Scaling() {
  
  // Keep height fixed at 1000mm
  const targetHeight = 1000;
  const baseHeight = 2000;
  const scaleY = targetHeight / baseHeight;

  verticalParts.forEach((mesh) => {
    mesh.scale.y = scaleY;
  });

  const topFrame = horizontalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'top_frame'
  );

  if (topFrame) {
    const minHeight = 1000;
    const maxHeight = 2000;
    const normalizedValue = (targetHeight - minHeight) / (maxHeight - minHeight);
    topFrame.position.y = normalizedValue;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });


  // Width at 0.75 of base
  const baseWidth = 2000;
  const targetWidth = baseWidth * 0.50;
  const scaleZ = targetWidth / baseWidth;

  horizontalParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });

  const rightFrame = verticalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'right_frame'
  );

  if (rightFrame) {
    const minWidth = 500;
    const maxWidth = 2000;
    const normalizedValue = (targetWidth - minWidth) / (maxWidth - minWidth);
    rightFrame.position.x = normalizedValue * 1.5;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });


const partsToRemove = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === 'top_mid3' || name === 'bottom_mid3' || name === 'top_mid2' || name === 'bottom_mid2' || name === 'horiz_beam4' || name === 'horiz_beam3'  || name === 'horiz_beam1';
  });

  partsToRemove.forEach((mesh) => {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    const index = moduleParts.indexOf(mesh);
    if (index > -1) {
      moduleParts.splice(index, 1);
    }
});


}

export function applyModel2_5Scaling() {
  
  // Keep height fixed at 1000mm
  const targetHeight = 1000;
  const baseHeight = 2000;
  const scaleY = targetHeight / baseHeight;

  verticalParts.forEach((mesh) => {
    mesh.scale.y = scaleY;
  });

  const topFrame = horizontalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'top_frame'
  );

  if (topFrame) {
    const minHeight = 1000;
    const maxHeight = 2000;
    const normalizedValue = (targetHeight - minHeight) / (maxHeight - minHeight);
    topFrame.position.y = normalizedValue;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });


  // Width at 0.75 of base
  const baseWidth = 2000;
  const targetWidth = baseWidth * 0.50;
  const scaleZ = targetWidth / baseWidth;

  horizontalParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });

  const rightFrame = verticalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'right_frame'
  );

  if (rightFrame) {
    const minWidth = 500;
    const maxWidth = 2000;
    const normalizedValue = (targetWidth - minWidth) / (maxWidth - minWidth);
    rightFrame.position.x = normalizedValue * 1.5;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });


const partsToRemove = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === 'top_mid3' || name === 'bottom_mid3' || name === 'top_mid2' || name === 'bottom_mid2' || name === 'horiz_beam4' || name === 'horiz_beam3';
  });

  partsToRemove.forEach((mesh) => {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    const index = moduleParts.indexOf(mesh);
    if (index > -1) {
      moduleParts.splice(index, 1);
    }
});


}


