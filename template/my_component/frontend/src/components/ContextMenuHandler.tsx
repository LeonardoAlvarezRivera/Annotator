import { Entity } from '../objects/Entity.interface';
import { Annotation } from '../objects/Annotation.interface';
import { useEffect, useState } from 'react';
import React from 'react';
import ContextMenu from '../SubComponents/ContextMenu';
export type ContextMenuProps = {
    Entities: Entity [],
    Annotation: Annotation,
    AnnotationsSelected: Annotation[],
    AnnotationList:Annotation[],
    tagSelected: boolean,
    showAnnotations: () => void
}


var InitialContextMenuConfig  =
{
    x:0,
    y:0,
    xTranslate: '0',
    yTranslate: '0',
    show:'none'
}
var annotationsSelected: Annotation[] = [];
var entityList: Entity[] = [];
var annotation: Annotation = {
    text: '',
    start: 0,
    end: 0,
    paragraph: '',
    documentId: 0,
    firstEntityId: 0,
    firstEntityCode: '',
    secondEntityId: 0,
    secondEntityCode: '',
    fieldsFirstEntity: [],
    fieldsSecondEntity: [],
    status: 'Draft'
};

var _isTagSelected:boolean = false;

export default function CorpusComponent(props:ContextMenuProps){
    if(props.AnnotationsSelected){
      entityList = props.Entities;
      annotation = props.Annotation;
      annotationsSelected = props.AnnotationsSelected;
      
      _isTagSelected = props.tagSelected;
    }
  
    const [contextMenu, setContexMenu] = useState<{x:number,y:number, xTranslate:string, yTranslate:string, show:string }|null>(null);

    function handleContextMenu(e:any){
      e.preventDefault();
      let x:string = '0';
      let y:string = '0';
  
      const {pageX,pageY} = e;

      var pageXResult:number = pageX -290;

         
      const {innerWidth, innerHeight} = window;
  
      if(contextMenu!==null)
      {
        var contextMenuHTMLElement:HTMLElement|null = document.getElementById('contextMenu');
        if(contextMenuHTMLElement)
        {
          const {offsetWidth, offsetHeight} = contextMenuHTMLElement;
  
          if(pageXResult  >= (innerWidth / 2)){
            x = '-100%';
            contextMenuHTMLElement.classList.add('left');
          }
          else
          {
            contextMenuHTMLElement.classList.remove('left');
          }
  
  
          if(pageXResult  >= (innerWidth - offsetWidth)){
            x = '-100%';
          }
  
          if(pageY  > (innerHeight / 2)){
            y = '-100%';
            contextMenuHTMLElement.classList.add('top');
          }else
          {
            contextMenuHTMLElement.classList.remove('top');
          }
        }
      }
      

  
      setContexMenu(
        contextMenu !== null && contextMenu.show !== 'block'?
        {
          x:pageXResult,
          y:pageY,
          xTranslate: x,
          yTranslate: y,
          show:'block'
        }:{
          x:pageXResult,
          y:pageY,
          xTranslate: x,
          yTranslate: y,
          show:'none'
        }
      );
  
    }
  
    function handleScrollCorpus(e:any) {
      e.stopPropagation();
      let documentCorpus = document.getElementById('document-container');
      var scrollpos = sessionStorage.getItem('scrollpos');
      if((!scrollpos && documentCorpus!.scrollTop > 0) || (scrollpos && documentCorpus!.scrollTop > 0))
          sessionStorage.setItem('scrollpos', documentCorpus!.scrollTop!.toString());
    }

    function handleOverCorpus(e:any) {
      e.stopPropagation();
      sessionStorage.setItem('isOverCorpus', 'true');
    }

    function handleOutCorpus(e:any) {
      e.stopPropagation();
      sessionStorage.setItem('isOverCorpus', 'false');
    }

    const handleCloseContextMenu = () => setContexMenu(InitialContextMenuConfig);
  
    window.addEventListener('resize', handleCloseContextMenu);
    

    return (
        <div id="Corpus" className="area-corpus area-tool" onContextMenu={(e:any) => handleContextMenu(e)}>
            <div className="area-tool-container" >
                <div className="area-corpus-header">
                <div className="area-corpus-header-content">
                    <button className="button-option button-option-unselected"></button>
                    <button className="button-option button-option-selected"></button>
                    <div className="container-input-document">
                            <input type="file"  name="file-1" id="documentFile" accept=".txt" className="inputfile-document inputfile-document-1" />
                            <label htmlFor="documentFile">
                                <svg xmlns="http://www.w3.org/2000/svg" className="iborrainputfile" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
                                <span className="iborrainputfile">New Document</span>
                            </label>
                    </div>
                    <i className="area-corpus-title" id="document-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</i>
                </div>
                <div id="area-corpus-separator" className="separator"></div>
                </div>
                <div id="document-container"  onScroll={(e:any) => handleScrollCorpus(e)} onMouseOver={(e:any) => handleOverCorpus(e)} onMouseOut={(e:any) => handleOutCorpus(e)} className="area-corpus-content"></div>
                {contextMenu !== null && <ContextMenu x={contextMenu.x} y={contextMenu.y} displayValue={contextMenu.show} xTranslate={contextMenu.xTranslate} yTranslate={contextMenu.yTranslate} closeContextMenu={handleCloseContextMenu} showAnnotations={props.showAnnotations} entities={entityList} annotation = {props.Annotation} annotationsSelected={props.AnnotationsSelected} annotationList={props.AnnotationList}/>}
            </div>
        </div>
    );
}