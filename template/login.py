'''
import streamlit as st

from my_component import example

example.open()
'''
import streamlit as st
from streamlit_option_menu import option_menu
from my_component.pages import Anotador, Entities, NER

#def open(name, authenticator):
def open():
    with st.sidebar:
        columns= st.columns((1,1))
        with columns[0]:
            if st.button("Clear states", use_container_width=True):
                for key in st.session_state.keys():
                    del st.session_state[key]
        with columns[1]:
            if st.button("Clear cache", use_container_width=True):
                st.cache_data.clear()
                

        option= option_menu("Annotation Tool", ["Entities", "Annotate", "View Annotations", "NER", "File Logs", \
                                                'Users', 'Statistics'], icons= ['gear', 'markdown', 'eye', \
                                                                                'house-gear', 'filetype-csv', 'person', 'key'])
        
    if option == "Entities":
        Entities.run()
    elif option  == "Annotate":
        Anotador.run()
    elif option == "View Annotations":
        NER.run()
    elif option == "NER":
        NER.run()
    elif option == "File Logs":
        NER.run()
    elif option == 'Statistics':
        NER.run()
    elif option == 'Users':
        NER.run()