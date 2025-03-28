import streamlit as st
from my_component import card_component

#Anotador
return_value = ""

# Anotador Code
page_anotador_default = """
<style>
.st-emotion-cache-18ni7ap {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    height: 2.875rem;
    background: rgb(255, 255, 255);
    outline: none;
    z-index: 999990;
    display: none;
}

.st-emotion-cache-12fmjuu {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    height: 2.875rem;
    background: rgb(255, 255, 255);
    outline: none;
    z-index: 999990;
    display: none;
}

iframe[title="my_component.my_component"] {
    border: 0px;
    width: calc(100vw - 250px );
    height: calc(100vh - 60px);
}

.st-emotion-cache-1y4p8pa {
    width: 100%;
    padding: 0rem 0rem 0rem !important;
    max-width: none !important; 
}


.st-emotion-cache-13ln4jf {
    width: 100%;
    padding: 0rem 0rem 0rem !important;
    max-width: none !important; 
}

.st-emotion-cache-uf99v8 {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: auto;
    -webkit-box-align: center;
    /*align-items: ;*/
}
.st-emotion-cache-1ln2a99 {
    width: 1394px;
    position: relative;
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    gap: 0rem !important;
}

.st-emotion-cache-bm2z3a {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: auto;
    -webkit-box-align: center;
    align-items: baseline;
}

.st-emotion-cache-yw8pof {
    width: 100%;
    padding: 0rem;
    max-width: 46rem;
}
.st-emotion-cache-mtjnbi {
    width: 100%;
    padding: 0rem;
    max-width: 736px;
}

<style>
"""

def run():
    st.empty()
    st.markdown(page_anotador_default, unsafe_allow_html=True)
    return_value = card_component("Anotador", None)
    