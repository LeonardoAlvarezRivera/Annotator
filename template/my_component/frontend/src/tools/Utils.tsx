//FILES UTILS

import { Annotation } from '../objects/Annotation.interface';
import { Entity } from '../objects/Entity.interface';

export const ReadFile = (inputFile:File):any => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result as string);
      };
      temporaryFileReader.readAsArrayBuffer(inputFile)//readAsText(inputFile);
    });
};
/**
 * Get title of document to save in browser database
 * @param inputFile 
 * @returns title of document to save
 */
export const getTitleDocument = (inputFile:File):string => {
    var split = inputFile.name.split(".")[1];//split tagtog id in document name
    const extensionLength = (split.includes('.txt'))?3:4;
    return inputFile.name;//delete extension file
};

export const readBinaryContent = (buffer: ArrayBuffer):string => {
    let view = new Uint8Array(buffer); // trata el buffer como una secuencia de enteros de 32 bits
    return  new  TextDecoder('utf-8').decode(view);  
  };

export const convertStringToDOM = (corpusDocument: HTMLElement,content: string, annotationsSelectedList: Annotation[], annotations:Annotation[], entities:Entity[]): string =>{
  var doc = new DOMParser().parseFromString(content, "text/xml");
  var documentSection = document.createElement("section");
  documentSection.setAttribute("class", 'section-corpus-text');
  
  var paragraphs = content.split('\n').filter(item => item !== '\r');
  paragraphs.forEach((paragraph, index) => {
    var elementP = doc.createElement("p");
    var annSelectedbyParagraph = annotationsSelectedList.filter(item => item.paragraph === 'p'+  index);
    var annByParagraph = annotations.filter(item => item.paragraph === 'p'+  index);
    var annotationsHTML = processHTMLAnnotations(paragraph, annSelectedbyParagraph, annByParagraph, entities);
    elementP.setAttribute("class", 'section-corpus-paragraph' );
    elementP.setAttribute("id", 'p'+  index);
    elementP.insertAdjacentHTML('beforeend', annotationsHTML);
    documentSection.appendChild(elementP);
  });

  
  return documentSection.outerHTML;
}

export const findNewAnnotationsInText = (selected:Annotation,annotationList: Annotation[], textContent:string, documentId:number, firstEntity:Entity|undefined, secondEntity:Entity|undefined):Annotation[] => {
  
  const textToFound:string =  selected.text;
  var newStartIndex = 0;
  var newEndIndex =  newStartIndex + textToFound.length;
  var result = annotationList.find(tmpAnnotation => tmpAnnotation.text === textToFound);
  if(result === undefined)
    {
      var paragraphs = textContent.split('\n').filter(item => item !== '\r');
      paragraphs.forEach((paragraph, index) => {
        let regex_word = new RegExp("(?<![\\w\\d])"+basicFormatString(textToFound)+"(?![\\w\\d])", "gi");
        let procesedTextContent = basicFormatString(paragraph);
        
        let array1;
        while ((array1 = regex_word.exec(procesedTextContent)) !== null) {

          newStartIndex = regex_word.lastIndex - textToFound.length;
          newEndIndex = newStartIndex + textToFound.length;
            var newAnnotation:Annotation = {
              text: paragraph.substring(newStartIndex,newEndIndex),
              start: newStartIndex,
              end: newEndIndex,
              paragraph: 'p'+index,
              documentId: documentId,
              firstEntityId: (firstEntity)?firstEntity.id!:-1,
              secondEntityId: (secondEntity)?secondEntity.id!:-1,
              firstEntityCode: (firstEntity)?firstEntity.Code:'',
              secondEntityCode: (secondEntity)?secondEntity.Code:'',
              fieldsFirstEntity: selected.fieldsFirstEntity,
              fieldsSecondEntity: selected.fieldsSecondEntity,
              status: 'Draft'
            };

            annotationList.push(newAnnotation);
        }
        newStartIndex = 0;
        newEndIndex =  newStartIndex + textToFound.length;
      });
      
    }else{
      annotationList = annotationList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) !== basicFormatString(textToFound));
    }

  return annotationList;
}


