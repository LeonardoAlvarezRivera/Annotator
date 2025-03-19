import { Entity } from '../objects/Entity.interface';
import { Annotation } from '../objects/Annotation.interface';
import { useEffect, useState } from 'react';
import React from 'react';
import ContextMenu from '../SubComponents/ContextMenu';
import { Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import { height } from '@mui/system';
export type ContextMenuProps = {
    Entities: Entity [],
    Annotation: Annotation,
    AnnotationsSelected: Annotation[],
    AnnotationList:Annotation[],
    tagSelected: boolean,
    showAnnotations: () => void,
    handleNewDocument: (e:any) => void,
    refreshData: () => void,
    handleSaveAnnoations: () => void
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

      var pageXResult:number = pageX -270;

         
      const {innerWidth, innerHeight} = window;
  
      if(contextMenu!==null)
      {
        var contextMenuHTMLElement:HTMLElement|null = document.getElementById('contextMenu');
        if(contextMenuHTMLElement)
        {
          const {offsetWidth, offsetHeight} = contextMenuHTMLElement;
  
          if(pageXResult  >= (innerWidth / 2.5)){
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
  
          if(pageY  > (innerHeight / 2.2)){
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
                    
                    <Button size='small' variant='contained' startIcon={<Save/>} onClick={props.handleSaveAnnoations} style={{height: '30px', marginLeft: '30px'} }>Save</Button>
                    
                    <i className="area-corpus-title" id="document-title"></i>
                </div>
                <div id="area-corpus-separator" className="separator"></div>
                </div>
                <div id="document-container"  onScroll={(e:any) => handleScrollCorpus(e)} onMouseOver={(e:any) => handleOverCorpus(e)} onMouseOut={(e:any) => handleOutCorpus(e)} className="area-corpus-content"></div>
                {contextMenu !== null && <ContextMenu x={contextMenu.x} y={contextMenu.y} displayValue={contextMenu.show} xTranslate={contextMenu.xTranslate} yTranslate={contextMenu.yTranslate} closeContextMenu={handleCloseContextMenu} showAnnotations={props.showAnnotations} refreshData={props.refreshData} entities={entityList} annotation = {props.Annotation} annotationsSelected={props.AnnotationsSelected} annotationList={props.AnnotationList}/>}
            </div>
        </div>
    );
}