import { verticalParts, horizontalParts, glassParts, moduleParts} from "../Scene";


export function applyModel4Scaling() {

    const targetHeight = 1000;
    const baseHeight = 2000;
    const scaleY = targetHeight / baseHeight;

    verticalParts.forEach((mesh) =>{
        mesh.scale.y = scaleY;
    });

    const topFrame = horizontalParts.find(
        (mesh) => mesh.name.toLowerCase() === 'top_frame'
    );

    if (topFrame) {
        const minHeight = 1000;
        const maxheight = 2000;
        const normalizedValue = (targetHeight - minHeight) / (maxheight - minHeight);
        topFrame.position.y = normalizedValue;
    }

    glassParts.forEach((mesh) => {
        mesh.scale.y = scaleY * 1.1;
        mesh.position.y = (-0.15 * scaleY) / 2;
    });

    const baseWidth = 2000;
    const targetWidth = baseWidth;
    const scaleZ = targetWidth / baseWidth;

    horizontalParts.forEach((mesh) => {
        mesh.scale.z = scaleZ;
    });

    const rightFrame = verticalParts.find(
    (mesh) => mesh.name.toLowerCase() === 'right_frame'
    );

    if (rightFrame){
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
      return   name === 'horiz_beam4' || name === 'horiz_beam3' || name === 'horiz_beam2' || name === 'horiz_beam1';
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