const processHTMLAnnotations = (content:string, annotationsSelected:Annotation[], annotationsSaved:Annotation[], entities:Entity[]):string => {
  var ContentAnnotations:string = content;
  var paragraphWithAnnotations:string = '';
  let annotations: Annotation[] = [];
  annotations = annotations.concat(annotationsSelected);
  annotations = annotations.concat(annotationsSaved);

  annotations.sort((a,b) => (a.start < b.start ? -1 : 1));
  if(annotations.length > 0)
  {
    var lastIndex=-1;
    for(var start= annotations.length-1; start >= 0 ; start--){
    
      if(lastIndex !== annotations[start].start)
      {
        let firstEntityId:number = annotations[start].firstEntityId;
        let secondEntityId:number = annotations[start].secondEntityId;

        if(lastIndex == -1)
          paragraphWithAnnotations = buildTextAnnotated(ContentAnnotations.substring(annotations[start].start,ContentAnnotations.length), annotations[start], getAnnotationColor(entities, firstEntityId, firstEntityId), getAnnotationColor(entities, secondEntityId, firstEntityId), entities) + paragraphWithAnnotations;
        else
        paragraphWithAnnotations = buildTextAnnotated(ContentAnnotations.substring(annotations[start].start,lastIndex),annotations[start],getAnnotationColor(entities, firstEntityId, firstEntityId), getAnnotationColor(entities, secondEntityId, firstEntityId), entities) + paragraphWithAnnotations;
  
        lastIndex = annotations[start].start;
      }else{
      //console.log(`Annotación ${annotations[start].start} parrafo: ${annotations[start].paragraph}` );
      }
    
    }

    if(lastIndex!= 0)
    paragraphWithAnnotations = ContentAnnotations.substring(0, lastIndex)+ paragraphWithAnnotations;
    return paragraphWithAnnotations;
  }
  else
    return ContentAnnotations;
}


const buildTextAnnotated = (paragraphContent: string, annotation: Annotation, firstColor:string, secondColor:string, entities:Entity[]): string=>{
 
  const annotationText = paragraphContent.substring(0, annotation.text.length);
  const restText = paragraphContent.substring(annotation.text.length, paragraphContent.length);
  
  var elementContent = document.createElement("span");
  elementContent.setAttribute("class","annotated-content");
  if(annotation.status === 'Saved')
    elementContent.setAttribute("style","color: #1c1c1c; background: linear-gradient(90deg, "+firstColor+" 0%, "+firstColor+" 50%, "+secondColor+" 50%, "+secondColor+" 50%); ");
  else if (annotation.status === 'Draft')
    elementContent.setAttribute("style", "background-color: #1b96f1; color: white;");
  else
    elementContent.setAttribute("style", "background-color: #1b96f1; color: white;");

  elementContent.setAttribute("id",(annotation.id)?annotation.id!.toString():'tmp'+Math.random().toString());
  elementContent.setAttribute("keywords", annotation.text);
  elementContent.innerText = annotationText;

  return elementContent.outerHTML + restText;
}

const getAnnotationColor =(entities: Entity[], entityId: number, secondEntityId:number|null):string =>{
  
  var entityColor: string = '';
  var entity = entities.find(entity => entity.id! === entityId);

  if(!entity){
    var secondEntity = entities.find(entity => entity.id! === secondEntityId);
    if(secondEntity)
      entityColor = secondEntity.Color;
    else
      entityColor = "hsl(0, 0%, 19%)";
  }
  else
    entityColor = entity.Color!;

  return entityColor;
}

export const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 

export const basicFormatString = (str:string) =>{
    return str.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const removeSpecialCharacters =(str: string): string =>
{
    str = str.replace(/[&<>]/g, " ");
    str = str.replaceAll("/p", "  ");
    return str;
}

export const hslToHex = (h:number, s:number, l:number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}