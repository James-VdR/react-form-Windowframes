import { verticalParts, horizontalParts, glassParts, moduleParts} from '../Scene.js';



export function applyModel1_1Scaling() {
  
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
    topFrame.position.y = normalizedValue ;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });


  // Width at 0.75 of base
  const baseWidth = 2000;
  const targetWidth = baseWidth * 0.25;
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
    return name === 'top_mid3' || name === 'bottom_mid3' || name === 'top_mid2' || name === 'bottom_mid2' || name === 'top_mid1' || name === 'bottom_mid1' || name === 'horiz_beam4' || name === 'horiz_beam3' || name === 'horiz_beam2' || name === 'horiz_beam1';
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


export function applyModel1_2Scaling(targetWidth = 500, targetHeight = 1000) {
 
  
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
    topFrame.position.y = normalizedValue * 1;
  }

  glassParts.forEach((mesh) => {
    mesh.scale.y = scaleY * 1.1;
    mesh.position.y = (-0.15 * scaleY) / 2;
  });

  // Calculate Z scale from targetWidth
  const baseWidth = 2000;
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

  //  Dynamic scale for horiz_beam1 based on width
  const horizBeam1 = moduleParts.find(
    (mesh) => mesh.name.toLowerCase() === 'horiz_beam1'
  );

  if (horizBeam1) {
    const minWidth = 500;
    const maxWidth = 2000;
    const minScale = 1.0;
    const maxScale = 4.0;

    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, targetWidth));
    const normalized = (clampedWidth - minWidth) / (maxWidth - minWidth);
    const scale = minScale + normalized * (maxScale - minScale);

    horizBeam1.scale.z = scale;
    console.log(`horiz_beam1.scale.z = ${scale.toFixed(3)}`);
  }

  // Remove extra parts
  const partsToRemove = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === 'top_mid3' || name === 'bottom_mid3' ||
           name === 'top_mid2' || name === 'bottom_mid2' ||
           name === 'top_mid1' || name === 'bottom_mid1' ||
           name === 'horiz_beam4' || name === 'horiz_beam3' ||
           name === 'horiz_beam2';
  });

  partsToRemove.forEach((mesh) => {
    if (mesh.parent) mesh.parent.remove(mesh);
    const index = moduleParts.indexOf(mesh);
    if (index > -1) moduleParts.splice(index, 1);
  });
}

